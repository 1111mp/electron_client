import './styles.scss';

import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { applyTheme } from 'app/utils';

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

// function appInit() {
//   return Promise.all([getThemeFromDatabase()]).then((res) => {
//     return {
//       userInfo: res[0],
//     };
//   });
// }

document.addEventListener('DOMContentLoaded', async () => {
  // const { userInfo } = await appInit();

  /** 初始化设置主题 */
  // const { theme = 'system' } = userInfo;
  // applyTheme(theme);

  (window as any).subscribeToSystemThemeChange((theme: string) => {
    applyTheme(theme);
  });

  const Root = require('./root').default;

  render(
    <AppContainer>
      <Root />
    </AppContainer>,
    document.getElementById('root')
  );
});
