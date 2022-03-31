import './styles.scss';

import { render } from 'react-dom';
import Root from './root';
// import { applyTheme } from 'app/utils';

(() => {
  // (window as any).subscribeToSystemThemeChange((theme: string) => {
  //   applyTheme(theme);
  // });

  render(<Root />, document.getElementById('root'));
})();
