import { LogFunctions } from 'electron-log';

export const consoleLogger: Omit<LogFunctions, 'log'> = {
  error(...args: Array<unknown>) {
    console.error(...args);
  },
  warn(...args: Array<unknown>) {
    console.warn(...args);
  },
  info(...args: Array<unknown>) {
    console.info(...args);
  },
  verbose(...args: Array<unknown>) {
    console.log('verbose', args);
  },
  debug(...args: Array<unknown>) {
    console.debug(...args);
  },
  silly(...args: Array<unknown>) {
    console.log(...args);
  },
};
