import { Theme } from 'App/types';
import SQL from 'better-sqlite3-multiple-ciphers';
import type { LogFunctions } from 'electron-log';

export type DataInterface = {
  close: () => Promise<void>;
  removeDB: () => Promise<void>;

  // user
  updateOrCreateUser(users: DB.UserAttributes): Promise<void>;
  getUserInfo: () => Promise<DB.UserAttributes>;
  setUserTheme: (theme: Theme) => Promise<unknown>;
};

export type ClientInterface = DataInterface & {};

export type ServerInterface = DataInterface & {
  // Server-only

  initialize: (options: {
    configDir: string;
    key: string;
    logger: Omit<LogFunctions, 'log'>;
  }) => Promise<void>;
};
