import { Event, ipcMain, WebContents, IpcMainEvent } from 'electron';
import log from 'electron-log';
import { openDevTools } from './devTools';
import dialog from './dialog';
import customWin from './customWin';
import browser from './browser';
import notifier from './notifier';
import _ from 'lodash';

const listener = require('../constants/listener.json');

export type ChannelType = 'on' | 'once';

export type Callbacks = {
  [cbName: string]: number[];
};

export type Callback = {
  id: number;
  cbName: string;
};

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
  private _rendererCallbacks: Callbacks;

  constructor() {
    this._allEvents = {};
    this._rendererCallbacks = {};
  }

  registCallback(cb: Callback) {
    const { id, cbName } = cb;
    this._rendererCallbacks[cbName] &&
      this._rendererCallbacks[cbName].indexOf(id) === -1 &&
      this._rendererCallbacks[cbName].push(id);
  }

  revokeCallback(cb: Callback) {
    const { id, cbName } = cb;
    this._rendererCallbacks[cbName] &&
      _.remove(this._rendererCallbacks[cbName], id);
  }

  /**
   * @description: 主线程中题注册channel
   * https://electronjs.org/docs/api/ipc-main#ipcmainremovealllisteners
   * @param {string} channel channel名
   * @param {(event: Event, args: any) => void} cb channel触发时执行的回调函数
   * @param {ChannelType} type 是否注册为一次性的listener
   * @return: void
   */
  regist(
    channel: string,
    cb: (event: Event, args: any) => void,
    type: ChannelType = 'on'
  ): void {
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
    } catch (e) {}
  }
}

export const mainProcess = MainProcess.getInstance();

/** 这里可以添加一些定义好的channel */
const events: any = {
  // 开发者工具
  [listener.MAIN_DEVTOOLS]() {
    return (event: Event) => {
      const webContent: WebContents = (event as any).sender;
      openDevTools(webContent);
    };
  },
  [listener.REGIST_CALLBACK]() {
    return (event: IpcMainEvent, cbName: string) => {
      mainProcess.registCallback({ id: event.sender.id, cbName });
    };
  },
  [listener.REVOKE_CALLBACK]() {
    return (event: IpcMainEvent, cbName: string) => {
      mainProcess.revokeCallback({ id: event.sender.id, cbName });
    };
  },
  [listener.THEME_SETTING]() {
    return (event: IpcMainEvent) => {
      // event.reply(window.)
    };
  },
  ...dialog,
  ...customWin,
  ...browser,
  ...notifier,
};

export default function () {
  let mainProcess = MainProcess.getInstance();

  Object.keys(events).forEach((event) => {
    mainProcess.on(event, events[event]());
  });

  return mainProcess;
}
