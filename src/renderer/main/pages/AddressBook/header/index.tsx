import './styles.scss';

import { memo } from 'react';
import { Input, Dropdown } from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  TeamOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { WindowName, WindowUrl } from 'App/types';

import type { MenuProps } from 'antd';

export const Header: React.FC = memo(() => {
  const addFriend: MenuProps['onClick'] = ({ key }) => {
    if (key === 'friend') {
      window.Context.windowOpen({
        name: WindowName.Search,
        url: WindowUrl.Search,
      });
    }
  };

  return (
    <div className="module-header">
      <p className="module-header-placeholder"></p>
      <div className="module-header-search">
        <Input
          className="search_input"
          placeholder="search"
          size="small"
          allowClear={true}
          prefix={<SearchOutlined />}
        />
        <Dropdown
          menu={{
            items: [
              { icon: <UserAddOutlined />, label: '添加朋友', key: 'friend' },
              {
                icon: <TeamOutlined />,
                label: '发起群聊',
                key: 'group',
              },
            ],
            onClick: addFriend,
          }}
          trigger={['click']}
        >
          <p className="module-header-search__btn">
            <PlusOutlined />
          </p>
        </Dropdown>
      </div>
    </div>
  );
});
