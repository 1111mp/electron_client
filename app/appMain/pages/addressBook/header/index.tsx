import './styles.scss';

import React from 'react';

import { Input } from 'antd';
import SearchOutlined from '@ant-design/icons/SearchOutlined';

const Header: React.FC = () => {
  return (
    <div className="module-header">
      <p className="module-header-placeholder"></p>
      <div className="module-header-search">
        <Input
          className="search_input"
          placeholder="搜索"
          size="small"
          allowClear={true}
          prefix={<SearchOutlined />}
        />
        <p className="module-header-search__btn">
          <span className="iconfont iconadd1"></span>
        </p>
      </div>
    </div>
  );
};

export default Header;
