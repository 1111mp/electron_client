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
    components: resolveApp('app/components'),
    containers: resolveApp('app/containers'),
    pages: resolveApp('app/pages'),
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
