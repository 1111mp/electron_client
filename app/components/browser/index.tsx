import './browser.scss';

import * as React from 'react';

import BasicComponent from 'components/BasicComponent';
import { WebviewTag } from 'electron';
import { BROWSER } from 'app/config';
import { queryParse } from 'app/utils';

import TabGroup, { Tab } from 'electron-tabs';

// const listener = require('app/constants/listener.json');
// const { Header, Content } = Layout;
// const styles = require();
type State = {
  iscrollInstance: any;
  activeWebView: WebviewTag | null;
  isMaximized: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
};

export default class Browser extends BasicComponent {
  private tabGroup?: TabGroup;
  private scrollInstance?: any;

  state: State = {
    iscrollInstance: null,
    activeWebView: null,
    isMaximized: false,
    canGoBack: false,
    canGoForward: false,
  };

  didMount() {
    const { url } = queryParse(location.search);
    this.initTabGroup();
    this.openUrl(url);
  }

  willUnmount() {
    // this.tabGroup = null;
  }

  initTabGroup = () => {
    this.tabGroup = new TabGroup({
      /** 不展示新建窗口按钮 如需展示 设置newTab属性 */
      // newTab: {
      //   title: 'New Tab'
      // }
    });

    // tabGroup.addTab({
    //   title: 'Google',
    //   src: 'https://www.baidu.com'
    // });

    this.tabGroup.on('tab-added', (tab: Tab) => {
      /** tab失去焦点是触发 包括被close也会触发 */
      tab.on('inactive', (tab: Tab) => {
        setTimeout(() => {
          const { activeWebView } = this.state;
          this.setState({
            canGoBack: (activeWebView as WebviewTag).canGoBack(),
            canGoForward: (activeWebView as WebviewTag).canGoForward(),
          });
        });
      });

      tab.webview.addEventListener('dom-ready', () => {
        this.setState({
          canGoBack: tab.webview.canGoBack(),
          canGoForward: tab.webview.canGoForward(),
        });
        tab.webview.addEventListener('did-navigate-in-page', () => {
          this.setState({
            canGoBack: tab.webview.canGoBack(),
            canGoForward: tab.webview.canGoForward(),
          });
        });
      });
    });

    /** 设置当前活动的webview */
    this.tabGroup.on('tab-active', (tab, tabGroup) => {
      this.setState({
        activeWebView: tab.webview,
      });
      const { iscrollInstance } = this.state;
      if (iscrollInstance) {
        iscrollInstance.scrollToElement(tab.tab, 500);
      }
    });

    /** 没有tab，则关闭窗口 */
    this.tabGroup.on('tab-removed', (tab: Tab, group) => {
      !group.tabs.length && this.$close();
    });
  };

  openUrl = (src: string) => {
    this.tabGroup &&
      this.tabGroup.addTab({
        title: 'loading...',
        active: true,
        src,
        ready: (tab) => this.initTabWebView(tab),
      });
  };

  initTabWebView = (tabInstance: any) => {
    const { iscrollInstance } = this.state;
    const { webview } = tabInstance;

    tabInstance.on('close', (tab: Tab) => {
      if (iscrollInstance) {
        iscrollInstance.refresh();
      } else {
        this.initIscroll();
      }
    });

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
  };

  initIscroll = () => {
    // @ts-ignore
    import('iscroll').then((iscroll) => {
      const IScroll = iscroll.default;
      const iscrollInstance = new IScroll(this.scrollInstance, {
        // scrollbars: true,
        mouseWheel: true,
        scrollX: true,
        preventDefault: false,
      });

      this.setState({ iscrollInstance });
    });
  };

  setMaximize = (flag: boolean) => {
    const method = flag ? '$maximize' : '$unmaximize';

    this.setState({ isMaximized: flag }, () => {
      this[method]();
      /** 恢复大小需要重设尺寸 */
      !flag && this.$setSize(BROWSER.width, BROWSER.height);
    });
  };

  renderHistory = () => {
    const { activeWebView, canGoBack, canGoForward } = this.state;

    return (
      <ul className="icons-container">
        <li
          className={'icon-history ' + (canGoBack ? '' : 'history-disabled')}
          style={{ marginRight: '2px' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => activeWebView && activeWebView.goBack()}
        >
          <i className="iconfont iconpre"></i>
        </li>
        <li
          className={'icon-history ' + (canGoForward ? '' : 'history-disabled')}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => activeWebView && activeWebView.goForward()}
        >
          <i className="iconfont iconnext"></i>
        </li>
        <li
          className={'icon-history'}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => activeWebView && activeWebView.reload()}
        >
          <i className="iconfont iconshuaxin"></i>
        </li>
      </ul>
    );
  };

  renderController = () => {
    const { isMaximized } = this.state;
    return (
      <ul className="icons-container">
        <li
          className="icon-item"
          style={{ marginRight: '8px' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => this.$minimize()}
        >
          <i className={'iconfont icontop-minimum'}></i>
        </li>
        <li
          className="icon-item"
          style={{ marginRight: '8px' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => this.setMaximize(!isMaximized)}
        >
          <i
            className={
              'iconfont ' +
              (isMaximized ? 'icontop-tonormal ' : 'icontop-maximize')
            }
          ></i>
        </li>
        <li
          className="icon-item"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => this.$close()}
        >
          <i className={'iconfont icontop-close'}></i>
        </li>
      </ul>
    );
  };

  // callEvent = () => {
  //   this.$callEvent('get_name', { name: 123456789 });
  // };

  $render() {
    return (
      <div className="module-browser">
        <div className="etabs-tabgroup">
          {this.renderHistory()}
          <div
            className="browser-tabs-container"
            ref={(ref) => (this.scrollInstance = ref)}
          >
            <div className="etabs-tabs"></div>
          </div>
          {/* <div className="etabs-buttons"></div> */}
          <div className="empty"></div>
          {this.renderController()}
        </div>
        <div className="etabs-views"></div>
      </div>
    );
  }
}
