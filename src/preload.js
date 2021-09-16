try {
  const path = require('path');
  const { ipcRenderer } = require('electron');

  require('./renderer-process/windows/context');

  window.ROOT_PATH = window.location.href.startsWith('file') ? '../' : '/';
  window.platform = process.platform;

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

console.info('preload complete');
