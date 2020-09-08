import React, { Component } from 'react';

import { Avatar, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const styles = require('./styles.scss');

export default class RoomItem extends Component<IAnyObject> {
  render() {
    const { clickHandler } = this.props;

    return (
      <li className={styles.container} onClick={clickHandler}>
        <Badge size="small" count={100} offset={[-6, 0]}>
          <Avatar size={40} icon={<UserOutlined />} />
        </Badge>
        <p className={styles.middle_content}>
          <span className={styles.name}>张逸凡</span>
          <span className={styles.detail}>
            你可以在这个对话中为自己添加笔记。
            如果您的帐户有任何连接设备，新的笔记将同步。
          </span>
        </p>
        <p className={styles.right_content}>
          <span className={styles.timer}>14:49</span>
          <span className={styles.status}></span>
        </p>
      </li>
    );
  }
}
