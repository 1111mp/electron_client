import { reaction, makeAutoObservable, toJS } from 'mobx';

export default class UserStore {
  user: DB.UserAttributes = window.Context.getUserInfo();

  constructor() {
    window.ThemeContext.nativeThemeListener.subscribe((theme) => {
      theme !== void 0 &&
        (this.user = {
          ...this.user,
          theme,
        });
    });

    makeAutoObservable(this, {}, { autoBind: true });

    reaction(
      () => this.user,
      (userInfo) => {
        // userInfo changed
        window.Context.sqlClient.upsertUser(toJS(userInfo));
      }
    );
  }
}
