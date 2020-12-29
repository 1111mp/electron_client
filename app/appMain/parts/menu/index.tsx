import './styles.scss';

import React from 'react';
import { observer } from 'mobx-react';
import { Avatar } from 'antd';
import classNames from 'classnames';
import { CUSTOMWIN } from 'app/config';
import { openWeb } from 'app/utils/rendererapi';
import { useTargetStore } from 'appMain/stores';

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

const Menu: React.FC = observer(() => {
  const routerStore = useTargetStore('routerStore');

  const openSetting = () => {
    openWeb({ ...CUSTOMWIN, url: `/settings?title=设置` });
  };

  const menuHandler = (path: string) => {
    routerStore.push(path);
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
              active: routerStore.location.pathname.indexOf(menu.path) !== -1,
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
});

export default Menu;
