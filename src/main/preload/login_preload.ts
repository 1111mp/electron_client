import { contextBridge, ipcRenderer } from 'electron';
import sqlClient from '../db/client';

try {
  const { locale, message } = ipcRenderer.sendSync('locale-data');

  contextBridge.exposeInMainWorld('Context', {
    platform: process.platform,
    NODE_ENV: process.env.NODE_ENV,

    locale,
    localeMessages: message,

    sqlClient,

    loginSuccessed: (user_str: string) =>
      ipcRenderer.send('login-successed', user_str),
    closeLogin: () => ipcRenderer.send('close-login'),
    checkForUpdates: () => {
      ipcRenderer.send('checkForUpdates');
    },
    comfirmUpdate: () => {
      ipcRenderer.send('comfirmUpdate');
    },
  });
} catch (err) {}

console.log('preload complete');
