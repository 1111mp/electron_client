// import 'mobx-react-lite/batchingForReactDom';
import { observable, reaction } from 'mobx';
import Store from '../Store';
import { applyTheme } from 'app/utils';
import { UserAttributes } from 'app/db/models/user.model';

export default class UserStore extends Store {
  @observable user: UserAttributes | null = null;

  constructor(props: any) {
    super(props);

    window.SignalContext.nativeThemeListener.subscribe((theme, type) => {
      applyTheme(theme);
      type === 'setting' &&
        (this.user = {
          ...this.user!,
          theme,
        });
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
        window.UserInfo = {
          ...window.UserInfo,
          ...user,
        };
      },
      {
        fireImmediately: true,
      }
    );

    return Promise.resolve();
  }
}
