import './styles.scss';

import React from 'react';

import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const Header: React.FC = () => {
  return (
    <div className="module-header">
      <p className="module-header-placeholder"></p>
      <p className="module-header-search">
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
