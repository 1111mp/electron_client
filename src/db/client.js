const { ipcRenderer } = require('electron');
const { fromPairs, compact, map, isFunction } = require('lodash');

// ipcRenderer.setMaxListeners(0);

const DATABASE_UPDATE_TIMEOUT = 2 * 60 * 1000; // two minutes

const SQL_CHANNEL_KEY = 'sql-channel';

const sqlClient = {
  close,

  upsertUser,
  getUserInfo,
};

module.exports = sqlClient;

const channelsAsUnknown = fromPairs(
  compact(
    map(sqlClient, (value) => {
      if (isFunction(value)) {
        return [value.name, makeChannel(value.name)];
      }

      return null;
    })
  )
);

const channels = channelsAsUnknown;

function makeChannel(fnName) {
  return async (...args) => {
    return new Promise((resolve, reject) => {
      try {
        ipcRenderer.invoke(SQL_CHANNEL_KEY, fnName, ...args).then(
          (result) => {
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

async function close() {
  await channels.close();
}

async function upsertUser(data) {
  return await channels.upsertUser(data);
}

async function getUserInfo() {
  return await channels.getUserInfo();
}
