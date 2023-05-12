import { join } from 'path';
import { createReadStream, copySync, removeSync } from 'fs-extra';
import http from 'http';
import FormData from 'form-data';
import ProgressBar from 'progress';
import AdmZip from 'adm-zip';
import webpackPaths from '../configs/webpack.paths';
import { version } from '../../release/app/package.json';
import { build } from '../../package.json';

const host = '127.0.0.1',
  port = 3000;

const { PUBLISH_TYPE } = process.env;
if (!PUBLISH_TYPE) {
  console.log();
  process.exit(0);
}

const { productName } = build;
const { platform, archs } = process.env;
const isDarwin = platform === 'darwin';

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
    // MacOS does not distinguish between x64 and arm64
    // packages for both architectures are packaged under the same file.
    form.append('archs', isDarwin ? 'mac' : archs === 'x64' ? archs : 'x32');
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
      host,
      port,
      method: 'POST',
      path: '/api/v1/electron/full',
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
    const form = new FormData({ maxDataSize: 200 * 1024 * 1024 });

    form.append('platform', isDarwin ? 'macos' : 'windows');
    form.append('version', version);

    // mac => x64 | mac-arm64 => arm64
    if (platform === 'win32') {
      const curArchs = archs === 'x64' ? 'x64' : 'x32';
      const resourcesPath = join(
        webpackPaths.buildPath,
        'win-unpacked/resources'
      );
      const zip = new AdmZip();
      // zip app.asar
      const asar = join(resourcesPath, 'app.asar');
      const update = join(webpackPaths.buildPath, `update.asar`);
      copySync(asar, update);
      zip.addLocalFile(update);
      const updateZip = join(webpackPaths.buildPath, `${curArchs}.zip`);
      zip.writeZip(updateZip);
      removeSync(update);

      form.append('app', createReadStream(updateZip));
      console.log(`  ${updateZip}`);
    } else if (platform === 'darwin') {
      console.log('files:');
      ['x64', 'arm64'].map((archs) => {
        const zip = new AdmZip();
        const resourcesPath = join(
          webpackPaths.buildPath,
          archs === 'x64' ? 'mac' : 'mac-arm64',
          `${productName}.app/Contents/Resources`
        );
        // zip app.asar
        const asar = join(resourcesPath, 'app.asar');
        const update = join(webpackPaths.buildPath, `update.asar`);
        copySync(asar, update);
        zip.addLocalFile(update);
        const updateZip = join(webpackPaths.buildPath, `${archs}.zip`);
        zip.writeZip(updateZip);
        removeSync(update);

        form.append('app', createReadStream(updateZip));
        console.log(`  ${updateZip}`);
      });
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
      host,
      port,
      method: 'POST',
      path: '/api/v1/electron/asar',
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
  }
})();
