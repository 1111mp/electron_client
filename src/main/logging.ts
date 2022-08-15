import { join } from 'path';
import log, { ElectronLog } from 'electron-log';
import moment from 'moment';

class Logging {
  private static instance: Logging;

  private log: ElectronLog;

  constructor() {
    this.log = log;
    this.log.transports.file.resolvePath = (variables) => {
      return join(
        variables.libraryDefaultDir,
        `${moment().format('YYYY-MM-DD')}.log`
      );
    };
  }

  public static getInstance() {
    if (!Logging.instance) Logging.instance = new Logging();

    return Logging.instance;
  }

  public getLogger = () => {
    return this.log;
  };
}

export default function () {
  return Logging.getInstance();
}
