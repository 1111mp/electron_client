try {
  const path = require('path');
  const { remote, ipcRenderer } = require('electron');
  const { nativeTheme } = remote.require('electron');

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
      fn(window.systemTheme);
    });
  };

  ipcRenderer.on('add-dark-overlay', (event, data) => {
    window.Events.addDarkOverlay(data);
  });

  ipcRenderer.on('remove-dark-overlay', () => {
    window.Events.removeDarkOverlay();
  });

  ipcRenderer.on('theme-setting', (event, data) => {
    window.Events.setThemeSetting(data);
  });

  window.localeMessages = ipcRenderer.sendSync('locale-data');

  const sqlClient = require('./db/client');

  window.Signal = {
    sqlClient,
  };
} catch (error) {
  console.log(error);
}

console.log('preload complete');
