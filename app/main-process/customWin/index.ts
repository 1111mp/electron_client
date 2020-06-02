import { Event, WebContents } from 'electron';
import CustomWindow, { CustomWindowArgs } from './customWin';
import { send } from '../common';

const listener = require('../../constants/listener.json');

/** 保存打开过的customWin 用于防止被垃圾回收
 *  需要注意：目前当窗口close之后 默认就会被destory 如果调用show 会报错：Object has been destoryed
 *  所以这里加上了isDestoryed的判断
 */
const winStack: { [id: string]: { url: string, win: CustomWindow } } = {};

export function createCusWin(options: CustomWindowArgs) {
  if (winStack[options.id] && !winStack[options.id].win.isDestroyed()) {
    winStack[options.id].win.show();
  } else {
    /** 判断是否有相同地址的窗口，如果有则认为是同一个不再打开新窗口 */
    let existCsWinId = '';
    Object.keys(winStack).forEach(key => {
      winStack[key].url === options.url && !existCsWinId && (existCsWinId = key);
    });

    if (existCsWinId && !winStack[existCsWinId].win.isDestroyed()) {
      winStack[existCsWinId].win.show();
    } else {
      if (winStack[options.id]) {
        delete winStack[options.id];
      }
      winStack[options.id] = {
        url: options.url,
        win: new CustomWindow({
          width: options.width,
          height: options.height,
          url: options.url,
          closed: () => {
            if (options.onClose && options.onClose() === false) return;

            send(options.webContents, {
              channel: listener.CUSTOM_WIN_CLOSE,
              data: 'closed'
            });

            delete winStack[options.id];
          }
        }),
      };
    }
  }
}

export default {
  /** 自定义窗口 */
  [listener.CUSTOM_WIN_SHOW]() {
    return (event: Event, args: CustomWindowArgs) => {
      const webContents: WebContents = event['sender'];
      const { id, width, height, url } = args;
      const customWinId = id || webContents.id;

      createCusWin({
        id: customWinId,
        width,
        height,
        url,
        webContents
      });
    }
  }
}
