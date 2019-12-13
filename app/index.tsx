import * as React from 'react';
import { render } from 'react-dom';
// 消除警告React-Hot-Loader: react-🔥-dom patch is not detected. React 16.6+ features may not work.
// 详见：https://github.com/gaearon/react-hot-loader#hot-loaderreact-dom
import { AppContainer } from 'react-hot-loader';
import { matchRoutes, } from 'react-router-config';
import Root from './root';
import Config from 'config';
import createStore from 'stores';
import routerConfig from 'routes';
import './app.global.css';

function getPathname() {
  return Config.isBorwserHistory
    ? window.location.pathname
    : window.location.hash.replace(/[?&]([^=&#]+)=([^&#]*)/g, '').replace(/#/, '');
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
    promise: () => Promise.all(promises)
  }
}

async function renderer() {
  const store = createStore();
  const loadAsyncComponents = preloadComponent();

  let statusCode = 200;

  if (loadAsyncComponents) {
    await loadAsyncComponents.promise();

    statusCode = loadAsyncComponents.components.length ? 200 : 404;
  } else {
    statusCode = 500;
  }

  render(
    <AppContainer>
      <Root store={store} statusCode={statusCode} />
    </AppContainer>,
    document.getElementById('root')
  );

  if ((module as any).hot) {
    (module as any).hot.accept('./root', () => {
      // eslint-disable-next-line global-require
      const NextRoot = require('./root').default;
      render(
        <AppContainer>
          <NextRoot store={store} />
        </AppContainer>,
        document.getElementById('root')
      );
    });
  }
}

(() => {
  renderer();
})();
