import path from 'path';
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { resolveHtmlPath, SearchType } from './util';
import { NativeThemeNotifier } from './NativeThemeNotifier';
import { WindowName } from '../types';

export type WindowArgs = {
  name: WindowName; // for window (unique)
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  title?: string;
  frame?: boolean;
  center?: boolean;
  resizable?: boolean;
  url?: string; // e.g "/setting"
  search?: SearchType;
  modal?: boolean;
};

// todo save created window
const windowsPool: Map<WindowName, BrowserWindow> = new Map();

/**
 * @description: setup for new window
 * @param {SearchType} baseSearch
 * @return {void}
 */
export function setupForNewWindow(
  nativeThemeNotifier: NativeThemeNotifier,
  getBaseSearch: () => SearchType
) {
  ipcMain.on('window:open', (event: IpcMainEvent, args: WindowArgs) => {
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

    windowsPool.set(
      name,
      new BrowserWindow({
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
      })
    );

    const window = windowsPool.get(name)!;

    window.loadURL(
      resolveHtmlPath({
        html: 'window.html',
        url,
        search: { ...getBaseSearch(), ...search },
      })
    );

    nativeThemeNotifier.addWindow(window);

    // if (
    //   process.env.NODE_ENV === 'development' ||
    //   process.env.DEBUG_PROD === 'true'
    // )
    window.webContents.openDevTools({ mode: 'undocked' });

    window.on('ready-to-show', () => {
      if (!window) {
        throw new Error(`"window[${name}]" is not defined`);
      }

      window.show();
      window.focus();
    });

    window.on('closed', () => {
      if (windowsPool.has(name)) windowsPool.delete(name);
    });

    return;
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
      console.log(`window[${name}]: close window failed.`);
    }
  });
}
