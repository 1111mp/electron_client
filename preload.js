try {
  const { remote } = require('electron');
  const { nativeTheme } = remote.require('electron');

  // nativeTheme.themeSource = 'dark'

  window.ROOT_PATH = window.location.href.startsWith('file') ? '../' : '/';
  window.platform = process.platform;

  function setSystemTheme() {
    window.systemTheme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }

  setSystemTheme();

  /** 全局方法 设置主题 */
  window.subscribeToSystemThemeChange = (fn) => {
    nativeTheme.on('updated', () => {
      setSystemTheme();
      fn();
    });
  };
} catch (error) {
  console.log(error);
}

console.log('preload complete');
