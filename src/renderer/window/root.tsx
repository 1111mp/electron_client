import { HashRouter } from 'react-router-dom';
import { RouterComponent } from './routes';
import { I18n } from 'Renderer/utils/i18n';

type Props = {
  statusCode: number;
};

const Root: React.ComponentType<Props> = ({ statusCode }) => {
  console.log(statusCode);

  return (
    <I18n messages={window.Context.localeMessages}>
      <HashRouter>
        <RouterComponent />
      </HashRouter>
    </I18n>
  );
};

export default Root;
