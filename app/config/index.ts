// const path = require('path');
// const url = require('url');
const {
  NODE_ENV
} = (process as any).env;

interface Config {
  isDev: boolean,
  isBorwserHistory: boolean
}

const config: Config = {
  isDev: NODE_ENV === 'development',
  /** 默认不使用history模式 */
  isBorwserHistory: false,
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
  url: '/dialog'
}

export default config;
