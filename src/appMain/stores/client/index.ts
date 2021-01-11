import { makeAutoObservable } from 'mobx';
// https://stackoverflow.com/questions/61654633/mobx-react-console-warning-related-observer

export default class ClientStore {
  isMaximized: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setMaximized = (flag: boolean): void => {
    this.isMaximized = flag;
  };
}
