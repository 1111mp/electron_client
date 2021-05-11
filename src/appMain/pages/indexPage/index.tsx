import './styles.scss';

import * as React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import Menu from 'app/appMain/parts/menu';
import { parseRoutes } from 'app/appMain/routes';
import { RouterConfig } from 'app/appMain/routes/route_config';

type Props = {
  route: { routes: RouterConfig[] };
};

const IndexPage: React.FC<Props> = ({ route }) => {
  const location = useLocation();
  console.log(route);

  return (
    <div className="module-index_page">
      <Menu />
      <div className="module-index_page-routes">
        {parseRoutes(route.routes)}
      </div>
      {location.pathname === '/' ? <Redirect to="/index" /> : null}
    </div>
  );
};

export default IndexPage;
