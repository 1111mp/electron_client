import 'mobx-react-lite/batchingForReactDom';
import { observable, action } from 'mobx';
// https://stackoverflow.com/questions/61654633/mobx-react-console-warning-related-observer

export default class Client {
  @observable isMaximized: boolean = false;

  @action setMaximized = (flag: boolean): void => {
    this.isMaximized = flag;
  }
}
