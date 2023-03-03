import { createRoot } from 'react-dom/client';
import { matchRoutes } from 'react-router-dom';
import Root from './root';
import Config from 'Renderer/config';
import { routerConfig } from './routes';
import { createStore } from './stores';
import { applyTheme } from 'Renderer/utils/theme';
import initMode from 'Renderer/utils/mode_check';
import { InitNativeThemeListener } from 'Renderer/utils/NativeThemeListener';
import { Theme } from 'App/types';

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
  return Promise.all([
    createStore(),
    initMode(),
    import(
      `antd/lib/locale/${
        window.Context.locale === 'en'
          ? 'en_US'
          : window.Context.locale.replace('-', '_')
      }.js`
    ).then((res) => res.default),
  ]).then((res) => {
    return {
      stores: res[0],
      localeForAntd: res[2],
    };
  });
}

(async () => {
  const loadAsyncComponents = preloadComponent();
  InitNativeThemeListener();

  const theme =
    window.systemTheme === Theme.system
      ? window.Context.getSystemTheme()
      : window.systemTheme;

  // initial to set theme
  applyTheme(theme);

  const { stores, localeForAntd } = await appInit();

  let statusCode = 200;

  if (loadAsyncComponents) {
    await loadAsyncComponents.promise();

    statusCode = loadAsyncComponents.components.length ? 200 : 404;
  } else {
    statusCode = 500;
  }

  const root = createRoot(document.getElementById('root')!);
  root.render(
    <Root
      theme={theme}
      localeForAntd={localeForAntd}
      stores={stores}
      statusCode={statusCode}
    />
  );
})();
