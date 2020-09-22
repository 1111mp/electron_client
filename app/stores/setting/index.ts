import 'mobx-react-lite/batchingForReactDom';
import Store, { State } from '../Store';
import { observable } from 'mobx';

export default class SettingStore extends Store {
  @observable theme?: string = '';

  persistMap = {
    sqlite: ['theme'],
  };
}
