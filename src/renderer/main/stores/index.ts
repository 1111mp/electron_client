import { createContext, useContext } from 'react';
import { configure } from 'mobx';
import Config from 'Renderer/config';
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

configure({
  enforceActions: 'never',
});

export type RootStore = {
  clientStore: ClientStore;
  userStore: UserStore;
};

export function createStore(): RootStore {
  return {
    clientStore: new ClientStore(),
    userStore: new UserStore(),
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
