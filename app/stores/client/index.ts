import { observable } from 'mobx';

export default class Client {
  @observable isMaximized: boolean = false;
}
