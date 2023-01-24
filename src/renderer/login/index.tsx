import './styles.scss';

import { createRoot } from 'react-dom/client';
import Root from './root';
// import { applyTheme } from 'app/utils';

(() => {
  // (window as any).subscribeToSystemThemeChange((theme: string) => {
  //   applyTheme(theme);
  // });

  const root = createRoot(document.getElementById('root')!);
  root.render(<Root />);
})();
