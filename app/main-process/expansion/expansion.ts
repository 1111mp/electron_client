import { BrowserWindow, screen } from 'electron';
import ChildWindow from '../win/childWin';
import { EXPANSION } from '../../config';
import { getOptions } from '../../utils/dialog';
import { linear } from '../common';

type Args = {
  x: number;
  y: number;
  height: number;
  mainWindow: BrowserWindow;
  leftWidth: boolean;
};

export default class Expansion {
  winInstance?: ChildWindow;
  mainWindow: BrowserWindow;
  leftWidth: boolean;
  private timer: any = null;

  constructor(args: Args) {
    this.mainWindow = args.mainWindow;
    this.leftWidth = args.leftWidth;
    this.createExpansion(args);
  }

  createExpansion(args: Args) {
    const winInstance = (this.winInstance = new ChildWindow({
      width: EXPANSION.width,
      height: args.height,
      x: args.x,
      y: args.y,
      frame: false,
      parent: this.mainWindow,
      resizable: false,
      movable: false,
      thickFrame: false,
      // show: true,
      alwaysOnTop: !this.leftWidth,
      minimizable: false,
      maximizable: false,
      // closable: false,
      // skipTaskbar: false,
      // type: 'toolbar',
      webPreferences: {
        devTools: false,
      },
    }));

    winInstance.bind({
      readyToShow: () => {
        this.show(args.x);
      },
      focus: this.focus,
      blur: this.blur,
      closed: this.closed,
    });

    const options = getOptions(EXPANSION.url, {
      header: false,
    });

    winInstance.loadFile(options, 'window');

    return winInstance;
  }

  show(startX: number) {
    this.winInstance && this.winInstance.show();
    this.animate(startX);
  }

  /** 执行从底部划出动画 渐变y和opcity */
  animate = (startX: number) => {
    let currentTime = 0;
    this.timer = setInterval(() => {
      currentTime += 10;
      if (currentTime > 200) {
        clearInterval(this.timer);
        this.leftWidth &&
          this.mainWindow &&
          this.mainWindow.setAlwaysOnTop(false);
      } else {
        if (this.leftWidth) {
          this.setBounds({
            x: Math.floor(linear(currentTime, startX, EXPANSION.width, 200)),
          });
        } else {
          this.setBounds({
            x: Math.floor(
              linear(currentTime, startX, EXPANSION.width, 200, false)
            ),
            // width: Math.floor(linear(currentTime, 0, EXPANSION.width, 200)),
          });
        }
      }
    }, 10);
  };

  setBounds = ({ x, width }: { x: number; width?: number }) => {
    try {
      this.winInstance &&
        this.winInstance.win &&
        !this.winInstance.win.isDestroyed() &&
        this.winInstance.win.setBounds(width ? { x, width } : { x });
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

  focus = () => {};

  blur = () => {
    // this.mainWindow && this.mainWindow.setAlwaysOnTop(false);
    this.winInstance?.win.setAlwaysOnTop(false);
  };

  /** 窗口关闭触发的事件 */
  closed = () => {
    // this.mainWindow && this.mainWindow.setAlwaysOnTop(false);
  };
}
