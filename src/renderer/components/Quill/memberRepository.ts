// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import Fuse from 'fuse.js';

// import { ConversationType } from '../state/ducks/conversations';
export type ConversationType = {
  [key: string]: any;
};

const FUSE_OPTIONS = {
  location: 0,
  shouldSort: true,
  threshold: 0,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  tokenize: true,
  keys: ['account', 'remark', 'email'],
};

export class MemberRepository {
  private members: Array<DB.UserWithFriendSetting>;

  private fuse: Fuse<DB.UserWithFriendSetting>;

  constructor(members: Array<DB.UserWithFriendSetting> = []) {
    this.members = members;
    this.fuse = new Fuse<DB.UserWithFriendSetting>(this.members, FUSE_OPTIONS);
  }

  updateMembers(members: Array<DB.UserWithFriendSetting>): void {
    this.members = members;
    this.fuse = new Fuse(members, FUSE_OPTIONS);
  }

  getMembers(omit?: DB.UserWithFriendSetting): Array<DB.UserWithFriendSetting> {
    if (omit) {
      return this.members.filter(({ id }) => id !== omit.id);
    }

    return this.members;
  }

  getMemberById(id?: number): DB.UserWithFriendSetting | undefined {
    return id
      ? this.members.find(({ id: memberId }) => memberId === id)
      : undefined;
  }

  getMemberByAccount(account?: string): DB.UserWithFriendSetting | undefined {
    return account
      ? this.members.find(({ account: memberAct }) => memberAct === account)
      : undefined;
  }

  search(
    pattern: string,
    omit?: DB.UserWithFriendSetting
  ): DB.UserWithFriendSetting[] {
    const results = this.fuse.search(`${pattern}`);

    if (omit) {
      return results
        .filter(({ item }) => item.id !== omit.id)
        .map(({ item }) => item);
    }

    return results.map(({ item }) => item);
  }
}
