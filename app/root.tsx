import React from 'react';
import { Provider } from 'mobx-react';
import { hot } from 'react-hot-loader/root';
import { Router, Redirect } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { createBrowserHistory, createHashHistory } from 'history';
import { syncHistoryWithStore } from 'mobx-react-router';
import Config from './config';
// import createRoutes from './routes';
import allRoutes from 'app/routes/route_config';

const History = Config.isBorwserHistory
  ? createBrowserHistory({
      basename: window.location.pathname,
    })
  : createHashHistory();
// const Routes = createRoutes();

type Props = {
  stores: any;
  statusCode: number;
};

const Root = ({ stores, statusCode }: Props) => (
  <Provider {...stores}>
    <Router history={syncHistoryWithStore(History, stores.routerStore)}>
      {/* <Routes /> */}
      <Redirect to="/index" />
      {renderRoutes(allRoutes)}
    </Router>
  </Provider>
);

export default hot(Root);
