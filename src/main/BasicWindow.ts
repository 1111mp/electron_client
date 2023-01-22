import path from 'path';
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import type { ElectronLog } from 'electron-log';

import { strictAssert } from './assert';
import { resolveHtmlPath } from './util';
import { NativeThemeNotifier } from './NativeThemeNotifier';
import { WindowName } from '../types';

// todo save created window
const windowsPool: Map<WindowName, BrowserWindow> = new Map();
let logger: ElectronLog;

/**
 * @description: setup for new window
 * @param {Windows.SearchType} baseSearch
 * @return {void}
 */
export function setupForNewWindow(
  nativeThemeNotifier: NativeThemeNotifier,
  getBaseSearch: () => Windows.SearchType,
  log: ElectronLog
) {
  logger = log;
  ipcMain.on('window:open', (event: IpcMainEvent, args: Windows.Args) => {
    const {
      name,
      width = 640,
      height = 480,
      minWidth = width,
      minHeight = height,
      title = name,
      frame = false,
      center = true,
      resizable = false,
      url = undefined,
      search,
      modal = false,
    } = args;

    // already created
    if (windowsPool.has(name)) return windowsPool.get(name)?.focus();

    const window = new BrowserWindow({
      show: false,
      width,
      height,
      minWidth,
      minHeight,
      title,
      center,
      frame,
      resizable,
      modal,
      parent: modal
        ? BrowserWindow.fromWebContents(event.sender) || undefined
        : undefined,
      minimizable: resizable,
      maximizable: resizable,
      titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'window_preload.js')
          : path.join(__dirname, '../../.erb/dll/window_preload.js'),
      },
    });

    windowsPool.set(name, window);

    window.loadURL(
      resolveHtmlPath({
        html: 'window.html',
        url,
        search: { ...getBaseSearch(), ...search },
      })
    );

    nativeThemeNotifier.addWindow(window);

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    )
      window.webContents.openDevTools({ mode: 'undocked' });

    window.on('ready-to-show', () => {
      strictAssert(window !== undefined, `"window[${name}]" is not defined.`);

      window.show();
      window.focus();
    });

    window.on('closed', () => {
      if (windowsPool.has(name)) windowsPool.delete(name);
    });
  });

  /**
   * @description: close the window with the name
   * @param {close} window
   * @param {unknown} _event
   * @param {WindowName} name
   * @return {*}
   */
  ipcMain.on('window:close', (_event: unknown, name: WindowName) => {
    try {
      windowsPool.get(name)?.close();
      windowsPool.delete(name);
    } catch (err) {
      strictAssert(logger !== undefined, 'Logger not initialized.');
      logger.error(`window[${name}]: close window failed.`);
    }
  });

  if (process.platform === 'win32') {
    // Windows
    // Minimizes the window.
    ipcMain.on('window:minimize', (_event: unknown, name: WindowName) => {
      try {
        windowsPool.get(name)?.maximize();
      } catch (_err) {
        strictAssert(logger !== undefined, 'Logger not initialized.');
        logger.error(`window[${name}]: minimize window failed.`);
      }
    });

    // Maximizes the window.
    ipcMain.on('window:maximize', (_event: unknown, name: WindowName) => {
      try {
        windowsPool.get(name)?.maximize();
      } catch (_err) {
        strictAssert(logger !== undefined, 'Logger not initialized.');
        logger.error(`window[${name}]: maximize window failed.`);
      }
    });

    // Unmaximizes the window.
    ipcMain.on('window:unmaximize', (_event: unknown, name: WindowName) => {
      try {
        windowsPool.get(name)?.unmaximize();
      } catch (_err) {
        strictAssert(logger !== undefined, 'Logger not initialized.');
        logger.error(`window[${name}]: maximize window failed.`);
      }
    });
  }
}
