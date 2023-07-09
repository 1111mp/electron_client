import path from 'path';
import fs from 'fs-extra';
import { rimrafSync } from 'rimraf';
import webpackPaths from '../configs/webpack.paths';

export default function deleteSourceMaps() {
  if (fs.existsSync(webpackPaths.distMainPath))
    rimrafSync(path.join(webpackPaths.distMainPath, '*.js.map'));
  if (fs.existsSync(webpackPaths.distRendererPath))
    rimrafSync(path.join(webpackPaths.distRendererPath, '*.js.map'));
}
