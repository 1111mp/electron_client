import React from 'react';
import BasicComponent from 'components/BasicComponent';

import InfiniteScroll from 'react-infinite-scroller';
import { Button, Drawer } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import MsgsContainer from './msgsContainer';
import Transmitter from './transmitter';

const styles = require('./styles.scss');

const msgs = [
  {
    msgId: '1',
    msgType: 0,
    content:
      '这个兄弟学名叫 stylus，是 CSS 的预处理框架。 CSS 预处理，顾名思义，预先处理 CSS。那 stylus 咋预先处理呢？',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
  {
    msgId: '2',
    msgType: 0,
    content:
      '这个兄弟学名叫 stylus，是 CSS 的预处理框架。 CSS 预处理，顾名思义，预先处理 CSS。那 stylus 咋预先处理呢？',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
  {
    msgId: '3',
    msgType: 0,
    content:
      '这个兄弟学名叫 stylus，是 CSS 的预处理框架。 CSS 预处理，顾名思义，预先处理 CSS。那 stylus 咋预先处理呢？',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
  {
    msgId: '4',
    msgType: 0,
    content:
      '这个兄弟学名叫 stylus，是 CSS 的预处理框架。 CSS 预处理，顾名思义，预先处理 CSS。那 stylus 咋预先处理呢？',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
  {
    msgId: '5',
    msgType: 0,
    content:
      '这个兄弟学名叫 stylus，是 CSS 的预处理框架。 CSS 预处理，顾名思义，预先处理 CSS。那 stylus 咋预先处理呢？',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
  {
    msgId: '6',
    msgType: 0,
    content:
      '这个兄弟学名叫 stylus，是 CSS 的预处理框架。 CSS 预处理，顾名思义，预先处理 CSS。那 stylus 咋预先处理呢？',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
  {
    msgId: '7',
    msgType: 0,
    content:
      '这个兄弟学名叫 stylus，是 CSS 的预处理框架。 CSS 预处理，顾名思义，预先处理 CSS。那 stylus 咋预先处理呢？',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
  {
    msgId: '8',
    msgType: 0,
    content:
      '这个兄弟学名叫 stylus，是 CSS 的预处理框架。 CSS 预处理，顾名思义，预先处理 CSS。那 stylus 咋预先处理呢？',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
  {
    msgId: '9',
    msgType: 0,
    content:
      '这个兄弟学名叫 stylus，是 CSS 的预处理框架。 CSS 预处理，顾名思义，预先处理 CSS。那 stylus 咋预先处理呢？',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
  {
    msgId: '10',
    msgType: 0,
    content:
      '在每一个需要使用变量的component组件中都需要单独引入index.styl文件，不仅进行了多次重复性的操作，而且文件名称一旦发生改变，维护更新非常麻烦，非常的不人性化。',
    time: 1598493522375,
    user: {
      avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
      name: '玩家954792',
      userId: 1811763,
    },
  },
];

export default class ChatInterface extends BasicComponent<IAnyObject> {
  state = {
    visible: false,
    messages: [],
  };

  scrollParentRef: any = null;

  didMount() {
    setTimeout(() => {
      this.setState(
        {
          messages: msgs,
        },
        () => {
          this.scrollToBtm();
        }
      );
    }, 0);
  }

  loadMore = () => {
    console.log('loadMore');
    // setTimeout(() => {
    //   console.log(88888888888)
    //   this.setState({
    //     messages: this.state.messages.concat(msgs),
    //   });
    // }, 1000);
  };

  scrollToBtm = () => {
    this.scrollParentRef &&
      (this.scrollParentRef.scrollTop = this.scrollParentRef.scrollHeight);
  };

  $render() {
    const { visible, messages } = this.state;

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.title}>张逸凡</p>
          <Button type="link" onClick={() => this.setState({ visible: true })}>
            <EllipsisOutlined style={{ fontSize: '20px' }} />
          </Button>
        </header>
        <div
          className={styles.content}
          ref={(ref) => (this.scrollParentRef = ref)}
        >
          <InfiniteScroll
            pageStart={0}
            hasMore={true}
            isReverse={true}
            loadMore={this.loadMore}
            loader={
              <div className={styles.loader} key={0}>
                Loading...
              </div>
            }
            initialLoad={false}
            threshold={50}
            useWindow={false}
            getScrollParent={() => this.scrollParentRef}
          >
            <MsgsContainer messages={messages} />
          </InfiniteScroll>
        </div>
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
