import './styles.scss';

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu } from './Menu';

export function Component() {
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
}

Component.displayName = 'Home';
