import type { Database } from 'better-sqlite3';
import { isNumber } from 'lodash';

export function objectToJSON<T>(data: T): string {
  return JSON.stringify(data);
}

export function jsonToObject<T>(json: string): T {
  return JSON.parse(json);
}

export function getSQLiteVersion(db: Database): string {
  const { sqlite_version: version } = db
    .prepare('select sqlite_version() AS sqlite_version')
    .get() as { sqlite_version: string };

  return version;
}

export function getSchemaVersion(db: Database): number {
  return db.pragma('schema_version', { simple: true }) as number;
}

export function setUserVersion(db: Database, version: number): void {
  if (!isNumber(version)) {
    throw new Error(`setUserVersion: version ${version} is not a number`);
  }
  db.pragma(`user_version = ${version}`);
}

export function getUserVersion(db: Database): number {
  return db.pragma('user_version', { simple: true }) as number;
}

export function getSQLCipherVersion(db: Database) {
  return db.pragma('cipher_version', { simple: true });
}
