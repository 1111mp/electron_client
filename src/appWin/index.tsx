import React from 'react';
import { render } from 'react-dom';
import Root from './root';

import 'app/app.global.css';
import 'app/app.global.scss';

(() => {
  render(<Root />, document.getElementById('root'));
})();
