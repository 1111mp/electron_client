import * as React from 'react';
import { render } from 'react-dom';
// 消除警告React-Hot-Loader: react-🔥-dom patch is not detected. React 16.6+ features may not work.
// 详见：https://github.com/gaearon/react-hot-loader#hot-loaderreact-dom
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import './app.global.css';

render(
  <AppContainer>
    <Root />
  </AppContainer>,
  document.getElementById('root')
);

if ((module as any).hot) {
  (module as any).hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./containers/Root').default;
    render(
      <AppContainer>
        <NextRoot />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
