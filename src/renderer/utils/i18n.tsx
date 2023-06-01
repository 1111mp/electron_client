import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { Theme } from 'App/types';

import type { ConfigProviderProps } from 'antd/es/config-provider';

export type I18nFn = (
  key: string,
  substitutions?: Array<string | number> | ReplacementValuesType
) => string;

export type ReplacementValuesType = {
  [key: string]: string | number;
};

const I18nContext = createContext<I18nFn>(() => 'NO LOCALE LOADED');

export type I18nProps = {
  messages: { [key: string]: { message: string } };
  theme: Theme;
  localeForAntd: ConfigProviderProps['locale'];
  children: React.ReactNode;
};

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

export const I18nAndTheme: React.ComponentType<I18nProps> = ({
  theme,
  messages,
  localeForAntd,
  children,
}): JSX.Element => {
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

  const getMessage = useCallback<I18nFn>(
    (key, substitutions) => {
      if (Array.isArray(substitutions) && substitutions.length > 1) {
        throw new Error(
          'Array syntax is not supported with more than one placeholder'
        );
      }

      const { message } = messages[key];
      if (!substitutions) {
        return message;
      }

      if (Array.isArray(substitutions)) {
        return substitutions.reduce(
          (result, substitution) =>
            result.toString().replace(/\$.+?\$/, substitution.toString()),
          message
        ) as string;
      }

      const FIND_REPLACEMENTS = /\$([^$]+)\$/g;

      let match = FIND_REPLACEMENTS.exec(message);
      let builder = '';
      let lastTextIndex = 0;

      while (match) {
        if (lastTextIndex < match.index) {
          builder += message.slice(lastTextIndex, match.index);
        }

        const placeholderName = match[1];
        const value = substitutions[placeholderName];
        if (!value) {
          // eslint-disable-next-line no-console
          console.error(
            `i18n: Value not provided for placeholder ${placeholderName} in key '${key}'`
          );
        }
        builder += value || '';

        lastTextIndex = FIND_REPLACEMENTS.lastIndex;
        match = FIND_REPLACEMENTS.exec(message);
      }

      if (lastTextIndex < message.length) {
        builder += message.slice(lastTextIndex);
      }

      return builder;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={getMessage}>
      <ConfigProvider
        theme={{
          algorithm:
            state.theme === Theme.light
              ? antdTheme.defaultAlgorithm
              : antdTheme.darkAlgorithm,
          token: {
            colorPrimary: '#58acec',
            colorLink: '#58acec',
            colorLinkActive: '#10ACED',
          },
        }}
        locale={localeForAntd}
      >
        {children}
      </ConfigProvider>
    </I18nContext.Provider>
  );
};

export const I18n: React.ComponentType<
  Pick<I18nProps, 'messages' | 'children'>
> = ({ messages, children }): JSX.Element => {
  const getMessage = useCallback<I18nFn>(
    (key, substitutions) => {
      if (Array.isArray(substitutions) && substitutions.length > 1) {
        throw new Error(
          'Array syntax is not supported with more than one placeholder'
        );
      }

      const { message } = messages[key];
      if (!substitutions) {
        return message;
      }

      if (Array.isArray(substitutions)) {
        return substitutions.reduce(
          (result, substitution) =>
            result.toString().replace(/\$.+?\$/, substitution.toString()),
          message
        ) as string;
      }

      const FIND_REPLACEMENTS = /\$([^$]+)\$/g;

      let match = FIND_REPLACEMENTS.exec(message);
      let builder = '';
      let lastTextIndex = 0;

      while (match) {
        if (lastTextIndex < match.index) {
          builder += message.slice(lastTextIndex, match.index);
        }

        const placeholderName = match[1];
        const value = substitutions[placeholderName];
        if (!value) {
          // eslint-disable-next-line no-console
          console.error(
            `i18n: Value not provided for placeholder ${placeholderName} in key '${key}'`
          );
        }
        builder += value || '';

        lastTextIndex = FIND_REPLACEMENTS.lastIndex;
        match = FIND_REPLACEMENTS.exec(message);
      }

      if (lastTextIndex < message.length) {
        builder += message.slice(lastTextIndex);
      }

      return builder;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={getMessage}>{children}</I18nContext.Provider>
  );
};

export const useI18n = (): I18nFn => useContext(I18nContext);
