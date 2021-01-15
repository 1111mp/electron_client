import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
// import { remove } from 'lodash';
import { dependencies } from '../../src/package.json';

const nodeModulesPath = path.join(__dirname, '../../src/node_modules');

// https://github.com/journeyapps/node-sqlcipher/issues/65
// const modules = remove(
//   Object.keys(dependencies || {}),
//   (module) => module !== '@journeyapps/sqlcipher'
// );

if (
  Object.keys(dependencies || {}).length > 0 &&
  fs.existsSync(nodeModulesPath)
) {
  // const electronRebuildCmd = `../node_modules/.bin/electron-rebuild --parallel --force --only ${modules.join(
  //   ','
  // )} --module-dir .`;
  const electronRebuildCmd =
    '../node_modules/.bin/electron-rebuild --parallel --force --types prod,dev,optional --module-dir .';

  const cmd =
    process.platform === 'win32'
      ? electronRebuildCmd.replace(/\//g, '\\')
      : electronRebuildCmd;
  execSync(cmd, {
    cwd: path.join(__dirname, '../../src'),
    stdio: 'inherit',
  });
}
