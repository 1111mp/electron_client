import 'mobx-react-lite/batchingForReactDom';
import Store, { State } from '../Store';
import { observable, computed, reaction } from 'mobx';
import { applyTheme } from 'app/utils';

export default class SettingStore extends Store {
  @observable theme: string = '';

  constructor(props: any) {
    super(props);
    reaction(
      () => this.theme,
      (theme) => {
        this.theme && applyTheme(theme);
      }
    );
  }

  persistMap = {
    sqlite: ['theme'],
  };
}
