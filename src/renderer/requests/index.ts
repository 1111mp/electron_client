import axios, {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import Config from 'Renderer/config';

const DEFAULT_API_CONFIG: AxiosRequestConfig = {
  method: 'GET',
  headers: {},
  responseType: 'json',
  responseEncoding: 'utf8',
  withCredentials: true,
  timeout: 30000,
};

axios.defaults.baseURL = Config.serverUrl;

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.url) return config;

    if (!/login|register/.test(config.url)) {
      const { token, userId } = window.UserInfo;
      config.headers.token = token; // getToken
      config.headers.userid = userId; // getUserId
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function request(
  api: string,
  config: AxiosRequestConfig = {}
): Promise<any> {
  return new Promise((resolve, reject) => {
    config.url = api;
    config.method = config.method || DEFAULT_API_CONFIG.method;

    config[config.method?.toLowerCase() === 'get' ? 'params' : 'data'] =
      config.data;

    config.headers = {
      ...DEFAULT_API_CONFIG.headers,
      ...config.headers,
    };

    axios({
      ...DEFAULT_API_CONFIG,
      ...config,
    })
      .then((resp) => {
        const { status, data = {} } = resp;
        if (status !== 200) {
          return reject({
            status: data.status || status,
            message: data.msg || '出错了,请稍后再试！',
            data,
            api,
          });
        }
        return resolve(data);
      })
      .catch((error) => reject(error));
  });
}

type Values = {
  [key: string]: any;
};

export function makeParams(keys: string[], values: Values) {
  let params: Values = {};
  keys &&
    keys.forEach((key) => {
      let value = values[key];
      if (value !== undefined && value !== '' && value !== null) {
        params[key] = value;
      }
    });
  return params;
}
