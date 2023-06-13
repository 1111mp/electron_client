import { makeAutoObservable } from 'mobx';

export default class ClientStore {
  isMaximized: boolean = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setMaximized = (flag: boolean): void => {
    this.isMaximized = flag;
  };
}
