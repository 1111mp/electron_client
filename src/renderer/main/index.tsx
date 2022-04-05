import { createRoot } from 'react-dom/client';
import { matchRoutes } from 'react-router-dom';
import Root from './root';
import Config from 'Renderer/config';
import { routerConfig } from './routes';
import { createStore } from './stores';
import { applyTheme } from 'Renderer/utils/theme';
import initMode from 'Renderer/utils/mode_check';
import { InitNativeThemeListener } from 'Renderer/utils/NativeThemeListener';

import './main.css';
import 'Renderer/styles/app.css';
import 'Renderer/styles/app.module.scss';

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

  const promises = branch!.map((config: any) => {
    const loadAsyncComponent = config.route.element.preload
      ? config.route.element.preload()
      : Promise.resolve(config.route.element);
    return loadAsyncComponent ? loadAsyncComponent : Promise.resolve(null);
  });

  return {
    components: branch!.map((config: any) => config.route.element),
    promise: () => Promise.all(promises),
  };
}

function appInit() {
  return Promise.all([createStore(), initMode()]).then((res) => {
    return {
      stores: res[0],
    };
  });
}

(async () => {
  const loadAsyncComponents = preloadComponent();
  InitNativeThemeListener();

  const { stores } = await appInit();

  // init theme
  applyTheme();

  let statusCode = 200;

  if (loadAsyncComponents) {
    await loadAsyncComponents.promise();

    statusCode = loadAsyncComponents.components.length ? 200 : 404;
  } else {
    statusCode = 500;
  }

  const root = createRoot(document.getElementById('root')!);
  root.render(<Root stores={stores} statusCode={statusCode} />);
})();
