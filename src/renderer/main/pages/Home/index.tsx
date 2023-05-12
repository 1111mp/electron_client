import './styles.scss';

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'Renderer/main/parts/menu';

const Home: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="module-home">
      <Menu />
      <div className="module-home-routes">
        <Outlet />
      </div>
      {pathname === '/' ? <Navigate to="/index" /> : null}
    </div>
  );
};

export default Home;
