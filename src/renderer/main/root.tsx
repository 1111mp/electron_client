import { HashRouter } from 'react-router-dom';
import { AppStoresProvider } from './stores';
import { RouterComponent } from './routes';
import { AliveScope } from 'react-activation';
import { I18n } from 'Renderer/utils/i18n';

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
    <AppStoresProvider
      theme={theme}
      localeForAntd={localeForAntd}
      stores={stores}
    >
      <I18n messages={window.Context.localeMessages}>
        <HashRouter>
          <AliveScope>
            <RouterComponent />
          </AliveScope>
        </HashRouter>
      </I18n>
    </AppStoresProvider>
  );
};

export default Root;
