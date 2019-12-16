import * as React from 'react';
import { Component } from 'react';
import { Provider } from 'mobx-react';
import { Router } from 'react-router-dom';
import { renderRoutes } from "react-router-config";
import { createBrowserHistory, createHashHistory } from 'history';
import { syncHistoryWithStore } from 'mobx-react-router';
import Config from './config';
import routerConfig from './routes';

const History = Config.isBorwserHistory
  ? createBrowserHistory()
  : createHashHistory();

type Props = {
  store: any,
  statusCode: number
};

export default class Root extends Component<Props> {
  render() {
    const { store } = this.props;
    return (
      <Provider store={store}>
        <Router history={syncHistoryWithStore(History, store.routerStore)} >
          {renderRoutes(routerConfig)}
        </Router>
      </Provider>
    );
  }
}
