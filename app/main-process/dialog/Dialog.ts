import { BrowserWindow } from 'electron';
import ChildWindow from '../win/childWin';
import { DIALOG } from '../../config';
import { getOptions } from '../../utils/dialog';

export default class Dialog {
  parent: BrowserWindow;
  winInstance?: ChildWindow;
  type: IDialog.type;
  title: string;
  message: string;
  data: IAnyObject;

  constructor(args?: IDialog.props) {
    this.type = (args && args.type) || 'alert';
    this.title = (args && args.title) || '';
    this.message = (args && args.message) || '';
    this.data = (args && args.data) || {};
    this.parent = args && args.parent;

    /** 必须指定父级BrowserWindow才可弹出对话框 */
    if (!this.parent) return;

    this.createWin();
  }

  createWin() {
    /** 在当前版本中new BrowserWindow添加model:true时 macOS上项目会crash windows正常 原因不明 */
    const winInstance = this.winInstance = new ChildWindow({
      width: DIALOG.width,
      height: DIALOG.height,
      parent: this.parent,
      center: true,
      modal: true,
      resizable: false,
      minimizable: false,
      alwaysOnTop: true
    });

    const options = getOptions(DIALOG.url, {
      type: this.type,
      title: this.title,
      message: this.message,
      ...this.data
    });

    winInstance.bind({ readyToShow: winInstance.show });
    winInstance.loadFile(options);

    return winInstance;
  }

  show() {
    this.winInstance && this.winInstance.show();
  }
}
