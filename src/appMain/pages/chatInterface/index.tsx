import './styles.scss';

import React from 'react';

// @ts-ignore
import ReactIScroll from 'react-iscroll';
// @ts-ignore
import iScroll from 'iscroll/build/iscroll-probe';
import { Button, Drawer } from 'antd';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import MsgsContainer from './msgsContainer';
import { Transmitter } from './transmitter';

function getData(): any[] {
  let res: any[] = [];
  for (let i = 0; i < 15; i++) {
    if (i === 0) {
      res.push({
        msgId: i,
        msgType: 0,
        system: '我是系统消息' + i,
        time: 1598493522375,
        user: {
          avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
          name: '玩家954792',
          userId: 1811763,
        },
      });
    } else if (i === 1) {
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
          userId: 1,
        },
      });
    } else if (i === 5) {
      res.push({
        msgId: i,
        msgType: 1,
        content: '需要使用变量的component组件中都需要单独引入',
        image: {
          url:
            'http://touxiangkong.com/uploads/allimg/20203301301/2020/3/Vzuiy2.jpg',
          width: 400,
          height: 400,
        },
        time: 1598493522375,
        user: {
          avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
          name: '玩家954792',
          userId: 1,
        },
      });
    } else {
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
  }
  return res;
}

type ScrollInfoRef = {
  maxScrollY?: number;
  y?: number;
  loading?: boolean;
};

const ChatInterface: React.ComponentType<IAnyObject> = () => {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [visible, setVisible] = React.useState<boolean>(false);

  const scrollRef = React.useRef();
  const infoRef = React.useRef<ScrollInfoRef>({
    maxScrollY: 0,
    y: 0,
    loading: false,
  });

  const loadMore = () => {
    console.log('loadMore');
    setTimeout(() => {
      setMessages(getData().concat(messages));
      infoRef.current.loading = false;
    }, 2000);
  };

  const onScrollHandler = (iScrollInstance: any) => {
    const { y, maxScrollY } = iScrollInstance;
    if (y > -50 && !infoRef.current.loading) {
      infoRef.current = {
        maxScrollY,
        y,
        loading: true,
      };
      loadMore();
    }
  };

  const scrollTo = (x: number = 0, y: number = 0, time: number = 500) => {
    const instance = getIScrollInstance();
    instance && instance.scrollTo(x, y, time);
  };

  const getIScrollInstance: iScroll = () => {
    const iscroll: IAnyObject = scrollRef.current || {};
    return iscroll.getIScroll && iscroll.getIScroll.call(iscroll);
  };

  React.useEffect(() => {
    setTimeout(() => {
      setMessages(getData());
    }, 1000);
  }, []);

  React.useEffect(() => {
    const instance = getIScrollInstance();
    if (instance) {
      const { maxScrollY } = instance;
      scrollTo(
        0,
        maxScrollY - infoRef.current.maxScrollY! + infoRef.current.y!,
        0
      );
    }
  }, [messages]);

  return (
    <div className="module-chat_interface">
      <header className="module-chat_interface-header">
        <p className="module-chat_interface-header--title">张逸凡</p>
        <Button type="link" onClick={() => setVisible(true)}>
          <EllipsisOutlined style={{ fontSize: '20px' }} />
        </Button>
      </header>
      <ReactIScroll
        ref={scrollRef}
        iScroll={iScroll}
        options={{
          probeType: 2,
          // disablePointer: true,
          mouseWheel: true,
          scrollbars: 'custom',
          freeScroll: true,
          fadeScrollbars: true,
          interactiveScrollbars: true,
          shrinkScrollbars: 'scale',
          preventDefaultException: {
            className: /message-content|message-wrapper|message-container/,
          },
        }}
        onScrollEnd={onScrollHandler}
      >
        <div className="module-chat_interface--scroll">
          <MsgsContainer messages={messages} />
        </div>
      </ReactIScroll>
      <footer className="module-chat_interface--footer">
        <Transmitter onPickEmoji={() => {}} />
      </footer>
      <Drawer
        title="Basic Drawer"
        placement="right"
        closable={false}
        onClose={() => setVisible(false)}
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
};

export default ChatInterface;
