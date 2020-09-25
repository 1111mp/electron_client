import './header.scss';

import React, { Component } from 'react';

import { Avatar, Input } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';

export default class Header extends Component<IAnyObject> {
  render() {
    return (
      <div className="module-roomlist-header">
        <Avatar className="avatar" size={30} icon={<UserOutlined />} />
        <Input
          className="search_input"
          placeholder="搜索"
          size="small"
          allowClear={true}
          prefix={<SearchOutlined />}
        />
      </div>
    );
  }
}
