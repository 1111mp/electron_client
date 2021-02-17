import './styles.scss';

import React from 'react';
import { Menu, Input, Dropdown } from 'antd';
import SearchOutlined from '@ant-design/icons/SearchOutlined';

import { openWeb } from 'app/utils/rendererapi';
import { get } from 'lodash';
import { ADDFRIEND } from 'app/config';

const Header: React.FC = React.memo(() => {
  const addFriend = () => {
    openWeb({
      ...ADDFRIEND,
      url: `/addfriend?header=${
        get(window, 'platform') === 'darwin' ? false : true
      }&title=添加朋友&min=false`,
      modal: true,
    });
  };

  const renderOverlay = () => {
    return (
      <Menu>
        <Menu.Item>
          <p className="module-header-search__menu" onClick={addFriend}>
            添加朋友
          </p>
        </Menu.Item>
        <Menu.Item>
          <p className="module-header-search__menu">发起群聊</p>
        </Menu.Item>
      </Menu>
    );
  };

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
        <Dropdown trigger={['click']} overlay={renderOverlay}>
          <p className="module-header-search__btn">
            <span className="iconfont iconadd1"></span>
          </p>
        </Dropdown>
      </div>
    </div>
  );
});

export default Header;
