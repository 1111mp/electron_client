import './styles.scss';

import { memo } from 'react';
import { Input, Dropdown } from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  TeamOutlined,
  PlusOutlined,
} from '@ant-design/icons';

// import { openWeb } from 'app/utils/rendererapi';
// import { get } from 'lodash';
// import { ADDFRIEND } from 'app/config';

const Header: React.FC = memo(() => {
  const addFriend = () => {
    // openWeb({
    //   ...ADDFRIEND,
    //   url: `/addfriend?header=${
    //     get(window, 'platform') === 'darwin' ? false : true
    //   }&title=添加朋友&min=false`,
    //   modal: true,
    // });
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

export default Header;
