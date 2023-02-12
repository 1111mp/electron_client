import { ipcMain } from 'electron';

type SQLType = {
  sqlCall(callName: string, args: ReadonlyArray<unknown>): unknown;
};

let sql: SQLType | undefined;

let initialized = false;

const SQL_CHANNEL_KEY = 'sql-channel';

export function initialize(mainSQL: SQLType): void {
  if (initialized) {
    throw new Error('sqlChannels: already initialized!');
  }
  initialized = true;

  sql = mainSQL;

  ipcMain.handle(SQL_CHANNEL_KEY, async (_event, callName, ...args) => {
    if (!sql) {
      throw new Error(`${SQL_CHANNEL_KEY}: Not yet initialized!`);
    }
    return sql.sqlCall(callName, args);
  });
}
