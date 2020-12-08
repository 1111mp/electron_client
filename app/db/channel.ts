import { ipcMain, IpcMainInvokeEvent } from 'electron';
import PQueue from 'p-queue';
import sql, { SqlInterface } from './index';

export default { initialize };

let initialized = false;

const SQL_CHANNEL_KEY = 'sql-channel';

let singleQueue: PQueue | null = null;
let multipleQueue: PQueue | null = null;

/** 创建单任务队列 同时只能进行一个任务 */
function makeNewSingleQueue() {
  singleQueue = new PQueue({ concurrency: 1, timeout: 1000 * 60 * 2 });
  return singleQueue;
}

/** 创建多任务队列 同时可以执行多个任务 */
function makeNewMultipleQueue() {
  multipleQueue = new PQueue({ concurrency: 10, timeout: 1000 * 60 * 2 });
  return multipleQueue;
}

function makeSQLJob(fn: Function, args: any[]) {
  // console.log(`Job ${jobId} (${callName}) queued`);
  return async () => {
    // const start = Date.now();
    // console.log(`Job ${jobId} (${callName}) started`);
    const result = await fn(...args);
    // const end = Date.now();
    // console.log(`Job ${jobId} (${callName}) succeeded in ${end - start}ms`);
    return result;
  };
}

async function handleCall(callName: keyof SqlInterface, args: any[]) {
  const fn = sql[callName];

  if (!fn) {
    throw new Error(`sql channel: ${callName} is not an available function`);
  }

  let result;

  if (fn.needsSerial) {
    if (singleQueue) {
      result = await singleQueue.add(makeSQLJob(fn, args));
    } else if (multipleQueue) {
      makeNewSingleQueue();

      singleQueue!.add(() => multipleQueue!.onIdle());
      multipleQueue = null;

      result = await singleQueue!.add(makeSQLJob(fn, args));
    } else {
      makeNewSingleQueue();
      result = await singleQueue!.add(makeSQLJob(fn, args));
    }
  } else {
    if (multipleQueue) {
      result = await multipleQueue.add(makeSQLJob(fn, args));
    } else if (singleQueue) {
      makeNewMultipleQueue();
      multipleQueue!.pause();

      const multipleQueueRef = multipleQueue!;
      const singleQueueRef = singleQueue;

      singleQueue = null;
      const promise = multipleQueueRef.add(makeSQLJob(fn, args));
      await singleQueueRef.onIdle();

      multipleQueueRef.start();
      result = await promise;
    } else {
      makeNewMultipleQueue();
      result = await multipleQueue!.add(makeSQLJob(fn, args));
    }
  }

  return result;
}

function initialize() {
  if (initialized) {
    throw new Error('sqlChannels: already initialized!');
  }
  initialized = true;

  ipcMain.handle(
    SQL_CHANNEL_KEY,
    async (
      event: IpcMainInvokeEvent,
      callName: keyof SqlInterface,
      ...args: any[]
    ) => {
      try {
        const result = await handleCall(callName, args);

        return Promise.resolve(result);
      } catch (error) {
        const errorForDisplay = error && error.stack ? error.stack : error;
        console.log(
          `sql channel error with call ${callName}: ${errorForDisplay}`
        );

        return Promise.reject(
          `sql channel error with call ${callName}: ${errorForDisplay}`
        );
      }
    }
  );
}
