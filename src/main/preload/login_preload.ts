import { contextBridge, ipcRenderer } from 'electron';
import sqlClient from '../db/client';

const { getUserInfo, updateOrCreateUser, setUserTheme } = sqlClient;

try {
  const { locale, message } = ipcRenderer.sendSync('locale-data');

  contextBridge.exposeInMainWorld('Context', {
    platform: process.platform,
    NODE_ENV: process.env.NODE_ENV,

    locale,
    localeMessages: message,

    sqlClient: {
      getUserInfo,
      updateOrCreateUser,
      setUserTheme,
    },

    loginSuccessed: (userInfo: DB.UserAttributes) =>
      ipcRenderer.send('login-successed', userInfo),
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
