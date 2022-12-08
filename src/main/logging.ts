import { ipcMain } from 'electron';
import log, { ElectronLog } from 'electron-log';
import dayjs from 'dayjs';

class Logging {
  private static instance: Logging;

  private log: ElectronLog;

  constructor() {
    this.log = log;
    this.log.transports.file.resolvePath = (variables) => {
      return (
        variables.libraryDefaultDir + `/${dayjs().format('YYYY-MM-DD')}.log`
      );
    };

    this.registeForRender();
  }

  public static getInstance() {
    if (!Logging.instance) Logging.instance = new Logging();
    return Logging.instance;
  }

  public getLogger = () => {
    return this.log;
  };

  private registeForRender = () => {
    ipcMain.on(
      'app-log-event',
      (_evt, name: keyof ElectronLog['functions'], ...args) => {
        this.log[name](args);
      }
    );
  };
}

export default function () {
  return Logging.getInstance();
}
