import { makeAutoObservable } from 'mobx';
import { getFriends } from 'App/renderer/services/friend';

import { HttpStatus } from 'App/types';

export default class Friends {
  friends: DB.UserWithFriendSetting[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    this.initial();
  }

  async initial() {
    this.friends = await window.Context.sqlClient.getFriends(10007);

    if (!this.friends || !this.friends.length)
      getFriends()
        .then((res) => {
          if (res.statusCode === HttpStatus.OK) {
            window.Context.sqlClient.setFriends(10007, res.data.friends);
            this.friends = res.data.friends;
          }
        })
        .catch((err) => console.log(err));
  }
}
