/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { userInfo } from 'os';
import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import checkForAsarUpdates from './increament';
import packageJson from '../../package.json';
import loadLocale from './locale';
import { MainSQL } from './db/main';
import { initialize as SQLChannelsInitialize } from './SQLChannel';
import { NativeThemeNotifier } from './NativeThemeNotifier';
import { setupForNewWindow } from './BasicWindow';
import Logging from './logging';

const { getLogger } = Logging();
const logger = getLogger();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.setFeedURL({
      provider: 'generic',
      channel: 'latest-mac',
      url: 'http://127.0.0.1:3000/upload/electron/full/1.0.0/macos/',
    });
    autoUpdater.logger = log;

    // autoUpdater.checkForUpdates();
    // autoUpdater.on('update-downloaded', () => {
    //   autoUpdater.quitAndInstall();
    // });

    // autoUpdater.checkForUpdatesAndNotify();

    // 是否自动更新，如果为true，当可以更新时(update-available)自动执行更新下载。
    autoUpdater.autoDownload = false;

    // 1. 在渲染进程里触发获取更新，开始进行更新流程。 (根据具体需求)
    ipcMain.on('checkForUpdates', async (e, arg) => {
      // autoUpdater.checkForUpdates();

      await checkForAsarUpdates(logger);
    });

    autoUpdater.on('error', function (error) {
      loginWindow?.webContents.send('updateError', JSON.stringify(error));
    });

    // 2. 开始检查是否有更新
    autoUpdater.on('checking-for-update', function () {
      loginWindow?.webContents.send('updateError', 'checking-for-update');
    });

    // 3. 有更新时触发
    autoUpdater.on('update-available', function (info) {
      loginWindow?.webContents.send('updateAvailable', info);
    });

    // 7. 收到确认更新提示，执行下载
    ipcMain.on('comfirmUpdate', () => {
      autoUpdater.downloadUpdate();
    });

    // 没有可用更新
    autoUpdater.on('update-not-available', async function (info) {
      loginWindow?.webContents.send('updateError', 'update-not-available');
      // 这时候可以检查是否有增量更新
      await checkForAsarUpdates(logger);
    });

    // 8. 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
    autoUpdater.on('download-progress', function (progressObj) {
      loginWindow?.webContents.send('updateError', progressObj);
    });

    // 10. 下载完成，告诉渲染进程，是否立即执行更新安装操作
    autoUpdater.on('update-downloaded', function () {
      // mainWindow.webContents.send('updateDownloaded');
      // 12. 立即更新安装
      // ipcMain.on('updateNow', (e, arg) => {
      autoUpdater.quitAndInstall();
      // });
    });
  }
}

let sqlInitTimeStart = 0;
let sqlInitTimeEnd = 0;

const sql = new MainSQL();

const nativeThemeNotifier = new NativeThemeNotifier();
nativeThemeNotifier.initialize();

let mainWindow: BrowserWindow | null = null;
let loginWindow: BrowserWindow | null = null;

let locale: I18n.Locale;

let appShouldQuit: boolean = false;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

function getBaseSearch(): Windows.SearchType {
  return {
    name: packageJson.build.productName,
    locale: locale.name,
    version: app.getVersion(),
    node_version: process.versions.node,
  };
}

const createWindow = async (callback: VoidFunction) => {
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1040,
    height: 730,
    minWidth: 1040,
    minHeight: 730,
    center: true,
    frame: false,
    title: 'mainWindow', // 用来标识 mainWindow
    icon: getAssetPath('icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    trafficLightPosition: {
      x: 4,
      y: 12,
    },
    webPreferences: {
      // nodeIntegration: true,
      // contextIsolation: false,
      scrollBounce: true,
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      // backgroundThrottling: false,
    },
  });

  const search = {
    ...getBaseSearch(),
    isFullScreen: String(Boolean(mainWindow.isFullScreen())),
  };

  mainWindow.loadURL(resolveHtmlPath({ html: 'main.html', search }));

  nativeThemeNotifier.addWindow(mainWindow);

  if (isDebug) mainWindow.webContents.openDevTools({ mode: 'undocked' });

  mainWindow.on('ready-to-show', () => {
    logger.info('main window is ready-to-show');

    if (!mainWindow) {
      return;
    }

    callback();

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      logger.info('showing main window');
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

// login window
const createLogin = async () => {
  loginWindow = new BrowserWindow({
    show: false,
    width: 280,
    height: 400,
    center: true,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      // nodeIntegration: true,
      // contextIsolation: false,
      scrollBounce: true,
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'login_preload.js')
        : path.join(__dirname, '../../.erb/dll/login_preload.js'),
      // backgroundThrottling: false,
    },
  });

  const search = {
    ...getBaseSearch(),
  };

  loginWindow.loadURL(resolveHtmlPath({ html: 'login.html', search }));

  // if (isDebug)
  loginWindow.webContents.openDevTools({ mode: 'undocked' });

  loginWindow.on('ready-to-show', () => {
    logger.info('login window is ready-to-show');

    if (!loginWindow) {
      return;
    }

    if (process.env.START_MINIMIZED) {
      loginWindow.minimize();
    } else {
      logger.info('showing login window');
      loginWindow.show();
      loginWindow.focus();
    }
  });

  loginWindow.on('closed', () => {
    loginWindow = null;
  });

  // login successed
  ipcMain.once('login-successed', async (_event: unknown, userInfo: string) => {
    global.UserInfo = {
      ...JSON.parse(userInfo),
    };

    createWindow(() => {
      if (loginWindow) loginWindow.close();
    });
  });

  ipcMain.once('close-login', () => {
    if (loginWindow) {
      appShouldQuit = true;
      loginWindow.close();
    }
  });

  new AppUpdater();
};

async function initializeSQL(
  userDataPath: string
): Promise<{ ok: true; error: undefined } | { ok: false; error: Error }> {
  const key = userInfo().username;

  if (!key) {
    logger.info(
      'key/initialize: Generating new encryption key, since we did not find it on disk'
    );
  }

  console.log(key);

  sqlInitTimeStart = Date.now();

  try {
    await sql.initialize({ configDir: userDataPath, key, logger: logger });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { ok: false, error };
    }

    return {
      ok: false,
      error: new Error(`initializeSQL: Caught a non-error '${error}'`),
    };
  } finally {
    sqlInitTimeEnd = Date.now();
  }

  return { ok: true, error: undefined };
}

/**
 * Add event listeners...
 */

app.on('ready', async () => {
  logger.info('app ready');

  const userDataPath = app.getPath('userData');

  if (!locale) {
    const appLocale = process.env.NODE_ENV === 'test' ? 'en' : app.getLocale();
    logger.info(`locale: ${appLocale}`);
    locale = loadLocale({ appLocale });
  }

  const sqlInitPromise = initializeSQL(userDataPath);

  const timeout = new Promise((resolve) =>
    setTimeout(resolve, 3000, 'timeout')
  );

  Promise.race([sqlInitPromise, timeout])
    .then((maybeTimeout) => {
      if (maybeTimeout !== 'timeout') return;

      /** 这里可以加载 loading 过渡 */
      logger.info(
        'sql.initialize is taking more than three seconds; showing loading dialog'
      );

      // loadingWindow = new BrowserWindow({
      //   show: false,
      //   width: 300,
      //   height: 265,
      //   resizable: false,
      //   frame: false,
      //   backgroundColor: '#3a76f0',
      //   webPreferences: {
      //     nodeIntegration: false,
      //     preload: path.join(__dirname, 'loading_preload.js'),
      //   },
      //   icon: windowIcon,
      // });

      // loadingWindow.once('ready-to-show', async () => {
      //   loadingWindow.show();
      //   // Wait for sql initialization to complete
      //   await sqlInitPromise;
      //   loadingWindow.destroy();
      //   loadingWindow = null;
      // });

      // loadingWindow.loadURL(prepareURL([__dirname, 'loading.html']));
    })
    .catch((err) => console.error(err));

  const { ok, error: sqlError } = await sqlInitPromise;

  console.log(ok);

  if (sqlError) {
    logger.error('sql.initialize was unsuccessful; returning early');
    return;
  }

  SQLChannelsInitialize(sql);

  createLogin();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (loginWindow) return;

  if (mainWindow === null) createWindow(() => {});
  else mainWindow.show();
});

app.on('window-all-closed', async () => {
  logger.info('main process handling window-all-closed');
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin' || appShouldQuit) {
    await sql.close();
    app.quit();
  }
});

ipcMain.on('locale-data', (event) => {
  event.returnValue = locale.messages;
});

setupForNewWindow(nativeThemeNotifier, getBaseSearch, logger);
