import './styles.scss';

import React from 'react';
import { Avatar } from 'antd';
import { CUSTOMWIN } from 'app/config';
import { openWeb } from 'app/utils/rendererapi';

const Menu: React.FC = () => {
  const openSetting = () => {
    openWeb({ ...CUSTOMWIN, url: `/settings?title=设置` });
  };

  return (
    <div className="module-app-menu">
      <p className="module-app-menu-avatar">
        <Avatar size={36} />
      </p>
      <ul className="module-app-menu-container">
        <li className="module-app-menu-container-item active">
          <span className="iconfont iconchat1"></span>
        </li>
        <li className="module-app-menu-container-item">
          <span className="iconfont iconfangdajingfuben3"></span>
        </li>
      </ul>
      <p className="module-app-menu-setting" onClick={openSetting}>
        <span className="iconfont iconsetting"></span>
      </p>
    </div>
  );
};

export default Menu;
