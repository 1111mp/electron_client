import { RouterStore } from 'mobx-react-router';
import Config from 'app/config';

Config.isDev
  && import('mobx-logger').then(logger => {
    logger.enableLogging({
      predicate: () => true,
      action: true,
      reaction: true,
      transaction: true,
      compute: true
    });
  });

const storageMap = {
  routerStore: RouterStore,
};

export default function createStore() {
  const keys = Object.keys(storageMap);
  let store: IAnyObject;

  store = {};

  keys.forEach(key => {
    store[key] = new storageMap[key]();
  });

  return store;
}
