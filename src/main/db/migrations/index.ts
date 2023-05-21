import type { Database } from 'better-sqlite3';
import type { LogFunctions } from 'electron-log';
import {
  getSchemaVersion,
  getSQLCipherVersion,
  getSQLiteVersion,
  getUserVersion,
} from '../util';

function updateToSchemaVersion1(
  currentVersion: number,
  db: Database,
  logger: Omit<LogFunctions, 'log'>
) {
  if (currentVersion >= 1) return;

  logger.info('updateToSchemaVersion1: starting...');

  db.transaction(() => {
    // table users
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        userId INTEGER NOT NULL,
        account STRING NOT NULL,
        token STRING,
        avatar STRING DEFAULT NULL,
        email STRING DEFAULT NULL,
        theme STRING DEFAULT NULL,
        regisTime STRING,
        updateTime STRING
      );
    `);

    // table userInfos (to save user info)
    db.exec(`
      CREATE TABLE userInfos (
        id INTEGER PRIMARY KEY,
        account STRING NOT NULL,
        avatar STRING DEFAULT NULL,
        email STRING DEFAULT NULL,
        regisTime STRING,
        updateTime STRING,
      );
    `);

    // table friends
    db.exec(`
      CREATE TABLE friends (
        userId INTEGER,
        friendId INTEGER,
        remark STRING,
        astrolabe BOOLEAN DEFAULT FALSE,
        block BOOLEAN DEFAULT FALSE,
        createdAt STRING,
        updatedAt STRING,
      );
    `);

    // table groups
    db.exec(`
      CREATE TABLE groups (
        id INTEGER PRIMARY KEY ASC,
        name STRING,
        avatar STRING DEFAULT NULL,
        type INTEGER NOT NULL,
        creator INTEGER NOT NULL,
        count INTEGER,
        members TEXT,
        createdAt STRING,
        updatedAt STRING,
      );
    `);

    // table messages
    db.exec(`
      CREATE TABLE messages (
        id BIGINT PRIMARY KEY DESC,
        msgId STRING NOT NULL,
        owner INTEGER NOT NULL,
        type STRING NOT NULL,
        groupId INTEGER DEFAULT NULL,
        sender INTEGER NOT NULL,
        receiver INTEGER NOT NULL,
        content TEXT,
        timer INTEGER NOT NULL,
        ext TEXT,
      );

      CREATE INDEX messages_msgId ON messages (msgId);

      CREATE INDEX messages_owner ON messages (owner);

      CREATE INDEX messages_sender ON messages (sender);

      CREATE INDEX messages_timer ON messages (timer);
    `);

    // table conversations
    db.exec(`
      CREATE TABLE conversations (
        id STRING PRIMARY KEY ASC,
        owner INTEGER NOT NULL,
        groupId INTEGER DEFAULT NULL,
        sender INTEGER NOT NULL,
        receiver INTEGER NOT NULL,
        lastReadAck BIGINT DEFAULT -1,
      );

      CREATE INDEX conversations_owner ON conversations (owner);
      
      CREATE INDEX conversations_sender ON conversations (sender);

      CREATE INDEX conversations_receiver ON conversations (receiver);
    `);

    db.pragma('user_version = 1');
  })();

  logger.info('updateToSchemaVersion1: success!');
}

function updateToSchemaVersion2(
  currentVersion: number,
  db: Database,
  logger: Omit<LogFunctions, 'log'>
) {
  if (currentVersion >= 2) return;

  logger.info('updateToSchemaVersion1: starting...');

  db.transaction(() => {
    db.exec(`
      CREATE TABLE group(
        id INTEGER PRIMARY KEY,
        userId INTEGER NOT NULL,
        account STRING NOT NULL,
        token STRING,
        avatar STRING DEFAULT NULL,
        email STRING DEFAULT NULL,
        theme STRING,
        regisTime STRING,
        updateTime STRING
      );
    `);

    db.pragma('user_version = 2');
  })();

  logger.info('updateToSchemaVersion2: success!');
}

export const SCHEMA_VERSIONS = [updateToSchemaVersion1];

export function updateSchema(
  db: Database,
  logger: Omit<LogFunctions, 'log'>
): void {
  const sqliteVersion = getSQLiteVersion(db);
  const sqlcipherVersion = getSQLCipherVersion(db);
  const userVersion = getUserVersion(db);
  const maxUserVersion = SCHEMA_VERSIONS.length;
  const schemaVersion = getSchemaVersion(db);

  logger.info(
    'updateSchema:\n',
    ` Current user_version: ${userVersion};\n`,
    ` Most recent db schema: ${maxUserVersion};\n`,
    ` SQLite version: ${sqliteVersion};\n`,
    ` SQLCipher version: ${sqlcipherVersion};\n`,
    ` (deprecated) schema_version: ${schemaVersion};\n`
  );

  if (userVersion > maxUserVersion) {
    throw new Error(
      `SQL: User version is ${userVersion} but the expected maximum version ` +
        `is ${maxUserVersion}. Did you try to start an old version of App?`
    );
  }

  for (let index = 0; index < maxUserVersion; index += 1) {
    const runSchemaUpdate = SCHEMA_VERSIONS[index];

    runSchemaUpdate(userVersion, db, logger);
  }
}
