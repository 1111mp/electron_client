import React from 'react';
import Login from './login';
import { I18n } from 'app/utils/i18n';

const { localeMessages } = window;

const App: React.ComponentType = () => {
  return (
    <I18n messages={localeMessages}>
      <Login />
    </I18n>
  );
};

export default App;
