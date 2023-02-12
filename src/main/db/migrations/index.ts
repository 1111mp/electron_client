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
    db.exec(`
      CREATE TABLE users(
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
