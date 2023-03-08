import './styles.scss';

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'Renderer/main/parts/menu';

const IndexPage: React.ComponentType = () => {
  const { pathname } = useLocation();

  return (
    <div className="module-index_page">
      <Menu />
      <div className="module-index_page-routes">
        <Outlet />
      </div>
      {pathname === '/' ? <Navigate to="/index" /> : null}
    </div>
  );
};

export default IndexPage;
