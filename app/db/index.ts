import { resolve } from 'path';
import { userInfo } from 'os';
import { app } from 'electron';
import { Sequelize } from 'sequelize';
import UserDefiner from './models/user';

import { SqlInterface, UserType } from './interface';

declare global {
  interface Function {
    needsSerial?: boolean;
  }
}

const sql: SqlInterface = {
  close,

  upsertUser,
  getUserInfo,

  initialize,
};

export default sql;

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

  // sqlInstance.sync({ alter: true });
  // sqlInstance.sync({ force: true });
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

async function upsertUser(data: UserType) {
  const sequelize: Sequelize = getInstance();

  try {
    await sequelize.models.User.upsert({
      id: 1,
      ...data,
    });

    return true;
  } catch (error) {
    return false;
  }
}

upsertUser.needsSerial = true;

async function getUserInfo() {
  const sequelize: Sequelize = getInstance();

  try {
    const result = await sequelize.models.User.findOne({
      attributes: { exclude: ['id'] },
    });

    return result?.toJSON();
  } catch (error) {
    return undefined;
  }
}
