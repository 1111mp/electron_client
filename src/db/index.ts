import { resolve } from 'path';
import { userInfo } from 'os';
import { app } from 'electron';
import { Sequelize } from 'sequelize';
import {
  UserAttributes,
  UserCreationAttributes,
  UserFactory,
} from './models/user.model';

import { DB, SqlType } from './types';

const user_id_key = 1;

declare global {
  interface Function {
    needsSerial?: boolean;
  }
}

let db: DB | null = null;

// let sequelize: Sequelize | null = null;

export async function initialize() {
  if (db) throw new Error('Cannot initialize more than once!');

  const userDataPath = app.getPath('userData');

  try {
    const sequelize = new Sequelize('database', '', userInfo().username, {
      dialect: 'sqlite',
      dialectModule: require('@journeyapps/sqlcipher'),
      storage: resolve(userDataPath, 'db/db.sqlite'),
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    });

    const User = UserFactory(sequelize);

    db = {
      sequelize,
      User,
    };

    sequelize
      .authenticate()
      .then(() => {
        console.info('connected to db');
        sequelize.sync({ alter: true });
        // db.sequelize.sync({ force: true });
      })
      .catch((error) => {
        console.error(error);
        throw 'error';
      });

    return 'successed';
  } catch (error) {
    // https://github.com/journeyapps/node-sqlcipher/issues/54
    return 'failed';
  }
}

async function close() {
  if (!db) return;

  const dbRef = db;
  db = null;
  await dbRef.sequelize.close();
}

function getInstance(): DB {
  if (!db) throw new Error('getInstance: globalInstance not set!');

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
  )?.toJSON() as UserAttributes;
}

export const sql: SqlType = {
  initialize,
  close,

  upsertUser,
  getUserInfo,
};
