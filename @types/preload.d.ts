/** eslint vars-on-top: off, no-var: off */

import { SqlClientType } from 'Main/db/types';
import { Theme, WindowName } from 'App/types';
import { NativeThemeListener } from 'Renderer/utils/NativeThemeListener';

declare global {
  var UserInfo: DB.UserAttributes;

  interface ContextType {
    NODE_ENV: string;
    platform: string;
    ROOT_PATH: string;

    getUserInfo: () => DB.UserAttributes;
    updateUserInfo: (userInfo: DB.UserAttributes) => unknown;

    localeMessages: I18n.Message;
    sqlClient: SqlClientType;

    getUserTheme: () => Theme;
    getSystemTheme: () => Exclude<Theme, 'system'>;
    themeSetting: (theme: Theme) => void;

    themeChangedListener: (fn: ThemeChangedListenerFN) => void;
    themeSettingListener: (fn: ThemeSettingListenerFN) => void;

    // for login window
    loginSuccessed: (user_str: string) => void;
    closeLogin: () => void;

    // for other window
    windowOpen: (args: Windows.Args) => void;
    windowClose: (name: WindowName) => void;
  }

  interface Window {
    Context: ContextType;

    // for theme
    systemTheme: Theme;

    ThemeContext: {
      nativeThemeListener: NativeThemeListener;
    };
  }
}
