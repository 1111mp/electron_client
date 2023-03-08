import { createContext, useContext, useReducer, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { Theme } from 'App/types';

import type { ConfigProviderProps } from 'antd/es/config-provider';

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

export const ContextForAntdProvider: React.FC<{
  theme: Theme;
  localeForAntd: ConfigProviderProps['locale'];
  children: React.ReactNode;
}> = ({ theme, localeForAntd, children }) => {
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

  return (
    <ConfigProvider
      theme={{
        algorithm:
          state.theme === Theme.light
            ? antdTheme.defaultAlgorithm
            : antdTheme.darkAlgorithm,
        token: {
          colorPrimary: '#58acec',
        },
      }}
      locale={localeForAntd}
    >
      {children}
    </ConfigProvider>
  );
};
