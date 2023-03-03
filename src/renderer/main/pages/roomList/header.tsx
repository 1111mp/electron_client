import './header.scss';

import React from 'react';

import { Input } from 'antd';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
// import { CUSTOMWIN } from 'app/config';

const Header: React.FC = () => {
  return (
    <div className="module-roomlist-header">
      <p className="module-roomlist-header-placeholder"></p>
      <p className="module-roomlist-header-search">
        <Input
          className="search_input"
          placeholder="search"
          size="small"
          allowClear={true}
          prefix={<SearchOutlined />}
        />
      </p>
    </div>
  );
};

export default Header;
