import { contextBridge, ipcRenderer } from 'electron';
import sqlClient from '../db/client';
import type { Theme, WindowName } from 'App/types';

try {
  const { locale, message } = ipcRenderer.sendSync('locale-data');

  contextBridge.exposeInMainWorld('Context', {
    platform: process.platform,
    NODE_ENV: process.env.NODE_ENV,

    locale,
    localeMessages: message,

    sqlClient,

    windowOpen: (args: Windows.Args) => ipcRenderer.send('window:open', args),
    windowClose: (name: WindowName) => ipcRenderer.send('window:close', name),

    getUserTheme: (): Theme => ipcRenderer.sendSync('native-theme:get_user'),
    getSystemTheme: (): Exclude<Theme, 'system'> =>
      ipcRenderer.sendSync('native-theme:get_system'),
    themeSetting: (theme: Theme) =>
      ipcRenderer.send('native-theme:setting', theme),

    // The value of theme setting is system. just change app theme, not to change value of setting.
    themeChangedListener: (fn: ThemeChangedListenerFN) => {
      ipcRenderer.on('native-theme:changed', (_event: unknown) => {
        fn();
      });
    },

    // from setting
    themeSettingListener: (fn: ThemeSettingListenerFN) => {
      ipcRenderer.on('native-theme:setting', (_event, theme: Theme) => {
        fn(theme);
      });
    },
  });
} catch (err) {}

console.log('preload complete');
