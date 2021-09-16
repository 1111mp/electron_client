import { BrowserWindow } from 'electron';
import ChildWindow from '../win/childWin';
export interface CustomWindowArgs extends IAnyObject {
  width: number;
  height: number;
  url: string;
  center?: boolean;
  modal?: boolean;
  parent?: BrowserWindow;
  x?: number;
  y?: number;
  closed?: VoidFunction;
}

export default class CustomWindow {
  winInstance: ChildWindow | undefined;

  constructor(args: CustomWindowArgs) {
    this.createWin(args);
  }

  createWin(args: CustomWindowArgs) {
    const winInstance = (this.winInstance = new ChildWindow(
      // @ts-ignore
      Object.assign(
        {
          frame: false,
          modal: false,
          center: true,
          width: args.width,
          height: args.height,
        },
        args.modal
          ? {
              parent: args.parent,
              x: args.x,
              y: args.y,
              resizable: false,
              movable: false,
              minimizable: false,
              maximizable: false,
              titleBarStyle:
                process.platform === 'darwin' ? 'hiddenInset' : 'default',
            }
          : args.center
          ? { x: args.x, y: args.y }
          : {}
      )
    ));

    winInstance.bind({
      readyToShow: winInstance.show,
      closed: args.close,
    });

    /** url会处理成 /hash?search形式 */
    winInstance.loadFile(
      { hash: args.url.split('?')[0], search: args.url.split('?')[1] },
      'window'
    );

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      //开发者工具 https://newsn.net/say/electron-devtools.html
      winInstance.getWebContents().openDevTools({ mode: 'undocked' });
    }

    return winInstance;
  }

  show() {
    this.winInstance && this.winInstance.show();
  }

  loadUrl(url: string) {
    this.winInstance && this.winInstance.loadURL(url, {});
  }

  getUrl() {
    return this.winInstance ? this.winInstance.getUrl() : '';
  }

  isDestroyed() {
    return this.winInstance ? this.winInstance.isDestroyed() : true;
  }
}
