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

/** 主界面 */
export const Mainwin = {
  width: 1024,
  height: 728,
  minWidth: 1024,
  minHeight: 728
};

/** 对话框 */
export const DIALOG = {
  width: 480,
  height: 324,
  url: '/dialog'
}

/** customWin模版
 * CUSTOMWIN = {
 *   w: 680,
 *   h: 600,
 *  id: 'customWin',
 *   url: '/customWin'
 * };
 */

/** 使用custonWin打开个人中心页面 */
export const CUSTOMWIN = {
  w: 680,
  h: 600,
  id: 'userCenter',
  url: '/userCenter'
};

export default config;
