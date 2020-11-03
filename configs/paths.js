'use strict';

const fs = require('fs');
const path = require('path');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = {
  alias: {
    app: resolveApp('app/'),
    appMain: resolveApp('app/appMain'),
    appWin: resolveApp('app/appWin'),
    appLogin: resolveApp('app/appLogin'),
    requests: resolveApp('app/requests'),
    components: resolveApp('app/components'),
    containers: resolveApp('app/containers'),
    stores: resolveApp('app/stores'),
    routes: resolveApp('app/routes'),
    utils: resolveApp('app/utils'),
    config: resolveApp('app/config'),
    constants: resolveApp('app/constants'),
    'renderer-process': resolveApp('app/renderer-process'),
    'main-process': resolveApp('app/main-process'),
  },
  extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  modules: [path.join(__dirname, '..', 'app'), 'node_modules'],
};
