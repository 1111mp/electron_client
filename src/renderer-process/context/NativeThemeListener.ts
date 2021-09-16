import * as Events from '../../constants/native_theme.json';

export type Callback = (change: Theme, type: NotifyType) => void;

export interface MinimalIPC {
  sendSync(channel: string): Theme;

  send(channel: string, new_theme: Theme): void;

  on(
    channel: string,
    listener: (event: unknown, ...args: ReadonlyArray<any>) => void
  ): this;
}

export type SystemThemeHolder = { systemTheme: Theme };

export class NativeThemeListener {
  private readonly subscribers = new Array<Callback>();

  // for setting
  public theme: Theme;

  constructor(
    private ipc: MinimalIPC,
    private readonly holder: SystemThemeHolder
  ) {
    this.theme = ipc.sendSync(Events.INIT);
    this.update();

    // TODO The value of theme setting is system. just change app theme, not to change value of setting.
    ipc.on(Events.CHANGED, (_event: unknown, new_theme: Theme) => {
      for (const fn of this.subscribers) {
        fn(new_theme, 'system');
      }
    });

    // TODO from setting
    ipc.on(
      Events.SETTING,
      (_event: unknown, theme_setting: Theme, theme: 'light' | 'dark') => {
        this.theme = theme_setting;
        this.update();

        for (const fn of this.subscribers) {
          fn(theme_setting === 'system' ? theme : theme_setting, 'setting');
        }
      }
    );
  }

  public theme_setting(new_theme: Theme): void {
    this.theme = new_theme;
    this.update();

    this.ipc.send(Events.SETTING, new_theme);
  }

  public subscribe(fn: Callback): void {
    this.subscribers.push(fn);
  }

  private update(): void {
    this.holder.systemTheme = this.theme;
  }
}
