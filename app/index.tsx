// import React, { Fragment } from 'react';
// import { render } from 'react-dom';
// import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
// import { history, configuredStore } from './store';
// import './app.global.css';

// const store = configuredStore();

import React, { Fragment } from 'react';
import { render } from 'react-dom';
// 消除警告React-Hot-Loader: react-🔥-dom patch is not detected. React 16.6+ features may not work.
// 详见：https://github.com/gaearon/react-hot-loader#hot-loaderreact-dom
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { matchRoutes } from 'react-router-config';
// import Root from './root';
import Config from 'app/config';
import createStore from 'app/stores';
import routerConfig from 'app/routes/route_config';
import './app.global.css';
import './app.global.scss';

function getPathname() {
  return Config.isBorwserHistory
    ? window.location.pathname
    : window.location.hash
        .replace(/[?&]([^=&#]+)=([^&#]*)/g, '')
        .replace(/#/, '');
}

function preloadComponent() {
  let branch;

  try {
    branch = matchRoutes(routerConfig, getPathname());
  } catch (e) {
    return false;
  }

  const promises = branch.map((config: any) => {
    const loadAsyncComponent = config.route.component.preload();
    return loadAsyncComponent ? loadAsyncComponent : Promise.resolve(null);
  });

  return {
    components: branch.map((config: any) => config.route.component),
    promise: () => Promise.all(promises),
  };
}

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', async () => {
  const stores = await createStore();

  const loadAsyncComponents = preloadComponent();

  let statusCode = 200;

  if (loadAsyncComponents) {
    await loadAsyncComponents.promise();

    statusCode = loadAsyncComponents.components.length ? 200 : 404;
  } else {
    statusCode = 500;
  }

  // eslint-disable-next-line global-require
  const Root = require('./root').default;
  render(
    <AppContainer>
      <Root stores={stores} statusCode={statusCode} />
    </AppContainer>,
    document.getElementById('root')
  );
});
