import { BrowserWindow, Event } from 'electron';
import * as React from 'react';
import { Component, Fragment } from 'react';
import RendererProcess, { CallBack } from 'app/renderer-process';

const listener = require('constants/listener.json');

interface OpenArgs {
  url: string;
  width?: number;
  height?: number;
  id?: string;
}

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
  }

  /** 对setState的改装，setState查看目前是否已经销毁 */
  const setState = target.prototype.setState;
  target.prototype.setState = function (...args: any[]) {
    if (this._unmount) return;
    setState.apply(this, args);
  }
}

@injectUnmount
export default class BasicComponent<Props = {}, State = {}, Other = any> extends Component<Props, State, Other> {
  $renderer: any;

  constructor(props: Props) {
    super(props);

    // 实例化RendererProcess渲染进程监听函数
    this.$renderer = new RendererProcess();
  }

  /** 重命名componentDidMount 让BasicComponent与React的Component生命周期区分开 */
  componentDidMount(...args: any) {
    return this.didMount.apply(this, args);
  }

  didMount(...args: any[]) { }

  /** 重命名componentDidUpdate 让BasicComponent与React的Component生命周期区分开 */
  componentDidUpdate(...args: any) {
    return this.didUpdate.apply(this, args);
  }

  didUpdate(...args: any[]) { }

  /** render 让BasicComponent与React的Component render分开 */
  render() {
    return this.$render.apply(this);
  }

  $render() {
    return (
      <Fragment>
        $render
      </Fragment>
    )
  }

  /** 改造componentWillUnmount */
  componentWillUnmount(...args: any) {
    // 移除所有的channel
    this.$renderer.destroyed();
    return this.willUnmount.apply(this, args);
  }

  willUnmount(...args: any[]) { }

  /** 使用箭头函数 防止出现this丢失问题 不需要每个函数都bind(this) */
  /** 渲染线程往主线程中发送channel */
  $send = (channel: string, args?: any): void => {
    this.$renderer.send(channel, args);
  }

  /** 往渲染线程中注册channel */
  $on = (channel: string, cb: CallBack): void => {
    this.$renderer.on(channel, cb);
  }

  /** 往渲染线程中注册一次性channel */
  $once = (channel: string, cb: CallBack): void => {
    this.$renderer.on(channel, cb, true);
  }

  /** 从渲染线程中移除注册过的channel */
  $remove = (channel: string): void => {
    this.$renderer.remove(channel);
  }

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
        resolve();
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
  $bindWinEvents = (): void => {
    this.$renderer.bindWinEvents();
  }

  /** 绑定窗口事件的回调函数 */
  $onWindowStatusChanged = (cb: (event: Event, status: string) => void) => {
    cb && (this.$renderer._onWindowStatusChanged = cb);
  }

  /** 打开alert弹窗 */
  $alert = (message: string, title: string = '弹窗', data?: IAnyObject) => {
    return new Promise((resolve, reject) => {
      this.$send(listener.DIALOG_SHOW, {
        type: 'alert',
        title,
        message,
        data
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
  }

  /** 打开confirm弹窗 */
  $confirm = (message: string, title: string = '弹窗', data?: IAnyObject) => {
    return new Promise((resolve, reject) => {
      this.$send(listener.DIALOG_SHOW, {
        type: 'confirm',
        title,
        message,
        data
      });

      /** 这里需要注意 因为confirm弹窗中只能点击取消或者确认按钮 所以肯定有一个不会被触发 所以不会被移除 下次打开的时候有一个会报重复注册channel的错误
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
  }

  /** 打开新窗口 */
  $open = ({ url, width, height, id }: OpenArgs) => {
    if (typeof window === 'undefined') return;

    this.$send(listener.CUSTOM_WIN_SHOW, {
      url,
      width,
      height,
      id
    });
  }

  /** 打开模态窗 */
  $openModal = ({ url, width, height, id }: OpenArgs) => {
    if (typeof window === 'undefined') return;

    this.$send(listener.CUSTOM_WIN_SHOW, {
      url,
      width,
      height,
      id
    });
  }

  /** 内置浏览器打开指定url页面 */
  $openBrowser = (url: string) => {
    if (typeof window === 'undefined') return;

    this.$send(listener.BROWSER_OPEN_URL, url);
  }

  /** 隐藏窗口 */
  $hide = (): void => {
    this.$renderer.hide();
  }

  /** 关闭窗口 */
  $close = (): void => {
    this.$renderer.close();
  }

  /** 设置窗口是否应处于全屏模式 */
  $setFullScreen = (isFull: boolean): void => {
    this.$renderer.setFullScreen(isFull);
  }

  /** 获取当前窗口对象 */
  $geCurrentWin = (): BrowserWindow => {
    return this.$renderer.geCurrentWin();
  }
}
