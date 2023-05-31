import { createContext, useContext } from 'react';
import { configure } from 'mobx';
import Config from 'Renderer/config';
import ClientStore from './client';
import UserStore from './user';
import Friends from './friends';

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
  friendsStore: Friends;
};

export function createStore(): RootStore {
  return {
    clientStore: new ClientStore(),
    userStore: new UserStore(),
    friendsStore: new Friends(),
  };
}

export const AppStoreContext = createContext<RootStore | null>(null);

export const AppStoresProvider: React.FC<{
  stores: RootStore;
  children: React.ReactNode;
}> = ({ stores, children }) => {
  return (
    <AppStoreContext.Provider value={stores}>
      {children}
    </AppStoreContext.Provider>
  );
};

export const useStores = () => {
  const stores = useContext(AppStoreContext);
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
