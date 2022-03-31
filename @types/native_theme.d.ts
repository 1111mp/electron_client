import { Theme } from 'App/types';

declare global {
  type NativeThemeState = Readonly<{
    shouldUseDarkColors: boolean;
  }>;

  type ThemeChangedListenerFN = () => void;
  type ThemeSettingListenerFN = (theme: Theme) => void;
}
