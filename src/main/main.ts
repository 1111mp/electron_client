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
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath, SearchType } from './util';
import packageJson from '../../package.json';
import { loadLocale } from './locale';
import { initialize as initSqlite } from './db';
import { initialize as sqlChannels } from './db/channel';
import { NativeThemeNotifier } from './/NativeThemeNotifier';
import { setupForNewWindow } from './window';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const nativeThemeNotifier = new NativeThemeNotifier();
nativeThemeNotifier.initialize();

let mainWindow: BrowserWindow | null = null;
let loginWindow: BrowserWindow | null = null;

let locale: I18n.Locale;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
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

function getBaseSearch(): SearchType {
  return {
    name: packageJson.productName,
    locale: locale.name,
    version: app.getVersion(),
    node_version: process.versions.node,
  };
}

const createWindow = async (callback: VoidFunction) => {
  if (isDevelopment) {
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

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    callback();

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
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

  loginWindow.on('ready-to-show', () => {
    if (!loginWindow) {
      throw new Error('"loginWindow" is not defined');
    }

    if (process.env.START_MINIMIZED) {
      loginWindow.minimize();
    } else {
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
      loginWindow && loginWindow.close();
    });
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    if (!locale) {
      const appLocale =
        process.env.NODE_ENV === 'test' ? 'en' : app.getLocale();
      console.log(appLocale);
      locale = loadLocale({ appLocale });
    }

    const sqlInitPromise = initSqlite();

    const timeout = new Promise((resolve) =>
      setTimeout(resolve, 3000, 'timeout')
    );

    Promise.race([sqlInitPromise, timeout]).then((maybeTimeout) => {
      if (maybeTimeout !== 'timeout') return;

      /** 这里可以加载 loading 过渡 */
      console.log(
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
    });

    const success = await sqlInitPromise;

    if (success !== 'successed') {
      console.log('sql.initialize was unsuccessful; returning early');
      return;
    }

    sqlChannels();

    createLogin();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (loginWindow) return;

      if (mainWindow === null) createWindow(() => {});
      else mainWindow.show();
    });
  })
  .catch(console.log);

ipcMain.on('locale-data', (event) => {
  event.returnValue = locale.messages;
});

setupForNewWindow(nativeThemeNotifier, getBaseSearch);
