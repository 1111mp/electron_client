import { HashRouter } from 'react-router-dom';
import { AppStoresProvider } from './stores';
import { RouterComponent } from './routes';
import { I18nAndTheme } from 'Renderer/utils/i18n';

import type { RootStore } from './stores';
import type { Theme } from 'App/types';
import type { ConfigProviderProps } from 'antd/es/config-provider';

type Props = {
  theme: Theme;
  localeForAntd: ConfigProviderProps['locale'];
  stores: RootStore;
  statusCode: number;
};

const Root: React.ComponentType<Props> = ({
  theme,
  localeForAntd,
  stores,
  statusCode,
}) => {
  console.log(statusCode);

  return (
    <AppStoresProvider stores={stores}>
      <I18nAndTheme
        theme={theme}
        localeForAntd={localeForAntd}
        messages={window.Context.localeMessages}
      >
        <HashRouter>
          <RouterComponent />
        </HashRouter>
      </I18nAndTheme>
    </AppStoresProvider>
  );
};

export default Root;
