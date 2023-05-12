import './styles.scss';

import { createRoot } from 'react-dom/client';
import Root from './root';
import initMode from 'Renderer/utils/mode_check';
import { InitNativeThemeListener } from 'Renderer/utils/NativeThemeListener';

import 'Renderer/styles/app.css';
import { Theme } from 'App/types';
import { applyTheme } from '../utils/theme';

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
  InitNativeThemeListener();

  const theme =
    window.systemTheme === Theme.system
      ? window.Context.getSystemTheme()
      : window.systemTheme;

  // initial to set theme
  applyTheme(theme);

  const { localeForAntd } = await appInit();

  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(<Root theme={theme} localeForAntd={localeForAntd} />);
})();
