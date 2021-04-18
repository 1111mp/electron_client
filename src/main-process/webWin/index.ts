import { BrowserWindow, Event, WebContents } from 'electron';
import CustomWindow, { CustomWindowArgs } from './webWin';
import { send } from '../common';

const listener = require('../../constants/listener.json');

/** 保存打开过的customWin 用于防止被垃圾回收
 *  需要注意：目前当窗口close之后 默认就会被destory 如果调用show 会报错：Object has been destoryed
 *  所以这里加上了isDestoryed的判断
 */
const winStack: { [id: string]: { url: string; win: CustomWindow } } = {};

export function createCusWin(options: CustomWindowArgs) {
  if (winStack[options.id] && !winStack[options.id].win.isDestroyed()) {
    winStack[options.id].win.show();
  } else {
    /** 判断是否有相同地址的窗口，如果有则认为是同一个不再打开新窗口 */
    let existCsWinId = '';
    Object.keys(winStack).forEach((key) => {
      winStack[key].url === options.url &&
        !existCsWinId &&
        (existCsWinId = key);
    });

    if (existCsWinId && !winStack[existCsWinId].win.isDestroyed()) {
      winStack[existCsWinId].win.show();
    } else {
      if (winStack[options.id]) {
        delete winStack[options.id];
      }
      winStack[options.id] = {
        url: options.url,
        win: new CustomWindow(
          Object.assign(
            {
              width: options.width,
              height: options.height,
              url: options.url,
              modal: options.modal,
              center: options.center,
              closed: () => {
                if (options.onClose && options.onClose() === false) return;

                send(options.webContents, {
                  channel: listener.CUSTOM_WIN_CLOSE,
                  data: 'closed',
                });

                delete winStack[options.id];
              },
              x: options.x,
              y: options.y,
            },
            options.modal ? { parent: options.parent } : {}
          )
        ),
      };
    }
  }
}

export default {
  /** 自定义窗口 */
  [listener.CUSTOM_WIN_SHOW]() {
    return (event: Event, args: CustomWindowArgs) => {
      const webContents: WebContents = (event as any).sender;
      const { id, width, height, url, modal = false, center = true } = args;
      const customWinId = id || webContents.id;
      
      if (modal || center) {
        const parent: BrowserWindow = BrowserWindow.fromWebContents(
          webContents
        )!;
        const {
          x,
          y,
          width: parentWidth,
          height: parentHeight,
        } = parent!.getBounds();

        createCusWin({
          id: customWinId,
          width,
          height,
          url,
          modal,
          webContents,
          parent,
          center,
          x: x + parentWidth / 2 - width / 2,
          y: y + parentHeight / 2 - height / 2,
        });
      } else {
        createCusWin({
          id: customWinId,
          width,
          height,
          url,
          modal,
          webContents,
        });
      }
    };
  },
};
