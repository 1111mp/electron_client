import './header.scss';

import React from 'react';
import BasicComponent from 'components/BasicComponent';
// import { inject, observer } from 'mobx-react';

import { Avatar, Input } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { CUSTOMWIN } from 'app/config';

const Header: React.FC = () => {
  return (
    <div className="module-roomlist-header">
      {/* <span className="avatar" onClick={this.handleClick}>
              <Avatar size={30} icon={<UserOutlined />} />
            </span> */}
      <p className="module-roomlist-header-placeholder"></p>
      <p className="module-roomlist-header-search">
        <Input
          className="search_input"
          placeholder="搜索"
          size="small"
          allowClear={true}
          prefix={<SearchOutlined />}
        />
      </p>
    </div>
  );
};

export default Header;
