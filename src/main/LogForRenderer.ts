import { ipcRenderer } from 'electron';
import type { ElectronLog } from 'electron-log';

type Log = ElectronLog['functions'];

class Logging {
  private static instance: Logging;

  private logger: Log;

  constructor() {
    this.logger = {
      error: this.error,
      warn: this.warn,
      info: this.info,
      verbose: this.verbose,
      debug: this.debug,
      silly: this.silly,
      log: this.log,
    };
  }

  public static getInstance() {
    if (!Logging.instance) Logging.instance = new Logging();
    return Logging.instance;
  }

  public getLogger = () => {
    return this.logger;
  };

  private send = (name: keyof Log, ...args: unknown[]) => {
    ipcRenderer.send('app-log-event', name, args);
  };

  private error: ElectronLog['functions']['error'] = (...params) => {
    this.send('error', params);
  };
  private warn: ElectronLog['functions']['warn'] = (...params) => {
    this.send('warn', params);
  };
  private info: ElectronLog['functions']['info'] = (...params) => {
    this.send('info', params);
  };
  private verbose: ElectronLog['functions']['verbose'] = (...params) => {
    this.send('verbose', params);
  };
  private debug: ElectronLog['functions']['debug'] = (...params) => {
    this.send('debug', params);
  };
  private silly: ElectronLog['functions']['silly'] = (...params) => {
    this.send('silly', params);
  };
  private log: ElectronLog['functions']['log'] = (...params) => {
    this.send('log', params);
  };
}

export default function () {
  return Logging.getInstance();
}
