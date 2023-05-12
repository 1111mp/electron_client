import { HashRouter } from 'react-router-dom';
import { RouterComponent } from './routes';
import { I18nAndTheme } from 'Renderer/utils/i18n';
import { ConfigProviderProps } from 'antd/es/config-provider';

import type { Theme } from 'App/types';

type Props = {
  theme: Theme;
  localeForAntd: ConfigProviderProps['locale'];
};

const Root: React.ComponentType<Props> = ({ theme, localeForAntd }) => {
  return (
    <I18nAndTheme
      theme={theme}
      localeForAntd={localeForAntd}
      messages={window.Context.localeMessages}
    >
      <HashRouter>
        <RouterComponent />
      </HashRouter>
    </I18nAndTheme>
  );
};

export default Root;
