import './styles.scss';

import React from 'react';
import { Avatar } from 'antd';
import classNames from 'classnames';
import { useNavigate, useLocation } from 'react-router-dom';
import { WindowName, WindowUrl } from 'App/types';

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
      url: WindowUrl.Setting,
    });
  };

  const menuHandler = (path: string) => {
    navigate(path);
  };

  return (
    <div className="module-menu">
      <p className="module-menu-avatar">
        <Avatar size={36} />
      </p>
      <ul className="module-menu-container">
        {Menus.map((menu) => (
          <li
            key={menu.path}
            className={classNames('module-menu-container-item', {
              active: location.pathname.includes(menu.path),
            })}
            onClick={() => menuHandler(menu.path)}
          >
            <span className={classNames('iconfont', menu.icon)}></span>
          </li>
        ))}
      </ul>
      <p className="module-menu-setting" title="Setting" onClick={openSetting}>
        <span className="iconfont iconsetting"></span>
      </p>
    </div>
  );
};

// export default Menu;
