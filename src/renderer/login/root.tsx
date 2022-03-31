import Login from './login';
import { I18n } from 'Renderer/utils/i18n';

const { localeMessages } = window.Context;

const Root: React.ComponentType = () => {
  return (
    <I18n messages={localeMessages}>
      <Login />
    </I18n>
  );
};

export default Root;
