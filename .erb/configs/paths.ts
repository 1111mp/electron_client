import fs from 'fs';
import path from 'path';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export default {
  App: resolveApp('src/'),
  Main: resolveApp('src/main'),
  Renderer: resolveApp('src/renderer'),
  Components: resolveApp('src/renderer/components'),
};
