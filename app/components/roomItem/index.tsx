import './styles.scss';

import * as React from 'react';

import { Avatar, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';

type Props = {
  clickHandler?: VoidFunction;
};

const RoomItem: React.FC<Props> = React.memo(({ clickHandler }) => {
  return (
    <li className="module-roomitem" onClick={clickHandler}>
      <Badge size="small" count={100} offset={[-6, 0]}>
        <Avatar size={40} icon={<UserOutlined />} />
      </Badge>
      <p className="module-roomitem-middle_content">
        <span className="module-roomitem-middle_content-name">张逸凡</span>
        <span className="module-roomitem-middle_content-detail">
          你可以在这个对话中为自己添加笔记。
          如果您的帐户有任何连接设备，新的笔记将同步。
        </span>
      </p>
      <p className="module-roomitem-right_content">
        <span className="module-roomitem-right_content-timer">14:49</span>
        <span className="module-roomitem-right_content-status"></span>
      </p>
    </li>
  );
});

export default RoomItem;
