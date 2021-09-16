import './styles.scss';

import * as React from 'react';
import { render } from 'react-dom';
import Root from './root';
import { applyTheme } from 'app/utils';

(() => {
  // (window as any).subscribeToSystemThemeChange((theme: string) => {
  //   applyTheme(theme);
  // });

  render(<Root />, document.getElementById('root'));
})();
