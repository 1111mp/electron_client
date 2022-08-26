import { join } from 'path';
import { Worker } from 'worker_threads';
import { app } from 'electron';
import { format } from 'util';
import { strictAssert } from '../assert';
import { ElectronLog, LogLevel } from 'electron-log';

const MIN_TRACE_DURATION = 40;

export type InitializeOptions = Readonly<{
  configDir: string;
  key: string;
  logger: ElectronLog;
}>;

export type WorkerRequest = Readonly<
  | {
      type: 'init';
      options: Omit<InitializeOptions, 'logger'>;
    }
  | {
      type: 'close';
    }
  | {
      type: 'removeDB';
    }
  | {
      type: 'sqlCall';
      method: string;
      args: ReadonlyArray<any>;
    }
>;

export type WrappedWorkerRequest = Readonly<{
  seq: number;
  request: WorkerRequest;
}>;

export type WrappedWorkerLogEntry = Readonly<{
  type: 'log';
  level: LogLevel;
  args: ReadonlyArray<unknown>;
}>;

export type WrappedWorkerResponse =
  | Readonly<{
      type: 'response';
      seq: number;
      error: string | undefined;
      response: any;
    }>
  | WrappedWorkerLogEntry;

type PromisePair<T> = {
  resolve: (response: T) => void;
  reject: (error: Error) => void;
};

export class MainSQL {
  private readonly worker: Worker;

  private isReady = false;

  private onReady: Promise<void> | undefined;

  private readonly onExit: Promise<void>;

  private seq = 0;

  private logger?: ElectronLog;

  private onResponse = new Map<number, PromisePair<any>>();

  constructor() {
    const scriptDir = app.isPackaged
      ? join(__dirname, 'mainWorker.js')
      : join(__dirname, '../../../.erb/dll/mainWorker.js');
    this.worker = new Worker(scriptDir);

    this.worker.on('message', (wrappedResponse: WrappedWorkerResponse) => {
      if (wrappedResponse.type === 'log') {
        const { level, args } = wrappedResponse;
        strictAssert(this.logger !== undefined, 'Logger not initialized');
        this.logger[level](`MainSQL: ${format(...args)}`);
        return;
      }

      const { seq, error, response } = wrappedResponse;

      const pair = this.onResponse.get(seq);
      this.onResponse.delete(seq);
      if (!pair) throw new Error(`Unexpected worker response with seq: ${seq}`);

      if (error) {
        pair.reject(new Error(error));
      } else {
        pair.resolve(response);
      }
    });

    this.onExit = new Promise<void>((resolve) => {
      this.worker.once('exit', resolve);
    });
  }

  public async initialize({ configDir, key, logger }: InitializeOptions) {
    if (this.isReady || this.onReady) {
      throw new Error('Already initialized');
    }

    this.logger = logger;

    this.onReady = this.send({ type: 'init', options: { configDir, key } });

    await this.onReady;

    this.onReady = undefined;
    this.isReady = true;
  }

  public async close(): Promise<void> {
    if (!this.isReady) throw new Error('Not initialized');

    await this.send({ type: 'close' });
    await this.onExit;
  }

  public async removeDB() {
    await this.send({ type: 'removeDB' });
  }

  public async sqlCall(method: string, args: ReadonlyArray<any>): Promise<any> {
    if (this.onReady) await this.onReady;

    if (!this.isReady) throw new Error('Not initialized');

    const { result, duration } = await this.send<{
      result: any;
      duration: number;
    }>({
      type: 'sqlCall',
      method,
      args,
    });

    if (duration > MIN_TRACE_DURATION) {
      strictAssert(this.logger !== undefined, 'Logger not initialized');
      this.logger.info(`MainSQL: slow query ${method} duration=${duration}ms`);
    }

    return result;
  }

  private async send<Response>(request: WorkerRequest): Promise<Response> {
    const { seq } = this;
    this.seq += 1;

    const result = new Promise<Response>((resolve, reject) => {
      this.onResponse.set(seq, { resolve, reject });
    });

    const wrappedRequest: WrappedWorkerRequest = {
      seq,
      request,
    };
    this.worker.postMessage(wrappedRequest);

    return result;
  }
}
