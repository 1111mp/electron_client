import { BrowserWindow } from 'electron';

export type CallBack = (event: any, args: any) => void;

class RendererProcess {
  /** 单例模式（仅适用于单线程） */
  static _instance: RendererProcess;

  static getInstance(): RendererProcess {
    if (!this._instance) {
      this._instance = new RendererProcess();
    }

    return this._instance;
  }

  private _electron?: any;
  private _win?: BrowserWindow;
  private _allEvents: IAnyObject;

  _onWindowStatusChanged?: (e: Event, status: string) => void;

  constructor() {
    this._allEvents = {};

    /** 判断是否处于浏览器环境 */
    if (typeof window === 'undefined') return;

    /** 防止初始化时electron还没有加载完成 */
    Object.defineProperty(this, '_win', {
      get() {
        const { remote } = require('electron');
        return remote.getCurrentWindow();
      },
    });

    Object.defineProperty(this, '_electron', {
      get() {
        return require('electron');
      },
    });
  }

  /**
   * @description: 窗口添加事件：https://electronjs.org/docs/api/browser-window#%E5%AE%9E%E4%BE%8B%E4%BA%8B%E4%BB%B6
   * @param {boolean} isBind
   * @return: void
   */
  bindWinEvents(isBind: boolean = true): void {
    if (!this._win) return;

    const win = this._win;
    const events = [
      'close', // 在窗口要关闭的时候触发。 它在DOM 的beforeunload 和 unload 事件之前触发. 调用event.preventDefault()将阻止这个操作。
      'closed', // 窗口已经关闭时触发。当你接收到这个事件的时候, 你应当删除对已经关闭的窗口的引用对象和避免再次使用它.
      'blur', // 当窗口失去焦点时触发
      'focus', // 当窗口获得焦点时触发
      'show', // 当窗口显示时触发
      'ready-to-show', // 当页面已经渲染完成(但是还没有显示) 并且窗口可以被显示时触发
      'hide', // 当窗口隐藏时触发
      'maximize', // 窗口最大化时触发
      'unmaximize', // 当窗口从最大化状态退出时触发
      'enter-full-screen', // 窗口进入全屏状态时触发
      'leave-full-screen', // 窗口离开全屏状态时触发
      'minimize', // 窗口最小化时触发
      'restore', // 当窗口从最小化状态恢复时触发
    ];
    const method = isBind ? 'on' : 'removeListener';
    events.forEach((event: any) => {
      win[method](
        event,
        (e: Event) =>
          this._onWindowStatusChanged && this._onWindowStatusChanged(e, event)
      );
    });

    if (!isBind) {
      delete this._onWindowStatusChanged;
    }
  }

  /**
   * @description: 获取当前窗口对象
   * @return: 当前窗口对象
   */
  getCurrentWin(): BrowserWindow | void {
    if (!this._electron) return;

    const { remote } = this._electron;
    return remote.getCurrentWindow();
  }

  /**
   * @description: 渲染线程往主线程中发送channel
   * @param {string} channel  事件名
   * @param {any} args  参数
   * @return: void
   */
  send(channel: string, args: any = {}): void {
    if (!this._electron) return;
    this._electron.ipcRenderer.send(channel, args);
  }

  /**
   * @description: 渲染线程往主线程中发送channel 同步
   * @param {string} channel  事件名
   * @param {any} args  参数
   * @return: void
   */
  sendSync(channel: string, args: any): any {
    if (!this._electron) return;
    return this._electron.ipcRenderer.sendSync(channel, args);
  }

  /** 向主线程发送消息 异步获取结果 */
  async invoke(channel: string, args: any): Promise<any> {
    console.log(this._electron);
    return this._electron.ipcRenderer.invoke(channel, args);
  }

  /**
   * @description: 往渲染线程中注册事件
   * @param {string} channel  事件名
   * @param {CallBack} cb  执行事件的回调方法
   * @param {boolean} isOnce  是否注册一次性的事件
   * @return: void
   */
  on(channel: string, cb: CallBack, isOnce?: boolean): void {
    if (!this._electron) return;

    if (cb) {
      if (this._allEvents[channel]) {
        throw new Error('event: [' + channel + '] has been bind!');
      }

      this._allEvents[channel] = cb;
    }

    this._electron.ipcRenderer[isOnce ? 'once' : 'on'](
      channel,
      (event: any, args: any) => {
        this._allEvents[channel] && this._allEvents[channel](args);

        /** 如果只执行一次，则执行后清除 */
        /** 用once注册过的事件 第一次触发执行之后默认会被移除：https://electronjs.org/docs/api/ipc-renderer#ipcrendereroncechannel-listener
         * 这里执行remove强制移除 保证一定被移除
         */
        isOnce && this.remove(channel);
      }
    );
  }

  /**
   * @description: 从渲染线程中移除注册过的事件
   * @param {string} channel  渲染线程注册过的事件名
   * @return: void
   */
  remove(channel: string): void {
    if (!this._electron) return;

    if (channel && this._allEvents[channel]) {
      this._electron.ipcRenderer.removeListener(
        channel,
        this._allEvents[channel]
      );
      delete this._allEvents[channel];
    }
  }

  /**
   * @description: 一次性清楚渲染线程中注册过的channel
   * @return: void
   */
  removeAll(): void {
    if (!this._electron) return;

    const events = Object.keys(this._allEvents);
    events.forEach((channel) => {
      /** 也可使用removeAllListeners一次性清楚所有注册过的channel
       * https://electronjs.org/docs/api/ipc-renderer#ipcrendererremovealllistenerschannel
       */
      if (this._allEvents[channel]) {
        this._electron.ipcRenderer.removeListener(
          channel,
          this._allEvents[channel]
        );
        delete this._allEvents[channel];
      }
    });
  }

  /**
   * @description: 当前窗口是否可以被用户改变窗口大小
   * @return: boolean
   */
  isResizable(): boolean {
    return this._win && this._win.isResizable()
      ? this._win.isResizable()
      : false;
  }

  /**
   * @description: 设置用户是否可以手动调整窗口大小
   * @param {boolean} isResizable 是否可以手动调整窗口大小
   * @return: void
   */
  setResizable(isResizable: boolean): void {
    this._win && this._win.setResizable(isResizable);
  }

  /**
   * @description: 设置窗口是否可由用户移动 在 Linux 上无效
   * @param {boolean} isMovalble  是否可被移动
   * @return: void
   */
  setMovable(isMovalble: boolean): void {
    this._win && this._win.setMovable(isMovalble);
  }

  /**
   * @description: 窗口最小化
   * @return: void
   */
  minimize(): void {
    this._win && this._win.minimize();
  }

  /**
   * @description: 窗口最大化
   * @return: void
   */
  maximize(): void {
    this._win && this._win.maximize();
  }

  /**
   * @description: 取消窗口最大化
   * @return: void
   */
  unmaximize(): void {
    this._win && this._win.unmaximize();
  }

  /**
   * @description: 设置窗口最大化的 width 和 height
   * @param {number} width 宽
   * @param {number} height 高
   * @return: void
   */
  setMaximumSize(width: number, height: number): void {
    this._win && this._win.setMaximumSize(width, height);
  }

  /**
   * @description: 将窗口的大小调整为width和height. 如果width或height低于设定的最小值, 那么对应的大小将被截断至设定的最小值.
   * @param {number} width 宽
   * @param {number} height 高
   * @return: void
   */
  setSize(width: number, height: number) {
    this._win && this._win.setSize(width, height);
  }

  /**
   * @description: 返回 Integer []-包含窗口的宽度和高度。
   * @return: Integer []
   */
  getSize(): number[] {
    return this._win && this._win.getSize() ? this._win.getSize() : [];
  }

  /**
   * @description: 将窗口移动到 x 和 y
   * @param {number} x 坐标x轴的值
   * @param {number} y 坐标y轴的值
   * @return: void
   */
  setPosition(x: number, y: number): void {
    this._win && this._win.setPosition(x, y);
  }

  /**
   * @description: 返回 Integer[] - 返回一个包含当前窗口位置的数组.
   * @return: number[]
   */
  getPosition(): number[] {
    return this._win ? this._win.getPosition() : [];
  }

  /**
   * @description: 设置窗口是否应处于全屏模式
   * @param {boolean} isFull  是否应处于全屏模式
   * @return: void
   */
  setFullScreen(isFull: boolean): void {
    this._win && this._win.setFullScreen(isFull);
  }

  /**
   * @description: 隐藏窗口
   * @return: void
   */
  hide(): void {
    this._win && this._win.hide();
  }

  /**
   * @description: 尝试关闭窗口。这与用户手动点击窗口的关闭按钮效果相同。但页面也可以取消关闭
   * https://electronjs.org/docs/api/browser-window#%E4%BA%8B%E4%BB%B6%EF%BC%9A-close
   * @return: void
   */
  close(): void {
    this._win && this._win.close();
  }

  /**
   * @description: 一次性清楚渲染线程中注册过的channel
   * @return: void
   */
  destroyed(): void {
    this.removeAll();
  }
}

export default () => RendererProcess.getInstance();
