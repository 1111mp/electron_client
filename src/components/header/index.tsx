import * as React from 'react';
import { Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import BasicComponent from 'components/BasicComponent';
import { Mainwin } from 'app/config';

const styles = require('./header.scss');

// interface HeaderState {
//   isMaximized: boolean
// }

interface HeaderProps extends IAnyObject {
  isMaximized?: boolean;
}

@inject((stores: IAnyObject) => ({
  routerStore: stores.routerStore,
  isMaximized: stores.clientStore.isMaximized,
  setMaximized: stores.clientStore.setMaximized,
}))
@observer
export default class AppHeader extends BasicComponent<HeaderProps> {
  /** 窗口是否最大化的变量isMaximized交由全局的mobx管理 方便是否进入最大化状态下会影响其他地方一些视图或者功能上的变化 */

  didMount() {
    /** 绑定窗口事件 */
    this.$bindWinEvents();
    /** 设置窗口事件回调函数 */
    this.$onWindowStatusChanged((e, status) => {
      const { setMaximized } = this.props;
      switch (status) {
        case 'maximize':
          setMaximized(true);
          break;
        case 'unmaximize':
          setMaximized(false);
          break;
        case 'enter-full-screen':
          setMaximized(true);
          break;
        case 'leave-full-screen':
          setMaximized(true);
          break;
      }
    });
  }

  willUnmount() {
    /** 移除绑定的窗口事件 */
    this.$bindWinEvents(false);
  }

  minApp = () => {
    this.$minimize();
  };

  setMaximize = (flag: boolean) => {
    const { setMaximized } = this.props;
    const method = flag ? '$maximize' : '$unmaximize';

    this[method]();
    setMaximized(flag);
    if (!flag) {
      this.$setSize(Mainwin.width, Mainwin.height);
    }
  };

  closeApp = () => {
    /** 关闭之前可进行一些操作... */
    require('@electron/remote').app.quit();
  };

  renderHistory() {
    const { routerStore } = this.props;
    let goBack = true;
    let goForward = true;

    const webContents = require('@electron/remote').getCurrentWebContents();

    goBack = webContents.canGoBack();
    goForward = webContents.canGoForward();

    return (
      <ul className={styles.container}>
        <li
          className={
            styles.iconHistory + (goBack ? '' : ` ${styles.hisoryDisabled}`)
          }
          style={{ marginRight: '2px' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => goBack && routerStore.goBack()}
        >
          <i className={'iconfont iconpre ' + styles.icon}></i>
        </li>
        <li
          className={
            styles.iconHistory + (goForward ? '' : ` ${styles.hisoryDisabled}`)
          }
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => goForward && routerStore.goForward()}
        >
          <i className={'iconfont iconnext ' + styles.icon}></i>
        </li>
      </ul>
    );
  }

  $render(): JSX.Element {
    const { isMaximized } = this.props;

    return (
      <Fragment>
        <div className={styles.wrapper}>
          <p className={styles.logoWrapper}>
            logo
            <i className={styles.separater} />
          </p>
          <div className={styles.widgetsWrapper}>
            <div className={styles.leftWrapper}>{this.renderHistory()}</div>
            <div className={styles.rightWrapper}>
              <ul className={styles.container}>
                <li
                  className={styles.iconItem}
                  style={{ marginRight: '8px' }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={this.minApp}
                >
                  <i className={'iconfont icontop-minimum ' + styles.icon}></i>
                </li>
                <li
                  className={styles.iconItem}
                  style={{ marginRight: '8px' }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => this.setMaximize(!isMaximized)}
                >
                  <i
                    className={
                      'iconfont ' +
                      (isMaximized
                        ? 'icontop-tonormal '
                        : 'icontop-maximize ') +
                      styles.icon
                    }
                  ></i>
                </li>
                <li
                  className={styles.iconItem}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={this.closeApp}
                >
                  <i className={'iconfont icontop-close ' + styles.icon}></i>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
