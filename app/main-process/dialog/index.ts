import { BrowserWindow, WebContents, IpcMainEvent } from 'electron';
import Dialog from './Dialog';
import { send } from '../common';
import { DIALOG } from '../../config';

const listener = require('../../constants/listener.json');

/** 用于防止dialog被垃圾回收 */
const dialogStack: IDialog.stack = {};

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
      event: IpcMainEvent,
      args: IDialog.state = { type: 'alert', title: '', message: '', data: {} }
    ) => {
      const webContents: WebContents = event.sender;
      const parent: any = BrowserWindow.fromWebContents(webContents);
      const { type, title, message, data } = args;

      if (dialogStack[event.sender.id]) return;

      const { x, y, width, height } = parent.getBounds();

      dialogStack[webContents.id] = new Dialog({
        type,
        title,
        message,
        parent,
        data,
        x: x + width / 2 - DIALOG.width / 2,
        y: y + height / 2 - DIALOG.height / 2,
      });

      !parent.isAlwaysOnTop() && parent.setAlwaysOnTop(true);
    };
  },
  /** 对话框确认按钮 */
  [listener.DIALOG_CONFIRM]() {
    return (event: IpcMainEvent) => {
      const webContents: WebContents = (event as any).sender;
      const dialogWindow: any = BrowserWindow.fromWebContents(webContents);
      const parent = dialogWindow.getParentWindow();

      send(parent.webContents, {
        channel: listener.DIALOG_CONFIRM,
        data: 'ok',
      });

      dialogWindow.close();
      parent.setAlwaysOnTop(false);
      clearDialog(parent.webContents.id);
    };
  },
  /** 对话框取消按钮 */
  [listener.DIALOG_CANCEL]() {
    return (event: IpcMainEvent) => {
      const webContents: WebContents = (event as any).sender;
      const dialogWindow: any = BrowserWindow.fromWebContents(webContents);
      const parent = dialogWindow.getParentWindow();

      send(parent.webContents, {
        channel: listener.DIALOG_CANCEL,
        data: 'cancel',
      });

      !dialogWindow.isDestroyed() && dialogWindow.close();
      !parent.isDestroyed() && parent.setAlwaysOnTop(false);
      clearDialog(parent.webContents.id);
    };
  },
};
