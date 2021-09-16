import {
  Event,
  ipcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
  WebContents,
  BrowserWindow,
} from 'electron';
import log from 'electron-log';
import { openDevTools } from './devTools';
import dialog from './dialog';
import webWin from './webWin';
import browser from './browser';
import notifier from './notifier';
import _ from 'lodash';

const { webContents } = require('electron');

const listener = require('../constants/listener.json');

export type ChannelType = 'on' | 'once' | 'handle';

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

export type MainDatas = {
  [key: string]: string;
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

  // _mainWindow: BrowserWindow | null;
  private _allEvents: IAnyObject;
  private _rendererEvents: CbEvents;
  private _datas: MainDatas;

  constructor() {
    // this._mainWindow = mainWindow;
    this._allEvents = {};
    this._rendererEvents = {};
    this._datas = new Object() as MainDatas;
  }

  registEvent(cb: CbEvent) {
    const { id, eventId } = cb;
    this._rendererEvents[eventId] = this._rendererEvents[eventId] || [];

    this._rendererEvents[eventId] &&
      this._rendererEvents[eventId].indexOf(id) === -1 &&
      this._rendererEvents[eventId].push(id);
  }

  invokeEvent(args: InvokeCb) {
    const { eventId } = args;

    this._rendererEvents[eventId] &&
      webContents
        .getAllWebContents()
        .filter(
          (content: WebContents) =>
            this._rendererEvents[eventId].indexOf(content.id) !== -1
        )
        .forEach((content: WebContents) => {
          content.executeJavaScript(
            `window.nts.${eventId} && window.nts.${eventId}.forEach(cb => cb(${JSON.stringify(
              {
                ...args,
              }
            )}))`
          );
        });
  }

  revokeEvent(cb: CbEvent) {
    const { id, eventId } = cb;
    this._rendererEvents[eventId] &&
      _.remove(this._rendererEvents[eventId], id);
  }

  setData(datas: MainDatas) {
    this._datas = {
      ...this._datas,
      ...datas,
    };
  }

  getData(keys: string[]) {
    try {
      return keys.map((key) => this._datas[key] || '');
    } catch (error) {
      throw new Error('Cannot find the specified data!');
    }
  }

  getMainWindow() {
    return webContents
      .getAllWebContents()
      .find(
        (webContent: any) =>
          webContent.browserWindowOptions &&
          webContent.browserWindowOptions.title === 'mainWindow'
      );
  }

  /** 从mainWindow的webContent获取挂载在全局window对象上的对应key的数据 */
  async getDataFromMainWindow(keys: string[]) {
    let script = '{';

    if (keys.length === 0) {
      script = `${keys[0]}}`;
    } else {
      keys.forEach((key: string, index: number) => {
        if (index === keys.length - 1) {
          script += `${key}}`;
        } else {
          script += `${key},`;
        }
      });
    }

    const mainWindow: WebContents = this.getMainWindow()!;

    if (mainWindow) {
      return mainWindow
        .executeJavaScript(`Promise.resolve(${script});`)
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      throw new Error('Cannot find the mainWindow!');
    }
  }

  /** 调用mainWindow的webContent全局的方法 */
  invokeMainWindowFunc({ funcname, args }: { funcname: string; args: any }) {
    const mainWindow: WebContents = this.getMainWindow()!;
    if (mainWindow) {
      mainWindow.executeJavaScript(
        `window.${funcname}(${JSON.stringify(args)})`
      );
    }
  }

  deleteData(keys: string[]) {
    keys &&
      keys.forEach((key) => {
        this._datas[key] && delete this._datas[key];
      });
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

  handle(channel: string, cb: any): void {
    this.regist(channel, cb, 'handle');
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

// export const mainProcess = MainProcess.getInstance();

/** 这里可以添加一些定义好的channel */
function getEvents(mainProcess: MainProcess): { [key: string]: Function } {
  return {
    // 开发者工具
    [listener.MAIN_DEVTOOLS]() {
      return (event: Event) => {
        const webContent: WebContents = (event as any).sender;
        openDevTools(webContent);
      };
    },
    /** 渲染线程向主线程注册事件 */
    [listener.REGIST_EVENT]() {
      return (event: IpcMainEvent, eventId: string) => {
        mainProcess.registEvent({ id: event.sender.id, eventId });
      };
    },
    /** 移除渲染线程向主线程注册的事件 */
    [listener.REVOKE_EVENT]() {
      return (event: IpcMainEvent, eventId: string) => {
        mainProcess.revokeEvent({ id: event.sender.id, eventId });
      };
    },
    /** 触发对应渲染线程注册过的事件 */
    [listener.INVOKE_EVENT]() {
      return (event: IpcMainEvent, args: InvokeCb) => {
        mainProcess.invokeEvent({ ...args });
      };
    },
    /** 渲染线程向主线程存数据 方便其他渲染线程获取 json格式数据 可传多个数据 */
    [listener.SET_DATA]() {
      return (event: IpcMainEvent, datas: MainDatas) => {
        mainProcess.setData(datas);
      };
    },
    /** 渲染线程向主线程获取数据 可传多个key */
    [listener.GET_DATA]() {
      return (event: IpcMainEvent, keys: string[]) => {
        const res = mainProcess.getData(keys);
        event.returnValue = res;
      };
    },
    /** 删除指定key的数据 可传多个key */
    [listener.DELETE_DATA]() {
      return (event: IpcMainEvent, keys: string[]) => {
        mainProcess.deleteData(keys);
      };
    },
    /** 同步向mainWindow的webContent获取挂载在全局window的数据 支持同时获取多个key的数据 例如 window.setting的数据 */
    [listener.GET_DATA_FROM_MAIN_WINDOW]() {
      return async (event: IpcMainEvent, keys: string[]) => {
        try {
          const data = await mainProcess.getDataFromMainWindow(keys);
          event.returnValue = data;
        } catch (error) {
          event.returnValue = {};
        }
      };
    },
    /** 调用mainWindow的webContent挂载在全局window上的方法 可以做成支持传递多个方法名去调用 但是没必要 */
    [listener.INVOKE_MAIN_WINDOW_FUNC]() {
      return (event: IpcMainEvent, data: { funcname: string; args: any }) => {
        mainProcess.invokeMainWindowFunc(data);
      };
    },
    ...dialog,
    ...webWin,
    ...browser,
    ...notifier,
  };
}

/** https://www.electronjs.org/docs/api/ipc-main#ipcmainhandlechannel-listener */
function getHandleEvents(
  mainProcess: MainProcess
): { [key: string]: Function } {
  return {
    [listener.GET_DATA_ASYNC]() {
      return async (event: IpcMainInvokeEvent, keys: any[]) => {
        // const res = mainProcess.getData(keys);
        // return res;
        try {
          const res = mainProcess.getData(keys);
          return Promise.resolve(res);
        } catch (error) {
          return Promise.reject(error);
        }
      };
    },
    /** 异步向mainWindow的webContent获取挂载在全局window的数据 支持同时获取多个key的数据 例如 window.setting的数据 */
    [listener.GET_DATA_FROM_MAIN_WINDOW_ASYNC]() {
      return async (event: IpcMainInvokeEvent, keys: string[]) => {
        try {
          const data = await mainProcess.getDataFromMainWindow(keys);
          return Promise.resolve(data);
        } catch (error) {
          return Promise.reject({});
        }
      };
    },
  };
}

export default async function () {
  let mainProcess = MainProcess.getInstance();

  const events = getEvents(mainProcess);
  Object.keys(events).forEach((event) => {
    mainProcess.on(event, events[event]());
  });

  const handleEvents = getHandleEvents(mainProcess);

  Object.keys(handleEvents).forEach((handle) => {
    mainProcess.handle(handle, handleEvents[handle]());
  });

  return Promise.resolve();
}
