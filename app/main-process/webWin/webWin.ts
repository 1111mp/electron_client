import ChildWindow from '../win/childWin';

export interface CustomWindowArgs extends IAnyObject {
  width: number;
  height: number;
  url: string;
  closed?: VoidFunction;
}

export default class CustomWindow {
  // width: number;
  // height: number;
  // url: string;
  // close?: VoidFunction;
  winInstance: ChildWindow | undefined;

  constructor(args: CustomWindowArgs) {
    // this.width = args.width;
    // this.height = args.height;
    // this.url = args.url;
    // this.close = args.close;

    this.createWin(args);
  }

  createWin(args: CustomWindowArgs) {
    const winInstance = (this.winInstance = new ChildWindow({
      frame: false,
      center: true,
      width: args.width,
      height: args.height,
    }));

    winInstance.bind({
      readyToShow: winInstance.show,
      closed: args.close,
    });
    /** url会处理成 /hash?search形式 */
    winInstance.loadFile(
      { hash: args.url.split('?')[0], search: args.url.split('?')[1] },
      'window'
    );

    return winInstance;
  }

  show() {
    this.winInstance && this.winInstance.show();
  }

  loadUrl(url: string) {
    this.winInstance && this.winInstance.loadURL(url);
  }

  getUrl() {
    return this.winInstance ? this.winInstance.getUrl() : '';
  }

  isDestroyed() {
    return this.winInstance ? this.winInstance.isDestroyed() : true;
  }
}
