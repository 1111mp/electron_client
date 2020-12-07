import { resolve } from 'path';
import { userInfo } from 'os';
import { app } from 'electron';
import { Sequelize } from 'sequelize';
import UserDefiner from './models/user';

export default {
  close,
  getInstance,

  initialize,
};

let sqlInstance: Sequelize | null = null;

export async function initialize() {
  if (sqlInstance) throw new Error('Cannot initialize more than once!');

  const userDataPath = app.getPath('userData');

  try {
    sqlInstance = new Sequelize('database', '', userInfo().username, {
      dialect: 'sqlite',
      dialectModule: require('@journeyapps/sqlcipher'),
      storage: resolve(userDataPath, 'db/db.sqlite'),
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    });
  } catch (error) {
    console.log(error);
    return false;
  }

  UserDefiner(sqlInstance);

  // sequelizeInstance.sync({ alter: true });
  // sequelizeInstance.sync({ force: true });
  return true;
}

async function close() {
  if (!sqlInstance) return;

  const dbRef = sqlInstance;
  sqlInstance = null;
  await dbRef.close();
}

function getInstance(): Sequelize {
  if (!sqlInstance) throw new Error('getInstance: globalInstance not set!');

  return sqlInstance;
}
