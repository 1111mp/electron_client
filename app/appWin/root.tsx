import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Router } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { createBrowserHistory, createHashHistory } from 'history';
import { IntlProvider } from 'react-intl';
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
  messages?: any;
};

const Root = ({ messages }: Props) => {
  const { header } = queryParse(location.search);
  return (
    <IntlProvider
      locale={navigator.language}
      defaultLocale={navigator.language}
      messages={messages}
    >
      {header === 'false' ? (
        <Router history={history}>{renderRoutes(routes)}</Router>
      ) : (
        <WinContainer>
          <Router history={history}>{renderRoutes(routes)}</Router>
        </WinContainer>
      )}
    </IntlProvider>
  );
};

export default hot(Root);
