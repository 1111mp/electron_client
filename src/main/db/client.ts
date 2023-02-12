import { ipcRenderer as ipc } from 'electron';
import Logging from '../LogForRenderer';
import { compact, fromPairs, isFunction, map, toPairs } from 'lodash';
import createTaskWithTimeout from '../utils/taskWithTimeout';
import { ClientInterface, ServerInterface } from './types';
import { Theme } from 'App/types';

let activeJobCount = 0;

// ipcRenderer.setMaxListeners(0);

const DATABASE_UPDATE_TIMEOUT = 2 * 60 * 1000; // two minutes

const SQL_CHANNEL_KEY = 'sql-channel';

const log = Logging().getLogger();

const dataInterface: ClientInterface = {
  close,
  removeDB,

  // user
  updateOrCreateUser,
  getUserInfo,
  setUserTheme,
};

export default dataInterface;

const channelsAsUnknown = fromPairs(
  compact(
    map(toPairs(dataInterface), ([name, value]: [string, unknown]) => {
      if (isFunction(value)) {
        return [name, makeChannel(name)];
      }

      return null;
    })
  )
) as unknown;

const channels: ServerInterface = channelsAsUnknown as ServerInterface;

function makeChannel(fnName: string) {
  return async (...args: ReadonlyArray<unknown>) => {
    activeJobCount += 1;

    return createTaskWithTimeout(async () => {
      try {
        return await ipc.invoke(SQL_CHANNEL_KEY, fnName, ...args);
      } finally {
        activeJobCount -= 1;
        if (activeJobCount === 0) {
          // resolveShutdown?.();
        }
      }
    }, `SQL channel call (${fnName})`)();
  };
}

// Note: will need to restart the app after calling this, to set up afresh
async function close(): Promise<void> {
  await channels.close();
}

// Note: will need to restart the app after calling this, to set up afresh
async function removeDB(): Promise<void> {
  await channels.removeDB();
}

function updateOrCreateUser(user: DB.UserAttributes) {
  return channels.updateOrCreateUser(user);
}

async function getUserInfo() {
  return channels.getUserInfo();
}

async function setUserTheme(theme: Theme) {
  return channels.setUserTheme(theme);
}
