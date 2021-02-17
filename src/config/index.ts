// const path = require('path');
// const url = require('url');
const { NODE_ENV } = process.env;

interface Config {
  isDev: boolean;
  isBorwserHistory: boolean;
  serverUrl: string;
}

const config: Config = {
  isDev: NODE_ENV === 'development',
  /** 默认不使用history模式 */
  isBorwserHistory: false,

  // serverUrl: 'http://192.168.80.208:3000',
  serverUrl: 'http://192.168.0.9:3000',
};

/** 主界面 */
export const Mainwin = {
  width: 1040,
  height: 730,
  minWidth: 1040,
  minHeight: 730,
};

/** 登录界面 */
export const LoginWin = {
  width: 280,
  height: 400,
};

/** 对话框 */
export const DIALOG = {
  width: 480,
  height: 324,
  url: '/dialog',
};

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
  width: 680,
  height: 600,
  id: 'settings',
  url: '/settings',
};

export const BROWSER = {
  width: 1024,
  height: 768,
  url: '/browser',
};

export const NOTIFIER = {
  width: 290,
  height: 200,
  url: '/notifier',
};

export const EXPANSION = {
  width: 250,
  // height: 200,
  url: '/notifier',
};

export const ADDFRIEND = {
  width: 600,
  height: 360,
  url: '/addfriend',
};

export default config;
