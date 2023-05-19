import { Theme } from 'App/types';

declare global {
  namespace DB {
    interface UserAttributes {
      id?: number;
      userId: number;
      account: string;
      token: string;
      avatar?: string;
      email?: string;
      theme?: Theme;
      regisTime: string;
      updateTime: string;
    }

    interface UserInfo {
      id: number;
      account: string;
      avatar?: string;
      email?: string;
      regisTime: string;
      updateTime: string;
    }

    interface SenderInfo {
      id: number;
      account: string;
      avatar?: string | null;
      email?: string | null;
      regisTime: string;
      updateTime: string;
    }

    interface FriendSetting {
      remark: string;
      astrolabe: boolean;
      block: boolean;
      createdAt: string;
      updatedAt: string;
    }

    interface UserWithFriendSetting
      extends Partial<FriendSetting>,
        SenderInfo {}
  }
}
