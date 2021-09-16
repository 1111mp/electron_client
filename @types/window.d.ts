import { UserAttributes } from 'app/db/models/user.model';
import { SqlClientType } from 'app/db/types';
import { Context as SignalContext } from 'app/renderer-process/context';

export type WhatIsThis = any;

declare global {
  interface Window {
    systemTheme: Theme;
    Signal: {
      sqlClient: SqlClientType;
    };
    SignalContext: SignalContext;
    UserInfo: UserAttributes;
  }
}
