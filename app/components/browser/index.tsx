import './browser.global.scss';

import * as React from 'react';
import { Fragment } from 'react';

import BasicComponent from "components/BasicComponent";
// import { Tag } from 'antd';
import { BROWSER } from 'app/config';

const TabGroup = require('electron-tabs');

const listener = require('app/constants/listener.json');
// const { Header, Content } = Layout;
// const styles = require();

export default class Browser extends BasicComponent {
  private tabGroup?: any;
  // state: IDialog.state;

  state = {
    iscrollInstance: null,
    activeWebView: null,
    isMaximized: false
  }

  didMount() {
    this.$on(listener.BROWSER_OPEN_URL, args => {
      this.openUrl(args.data);
    })

    const tabGroup = this.tabGroup = new TabGroup({
      /** 不展示新建窗口按钮 如需展示 设置newTab属性 */
      // newTab: {
      //   title: 'New Tab'
      // }
    });

    /** 设置当前活动的webview */
    tabGroup.on('tab-active', (tab) => {
      this.setState({ activeWebView: tab.webview });
    });

    /** 没有tab，则关闭窗口 */
    tabGroup.on('tab-removed', (tab, group) => {
      !group.tabs.length && this.$close();
    });
  }

  openUrl = (src: string) => {
    this.tabGroup && this.tabGroup.addTab({
      title: 'loading...',
      active: true,
      src,
      ready: (tab) => this.initTabWebView(tab),
    });
  }

  initTabWebView = (tabInstance: any) => {
    const { iscrollInstance } = this.state;
    const { webview } = tabInstance;

    webview.addEventListener('dom-ready', () => {
      tabInstance.setTitle(webview.getTitle());

      /** 重写滚动条样式 */
      webview.insertCSS(
        `
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.1);
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.2);
          }
        `
      );

      /** init iscroll */
      if (iscrollInstance) {
        iscrollInstance.refresh();
        iscrollInstance.scrollToElement(tabInstance.tab, 500);
      } else {
        this.initIscroll();
      }
    });

    webview.addEventListener('new-window', (e: any) => {
      console.log(e);
      this.openUrl(e.url);
    });

    webview.addEventListener('did-fail-load', (...args: any[]) => {
      console.log('load failed', args);
    });
  }

  initIscroll = () => {
    import('iscroll').then((iscroll) => {
      const IScroll = iscroll.default;
      const iscrollInstance = new IScroll(this.refs.iscroll, {
        // scrollbars: true,
        mouseWheel: true,
        scrollX: true,
        preventDefault: false
      });

      this.setState({ iscrollInstance });
    });
  }

  setMaximize = (flag: boolean) => {
    const method = flag ? '$maximize' : '$unmaximize';

    this.setState({ isMaximized: flag }, () => {
      this[method]();
      /** 恢复大小需要重设尺寸 */
      !flag && this.$setSize(BROWSER.width, BROWSER.height);
    });
  }

  renderController = () => {
    const { isMaximized } = this.state;
    return (
      <ul className="icons-container">
        <li
          className="icon-item"
          style={{ marginRight: '8px' }}
          onMouseDown={e => e.stopPropagation()}
          onClick={() => this.$minimize()}
        >
          <i className={'iconfont icontop-minimum'}></i>
        </li>
        <li
          className="icon-item"
          style={{ marginRight: '8px' }}
          onMouseDown={e => e.stopPropagation()}
          onClick={() => this.setMaximize(!isMaximized)}
        >
          <i className={'iconfont ' + (isMaximized ? 'icontop-tonormal ' : 'icontop-maximize')}></i>
        </li>
        <li
          className="icon-item"
          onMouseDown={e => e.stopPropagation()}
          onClick={() => this.$close()}
        >
          <i className={'iconfont icontop-close'}></i>
        </li>
      </ul>
    )
  }

  $render() {
    return (
      <Fragment>
        <div className="etabs-tabgroup">
          <div className="browser-tabs-container" ref="iscroll">
            <div className="etabs-tabs"></div>
          </div>
          {/* <div className="etabs-buttons"></div> */}
          <div className="empty"></div>
          {this.renderController()}
        </div>
        <div className="etabs-views">

        </div>
      </Fragment>
    )
  }
}
