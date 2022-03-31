import { ipcMain, nativeTheme, BrowserWindow } from 'electron';

enum Theme {
  system = 'system',
  light = 'light',
  dark = 'dark',
}

function getTheme(): Exclude<Theme, 'system'> {
  return nativeTheme.shouldUseDarkColors ? Theme.dark : Theme.light;
}

export class NativeThemeNotifier {
  private readonly listeners = new Set<BrowserWindow>();

  private theme: Theme = Theme.system; // theme of userInfo

  public initialize(): void {
    nativeTheme.on('updated', () => {
      this.theme === Theme.system && this.notifyListeners();
    });

    // init theme from userInfo
    ipcMain.on('native-theme:init', (_event, theme: Theme) => {
      this.theme = theme;
    });

    ipcMain.on('native-theme:get_user', (event) => {
      event.returnValue = this.theme;
    });

    ipcMain.on('native-theme:get_system', (event) => {
      event.returnValue = getTheme();
    });

    // for setting
    ipcMain.on('native-theme:setting', (_event, theme: Theme) => {
      if (this.theme === theme) return;

      this.theme = theme;

      for (const window of this.listeners) {
        window.webContents.send('native-theme:setting', theme);
      }
    });
  }

  public addWindow(window: BrowserWindow): void {
    if (this.listeners.has(window)) {
      return;
    }

    this.listeners.add(window);

    window.once('closed', () => {
      this.listeners.delete(window);
    });
  }

  // TODO The value of theme setting is system. just change app theme, not to change value of setting.
  private notifyListeners(): void {
    for (const window of this.listeners) {
      window.webContents.send('native-theme:changed');
    }
  }
}
