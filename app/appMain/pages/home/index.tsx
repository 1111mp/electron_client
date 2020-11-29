import './styles.scss';

import * as React from 'react';
import { Fragment } from 'react';
import { observer } from 'mobx-react';
import { renderRoutes } from 'react-router-config';
import { useTargetStore } from 'appMain/stores';

import RoomList from '../roomList';
import Empty from 'components/empty';

const themes = [
  { label: '系统', value: 'system' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
];

const Home: React.FC<IAnyObject> = observer(({ route }) => {
  const routerStore = useTargetStore('routerStore');

  return (
    <Fragment>
      <div className="module-home">
        <div className="module-home-sider">
          <RoomList />
        </div>
        <div className="module-home-content">
          {routerStore.location.pathname === '/index' ? <Empty /> : null}
          {renderRoutes(route.routes)}
        </div>
      </div>
    </Fragment>
  );
});

export default Home;
