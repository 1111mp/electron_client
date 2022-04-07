import { join } from 'path';
import { createReadStream } from 'fs';
import http from 'http';
import FormData from 'form-data';
import ProgressBar from 'progress';
import webpackPaths from '../configs/webpack.paths';
import { version } from '../../release/app/package.json';
import { build } from '../../package.json';

const { PUBLISH_TYPE } = process.env;
if (!PUBLISH_TYPE) {
  console.log();
  process.exit(0);
}

const { productName } = build;
const { platform, archs } = process.env;
const isDarwin = platform === 'darwin';

console.log(platform);
console.log(archs);
console.log('--------- Start to publish --------');

function getFormLength(form: FormData): Promise<number> {
  return new Promise((resolve) => {
    form.getLength(function (_err, size) {
      resolve(size);
    });
  });
}

(async () => {
  if (PUBLISH_TYPE === 'full') {
    // Full publish
    const form = new FormData({ maxDataSize: 200 * 1024 * 1024 });

    form.append('platform', isDarwin ? 'macos' : 'windows');
    if (platform === 'win32') {
      form.append('archs', archs === 'x64' ? archs : 'x32');
    }
    form.append('version', version);
    console.log('files:');
    const ymlPath = join(
      webpackPaths.buildPath,
      isDarwin ? 'latest-mac.yml' : 'latest.yml'
    );
    form.append('yml', createReadStream(ymlPath));
    console.log(`  ${ymlPath}`);

    if (platform === 'darwin') {
      // MacOS
      ['x64', 'arm64'].forEach((arch) => {
        form.append(
          'app',
          createReadStream(
            join(
              webpackPaths.buildPath,
              `${productName}_Setup_${arch}_${version}.dmg`
            )
          )
        );
        form.append(
          'app',
          createReadStream(
            join(
              webpackPaths.buildPath,
              `${productName}_Setup_${arch}_${version}.zip`
            )
          )
        );
      });
    } else if (platform === 'win32') {
      // Windows
      const appPath = join(
        webpackPaths.buildPath,
        `${productName}_Setup_${archs}_${version}.exe`
      );
      form.append('app', createReadStream(appPath));
      console.log(`  ${appPath}`);
    }

    const uploadSize = await getFormLength(form);

    const progressBar = new ProgressBar(
      'uploading [:bar] :rate/bps :percent :etas :elapseds',
      {
        complete: '=',
        incomplete: ' ',
        width: 40,
        total: uploadSize,
      }
    );

    form.on('data', function (data) {
      progressBar.tick(data.length, undefined);
    });

    const req = http.request({
      host: '192.168.0.3',
      port: 3000,
      method: 'POST',
      path: '/api/electron/update',
      headers: form.getHeaders(),
    });

    form.pipe(req);

    req.on('response', function (res) {
      res.on('data', (chunk) => {
        const { code, msg } = JSON.parse(`${chunk}`);
        if (code === 200) {
          console.log(msg);
        } else {
          console.log(`Publish failed: ${msg}`);
        }
      });

      res.on('end', () => {
        console.log('---------- Publish end ----------');
      });
    });
  } else if (PUBLISH_TYPE === 'asar') {
    // Incremental publish
  }
})();
