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

export default config;
