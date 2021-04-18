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

export type TStore = {
  routerStore: RouterStore;
  clientStore: ClientStore;
};

export type MStore = {
  userStore: UserStore;
};

export type RootStore = TStore & MStore;

export function createStore(): RootStore {
  const stores: TStore = {
    routerStore: new RouterStore(),
    clientStore: new ClientStore(),
  };

  try {
    manager.stores = {
      userStore: new UserStore('user'),
      // Setting: new SettingStore('Setting'),
    };
  } catch (e) {
    console.log(e);
  }

  manager.init();

  return {
    ...stores,
    ...(manager.stores as MStore),
  };
}

// const stores = createStore();

export const StoreContext = createContext<RootStore | null>(null);

export const useStores = () => {
  const stores = useContext(StoreContext);
  if (!stores) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('You have forgot to use StoreProvider, shame on you.');
  }
  return stores;
};

export function useTargetStore<K extends keyof RootStore>(
  target: K
): RootStore[K] {
  const stores = useStores();

  return stores[target];
}

// export default stores;
