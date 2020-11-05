try {
  const path = require('path');
  const { remote, ipcRenderer } = require('electron');
  const { nativeTheme, app } = remote.require('electron');
  const initDatabase = require('./db');

  // nativeTheme.themeSource = 'dark'

  // window.ROOT_PATH = window.location.href.startsWith('file') ? '../' : '/';
  window.platform = process.platform;

  function setSystemTheme() {
    window.systemTheme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }

  setSystemTheme();

  /** 全局方法 设置主题 */
  window.subscribeToSystemThemeChange = (fn) => {
    nativeTheme.on('updated', () => {
      setSystemTheme();
      fn(window.systemTheme);
    });
  };

  window.sequelize = initDatabase();
} catch (error) {
  console.log(error);
}

console.log('preload complete');
