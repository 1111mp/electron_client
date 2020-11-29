import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import Login from './login';
import { applyTheme, getThemeFromDatabase } from 'app/utils';
import './styles.scss';

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

const App = () => {
  return <Login />;
};

const Root = hot(App);

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

  render(
    <AppContainer>
      <Root />
    </AppContainer>,
    document.getElementById('root')
  );
});
