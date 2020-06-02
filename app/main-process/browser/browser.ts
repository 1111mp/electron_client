import ChildWindow from '../win/childWin';
import { BROWSER } from '../../config';

export default class Browser {
  isShown: boolean;
  winInstance?: ChildWindow;
  // url?: string;
  onShown?: () => void;
  onFinish?: () => void;
  onClosed?: () => void;

  constructor(args?: IBrowser.props) {
    this.isShown = false;
    // this.url = args && args.url;
    this.onShown = args && args.shown;
    this.onFinish = args && args.finish;
    this.onClosed = args && args.closed;

    this.createWindow();
  }

  createWindow() {
    const winInstance = this.winInstance = new ChildWindow({
      width: BROWSER.width,
      height: BROWSER.height,
      minWidth: BROWSER.width,
      minHeight: BROWSER.height,
      center: true,
      resizable: true,
      webPreferences: {
        webviewTag: true
      }
    });

    winInstance.bind({
      readyToShow: () => {
        winInstance.show();
        this.isShown = true;
      },
      finish: this.onFinish,
      closed: this.onClosed
    });

    winInstance.loadFile({ hash: BROWSER.url });

    return winInstance;
  }

  show() {
    this.winInstance && this.winInstance.show();
  }
}
