import './styles.scss';

import React from 'react';
import { Avatar } from 'antd';
import classNames from 'classnames';
// import { CUSTOMWIN } from 'Renderer/config';
// import { openWeb } from 'app/utils/rendererapi';
import { useNavigate, useLocation } from 'react-router-dom';
import { WindowName } from 'App/types';

export const Menus: any[] = [
  {
    label: '首页',
    path: '/index',
    icon: 'iconchat1',
  },
  {
    label: '通讯录',
    path: '/addressbook',
    icon: 'iconfangdajingfuben3',
  },
];

export const Menu: React.ComponentType = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const openSetting = () => {
    window.Context.windowOpen({
      name: WindowName.Setting,
      url: '/setting',
    });
  };

  const menuHandler = (path: string) => {
    navigate(path);
  };

  return (
    <div className="module-app-menu">
      <p className="module-app-menu-avatar">
        <Avatar size={36} />
      </p>
      <ul className="module-app-menu-container">
        {Menus.map((menu) => (
          <li
            key={menu.path}
            className={classNames('module-app-menu-container-item', {
              active: location.pathname.includes(menu.path),
            })}
            onClick={() => menuHandler(menu.path)}
          >
            <span className={classNames('iconfont', menu.icon)}></span>
          </li>
        ))}
      </ul>
      <p
        className="module-app-menu-setting"
        title="Setting"
        onClick={openSetting}
      >
        <span className="iconfont iconsetting"></span>
      </p>
    </div>
  );
};

// export default Menu;
