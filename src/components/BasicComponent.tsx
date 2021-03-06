import { BrowserWindow, Event } from 'electron';
import * as React from 'react';
import { Component, Fragment } from 'react';
import initRendererProcess, { CallBack } from 'app/renderer-process';
import { getLocationSearch, queryMergeToStr } from 'app/utils';
import _ from 'lodash';
import { OpenArgs } from 'app/utils/rendererapi';

const listener = require('constants/listener.json');

/**
 * @description: 检测组件是否已经销毁，防止setState内存溢出 https://segmentfault.com/a/1190000017186299
 * @param {any} target  当前组件实例
 */
function injectUnmount(target: any) {
  /** 改装componentWillUnmount，销毁的时候记录一下 */
  const next = target.prototype.componentWillUnmount;

  target.prototype.componentWillUnmount = function (...args: any[]) {
    next && next.apply(this, args);
    this._unmount = true;
  };

  /** 对setState的改装，setState查看目前是否已经销毁 */
  const setState = target.prototype.setState;
  target.prototype.setState = function (...args: any[]) {
    if (this._unmount) return;
    setState.apply(this, args);
  };
}

@injectUnmount
export default class BasicComponent<
  Props = {},
  State = {},
  Other = any
> extends Component<Props, State, Other> {
  $renderer: any;

  constructor(props: Props) {
    super(props);

    // 实例化RendererProcess渲染进程监听函数
    this.$renderer = initRendererProcess();
  }

  /** 重命名componentDidMount 让BasicComponent与React的Component生命周期区分开 */
  componentDidMount(...args: any) {
    return this.didMount.apply(this, args);
  }

  didMount(...args: any[]) {}

  /** 重命名componentDidUpdate 让BasicComponent与React的Component生命周期区分开 */
  componentDidUpdate(...args: any) {
    return this.didUpdate.apply(this, args);
  }

  didUpdate(...args: any[]) {}

  /** 重命名render 让BasicComponent与React的Component render分开 */
  render() {
    return this.$render.apply(this);
  }

  $render() {
    return <Fragment>$render</Fragment>;
  }

  /** 改造componentWillUnmount */
  componentWillUnmount(...args: any) {
    // 移除所有的channel
    this.$renderer.destroyed();
    return this.willUnmount.apply(this, args);
  }

  willUnmount(...args: any[]) {}

  /** 使用箭头函数 防止出现this丢失问题 不需要每个函数都bind(this) */
  /** 渲染线程往主线程中发送channel */
  $send = (channel: string, args?: any): void => {
    this.$renderer.send(channel, args);
  };

  /** 向主线程发送消息 同步获取结果 */
  $sendSync = (channel: string, args?: any): any => {
    return this.$renderer.sendSync(channel, args);
  };

  /** 向主线程发送消息 异步获取结果 */
  $invoke = async (channel: string, args?: any): Promise<any> => {
    return this.$renderer.invoke(channel, args);
  };

  /** 往渲染线程中注册channel */
  $on = (channel: string, cb: CallBack): void => {
    this.$renderer.on(channel, cb);
  };

  /** 往渲染线程中注册一次性channel */
  $once = (channel: string, cb: CallBack): void => {
    this.$renderer.on(channel, cb, true);
  };

  /** 从渲染线程中移除注册过的channel */
  $remove = (channel: string): void => {
    this.$renderer.remove(channel);
  };

  /** 向主线程注册事件 */
  $registEvent = (eventId: string, eventCb: (data: any) => void) => {
    try {
      (window as any).nts = (window as any).nts
        ? { ...(window as any).nts }
        : new Object();
      if ((window as any).nts[eventId]) {
        (window as any).nts[eventId].push(eventCb);
      } else {
        (window as any).nts[eventId] = new Array(eventCb);
      }
      console.log((window as any).nts[eventId]);
      this.$send(listener.REGIST_EVENT, eventId);
    } catch (error) {
      throw new Error('regist event to ipcMain failed!');
    }
  };

  /** 从主线程中注销一个事件 */
  $revokeEvent = (eventId: string, eventCb: (data: any) => void) => {
    try {
      (window as any).nts = (window as any).nts
        ? { ...(window as any).nts }
        : new Object();

      if ((window as any).nts[eventId] && (window as any).nts[eventId].length) {
        let position: number = -1,
          lists = (window as any).nts[eventId];
        for (let i = lists.length - 1; i >= 0; i--) {
          if (lists[i] === eventCb) {
            position = i;
            break;
          }
        }

        if (position === 0) {
          (window as any).nts[eventId].shift();
        } else if (position > 0) {
          (window as any).nts[eventId].splice(position, 1);
        }
      }

      console.log((window as any).nts[eventId]);

      this.$send(listener.REVOKE_EVENT, eventId);
    } catch (error) {
      throw new Error('revoke event from ipcMain failed!');
    }
  };

  /** 调用事件 */
  $callEvent = (eventId: string, args?: IAnyObject) => {
    this.$send(listener.INVOKE_EVENT, { ...args, eventId });
  };

  /** react组件中加载js脚本
   * 参考：https://github.com/threepointone/react-loadscript/blob/master/src/index.js
   */
  $loadScript(url: string) {
    let timeout: number;

    return new Promise((resolve, reject) => {
      const head = document.querySelector('head');
      const elScript = document.createElement('script');
      let loadFinished = false;
      elScript.src = url;
      elScript.onload = () => {
        head && head.removeChild(elScript);
        clearTimeout(timeout);
        if (loadFinished) {
          return;
        }
        loadFinished = true;
        resolve(true);
      };
      head && head.appendChild(elScript);

      timeout = (window as any).setTimeout(() => {
        if (loadFinished) {
          return;
        }
        reject();
        loadFinished = true;
      }, 10 * 1e3); // 10秒超时
    });
  }

  /** 往当前窗口添加窗口状态变化的事件 */
  $bindWinEvents = (isBind: boolean = true): void => {
    this.$renderer.bindWinEvents(isBind);
  };

  /** 绑定窗口事件的回调函数 */
  $onWindowStatusChanged = (cb: (event: Event, status: string) => void) => {
    cb && (this.$renderer._onWindowStatusChanged = cb);
  };

  /** 打开alert弹窗 */
  $alert = (message: string, title: string = '弹窗', data?: IAnyObject) => {
    return new Promise((resolve, reject) => {
      this.$send(listener.DIALOG_SHOW, {
        type: 'alert',
        title,
        message,
        data,
      });

      /** 点击弹窗确认按钮 */
      this.$once(listener.DIALOG_CONFIRM, (args: any) => {
        resolve(args.data);
      });

      /** 点击弹窗取消按钮 */
      // this.$once(listener.DIALOG_CANCEL, (args: any) => {
      //   reject(args.data);
      // });
    });
  };

  /** 打开confirm弹窗 */
  $confirm = (message: string, title: string = '弹窗', data?: IAnyObject) => {
    return new Promise((resolve, reject) => {
      this.$send(listener.DIALOG_SHOW, {
        type: 'confirm',
        title,
        message,
        data,
      });

      /** 这里需要注意 因为confirm弹窗中只能点击取消或者确认按钮 所以肯定有一个channel不会被触发 所以不会被移除 下次打开的时候有一个会报重复注册channel的错误
       *  所以在各自的回调中去帮忙移除另一个的channel
       */
      /** 点击弹窗确认按钮 */
      this.$once(listener.DIALOG_CONFIRM, (args: any) => {
        this.$remove(listener.DIALOG_CANCEL);
        resolve(args.data);
      });

      /** 点击弹窗取消按钮 */
      this.$once(listener.DIALOG_CANCEL, (args: any) => {
        this.$remove(listener.DIALOG_CONFIRM);
        reject(args.data);
      });
    });
  };

  /** 系统通知 */
  $notifier = (params: Notifier.Args) => {
    return new Promise((resolve, reject) => {
      this.$send(listener.NOTIFY, { ...params });

      /** 对所需要监听的事件进行处理 */
      const {} = params;
      /** 默认加上对timeout事件的处理 */
    });
  };

  /**
   * 将当前访问的search附加至传入的url上
   */
  $addUrlQuery = (
    url: string,
    query?: IAnyObject,
    addSearch: boolean = true
  ) => {
    if (typeof window === 'undefined') return url;

    let queryStr = '';
    query &&
      Object.keys(query).forEach((key) => {
        queryStr += `${queryStr ? '&' : ''}${key}=${query[key]}`;
      });

    const search = getLocationSearch();
    queryStr = '?' + queryStr;
    queryStr =
      search && addSearch ? queryMergeToStr(queryStr, search) : queryStr;

    return queryStr
      ? /\?/.test(url)
        ? `${url}&${queryStr.substr(1, queryStr.length)}`
        : url + queryStr
      : url;
  };

  /** 打开新窗口 */
  $openWeb = ({ url, width, height, id }: OpenArgs) => {
    if (typeof window === 'undefined') return;

    this.$send(listener.CUSTOM_WIN_SHOW, {
      url,
      width,
      height,
      id,
    });
  };

  /** 内置浏览器打开指定url页面 */
  $openBrowser = (url: string) => {
    if (typeof window === 'undefined') return;

    this.$send(listener.BROWSER_OPEN_URL, url);
  };

  /** 隐藏窗口 */
  $hide = (): void => {
    this.$renderer.hide();
  };

  /** 窗口最小化 */
  $minimize = (): void => {
    this.$renderer.minimize();
  };

  /** 窗口最大化 */
  $maximize = (): void => {
    this.$renderer.maximize();
  };

  /** 设置窗口最大化的 width 和 height */
  $setMaximumSize = (width: number, height: number) => {
    this.$renderer.$setMaximumSize(width, height);
  };

  /** 取消窗口最大化 */
  $unmaximize = (): void => {
    this.$renderer.unmaximize();
  };

  /** 关闭窗口 */
  $close = (): void => {
    this.$renderer.close();
  };

  /** 设置窗口是否应处于全屏模式 */
  $setFullScreen = (isFull: boolean): void => {
    this.$renderer.setFullScreen(isFull);
  };

  /** 获取当前窗口对象 */
  $getCurrentWin = (): BrowserWindow => {
    return this.$renderer.getCurrentWin();
  };

  /** 设置窗口尺寸 */
  $setSize = (width: number, height: number) => {
    if (!this.$renderer.isResizable()) {
      this.$renderer.setResizable(true);
      this.$renderer.setSize(width, height);
      this.$renderer.setResizable(false);
    } else {
      this.$renderer.setSize(width, height);
    }
  };

  /** 返回 Integer []-包含窗口的宽度和高度。 */
  $getSize = (): number[] => {
    return this.$renderer.$getSize();
  };

  /** 将窗口移动到 x 和 y */
  $setPosition = (x: number, y: number) => {
    this.$renderer.$setPosition(x, y);
  };

  /** 返回 Integer[] - 返回一个包含当前窗口位置的数组. */
  $getPosition = (): number[] => {
    return this.$renderer.$getPosition();
  };
}
