/*
 * @Author: 张逸凡
 * @Date: 2019-12-16 11:17:34
 * @LastEditTime: 2020-08-05 14:02:38
 * @LastEditors: Please set LastEditors
 * @Description: electron系统托盘Tray
 * @FilePath: \electron_client\app\main-process\tray\index.ts
 */
import { Menu, NativeImage, Tray } from 'electron';
import log from 'electron-log';
import menuItems from './menuItem';

/**
 * https://electronjs.org/docs/api/tray#%E5%AE%9E%E4%BE%8B%E4%BA%8B%E4%BB%B6
 */
export type TrayEvent =
  // windows
  | 'click'
  | 'right-click'
  | 'double-click'
  | 'balloon-show'
  | 'balloon-click'
  | 'balloon-closed'
  // macOS
  | 'drop'
  | 'drop-files'
  | 'drop-text'
  | 'drag-enter'
  | 'drag-leave'
  | 'drag-end'
  | 'mouse-enter'
  | 'mouse-leave'
  | 'mouse-move';

export interface TrayOptions {
  icon: string | NativeImage;
  hasMenu?: boolean;
}

export default class TrayCreator {
  /** TrayCreator单例 */
  static _instance: TrayCreator;

  static getInstance(options: TrayOptions): TrayCreator {
    if (!this._instance) {
      this._instance = new TrayCreator(options);
    }

    return this._instance;
  }

  private _allEvents: IAnyObject = {};
  private _icon: string | NativeImage;
  private _hasMenu: boolean;

  _trayInstance: Tray | { [k: string]: any };

  constructor(options: TrayOptions) {
    this._hasMenu =
      typeof options.hasMenu === 'undefined' ? true : options.hasMenu;
    this._icon = options.icon;
    this._trayInstance = {};
  }

  // 初始化创建Tray
  initTray(): void {
    const menuContext = Menu.buildFromTemplate(menuItems);

    this._trayInstance = new Tray(this._icon);
    this._hasMenu && this.setContextMenu(menuContext);
  }

  // 设置这个图标的内容菜单
  setContextMenu(menu: Menu): void {
    this._trayInstance && this._trayInstance.setContextMenu(menu);
  }

  // 设置鼠标指针在托盘图标上悬停时显示的文本
  setToolTip(toolTip: string): void {
    this._trayInstance && this._trayInstance.setToolTip(toolTip);
  }

  /**
   * @description: 系统托盘绑定事件
   * @param {TrayEvent} event 事件名
   * @param {() => void} cb 触发事件执行的回调函数
   * @return:void
   */
  on(event: TrayEvent, cb: () => void): void {
    if (event in this._allEvents) {
      throw new Error('Event: ' + event + 'has been registed!');
    }

    let res: any = null;

    this._allEvents[event] = function (...args: any) {
      log.info(`[tray event] ${event}, 'args'`, ...args);

      try {
        res = cb.apply(this, args);
      } catch (error) {
        log.error(`[tray event] ${error}`);
      }
      return res;
    };

    this._trayInstance.addListener(event, this._allEvents[event]);
  }

  /**
   * @description: 移除系统托盘绑定过的事件
   * @param {TrayEvent} event 事件名
   * @return: void
   */
  off(event: TrayEvent): void {
    if (!(event in this._allEvents)) return;

    try {
      this._trayInstance.removeAllListeners(event, this._allEvents[event]);
      delete this._allEvents[event];
    } catch (error) {
      log.error(`[tray event] ${event}, remove error ${error}`);
    }
  }
}
