/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  nativeImage,
  IpcMainEvent,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import Config, { Mainwin, LoginWin } from './config';
import { initialize as initSqlite } from './db';
import sqlChannels from './db/channel';
import initMainProcess from './main-process';
import TrayCreator from './main-process/tray';
import listeners from './constants/listener.json';

/** 设置日志级别 */
log.transports.console.level = 'silly';

/** 开发者工具 */
if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let loginWindow: BrowserWindow | null = null;
let tray = null; // 创建全局的变量 防止系统托盘被垃圾回收

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'resources')
  : path.join(__dirname, '../resources');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const createWindow = (userInfo: string, callback: Function) => {
  mainWindow = new BrowserWindow({
    show: false,
    width: Mainwin.width,
    height: Mainwin.height,
    minWidth: Mainwin.minWidth,
    minHeight: Mainwin.minHeight,
    center: true,
    frame: false,
    title: 'mainWindow', // 用来标识 mainWindow
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
          }
        : {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
          },
  });

  mainWindow.loadURL(`file://${__dirname}/pages/index.html`);

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    //开发者工具 https://newsn.net/say/electron-devtools.html
    mainWindow.webContents.openDevTools({ mode: 'undocked' });
  }

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
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

  /** 崩溃容错 */
  mainWindow.webContents.on('crashed', () => {
    // @ts-ignore
    const choice = dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '崩溃啦',
      message: '好像出了点小问题...',
      buttons: ['重新打开', '关闭'],
    });

    // @ts-ignore
    if (choice['response'] === 0) mainWindow.reload();
    // @ts-ignore
    else mainWindow.close();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  /** 创建系统托盘菜单 */
  createTray();
};

/** 登录窗口 */
const createLogin = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  loginWindow = new BrowserWindow({
    show: false,
    width: LoginWin.width,
    height: LoginWin.height,
    center: true,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'login_preload.js'),
    },
  });

  loginWindow.loadURL(`file://${__dirname}/pages/login.html`);

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    //开发者工具 https://newsn.net/say/electron-devtools.html
    loginWindow.webContents.openDevTools({ mode: 'undocked' });
  }

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
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

  /** 崩溃容错 */
  loginWindow.webContents.on('crashed', () => {
    // @ts-ignore
    const choice = dialog.showMessageBox(loginWindow, {
      type: 'info',
      title: '崩溃啦',
      message: '好像出了点小问题...',
      buttons: ['重新打开', '关闭'],
    });

    // @ts-ignore
    if (choice['response'] === 0) loginWindow.reload();
    // @ts-ignore
    else loginWindow.close();
  });

  loginWindow.on('closed', () => {
    loginWindow = null;
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  /** 登录成功 */
  ipcMain.once(
    listeners.LOGIN_SUCCESSFUL,
    async (event: IpcMainEvent, userInfo: string) => {
      (global as any).UserInfo = {
        ...(global as any).UserInfo,
        ...JSON.parse(userInfo),
      };

      createWindow(userInfo, () => {
        loginWindow && loginWindow.close();
      });
    }
  );
};

function createTray() {
  const iconSize = process.platform === 'darwin' ? '16' : '256';
  const icon = getAssetPath(`icons/${iconSize}x${iconSize}.png`);
  const image = nativeImage.createFromPath(icon);
  tray = new TrayCreator({
    icon: image,
  });

  tray.initTray();

  tray.setToolTip('WeChat');

  tray.on('click', () => {
    // @ts-ignore
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

/**
 * Add event listeners...
 */
/** 解决启动时的短暂黑屏问题 */
app.disableHardwareAcceleration();

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createLogin);
} else {
  app.on('ready', async () => {
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

    if (!success) {
      console.log('sql.initialize was unsuccessful; returning early');
      return;
    }

    await sqlChannels.initialize();

    await await createLogin();
  });
}

app.on('gpu-process-crashed', () => {
  debugger;
  app.exit();
});

app.on('renderer-process-crashed', () => {
  debugger;
  app.exit();
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow) {
    mainWindow.show();
  } else {
    createWindow((global as any).UserInfo, () => {});
  }
});

ipcMain.on('close-login', () => {
  if (loginWindow) {
    loginWindow.close();
  }
});

/** 添加主进程监听事件 */
initMainProcess();
