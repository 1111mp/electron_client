import { BrowserWindow, screen } from 'electron';
import ChildWindow from '../win/childWin';
import { DIALOG } from '../../config';
import { getOptions } from '../../utils/dialog';

export default class Dialog {
  // parent: BrowserWindow;
  winInstance?: ChildWindow;
  // type: IDialog.type;
  // title: string;
  // message: string;
  // data: IAnyObject;

  constructor(args: IDialog.props) {
    // this.type = (args && args.type) || 'alert';
    // this.title = (args && args.title) || '';
    // this.message = (args && args.message) || '';
    // this.data = (args && args.data) || {};
    // this.parent = args && args.parent;

    /** 必须指定父级BrowserWindow才可弹出对话框 */
    if (!args.parent) return;

    this.createWin(args);
  }

  createWin(args: IDialog.props) {
    // let display = screen.getPrimaryDisplay();
    // let WIDTH = display.bounds.width;
    // let HEIGHT = display.bounds.height;

    /** mac下 设置模态框时  同时设置modal:true parent 和frame时 程序会崩溃 */
    const winInstance = (this.winInstance = new ChildWindow({
      width: DIALOG.width,
      height: DIALOG.height,
      // x: WIDTH - DIALOG.width,
      // y: HEIGHT - DIALOG.height,
      x: args.x,
      y: args.y,
      parent: args.parent,
      center: true,
      modal: true,
      resizable: false,
      minimizable: false,
      // alwaysOnTop: true,
    }));

    const options = getOptions(DIALOG.url, {
      type: args.type,
      title: args.title,
      message: args.message,
      ...args.data,
    });

    winInstance.bind({ readyToShow: winInstance.show });
    winInstance.loadFile(options, 'dialog');

    return winInstance;
  }

  show() {
    this.winInstance && this.winInstance.show();
  }
}
