import React, { Fragment } from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import WinContainer from 'components/winContainer';
import Config from 'app/config';
import routes from './routes';
import { queryParse } from 'app/utils';

const Router: React.ComponentType<any> = Config.isBorwserHistory
  ? BrowserRouter
  : HashRouter;

type Props = {
  statusCode?: number;
};

const Root = ({}: Props) => {
  const { header } = queryParse(location.search);
  return (
    <Fragment>
      {header === 'false' ? (
        <Router>{renderRoutes(routes)}</Router>
      ) : (
        <WinContainer>
          <Router>{renderRoutes(routes)}</Router>
        </WinContainer>
      )}
    </Fragment>
  );
};

export default Root;
