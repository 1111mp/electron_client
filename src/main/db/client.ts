import { ipcRenderer as ipc } from 'electron';
import Logging from '../LogForRenderer';
import { compact, fromPairs, isFunction, map, toPairs } from 'lodash';
import createTaskWithTimeout from '../utils/taskWithTimeout';
import { ClientInterface, ClientJobType, ServerInterface } from './types';

type ClientJobUpdateType = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  args?: ReadonlyArray<unknown>;
};

// ipcRenderer.setMaxListeners(0);

const DATABASE_UPDATE_TIMEOUT = 2 * 60 * 1000; // two minutes

const SQL_CHANNEL_KEY = 'sql-channel';

const _jobs: { [id: string]: ClientJobType } = Object.create(null);
const _DEBUG = false;
let _jobCounter = 0;
let _shuttingDown = false;
let _shutdownCallback: ((error?: Error) => void) | null = null;
const log = Logging().getLogger();

const dataInterface: ClientInterface = {
  close,
  removeDB,

  // user
  updateOrCreateUser,
  getUserInfo,
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

function _makeJob(fnName: string) {
  if (_shuttingDown && fnName !== 'close') {
    throw new Error(
      `Rejecting SQL channel job (${fnName}); application is shutting down`
    );
  }

  _jobCounter += 1;
  const id = _jobCounter;

  if (_DEBUG) {
    log.info(`SQL channel job ${id} (${fnName}) started`);
  }
  _jobs[id] = {
    fnName,
    start: Date.now(),
  };

  return id;
}

function _updateJob(id: number, data: ClientJobUpdateType) {
  const { resolve, reject } = data;
  const { fnName, start } = _jobs[id];

  _jobs[id] = {
    ..._jobs[id],
    ...data,
    resolve: (value: unknown) => {
      _removeJob(id);
      const end = Date.now();
      if (_DEBUG) {
        log.info(
          `SQL channel job ${id} (${fnName}) succeeded in ${end - start}ms`
        );
      }

      return resolve(value);
    },
    reject: (error: Error) => {
      _removeJob(id);
      const end = Date.now();
      log.info(`SQL channel job ${id} (${fnName}) failed in ${end - start}ms`);

      return reject(error);
    },
  };
}

function _removeJob(id: number) {
  if (_DEBUG) {
    _jobs[id].complete = true;

    return;
  }

  delete _jobs[id];

  if (_shutdownCallback) {
    const keys = Object.keys(_jobs);
    if (keys.length === 0) {
      _shutdownCallback();
    }
  }
}

function _getJob(id: number) {
  return _jobs[id];
}

if (ipc && ipc.on) {
  ipc.on(`${SQL_CHANNEL_KEY}-done`, (_, jobId, errorForDisplay, result) => {
    const job = _getJob(jobId);
    if (!job) {
      throw new Error(
        `Received SQL channel reply to job ${jobId}, but did not have it in our registry!`
      );
    }

    const { resolve, reject, fnName } = job;

    if (!resolve || !reject) {
      throw new Error(
        `SQL channel job ${jobId} (${fnName}): didn't have a resolve or reject`
      );
    }

    if (errorForDisplay) {
      return reject(
        new Error(
          `Error received from SQL channel job ${jobId} (${fnName}): ${errorForDisplay}`
        )
      );
    }

    return resolve(result);
  });
} else {
  log.warn('sql/Client: ipc.on is not available!');
}

function makeChannel(fnName: string) {
  return async (...args: ReadonlyArray<unknown>) => {
    const jobId = _makeJob(fnName);

    return createTaskWithTimeout(
      () =>
        new Promise((resolve, reject) => {
          try {
            ipc.send(SQL_CHANNEL_KEY, jobId, fnName, ...args);

            _updateJob(jobId, {
              resolve,
              reject,
              args: _DEBUG ? args : undefined,
            });
          } catch (error) {
            _removeJob(jobId);

            reject(error);
          }
        }),
      `SQL channel job ${jobId} (${fnName})`
    )();
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

async function updateOrCreateUser(user: DB.UserAttributes) {
  await channels.updateOrCreateUser(user);
}

async function getUserInfo() {
  const result = await channels.getUserInfo();

  return result;
}
