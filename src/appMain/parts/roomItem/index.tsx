import './styles.scss';

import * as React from 'react';

import { Avatar, Badge } from 'antd';
import UserOutlined from '@ant-design/icons/UserOutlined';

type Props = {
  clickHandler?: (event: React.MouseEvent) => void;
};

const RoomItem: React.FC<Props> = React.memo(({ clickHandler }) => {
  return (
    <li className="module-roomitem" onClick={clickHandler}>
      <Avatar size={40} icon={<UserOutlined />} />
      <div className="module-roomitem-content">
        {/* <Tag color="gold">Personal</Tag> */}
        <span className="module-roomitem-content--name">张逸凡</span>
        <span className="module-roomitem-content--detail">
          你可以在这个对话中为自己添加笔记。
          如果您的帐户有任何连接设备，新的笔记将同步。
        </span>
        {/* <span className="module-roomitem-content--timer">11:41 am</span>
        <span className="module-roomitem-content--count">
          <Badge count={5} />
        </span> */}
      </div>
      <div className="module-roomitem-right_content">
        <span className="module-roomitem-right_content--timer">11:41 am</span>
        <span className="module-roomitem-right_content--count">
          <Badge count={5} />
        </span>
      </div>
    </li>
  );
});

export default RoomItem;
