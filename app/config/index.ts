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

export default config;
