import { observable, action } from 'mobx';

export default class Client {
  @observable isMaximized: boolean = false;

  @action setMaximized = (flag: boolean): void => {
    this.isMaximized = flag;
  }
}
