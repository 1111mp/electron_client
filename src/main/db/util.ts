import type { Database } from 'better-sqlite3';
import { isNumber } from 'lodash';

// This value needs to be below SQLITE_MAX_VARIABLE_NUMBER.
const MAX_VARIABLE_COUNT = 100;

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

//
// Various table helpers
//

export function batchMultiVarQuery<ValueT>(
  db: Database,
  values: ReadonlyArray<ValueT>,
  query: (batch: ReadonlyArray<ValueT>) => void
): [];
export function batchMultiVarQuery<ValueT, ResultT>(
  db: Database,
  values: ReadonlyArray<ValueT>,
  query: (batch: ReadonlyArray<ValueT>) => Array<ResultT>
): Array<ResultT>;

export function batchMultiVarQuery<ValueT, ResultT>(
  db: Database,
  values: ReadonlyArray<ValueT>,
  query:
    | ((batch: ReadonlyArray<ValueT>) => void)
    | ((batch: ReadonlyArray<ValueT>) => Array<ResultT>)
): Array<ResultT> {
  if (values.length > MAX_VARIABLE_COUNT) {
    const result: Array<ResultT> = [];
    db.transaction(() => {
      for (let i = 0; i < values.length; i += MAX_VARIABLE_COUNT) {
        const batch = values.slice(i, i + MAX_VARIABLE_COUNT);
        const batchResult = query(batch);
        if (Array.isArray(batchResult)) {
          result.push(...batchResult);
        }
      }
    })();
    return result;
  }

  const result = query(values);
  return Array.isArray(result) ? result : [];
}
