import { BrowserWindow, Event, WebContents } from 'electron';
import Dialog from './Dialog';
import { send } from '../common';

const listener = require('../../constants/listener.json');

/** 用于防止dialog被垃圾回收 */
const dialogStack: IDialog.stack = {};
let isAlwaysOnTop: boolean = false;

/**
 * 清除dialog
 * @param id
 */
function clearDialog(id: number) {
  if (id in dialogStack) {
    delete dialogStack[id];
  }
}

export default {
  /** 显示对话框 默认type为alert */
  [listener.DIALOG_SHOW]() {
    return (
      event: Event,
      args: IDialog.state = { type: 'alert', title: '', message: '', data: {} }
    ) => {
      const webContents: WebContents = (event as any).sender;
      const parent: any = BrowserWindow.fromWebContents(webContents);
      const { type, title, message, data } = args;

      if (dialogStack[webContents.id]) return;

      dialogStack[webContents.id] = new Dialog({
        type,
        title,
        message,
        parent,
        data,
      });

      isAlwaysOnTop = parent.isAlwaysOnTop();
      !isAlwaysOnTop && parent.setAlwaysOnTop(true);
    };
  },
  /** 对话框确认按钮 */
  [listener.DIALOG_CONFIRM]() {
    return (event: Event) => {
      const webContents: WebContents = (event as any).sender;
      const dialogWindow: any = BrowserWindow.fromWebContents(webContents);
      const parent = dialogWindow.getParentWindow();

      send(parent.webContents, {
        channel: listener.DIALOG_CONFIRM,
        data: 'ok',
      });

      dialogWindow.close();
      !isAlwaysOnTop && parent.setAlwaysOnTop(false);
      clearDialog(parent.webContents.id);
    };
  },
  /** 对话框取消按钮 */
  [listener.DIALOG_CANCEL]() {
    return (event: Event) => {
      const webContents: WebContents = (event as any).sender;
      const dialogWindow: any = BrowserWindow.fromWebContents(webContents);
      const parent = dialogWindow.getParentWindow();

      send(parent.webContents, {
        channel: listener.DIALOG_CANCEL,
        data: 'cancel',
      });

      !dialogWindow.isDestroyed() && dialogWindow.close();
      !isAlwaysOnTop && !parent.isDestroyed() && parent.setAlwaysOnTop(false);
      clearDialog(parent.webContents.id);
    };
  },
};
