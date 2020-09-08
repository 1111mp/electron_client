import React from 'react';
import BasicComponent from 'components/BasicComponent';

import { Button, Drawer } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import MsgsContainer from './msgsContainer';

const styles = require('./styles.scss');

export default class ChatInterface extends BasicComponent<IAnyObject> {
  state = {
    visible: false,
    messages: [
      {
        msgId: '1',
        msgType: 0,
        content: 'aaa',
        time: 1598493522375,
        user: {
          avatar: 'https://img2-npl.bao.163.com/avatar/default/054/200',
          name: '玩家954792',
          userId: 1811763,
        },
      },
    ],
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
        <div className={styles.content}>
          <MsgsContainer messages={messages} />
        </div>
        <footer className={styles.footer}></footer>
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
