import { createRoot } from 'react-dom/client';
import Root from './root';
import { createStore } from './stores';
import { applyTheme } from 'Renderer/utils/theme';
import initMode from 'Renderer/utils/mode_check';
import { InitNativeThemeListener } from 'Renderer/utils/NativeThemeListener';
import { Theme } from 'App/types';

import 'Renderer/styles/app.css';
import 'Renderer/styles/app.module.scss';

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
  InitNativeThemeListener();

  const theme =
    window.systemTheme === Theme.system
      ? window.Context.getSystemTheme()
      : window.systemTheme;

  // initial to set theme
  applyTheme(theme);

  const { stores, localeForAntd } = await appInit();

  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <Root theme={theme} localeForAntd={localeForAntd} stores={stores} />
  );
})();
