import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';

import 'app/app.global.css';
import 'app/app.global.scss';

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

function loadLocaleData(locale: string): Promise<Record<string, any>> {
  switch (locale) {
    case 'en':
      return import('../../_locales/en/messages.json');
    case 'zh-CN':
    default:
      return import('../../_locales/zh_CN/messages.json');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const messages = await loadLocaleData(navigator.language);

  // eslint-disable-next-line global-require
  const Root = require('./root').default;
  render(
    <AppContainer>
      <Root messages={messages} />
    </AppContainer>,
    document.getElementById('root')
  );
});
