import { createContext, useContext } from 'react';
import { RouterStore } from '@superwf/mobx-react-router';
import { configure } from 'mobx';
import Config from 'app/config';
import manager from './StoreManager';
import ClientStore from './client';
import UserStore from './user';
// import SettingStore from './setting';

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

configure({
  enforceActions: 'never',
});

const storageMap: any = {
  routerStore: RouterStore,
  clientStore: ClientStore,
};

function createStore() {
  const keys = Object.keys(storageMap);
  let store: IAnyObject;

  store = {};

  keys.forEach((key) => {
    store[key] = new storageMap[key]();
  });

  try {
    manager.stores = {
      user: new UserStore('user'),
      // Setting: new SettingStore('Setting'),
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

const stores = createStore();

export const StoreContext = createContext(stores);

export const useStores = () => useContext(StoreContext);

export function useTargetStore(target: string) {
  const stores = useStores();

  return target ? stores[target] : stores;
}

export default stores;
