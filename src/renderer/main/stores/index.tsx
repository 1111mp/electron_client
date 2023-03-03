import { createContext, useContext, useEffect, useReducer } from 'react';
import { configure } from 'mobx';
import { ConfigProvider, theme as antdTheme } from 'antd';
import Config from 'Renderer/config';
import ClientStore from './client';
import UserStore from './user';
import { Theme } from 'App/types';

import type { ConfigProviderProps } from 'antd/es/config-provider';

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

export const AppStoreContext = createContext<RootStore | null>(null);

type StateType = {
  theme: Theme;
};

enum ActionType {
  ThemeChanged = 'THEME_CHANGED',
}

type StateAction = {
  type: ActionType;
  payload: StateType;
};

export const AppStoresProvider: React.FC<{
  theme: Theme;
  localeForAntd: ConfigProviderProps['locale'];
  stores: RootStore;
  children: React.ReactNode;
}> = ({ theme, localeForAntd, stores, children }) => {
  const [state, dispatch] = useReducer(
    (state: StateType, action: StateAction) => {
      switch (action.type) {
        case ActionType.ThemeChanged:
          return { ...state, ...action.payload };
        default:
          return state;
      }
    },
    {
      theme,
    }
  );

  useEffect(() => {
    window.ThemeContext.nativeThemeListener.subscribe((changed) => {
      dispatch({
        type: ActionType.ThemeChanged,
        payload: { theme: changed },
      });
    });
  }, []);

  console.log(localeForAntd);

  return (
    <AppStoreContext.Provider value={stores}>
      <ConfigProvider
        theme={{
          algorithm:
            state.theme === Theme.light
              ? antdTheme.defaultAlgorithm
              : antdTheme.darkAlgorithm,
        }}
        locale={localeForAntd}
      >
        {children}
      </ConfigProvider>
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
