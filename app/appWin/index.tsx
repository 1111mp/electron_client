import React from 'react';
import { render } from 'react-dom';
import Root from './root';

import 'app/app.global.css';
import 'app/app.global.scss';

function loadLocaleData(locale: string): Promise<Record<string, any>> {
  switch (locale) {
    case 'en':
      return import('../../_locales/en/messages.json');
    case 'zh-CN':
    default:
      return import('../../_locales/zh_CN/messages.json');
  }
}

(async () => {
  const messages = await loadLocaleData(navigator.language);

  render(<Root messages={messages} />, document.getElementById('root'));
})();
