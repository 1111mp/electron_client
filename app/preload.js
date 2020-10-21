try {
  const { remote, ipcRenderer } = require('electron');
  const { nativeTheme } = remote.require('electron');
  const initDatabase = require('./db');

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

  ipcRenderer.on('add-dark-overlay', () => {
    window.Events.addDarkOverlay();
  });

  ipcRenderer.on('remove-dark-overlay', () => {
    window.Events.removeDarkOverlay();
  });

  initDatabase();
} catch (error) {
  console.log(error);
}

console.log('preload complete');
