const { NODE_ENV } = window.Context;

interface Config {
  isDev: boolean;
  isBorwserHistory: boolean;
  serverUrl: string;
}

const config: Config = {
  isDev: NODE_ENV === 'development',
  // electron only hash history
  isBorwserHistory: false,

  // serverUrl: 'http://192.168.80.208:3000',
  serverUrl: 'http://127.0.0.1:3000/api',
};

export default config;
