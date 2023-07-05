import { Theme } from 'App/types';
// import SQL from 'better-sqlite3-multiple-ciphers';
import type { LogFunctions } from 'electron-log';

export type DataInterface = {
  close: () => Promise<void>;
  removeDB: () => Promise<void>;

  // user
  updateOrCreateUser: (users: DB.UserAttributes) => Promise<void>;
  getUserInfo: () => Promise<DB.UserAttributes>;
  setUserTheme: (theme: Theme) => Promise<unknown>;

  // friends
  setFriends: (
    owner: number,
    friends: DB.UserWithFriendSetting[]
  ) => Promise<void>;
  // setFriendsSync: (owner: number, friends: DB.UserWithFriendSetting[]) => void;
  getFriend: (owner: number, id: number) => Promise<DB.UserWithFriendSetting>;
  // getFriendSync: (owner: number, id: number) => DB.UserWithFriendSetting;
  getFriends: (owner: number) => Promise<DB.UserWithFriendSetting[]>;
  // getFriendsSync: (owner: number) => DB.UserWithFriendSetting[];
  updateFriendInfo: (
    owner: number,
    info: DB.FriendSetting & { id: number }
  ) => Promise<void>;
  // updateFriendInfoSync: (
  //   owner: number,
  //   info: DB.FriendSetting & { id: number }
  // ) => void;
  removeFriends: (owner: number, id: number | number[]) => Promise<void>;
  // removeFriendsSync: (owner: number, id: number | number[]) => void;

  // groups
  setGroups: (groups: ModuleIM.Core.GroupBasic[]) => Promise<void>;
  setGroupsIncludeMembers: (
    groups: Array<ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }>
  ) => Promise<void>;
  setGroup: (group: ModuleIM.Core.GroupBasic) => Promise<void>;
  setGroupIncludeMembers: (
    group: ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }
  ) => Promise<void>;
  getGroup: (groupId: number) => Promise<ModuleIM.Core.GroupBasic>;
  // getGroupSync: (groupId: number) => ModuleIM.Core.GroupBasic;
  getGroupWithMembers: (
    owner: number,
    groupId: number
  ) => Promise<
    | (ModuleIM.Core.GroupBasic & { members: DB.UserWithFriendSetting[] })
    | undefined
  >;
  getMembersByGroupId: (
    owner: number,
    groupId: number
  ) => Promise<DB.UserWithFriendSetting[]>;
  getGroups: (userId: number) => Promise<Array<ModuleIM.Core.GroupBasic>>;
  getGroupsIncludeMembers: (
    userId: number
  ) => Promise<
    Array<ModuleIM.Core.GroupBasic & { members: DB.UserWithFriendSetting[] }>
  >;

  // messages
  setMessage: (
    owner: number,
    message: ModuleIM.Core.MessageBasic
  ) => Promise<void>;
  setMessages: (
    owner: number,
    messages: ModuleIM.Core.MessageBasic[]
  ) => Promise<void>;
  getMessagesBySender: (options: {
    userId: number;
    receiver: number;
    pageNum: number;
    pageSize: number;
  }) => Promise<ModuleIM.Core.MessageBasic[]>;
  removeMessageByMsgIds: (msgIds: string[]) => Promise<void>;
  removeMessagesBySender: (owner: number, sender: number) => Promise<void>;
  removeMessages: (owner: number) => Promise<void>;

  // conversations
  getLastConversationMessage: (
    owner: number,
    sender: number
  ) => Promise<ModuleIM.Core.MessageBasic>;
  // getLastConversationMessageSync: (
  //   owner: number,
  //   sender: number
  // ) => ModuleIM.Core.MessageBasic;
  createConversation: (
    conversation: Omit<
      ModuleIM.Core.ConversationType,
      'id' | 'lastReadAck' | 'active_at'
    > & {
      id?: string;
      lastReadAck?: bigint;
      active_at?: number;
    }
  ) => Promise<void>;
  updateConvActiveAtWithValue: (id: string, active_at: number) => Promise<void>;
  updateConversationActiveAt: (id: string) => Promise<void>;
  // updateConversationActiveAtSync: (id: string, active_at: number) => void;
  updateConversationLastRead: (
    id: string,
    lastReadAck: bigint
  ) => Promise<void>;
  // updateConversationLastReadSync: (id: string, lastReadAck: bigint) => void;
  removeConversationById: (id: string) => Promise<void>;
  removeConversations: (owner: number) => Promise<void>;
  // removeConversationsSync: (owner: number) => void;
  getConversations: (
    owner: number
  ) => Promise<ModuleIM.Core.ConversationType[]>;
  getConversationsWithAll: (
    owner: number
  ) => Promise<Array<ModuleIM.Core.ConversationWithAllType>>;
  // getConversationsWithAllSync: (
  //   owner: number
  // ) => Array<ModuleIM.Core.ConversationWithAllType>;
  getTotalUnreadForConversation: (
    owner: number,
    options: {
      sender: number;
      lastReadAck: bigint;
    }
  ) => Promise<number>;
  // getTotalUnreadForConversationSync: (
  //   owner: number,
  //   options: {
  //     sender: number;
  //     lastReadAck: bigint;
  //   }
  // ) => number;
  getTotalUnreadCount: (options: {
    owner: number;
    lastReadAck: bigint;
  }) => Promise<number>;
};

export type ClientInterface = DataInterface & {
  // Client-side only

  shutdown: () => Promise<void>;
};

export type ServerInterface = DataInterface & {
  // Server-side only

  initialize: (options: {
    configDir: string;
    key: string;
    logger: Omit<LogFunctions, 'log'>;
  }) => Promise<void>;
};
