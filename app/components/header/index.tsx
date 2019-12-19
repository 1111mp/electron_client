import * as React from 'react';
import { Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import BasicComponent from 'components/BasicComponent';

const styles = require('./header.scss');

interface HeaderState {
  isMaximized: boolean
}

@inject((stores: IAnyObject) => ({
  isMaximized: stores.clientStore.isMaximized
}))
@observer
export default class AppHeader extends BasicComponent<IAnyObject> {
  static getDerivedStateFromProps(nextProps: IAnyObject, state: HeaderState) {
    const { isMaximized } = nextProps;
    console.log(isMaximized)
    console.log(state.isMaximized)

    return state.isMaximized !== isMaximized ? { isMaximized } : null
  }

  state: HeaderState = {
    isMaximized: true
  }

  didMount() {
    /** 绑定窗口事件回调 */
    this.$bindWinEvents();
    this.$onWindowStatusChanged((e, status) => {
      switch (status) {
        case 'maximize':
          console.log(11111)
          this.setState({ isMaximized: true });
          break;
      }
    });
  }

  minApp = () => {
    this.$minimize();
  }

  closeApp = () => {
    /** 关闭之前可进行一些操作... */
    require('electron').remote.app.quit();
  }

  $render(): JSX.Element {
    const { isMaximized } = this.state;

    return (
      <Fragment>
        <div className={styles.wrapper}>
          <p className={styles.logoWrapper}>logo</p>
          <div className={styles.widgetsWrapper}>
            <div className={styles.leftWrapper}></div>
            <div className={styles.rightWrapper}>
              <ul className={styles.container}>
                <li className={styles.iconItem} style={{ marginRight: '8px' }} onMouseDown={e => e.stopPropagation()} onClick={this.minApp}>
                  <i className={'iconfont icontop-minimum ' + styles.icon}></i>
                </li>
                <li className={styles.iconItem} style={{ marginRight: '8px' }}>
                  <i className={'iconfont ' + (isMaximized ? 'icontop-tonormal ' : 'icontop-maximize ') + styles.icon}></i>
                </li>
                <li className={styles.iconItem} onMouseDown={e => e.stopPropagation()} onClick={this.closeApp}>
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
