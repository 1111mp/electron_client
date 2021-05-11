import React from 'react';
import { HashRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { RootStore, StoreContext } from './stores';
import { I18n } from 'app/utils/i18n';
import allRoutes from './routes/route_config';

declare global {
  // We want to extend `window` here.
  // eslint-disable-next-line no-restricted-syntax
  interface Window {
    localeMessages: { [key: string]: { message: string } };
  }
}

type Props = {
  stores: RootStore;
  statusCode: number;
};

const Root = ({ stores, statusCode }: Props) => {
  const { localeMessages } = window;

  return (
    <StoreContext.Provider value={stores}>
      <I18n messages={localeMessages}>
        <HashRouter>{renderRoutes(allRoutes)}</HashRouter>
      </I18n>
    </StoreContext.Provider>
  );
};

export default Root;
