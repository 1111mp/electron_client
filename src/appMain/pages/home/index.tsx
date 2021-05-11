import './styles.scss';

import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import RoomList from '../roomList';
import Empty from 'components/empty';

const Home: React.FC<IAnyObject> = ({ route }) => {
  let location = useLocation();
  console.log('route');
  console.log(route);

  return (
    <div className="module-home">
      <div className="module-home-sider">
        <RoomList />
      </div>
      <div className="module-home-content">
        {location.pathname === '/index' ? <Empty /> : null}
        {renderRoutes(route.routes)}
        {/* {parseRoutes(route.routes)} */}
      </div>
    </div>
  );
};

export default Home;
