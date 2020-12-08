import { resolve } from 'path';
import { userInfo } from 'os';
import { app } from 'electron';
import { Sequelize, Op, UpsertOptions } from 'sequelize';
import UserDefiner from './models/user';

declare global {
  interface Function {
    needsSerial?: boolean;
  }
}

export type SqlInterface = {
  close: () => Promise<void>;
  initialize: () => Promise<boolean>;

  upsertUser: (data: UserType) => Promise<boolean>;
};

export type UserType = {
  userId: number;
  [key: string]: unknown;
};

const sql: SqlInterface = {
  close,

  upsertUser,

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

async function upsertUser(data: UserType) {
  const sequelize: Sequelize = getInstance();

  try {
    await sequelize.models.User.upsert({
      ...data,
    });

    return true;
  } catch (error) {
    return false;
  }
}

upsertUser.needsSerial = true;
