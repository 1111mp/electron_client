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

  ipcMain.on(SQL_CHANNEL_KEY, async (event, jobId, callName, ...args) => {
    try {
      if (!sql) {
        throw new Error(`${SQL_CHANNEL_KEY}: Not yet initialized!`);
      }
      const result = await sql.sqlCall(callName, args);
      event.sender.send(`${SQL_CHANNEL_KEY}-done`, jobId, null, result);
    } catch (error) {
      const errorForDisplay = error && error.stack ? error.stack : error;
      console.log(
        `sql channel error with call ${callName}: ${errorForDisplay}`
      );
      if (!event.sender.isDestroyed()) {
        event.sender.send(`${SQL_CHANNEL_KEY}-done`, jobId, errorForDisplay);
      }
    }
  });
}
