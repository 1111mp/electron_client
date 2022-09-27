import { contextBridge, ipcRenderer } from 'electron';
import sqlClient from '../db/client';

try {
  const localeMessages = ipcRenderer.sendSync('locale-data');

  contextBridge.exposeInMainWorld('Context', {
    platform: process.platform,
    NODE_ENV: process.env.NODE_ENV,

    localeMessages,
    sqlClient,

    loginSuccessed: (user_str: string) =>
      ipcRenderer.send('login-successed', user_str),
    closeLogin: () => ipcRenderer.send('close-login'),
    updateAvailable: (fn: (info: any) => void) => {
      ipcRenderer.on('updateAvailable', (_event, info: any) => {
        fn(info);
      });
    },
    updateError: (fn: (info: any) => void) => {
      ipcRenderer.on('updateAvailable', (_event, info: any) => {
        fn(info);
      });
    },
    checkForUpdates: () => {
      ipcRenderer.send('checkForUpdates');
    },
    comfirmUpdate: () => {
      ipcRenderer.send('comfirmUpdate');
    },
  });
} catch (err) {}

console.log('preload complete');
