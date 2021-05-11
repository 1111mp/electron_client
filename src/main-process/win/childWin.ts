import { BrowserWindow, BrowserWindowConstructorOptions, app } from 'electron';
import { LoadFileOption } from 'app/utils/dialog';
import { resolve, join } from 'path';
import { parse, format } from 'url';
import { merge } from 'lodash';
export interface WindowListener {
  readyToShow?: () => void;
  show?: () => void;
  finish?: () => void;
  closed?: () => void;
  focus?: () => void;
  blur?: () => void;
}

export default class ChildWindow {
  win: BrowserWindow | IAnyObject;
  winOptions: BrowserWindowConstructorOptions;

  constructor(args: BrowserWindowConstructorOptions) {
    this.win = {};
    this.winOptions = args;

    this.createMainWindow();
  }

  createMainWindow = () => {
    this.win = new BrowserWindow(
      merge(
        {
          center: true,
          // frame: false,
          show: false,
          resizable: false,
          transparent: false,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
          },
        },
        this.winOptions
      )
    );

    if (process.platform === 'win32') {
      /** windows 下禁用右键 */
      this.win.hookWindowMessage(278, (e: Event) => {
        this.win.setEnabled(false);
        setTimeout(() => this.win.setEnabled(true), 100);
        return;
      });
    }
  };

  bind = (cb?: WindowListener) => {
    if (!cb) return;

    cb.readyToShow &&
      this.win.once('ready-to-show', () => {
        cb.readyToShow!();
      });

    cb.show &&
      this.win.once('show', () => {
        cb.show!();
      });

    cb.focus &&
      this.win.on('focus', () => {
        cb.focus!();
      });

    cb.blur &&
      this.win.on('blur', () => {
        cb.blur!();
      });

    cb.closed &&
      this.win.once('closed', () => {
        cb.closed!();
      });

    cb.finish &&
      this.win.webContents.once('did-finish-load', () => {
        cb.finish!();
      });
  };

  loadURL = (
    name: string = 'index',
    options: { [key: string]: string | number | boolean }
  ) => {
    const pathSegments =
      app.isPackaged || process.env.NODE_ENV === 'production'
        ? [__dirname, 'pages', `${name}.html`]
        : [__dirname, '..', '..', 'pages', `${name}.html`];
    const parsed = parse(join(...pathSegments));

    const userAgent = this.win.webContents.getUserAgent();

    const prepareURL = format({
      ...parsed,
      ...options,
    });

    this.win.loadURL(prepareURL, { userAgent });
  };

  loadFile = (options: LoadFileOption, temp: string = 'index') => {
    this.win.loadFile(
      app.isPackaged || process.env.NODE_ENV === 'production'
        ? resolve(__dirname, `pages/${temp}.html`)
        : resolve(__dirname, `../../pages/${temp}.html`),
      {
        ...options,
      }
    );
  };

  getWebContents = () => {
    return this.win ? this.win.webContents : null;
  };

  getUrl = () => {
    const webContents = this.win.webContents;

    if (!webContents || webContents.isDestroyed() || webContents.isCrashed())
      return '';

    return webContents.getURL();
  };

  show = () => {
    this.win.show();
  };

  focus = () => {
    this.win.focus();
  };

  isVisible = () => {
    return this.win.isVisible();
  };

  isDestroyed = () => {
    return this.win.isDestroyed();
  };

  isMinimized = () => {
    return this.win.isMinimized();
  };

  restore = () => {
    this.win.restore();
  };

  mini = () => {
    this.win.minimize();
  };

  hide = () => {
    this.win.hide();
  };

  max = () => {
    this.win.maximize();
  };

  reload = () => {
    this.win.reload();
  };

  close = () => {
    this.win.close();
  };
}
