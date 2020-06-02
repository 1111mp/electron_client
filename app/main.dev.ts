/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, dialog, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import Config, { Mainwin } from './config';
import listener from './main-process';
import TrayCreator from './main-process/tray';
import debug from 'electron-debug'
import path from 'path'

// const path = require('path');
// const debug = require('electron-debug');

/** 设置日志级别 */
log.transports.console.level = 'silly';

/** 开发者工具 */
debug({
  isEnabled: Config.isDev,
  showDevTools: Config.isDev
});

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;
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
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
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

app.on('ready', async () => {
  // 项目使用run-electron代替electron启动项目以解决Google Chrome的devtools的报错信息
  // 详见 https://github.com/electron/electron/issues/12438#issuecomment-412172065
  // https://github.com/sindresorhus/run-electron
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: Mainwin.width,
    height: Mainwin.height,
    minWidth: Mainwin.minWidth,
    minHeight: Mainwin.minHeight,
    center: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  /** 崩溃容错 */
  mainWindow.webContents.on('crashed', () => {
    const choice = dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '崩溃啦',
      message: '好像出了点小问题...',
      buttons: ['重新打开', '关闭']
    });

    if (choice['response'] === 0) mainWindow.reload();
    else mainWindow.close();
  });

  app.on('gpu-process-crashed', () => {
    debugger
    app.exit();
  });

  app.on('renderer-process-crashed', () => {
    debugger
    app.exit();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    tray = null;
  });

  /** 添加程序菜单 */
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  /** 创建系统托盘菜单 */
  createTray();

  /** 添加主进程监听事件 */
  listener();
});

function createTray() {
  const icon = path.join(__dirname, '../resources/icon.png');
  const image = nativeImage.createFromPath(icon);
  tray = new TrayCreator({
    icon: image.resize({ width: 16, height: 16 })
  });

  tray.initTray();

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}
