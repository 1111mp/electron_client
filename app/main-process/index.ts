import { Event, ipcMain, WebContents } from 'electron';
import log from 'electron-log';
import { openDevTools } from './devTools';
import dialog from './dialog';
import customWin from './customWin';
import browser from './browser';

const listener = require('../constants/listener.json');

export type ChannelType = 'on' | 'once';

export class MainProcess {
  /** 单例模式（仅适用于单线程） */
  static _instance: MainProcess;

  static getInstance(): MainProcess {
    if (!this._instance) {
      this._instance = new MainProcess();
    }

    return this._instance;
  }

  private _allEvents: IAnyObject;

  constructor() {
    this._allEvents = {};
  }

  /**
   * @description: 主线程中题注册channel
   * https://electronjs.org/docs/api/ipc-main#ipcmainremovealllisteners
   * @param {string} channel channel名
   * @param {(event: Event, args: any) => void} cb channel触发时执行的回调函数
   * @param {ChannelType} type 是否注册为一次性的listener
   * @return: void
   */
  regist(channel: string, cb: (event: Event, args: any) => void, type: ChannelType = 'on'): void {
    if (channel in this._allEvents) {
      throw new Error('Event has been registed!');
    }

    let res: any = null;
    this._allEvents[channel] = function (event: Event, args: any) {
      /** 事件记录 */
      console.log(`[ipc event] ${channel}, 'args'`, args);

      try {
        res = cb.call(this, event, args);
      } catch (error) {
        log.error(`[ipc event] ${error}`);
      }
      return res;
    };

    ipcMain[type](channel, this._allEvents[channel]);
  }

  on(channel: string, cb: any): void {
    this.regist(channel, cb, 'on');
  }

  once(channel: string, cb: any): void {
    this.regist(channel, cb, 'once');
  }

  /**
   * @description: 从主线程中移除指定channel的listener
   * @param {string} channel  channel名
   * @return: void
   */
  off(channel: string): void {
    if (!(channel in this._allEvents)) return;

    try {
      ipcMain.removeListener(channel, this._allEvents[channel]);
      delete this._allEvents[channel];
    } catch (e) { }
  }
}

/** 这里可以添加一些定义好的channel */
const events = {
  // 开发者工具
  [listener.MAIN_DEVTOOLS]() {
    return (event: Event) => {
      const webContent: WebContents = event['sender'];
      openDevTools(webContent);
    };
  },
  ...dialog,
  ...customWin,
  ...browser,
}

export default function () {
  const mainProcess = MainProcess.getInstance();

  Object.keys(events).forEach(event => {
    mainProcess.on(event, events[event]());
  });

  return mainProcess;
}
