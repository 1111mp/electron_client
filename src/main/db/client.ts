import { ipcRenderer } from 'electron';
import { SqlClientType } from './types';

// ipcRenderer.setMaxListeners(0);

const DATABASE_UPDATE_TIMEOUT = 2 * 60 * 1000; // two minutes

const SQL_CHANNEL_KEY = 'sql-channel';

const sqlClient: SqlClientType = {
  close: makeChannel<void>('close'),

  upsertUser: makeChannel<any>('upsertUser'),
  getUserInfo: makeChannel<DB.UserAttributes>('getUserInfo'),
};

export { sqlClient };

function makeChannel<T>(fnName: keyof SqlClientType) {
  return async (...args: any[]): Promise<T> => {
    return new Promise((resolve, reject) => {
      try {
        ipcRenderer.invoke(SQL_CHANNEL_KEY, fnName, ...args).then(
          (result: T) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );

        setTimeout(() => {
          reject(new Error(`SQL channel job (${fnName}) timed out`));
        }, DATABASE_UPDATE_TIMEOUT);
      } catch (error) {
        reject(error);
      }
    });
  };
}
