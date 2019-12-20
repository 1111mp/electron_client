import { Event } from 'electron';
import Browser from './browser';
import { send } from '../common';

const listener = require('../../constants/listener.json');

/** 用于防止dialog被垃圾回收 */
let browserStack: IBrowser.stack = [];

/** 清除browser */
function clearDialog() {
  browserStack = [];
}

/** 创建browser */
function getBrowser(finish?: VoidFunction) {
  if (!browserStack.length) {
    browserStack = [new Browser({
      finish,
      closed: clearDialog
    })];
  } else {
    setTimeout(() => finish && finish());
  }

  return browserStack[0];
}

export default {
  /** 创建browser */
  [listener.BROWSER_SHOW]() {
    return (event: Event) => getBrowser();
  },

  /** 内置浏览器打开指定url页面 */
  [listener.BROWSER_OPEN_URL]() {
    return (event: Event, url: string) => {
      const browser = getBrowser(() => {
        send(browser.winInstance.win.webContents, {
          channel: listener.BROWSER_OPEN_URL,
          data: url
        });
      });
    }
  },
}
