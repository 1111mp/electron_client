const { NODE_ENV } = window.Context || { NODE_ENV: 'development' };

interface Config {
  isDev: boolean;
  isBorwserHistory: boolean;
  serverUrl: string;
  imSocketUrl: string;
}

const config: Config = {
  isDev: NODE_ENV === 'development',
  // electron only hash history
  isBorwserHistory: false,

  // serverUrl: 'http://192.168.0.3:3000/api',
  serverUrl: 'http://127.0.0.1:3000/api/v1',
  imSocketUrl: 'ws://127.0.0.1:3000',
};

export default config;
