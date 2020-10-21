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
        this.theme && applyTheme(theme);
      }
    );
    return Promise.resolve();
  }

  persistMap = {
    sqlite: ['theme'],
  };
}
