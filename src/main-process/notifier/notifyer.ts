import { screen } from 'electron';
import ChildWindow from '../win/childWin';
import { NOTIFIER } from '../../config';
import { getOptions } from '../../utils/dialog';
import { easeInQuad, easeOutQuad } from '../common';
import { PopupNotify } from './index';

const offset = 8;

export default class Notifier {
  isShown: boolean;
  winInstance?: ChildWindow;
  screenHeight: number = 0;
  private timer: any = null;

  constructor(args: PopupNotify) {
    this.isShown = false;

    this.createNotifier(args);
  }

  createNotifier(args: PopupNotify) {
    let display = screen.getPrimaryDisplay().workAreaSize;
    let WIDTH = display.width;
    let HEIGHT = display.height; // 减去任务栏的高度
    this.screenHeight = HEIGHT;

    const winInstance = (this.winInstance = new ChildWindow({
      width: NOTIFIER.width,
      height: NOTIFIER.height,
      x: WIDTH - NOTIFIER.width - offset,
      y: HEIGHT,
      frame: false,
      resizable: false,
      movable: false,
      alwaysOnTop: true,
      opacity: 0,
      webPreferences: {
        devTools: false,
      },
    }));

    winInstance.bind({
      readyToShow: () => {
        this.show();
      },
      focus: this.focus,
      blur: this.blur,
      closed: this.closed,
    });

    const options = getOptions(NOTIFIER.url, {
      ...args,
      min: false,
    });

    winInstance.loadFile(options, 'window');

    return winInstance;
  }

  show() {
    this.winInstance && this.winInstance.show();
    this.animate(this.winClose);
  }

  /** 执行从底部划出动画 渐变y和opcity */
  animate = (callback: Function, open: boolean = true) => {
    let currentTime = 0;
    this.timer = setInterval(() => {
      currentTime += 10;
      if (currentTime > 200) {
        open && (this.isShown = true);
        clearInterval(this.timer);
        /** 开始执行销毁当前弹窗的方法 */
        callback();
      } else {
        this.setBounds(
          Math.floor(
            open
              ? easeOutQuad(
                  currentTime,
                  this.screenHeight,
                  NOTIFIER.height + offset,
                  200,
                  !open
                )
              : easeInQuad(
                  currentTime,
                  this.screenHeight - NOTIFIER.height - offset,
                  NOTIFIER.height + offset,
                  200
                )
          )
        );
        this.setOpacity(
          Number(
            open
              ? easeInQuad(currentTime, 0, 1, 200, open).toFixed(2)
              : easeOutQuad(currentTime, 1, 0, 200, open).toFixed(2)
          )
        );
      }
    }, 10);
  };

  setBounds = (y: number) => {
    try {
      this.winInstance &&
        this.winInstance.win &&
        !this.winInstance.win.isDestroyed() &&
        this.winInstance.win.setBounds({ y });
    } catch (error) {
      console.log(error);
    }
  };

  setOpacity = (opacity: number) => {
    try {
      this.winInstance &&
        this.winInstance.win &&
        !this.winInstance.win.isDestroyed() &&
        this.winInstance.win.setOpacity(opacity);
    } catch (error) {
      console.log(error);
    }
  };

  focus = () => {
    /** 获取焦点之后 取消倒计时关闭当前窗口 但是由于窗口打开是默认获取焦点的 focus不会重复触发
     *  所以这时候isShown为false 不会clearTimeout 除非先失去焦点 再获取焦点才会clearTimeout */
    if (this.isShown && this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };

  blur = () => {
    /** 开始倒计时关闭当前窗口 */
    this.timer === null && this.winClose();
  };

  /** 窗口关闭触发的事件 */
  closed = () => {
    this.timer && clearTimeout(this.timer);
  };

  /** 倒计时2s之后关闭当前窗口 */
  winClose = () => {
    this.timer = setTimeout(() => {
      this.animate(() => {
        setTimeout(() => {
          this.winInstance &&
            this.winInstance.win &&
            !this.winInstance.win.isDestroyed() &&
            this.winInstance.win.close();
        });
      }, false);
    }, 3000);
  };
}
