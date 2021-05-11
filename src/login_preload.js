try {
  const { ipcRenderer } = require('electron');
  const { nativeTheme, app } = require('@electron/remote').require('electron');

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

  window.closeLogin = () => ipcRenderer.send('close-login');
  window.localeMessages = ipcRenderer.sendSync('locale-data');

  const sqlClient = require('./db/client');

  window.Signal = {
    sqlClient,
  };
} catch (error) {
  console.log(error);
}

console.log('preload complete');
