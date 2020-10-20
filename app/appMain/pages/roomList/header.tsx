import './header.scss';

import React from 'react';

import { Avatar, Input } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';

const Header: React.FC = () => {
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
};

export default Header;
