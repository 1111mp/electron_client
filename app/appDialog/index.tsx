import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import Dialog from 'components/dialog';
import 'app/app.global.css';
import './styles.scss';

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

const App = () => {
  return <Dialog />;
};

const Root = hot(App);

render(
  <AppContainer>
    <Root />
  </AppContainer>,
  document.getElementById('root')
);
