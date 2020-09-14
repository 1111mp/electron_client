import React from 'react';
import BasicComponent from 'components/BasicComponent';

import ReactIScroll from 'react-iscroll';
import iScroll from 'iscroll/build/iscroll-probe';
import { Button, Drawer } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import MsgsContainer from './msgsContainer';
import Transmitter from './transmitter';
import _ from 'lodash';

const styles = require('./styles.scss');

function getData(): any[] {
  let res: any[] = [];
  for (let i = 0; i < 15; i++) {
    res.push({
      msgId: i,
      msgType: 0,
      content:
        '在每一个需要使用变量的component组件中都需要单独引入index.styl文件，不仅进行了多次重复性的操作，而且文件名称一旦发生改变，维护更新非常麻烦，非常的不人性化。' +
        i,
      time: 1598493522375,
      user: {
        avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
        name: '玩家954792',
        userId: 1811763,
      },
    });
  }
  return res;
}

export default class ChatInterface extends BasicComponent<IAnyObject> {
  state = {
    visible: false,
    messages: [],
    loading: false,
  };

  beforeScrollHeight: number = 0;
  beforeScrollTop: number = 0;
  iScroll: any = null;

  didMount() {
    setTimeout(() => {
      this.setState(
        {
          messages: getData(),
        },
        () => {
          this.scrollToBottom();
        }
      );
    }, 0);
  }

  didUpdate(prevProps: any, prevState: any) {
    const { messages: prevMessages } = prevState;
    const { messages } = this.state;
    if (!_.isEqual(prevMessages, messages)) {
      const instance = this.getIScrollInstance();
      const { maxScrollY } = instance;
      this.scrollTo(
        0,
        maxScrollY - this.beforeScrollHeight + this.beforeScrollTop,
        0
      );
    }
  }

  loadMore = () => {
    console.log('loadMore');
    this.setState(
      {
        loading: true,
      },
      () => {
        setTimeout(() => {
          console.log(88888888888);
          this.setState({
            loading: false,
            messages: getData().concat(this.state.messages),
          });
        }, 200);
      }
    );
  };

  scrollTo = (x: number = 0, y: number = 0, time: number = 500) => {
    const instance = this.getIScrollInstance();

    instance && instance.scrollTo(x, y, time);
  };

  scrollToBottom = () => {
    // const iscroll: IAnyObject = this.iScroll || {};
    const instance = this.getIScrollInstance();

    instance && instance.scrollTo(0, instance.maxScrollY);
  };

  onScrollHandler = (iScrollInstance: any) => {
    const { y, maxScrollY } = iScrollInstance;
    if (y > -50 && !this.state.loading) {
      this.beforeScrollHeight = maxScrollY;
      this.beforeScrollTop = y;
      this.loadMore();
    }
  };

  getIScrollInstance: iScroll = () => {
    const iscroll: IAnyObject = this.iScroll || {};
    return iscroll.getIScroll && iscroll.getIScroll.call(iscroll);
  };

  $render() {
    const { visible, messages, loading } = this.state;

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.title}>张逸凡</p>
          <Button type="link" onClick={() => this.setState({ visible: true })}>
            <EllipsisOutlined style={{ fontSize: '20px' }} />
          </Button>
        </header>
        <ReactIScroll
          ref={(ref: any) => (this.iScroll = ref)}
          iScroll={iScroll}
          options={{
            probeType: 2,
            mouseWheel: true,
            scrollbars: true,
            freeScroll: true,
            fadeScrollbars: true,
            shrinkScrollbars: 'scale',
          }}
          onScrollEnd={this.onScrollHandler}
        >
          <div className={styles.content}>
            <MsgsContainer messages={messages} loading={loading} />
          </div>
        </ReactIScroll>
        <footer className={styles.footer}>
          <Transmitter />
        </footer>
        <Drawer
          title="Basic Drawer"
          placement="right"
          closable={false}
          onClose={() => this.setState({ visible: false })}
          visible={visible}
          getContainer={false}
          style={{ position: 'absolute' }}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
      </div>
    );
  }
}
