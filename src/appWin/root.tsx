import React, { Fragment } from 'react';
import { Router } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { createBrowserHistory, createHashHistory } from 'history';
import WinContainer from 'components/winContainer';
import Config from 'app/config';
import routes from './routes';
import { queryParse } from 'app/utils';

const history = Config.isBorwserHistory
  ? createBrowserHistory({
      basename: window.location.pathname,
    })
  : createHashHistory();

type Props = {
  statusCode?: number;
};

const Root = ({}: Props) => {
  const { header } = queryParse(location.search);
  return (
    <Fragment>
      {header === 'false' ? (
        <Router history={history}>{renderRoutes(routes)}</Router>
      ) : (
        <WinContainer>
          <Router history={history}>{renderRoutes(routes)}</Router>
        </WinContainer>
      )}
    </Fragment>
  );
};

export default Root;
