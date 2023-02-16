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

    interface SenderInfo {
      id: number;
      account: string;
      avatar: string | null;
      email: string | null;
      regisTime: string;
      updateTime: string;
    }
  }
}
