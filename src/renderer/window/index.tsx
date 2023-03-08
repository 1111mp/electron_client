import './styles.scss';

import { createRoot } from 'react-dom/client';
import { matchRoutes } from 'react-router-dom';
import Root from './root';
import { routerConfig } from './routes';
import initMode from 'Renderer/utils/mode_check';
import Config from 'Renderer/config';
import { InitNativeThemeListener } from 'Renderer/utils/NativeThemeListener';

import 'Renderer/styles/app.css';
import { Theme } from 'App/types';
import { applyTheme } from '../utils/theme';

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
      localeForAntd: res[1],
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

  const { localeForAntd } = await appInit();

  let statusCode = 200;

  if (loadAsyncComponents) {
    await loadAsyncComponents.promise();

    statusCode = loadAsyncComponents.components.length ? 200 : 404;
  } else {
    statusCode = 500;
  }

  const root = createRoot(document.getElementById('root')!);
  root.render(
    <Root statusCode={statusCode} theme={theme} localeForAntd={localeForAntd} />
  );
})();
