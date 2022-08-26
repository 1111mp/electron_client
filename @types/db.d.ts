import { Theme } from 'App/types';

declare global {
  namespace DB {
    interface UserAttributes {
      id: number;
      userId: number;
      account: string;
      token: string;
      avatar: string | null;
      email: string | null;
      theme: Theme;
      regisTime: string;
      updateTime: string;
    }
  }
}
