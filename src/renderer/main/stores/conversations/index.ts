import { makeAutoObservable } from 'mobx';

export default class Conversations {
  private conversations: ModuleIM.Core.ConversationType[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }
}
