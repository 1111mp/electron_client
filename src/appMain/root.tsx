import React from 'react';
import { Router, Redirect } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { createBrowserHistory, createHashHistory } from 'history';
import { syncHistoryWithStore } from '@superwf/mobx-react-router';
import { AliveScope } from 'react-activation';
import { RootStore, StoreContext } from './stores';
import { I18n } from 'app/utils/i18n';
import Menu from 'appMain/parts/menu';
import Config from 'app/config';
import allRoutes from './routes/route_config';

declare global {
  // We want to extend `window` here.
  // eslint-disable-next-line no-restricted-syntax
  interface Window {
    localeMessages: { [key: string]: { message: string } };
  }
}

const History = Config.isBorwserHistory
  ? createBrowserHistory()
  : createHashHistory();

type Props = {
  stores: RootStore;
  statusCode: number;
};

const Root = ({ stores, statusCode }: Props) => {
  const history = syncHistoryWithStore(History, stores.routerStore);
  const { localeMessages } = window;

  return (
    <StoreContext.Provider value={stores}>
      <I18n messages={localeMessages}>
        <Menu />
        <Router history={history}>
          <AliveScope>
            {/* <Routes /> */}
            {renderRoutes(allRoutes)}
            <Redirect to="index" />
          </AliveScope>
        </Router>
      </I18n>
    </StoreContext.Provider>
  );
};

export default Root;
