import 'mobx-react-lite/batchingForReactDom';
import Store from '../Store';
import { observable, reaction } from 'mobx';
import { applyTheme } from 'app/utils';

export default class SettingStore extends Store {
  @observable theme: string = '';

  // constructor(props: any) {
  //   super(props);
  // }

  ready(): Promise<void> {
    super.ready();
    reaction(
      () => this.theme,
      (theme: string) => {
        /** 暴露给window 方便其他BrowserWindow获取数据 */
        (window as any).settings = {
          ...(window as any).settings,
          theme: this.theme,
        };
        this.theme && applyTheme(theme);
      },
      {
        fireImmediately: true,
      }
    );
    return Promise.resolve();
  }

  persistMap = {
    sqlite: ['theme'],
  };
}
