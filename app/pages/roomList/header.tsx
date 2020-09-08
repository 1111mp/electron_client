import React, { Component } from 'react';

import { Avatar, Input } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';

const styles = require('./header.scss');

export default class Header extends Component<IAnyObject> {
  render() {
    return (
      <div className={styles.container}>
        <Avatar className={styles.avatar} size={30} icon={<UserOutlined />} />
        <Input className={styles.search_input} placeholder="搜索" size="small" allowClear={true} prefix={<SearchOutlined />} />
      </div>
    );
  }
}
