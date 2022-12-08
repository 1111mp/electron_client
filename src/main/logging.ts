import log, { ElectronLog } from 'electron-log';
import dayjs from 'dayjs';

class Logging {
  private static instance: Logging;

  private log: ElectronLog;

  constructor() {
    this.log = log;
    this.log.transports.file.resolvePath = (variables) => {
      console.log(variables.libraryDefaultDir);
      return (
        variables.libraryDefaultDir + `/${dayjs().format('YYYY-MM-DD')}.log`
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
