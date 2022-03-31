import { contextBridge, ipcRenderer } from 'electron';
import { sqlClient } from '../db/client';
import { WindowArgs } from '../window';
import { Theme, WindowName } from 'App/types';

(async function () {
  try {
    const localeMessages = ipcRenderer.sendSync('locale-data');

    let UserInfo = await sqlClient.getUserInfo();
    ipcRenderer.send('native-theme:init', UserInfo.theme);

    // exposeInMainWorld don't support class
    contextBridge.exposeInMainWorld('Context', {
      platform: process.platform,
      NODE_ENV: process.env.NODE_ENV,
      ROOT_PATH: window.location.href.startsWith('file') ? '../' : '/',

      getUserInfo: () => UserInfo,
      updateUserInfo: (userInfo: DB.UserAttributes) =>
        (UserInfo = { ...userInfo }),

      windowOpen: (args: WindowArgs) => ipcRenderer.send('window:open', args),
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

      localeMessages,
      sqlClient,
    });
  } catch (err) {}

  console.log('preload complete');
})();
