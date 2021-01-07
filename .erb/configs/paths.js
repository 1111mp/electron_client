import fs from 'fs';
import path from 'path';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export default {
  alias: {
    app: resolveApp('src/'),
    appMain: resolveApp('src/appMain'),
    appWin: resolveApp('src/appWin'),
    appLogin: resolveApp('src/appLogin'),
    requests: resolveApp('src/requests'),
    components: resolveApp('src/components'),
    containers: resolveApp('src/containers'),
    stores: resolveApp('src/stores'),
    routes: resolveApp('src/routes'),
    utils: resolveApp('src/utils'),
    config: resolveApp('src/config'),
    constants: resolveApp('src/constants'),
    'renderer-process': resolveApp('src/renderer-process'),
    'main-process': resolveApp('src/main-process'),
  },
  extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  modules: [path.join(__dirname, '../src'), 'node_modules'],
};
