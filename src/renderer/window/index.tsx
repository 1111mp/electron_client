import './styles.scss';

import { render } from 'react-dom';
import { matchRoutes } from 'react-router-dom';
import Root from './root';
import { routerConfig } from './routes';
import Config from 'Renderer/config';
import { InitNativeThemeListener } from 'Renderer/utils/NativeThemeListener';

import 'Renderer/styles/app.css';

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

(async () => {
  const loadAsyncComponents = preloadComponent();
  InitNativeThemeListener();

  let statusCode = 200;

  if (loadAsyncComponents) {
    await loadAsyncComponents.promise();

    statusCode = loadAsyncComponents.components.length ? 200 : 404;
  } else {
    statusCode = 500;
  }

  render(<Root statusCode={statusCode} />, document.getElementById('root'));
})();
