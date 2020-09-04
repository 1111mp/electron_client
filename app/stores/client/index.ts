import 'mobx-react-lite/batchingForReactDom'
import Store, { State } from '../Store';
import { observable, action } from 'mobx';
// https://stackoverflow.com/questions/61654633/mobx-react-console-warning-related-observer

export default class ClientStore {
  @observable isMaximized: boolean = false;

  @action setMaximized = (flag: boolean): void => {
    this.isMaximized = flag;
  };
}
