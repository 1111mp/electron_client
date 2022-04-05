import { applyTheme } from './theme';
import { Theme } from 'App/types';

export type Callback = (change?: Theme) => void;
export type SystemThemeHolder = { Context: ContextType; systemTheme: Theme };

export class NativeThemeListener {
  private readonly subscribers = new Array<Callback>();

  // for setting
  public theme: Theme;

  constructor(private readonly holder: SystemThemeHolder) {
    this.theme = window.Context.getUserTheme(); // theme of userInfo
    this.update();

    // initialize themeChangedListener
    window.Context.themeChangedListener(() => {
      for (const fn of this.subscribers) {
        fn();
      }
    });

    // initialize themeSettingListener
    window.Context.themeSettingListener((theme) => {
      this.theme = theme;
      this.update(true);

      for (const fn of this.subscribers) {
        fn(theme);
      }
    });
  }

  public theme_setting(theme: Theme): void {
    this.theme = theme;
    this.update();

    window.Context.themeSetting(theme);
  }

  public subscribe(fn: Callback): void {
    this.subscribers.push(fn);
  }

  private update(update: boolean = false): void {
    // TODO electron not support this way to change
    update &&
      this.holder.Context.updateUserInfo &&
      this.holder.Context.updateUserInfo({
        ...window.Context.getUserInfo(),
        theme: this.theme,
      }); // update
    this.holder.systemTheme = this.theme; // update theme of userInfo
  }
}

export function InitNativeThemeListener() {
  window.ThemeContext = {
    nativeThemeListener: new NativeThemeListener(window),
  };

  window.ThemeContext.nativeThemeListener.subscribe(() => {
    applyTheme();
  });
}
