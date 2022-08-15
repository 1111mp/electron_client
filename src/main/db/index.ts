import { resolve as pathResolve } from 'path';
import { userInfo } from 'os';
import { app } from 'electron';
import { Sequelize } from 'sequelize';
import { UserCreationAttributes, UserFactory } from './models/user.model';
import Logging from '../logging';

import { DB, SqlType } from './types';

const user_id_key = 1;

declare global {
  interface Function {
    needsSerial?: boolean;
  }
}

let db: DB | null = null;
const { getLogger } = Logging();

// let sequelize: Sequelize | null = null;

export function initialize(): Promise<'successed' | 'failed'> {
  if (db) throw new Error('Cannot initialize more than once!');

  return new Promise((resolve) => {
    const userDataPath = app.getPath('userData');
    getLogger().info(`db path: ${pathResolve(userDataPath, 'db/sqlite.db')}`);
    try {
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        dialectModulePath: '@journeyapps/sqlcipher',
        storage: pathResolve(userDataPath, 'db/sqlite.db'),
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
        },
        logging:
          process.env.NODE_ENV === 'development' ||
          process.env.DEBUG_PROD === 'true'
            ? console.log
            : false,
        password: userInfo().username,
      });
      sequelize.query('PRAGMA cipher_compatibility = 4');
      sequelize.query(`PRAGMA key = '${userInfo().username}'`);

      const User = UserFactory(sequelize);

      db = {
        sequelize,
        User,
      };

      sequelize
        .authenticate()
        .then(async () => {
          getLogger().info('connected to db');
          await sequelize.sync({ alter: true });
          // await sequelize.sync({ force: true });
          resolve('successed');
        })
        .catch((error) => {
          getLogger().error(`db authenticate error: ${error}`);
          // throw 'error';
          resolve('failed');
        });
    } catch (error) {
      // https://github.com/journeyapps/node-sqlcipher/issues/54
      resolve('failed');
    }
  });
}

async function close() {
  if (!db) return;

  const dbRef = db;
  db = null;
  await dbRef.sequelize.close();
}

function getInstance(): DB {
  if (!db) {
    getLogger().error('getInstance: globalInstance not set!');
    throw new Error('getInstance: globalInstance not set!');
  }

  return db;
}

function upsertUser(data: UserCreationAttributes) {
  const db = getInstance();

  return db.User.upsert({
    ...data,
    id: user_id_key,
    userId: data.id,
  });
}

upsertUser.needsSerial = true;

async function getUserInfo() {
  const db = getInstance();

  return (
    await db.User.findOne({
      attributes: { exclude: ['id'] },
      where: {
        id: user_id_key,
      },
    })
  )?.toJSON() as DB.UserAttributes;
}

export const sql: SqlType = {
  initialize,
  close,

  upsertUser,
  getUserInfo,
};
