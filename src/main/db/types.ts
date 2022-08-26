import { LogFunctions } from 'electron-log';

export type DataInterface = {
  close: () => Promise<void>;
  removeDB: () => Promise<void>;

  // user
  updateOrCreateUser(users: DB.UserAttributes): Promise<void>;
  getUserInfo: () => Promise<DB.UserAttributes>;
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

export type ClientJobType = {
  fnName: string;
  start: number;
  resolve?: (value: unknown) => void;
  reject?: (error: Error) => void;

  // Only in DEBUG mode
  complete?: boolean;
  args?: ReadonlyArray<unknown>;
};
