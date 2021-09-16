try {
  const { ipcRenderer: ipc } = require('electron');

  require('../../renderer-process/windows/context');
} catch (error) {
  console.log(error);
}

console.info('preload complete');
