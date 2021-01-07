import { WebContents } from 'electron';
import log from 'electron-log';

async function installExtensions() {
  const {
    default: installer,
    REACT_DEVELOPER_TOOLS,
  } = require('electron-devtools-installer');

  installer([REACT_DEVELOPER_TOOLS])
    .then((name: string) => log.info(`Added Extension:  ${name}`))
    .catch((err: Error) => log.error('An error occurred: ', err));
}

export async function openDevTools(webContents: WebContents) {
  webContents.openDevTools();
  await installExtensions();
}
