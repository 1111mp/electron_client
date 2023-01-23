import { LogFunctions } from 'electron-log';
import { parentPort } from 'worker_threads';
import db from './server';
import {
  WrappedWorkerRequest,
  WrappedWorkerLogEntry,
  WrappedWorkerResponse,
} from './main';

if (!parentPort) throw new Error('Must run as a worker thread');

const port = parentPort;

function respond(seq: number, error: Error | undefined, response?: unknown) {
  const wrappedResponse: WrappedWorkerResponse = {
    type: 'response',
    seq,
    error: error?.stack,
    response,
  };
  port.postMessage(wrappedResponse);
}

const log = (
  level: WrappedWorkerLogEntry['level'],
  args: Array<unknown>
): void => {
  const weappedResponse: WrappedWorkerResponse = {
    type: 'log',
    level,
    args,
  };

  port.postMessage(weappedResponse);
};

//  'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';
const logger: Omit<LogFunctions, 'log'> = {
  error(...args: Array<unknown>) {
    log('error', args);
  },
  warn(...args: Array<unknown>) {
    log('warn', args);
  },
  info(...args: Array<unknown>) {
    log('info', args);
  },
  verbose(...args: Array<unknown>) {
    log('verbose', args);
  },
  debug(...args: Array<unknown>) {
    log('debug', args);
  },
  silly(...args: Array<unknown>) {
    log('silly', args);
  },
};

port.on('message', async ({ seq, request }: WrappedWorkerRequest) => {
  try {
    if (request.type === 'init') {
      await db.initialize({ ...request.options, logger });

      respond(seq, undefined, undefined);

      return;
    }

    if (request.type === 'close') {
      await db.close();

      respond(seq, undefined, undefined);
      process.exit(0);

      return;
    }

    if (request.type === 'removeDB') {
      await db.removeDB();

      respond(seq, undefined, undefined);

      return;
    }

    if (request.type === 'sqlCall') {
      const method = db[request.method];
      if (typeof method !== 'function') {
        throw new Error(`Invalid sql method: ${method}`);
      }

      const start = Date.now();
      const result = await (method as Function).apply(db, request.args);
      const end = Date.now();

      respond(seq, undefined, { result, duration: end - start });

      return;
    }

    throw new Error('Unexpected request type');
  } catch (error) {
    respond(seq, error, undefined);
  }
});
