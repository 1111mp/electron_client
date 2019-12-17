const path = require('path');
const url = require('url');
const {
  NODE_ENV,
} = (process as any).env;

interface Config {
  isDev: boolean,
  isBorwserHistory: boolean
}

const config: Config = {
  isDev: NODE_ENV === 'development',
  /** 默认使用history模式 */
  isBorwserHistory: true,
}

export const Mainwin = {
  width: 1024,
  height: 728,
  minWidth: 1024,
  minHeight: 728
};

export const DIALOG = {
  width: 480,
  height: 324,
  url: getIndex('/dialog')
}

function getIndex(pathName: string) {
  const dirName = typeof window === 'undefined' ? __dirname : require('electron').remote.app.getAppPath();
  return url.format({
    pathname: path.join(dirName, `../app.html`),
    protocol: 'file:',
    hash: pathName,
    slashes: true
  });
}

export default config;
