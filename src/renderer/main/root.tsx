import { HashRouter } from 'react-router-dom';
import { AliveScope } from 'react-activation';
import { RouterComponent } from './routes';
import { RootStore, StoreContext } from './stores';
import { I18n } from 'Renderer/utils/i18n';

type Props = {
  stores: RootStore;
  statusCode: number;
};

const Root: React.ComponentType<Props> = ({ stores, statusCode }) => {
  console.log(statusCode);

  return (
    <StoreContext.Provider value={stores}>
      <I18n messages={window.Context.localeMessages}>
        <HashRouter>
          <AliveScope>
            <RouterComponent />
          </AliveScope>
        </HashRouter>
      </I18n>
    </StoreContext.Provider>
  );
};

export default Root;
