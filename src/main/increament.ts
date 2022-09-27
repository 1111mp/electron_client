import { platform, arch } from 'os';
import { join } from 'path';
import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import { app } from 'electron';
import axios from 'axios';
import packageJson from '../../release/app/package.json';
import type { ElectronLog } from 'electron-log';

let logger: ElectronLog;

// const { platform } = process.env;
const isDarwin = platform() === 'darwin';

const archs = arch();
const curArch = archs === 'arm64' ? 'arm64' : archs === 'x64' ? 'x64' : 'x32';

async function getAppInfo() {
  return new Promise((resolve, reject) => {
    axios({
      url: 'http://127.0.0.1:3000/api/electron/appInfoForAsar',
      method: 'GET',
      params: {
        platform: isDarwin ? 'macos' : 'windows',
        version: packageJson.version,
        archs: curArch,
      },
    })
      .then((resp) => {
        const { status, data = {} } = resp;
        if (status !== 200) {
          return reject({
            status: data.status || status,
            message: data.msg || '出错了,请稍后再试！',
            data,
          });
        }
        return resolve(data);
      })
      .catch((error) => reject(error));
  });
}

// {
//   "code": 200,
//   "data": {
//       "createdAt": "2022-09-14 14:33",
//       "updatedAt": "2022-09-14 14:33",
//       "id": 3,
//       "platform": "macos",
//       "version": "1.0.0",
//       "archs": "arm64",
//       "url": "electron/asar/1.0.0/macos/arm64.zip",
//       "forceUpdate": false,
//       "type": "asar",
//       "actived": false,
//       "remark": null,
//       "ext": null
//   }
// }
async function checkForAsarUpdates(log: ElectronLog) {
  logger = log;

  const info = (await getAppInfo()) as any;
  const { data } = info;
  console.log(data);

  // to download file
  axios(`http://127.0.0.1:3000/upload/${data.url}`, {
    responseType: 'arraybuffer', // 特别注意，需要加上此参数
  })
    .then((res) => {
      console.log(res);
      console.log(isDarwin);
      logger.info(app.getAppPath());
      const resourcesPath = app.getAppPath().replace('app.asar', '');
      // const resourcesPath = `${__dirname}/`;
      const updatePath = `${resourcesPath}${curArch}.zip`;
      if (isDarwin) {
        fs.writeFileSync(updatePath, res.data);

        const zip = new AdmZip(updatePath);

        zip.extractAllToAsync(`${resourcesPath}`, true, undefined, (err) => {
          if (err) {
            console.log(err);
            return;
          }
          fs.removeSync(updatePath);

          fs.unlinkSync(app.getAppPath());
          fs.renameSync(`${resourcesPath}update.asar`, `${resourcesPath}app.asar`);

          setTimeout(() => {
            app.relaunch();
            app.exit(0);
          }, 1000);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

export default checkForAsarUpdates;
