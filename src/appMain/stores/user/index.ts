// import 'mobx-react-lite/batchingForReactDom';
import { observable, reaction } from 'mobx';
import Store from '../Store';
import { applyTheme } from 'app/utils';

export default class UserStore extends Store {
  @observable user: any = {};

  constructor(props: any) {
    super(props);

    /** 初始化的时候 暴露全局更换主题的方法 */
    (window as any).setAppTheme = (theme: string) => {
      this.user = {
        ...this.user,
        theme,
      };
    };

    (window as any).subscribeToSystemThemeChange((theme: string) => {
      this.user.theme === 'system' && applyTheme(theme);
    });
  }

  persistMap = {
    sqlite: ['user'],
  };

  ready(): Promise<void> {
    super.ready();

    reaction(
      () => this.user,
      (user: any) => {
        /** 暴露给window 方便其他BrowserWindow获取数据 */
        (window as any).UserInfo = {
          ...(window as any).UserInfo,
          ...user,
        };
        user.theme && applyTheme(user.theme);
      },
      {
        fireImmediately: true,
      }
    );

    return Promise.resolve();
  }
}
