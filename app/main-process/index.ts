import { Event, ipcMain, IpcMainEvent, WebContents } from 'electron';
import log from 'electron-log';
import { openDevTools } from './devTools';
import dialog from './dialog';
import customWin from './customWin';
import browser from './browser';
import notifier from './notifier';
import _ from 'lodash';
const { webContents } = require('electron');

const listener = require('../constants/listener.json');

export type ChannelType = 'on' | 'once';

export type CbEvents = {
  [eventId: string]: number[];
};

export type CbEvent = {
  id: number;
  eventId: string;
};

export type InvokeCb = {
  eventId: string;
  [key: string]: any;
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
  private _rendererEvents: CbEvents;

  constructor() {
    this._allEvents = {};
    this._rendererEvents = {};
  }

  registEvent(cb: CbEvent) {
    const { id, eventId } = cb;
    this._rendererEvents[eventId] = this._rendererEvents[eventId] || [];

    this._rendererEvents[eventId] &&
      this._rendererEvents[eventId].indexOf(id) === -1 &&
      this._rendererEvents[eventId].push(id);

    console.log(this._rendererEvents);
  }

  invokeEvent(args: InvokeCb) {
    const { eventId } = args;

    this._rendererEvents[eventId] &&
      webContents
        .getAllWebContents()
        .filter(
          (content) => this._rendererEvents[eventId].indexOf(content.id) !== -1
        )
        .forEach((content) => {
          content.executeJavaScript(
            `window.nts.${eventId} && window.nts.${eventId}.forEach(cb => cb(${JSON.stringify({
              ...args,
            })}))`
          );
        });
  }

  revokeEvent(cb: CbEvent) {
    const { id, eventId } = cb;
    this._rendererEvents[eventId] &&
      _.remove(this._rendererEvents[eventId], id);

    console.log(this._rendererEvents);
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
  [listener.REGIST_EVENT]() {
    return (event: IpcMainEvent, eventId: string) => {
      console.log(11111111111);
      console.log(eventId);
      console.log(event.sender.id);
      mainProcess.registEvent({ id: event.sender.id, eventId });
    };
  },
  [listener.REVOKE_EVENT]() {
    return (event: IpcMainEvent, eventId: string) => {
      console.log(22222222222);
      console.log(eventId);
      console.log(event.sender.id);
      mainProcess.revokeEvent({ id: event.sender.id, eventId });
    };
  },
  [listener.INVOKE_EVENT]() {
    return (event: IpcMainEvent, args: InvokeCb) => {
      console.log(3333333333);
      console.log(args);
      console.log(event.sender.id);
      mainProcess.invokeEvent({ ...args });
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
