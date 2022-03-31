import './styles.scss';

import * as React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import RoomList from '../roomList';
import { Empty } from 'Components/Empty';

const Home: React.ComponentType = () => {
  const location = useLocation();

  return (
    <div className="module-home">
      <div className="module-home-sider">
        <RoomList />
      </div>
      <div className="module-home-content">
        {location.pathname === '/index' ? <Empty /> : null}
        <Outlet />
      </div>
    </div>
  );
};

export default Home;
