import { reaction, makeAutoObservable, toJS } from 'mobx';

export default class UserStore {
  user: DB.UserAttributes = window.Context.getUserInfo();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    reaction(
      () => this.user,
      (userInfo) => {
        // userInfo changed
        window.Context.sqlClient.updateOrCreateUser(toJS(userInfo));
      }
    );
  }
}
