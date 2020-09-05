import { RouterStore } from 'mobx-react-router';
import Config from 'app/config';
import manager from './StoreManager';
import ClientStore from './client';
import UserStore from './user';

Config.isDev &&
  import('mobx-logger').then((logger) => {
    logger.enableLogging({
      predicate: () => true,
      action: true,
      reaction: true,
      transaction: true,
      compute: true,
    });
  });

const storageMap: any = {
  routerStore: RouterStore,
  clientStore: ClientStore,
};

export default async function createStore() {
  const keys = Object.keys(storageMap);
  let store: IAnyObject;

  store = {};

  keys.forEach((key) => {
    store[key] = new storageMap[key]();
  });

  // return store;

  try {
    manager.stores = {
      user: new UserStore('user'),
    };
  } catch (e) {
    console.log(e);
  }

  manager.init();

  return {
    ...store,
    ...manager.stores,
  };
}
