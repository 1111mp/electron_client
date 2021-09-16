import { ipcMain as ipc, nativeTheme, BrowserWindow } from 'electron';
import * as Events from '../constants/native_theme.json';

function getTheme(): Theme {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}

export class NativeThemeNotifier {
  private readonly listeners = new Set<BrowserWindow>();

  private theme: Theme = 'system';

  public initialize(): void {
    nativeTheme.on('updated', () => {
      this.theme === 'system' && this.notifyListeners(getTheme());
    });

    ipc.on(Events.INIT, (event) => {
      event.returnValue = this.theme;
    });

    // for setting
    ipc.on(Events.SETTING, (event, new_theme: Theme) => {
      if (this.theme === new_theme) return;

      this.theme = new_theme;

      for (const window of this.listeners) {
        window.webContents.send(Events.SETTING, new_theme, getTheme());
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
  private notifyListeners(new_theme: Theme): void {
    for (const window of this.listeners) {
      window.webContents.send(Events.CHANGED, new_theme);
    }
  }
}
