import { RouterProvider } from 'react-router-dom';
import { AppStoresProvider } from './stores';
import { I18nAndTheme } from 'Renderer/utils/i18n';
import { router } from './routes';

import type { RootStore } from './stores';
import type { Theme } from 'App/types';
import type { ConfigProviderProps } from 'antd/es/config-provider';

type Props = {
  theme: Theme;
  localeForAntd: ConfigProviderProps['locale'];
  stores: RootStore;
};

const Root: React.FC<Props> = ({ theme, localeForAntd, stores }) => {
  return (
    <AppStoresProvider stores={stores}>
      <I18nAndTheme
        theme={theme}
        localeForAntd={localeForAntd}
        messages={window.Context.localeMessages}
      >
        <RouterProvider router={router} />
      </I18nAndTheme>
    </AppStoresProvider>
  );
};

export default Root;
