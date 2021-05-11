import './styles.scss';

import React from 'react';
import { Avatar } from 'antd';
import classNames from 'classnames';
import { CUSTOMWIN } from 'app/config';
import { openWeb } from 'app/utils/rendererapi';
import { useHistory, useLocation } from 'react-router-dom';

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

const Menu: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const openSetting = () => {
    openWeb({ ...CUSTOMWIN, url: `${CUSTOMWIN.url}?title=设置` });
  };

  const menuHandler = (path: string) => {
    history.push(path);
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
      <p className="module-app-menu-setting" onClick={openSetting}>
        <span className="iconfont iconsetting"></span>
      </p>
    </div>
  );
};

export default Menu;
