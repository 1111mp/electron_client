// import React, { Fragment } from 'react';
// import { render } from 'react-dom';
// import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
// import { history, configuredStore } from './store';
// import './app.global.css';

// const store = configuredStore();

import React from 'react';
import { render } from 'react-dom';
// 消除警告React-Hot-Loader: react-🔥-dom patch is not detected. React 16.6+ features may not work.
// 详见：https://github.com/gaearon/react-hot-loader#hot-loaderreact-dom
// import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { matchRoutes } from 'react-router-config';
import Root from './root';
import Config from 'app/config';
import { createStore } from './stores';
import routerConfig from './routes/route_config';
import { applyTheme, getThemeFromDatabase } from 'app/utils';
import initMode from 'app/utils/mode_check';

import './main.global.css';
import 'app/app.global.css';
import 'app/app.global.scss';

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
    const loadAsyncComponent = config.route.component.preload
      ? config.route.component.preload()
      : Promise.resolve(config.route.component);
    return loadAsyncComponent ? loadAsyncComponent : Promise.resolve(null);
  });

  return {
    components: branch.map((config: any) => config.route.component),
    promise: () => Promise.all(promises),
  };
}

function appInit() {
  return Promise.all([createStore(), getThemeFromDatabase(), initMode()]).then(
    (res) => {
      return {
        stores: res[0],
        user: res[1],
      };
    }
  );
}

(async () => {
  const loadAsyncComponents = preloadComponent();
  let { stores, user } = await appInit();

  /** 初始化设置主题 */
  const { theme = 'system' } = user;
  applyTheme(theme);

  let statusCode = 200;

  if (loadAsyncComponents) {
    await loadAsyncComponents.promise();

    statusCode = loadAsyncComponents.components.length ? 200 : 404;
  } else {
    statusCode = 500;
  }

  render(
    <Root stores={stores} statusCode={statusCode} />,
    document.getElementById('root')
  );
})();
