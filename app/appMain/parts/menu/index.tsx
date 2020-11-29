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
  console.log(routerStore);

  const openSetting = React.useCallback(() => {
    openWeb({ ...CUSTOMWIN, url: `/settings?title=设置` });
  }, []);

  const menuHandler = React.useCallback(
    (path: string) => {
      routerStore.push(path);
    },
    [routerStore]
  );

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
              active: routerStore.location.pathname === menu.path,
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
