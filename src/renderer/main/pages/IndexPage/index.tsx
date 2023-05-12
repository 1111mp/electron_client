import './styles.scss';

import { Outlet } from 'react-router-dom';
import RoomList from '../roomList';

const IndexPage: React.FC = () => {
  return (
    <div className="module-index_page">
      <div className="module-index_page-sider">
        <RoomList />
      </div>
      <div className="module-index_page-content">
        <Outlet />
      </div>
    </div>
  );
};

export default IndexPage;
