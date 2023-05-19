import { join } from 'path';
import { ensureDirSync, removeSync } from 'fs-extra';
import SQL from 'better-sqlite3-multiple-ciphers';
import { isString } from 'lodash';
import { updateSchema } from './migrations';
import { consoleLogger } from '../utils/consoleLogger';
import { getSchemaVersion, getUserVersion, setUserVersion } from './util';

import type { Database, Statement } from 'better-sqlite3';
import type { LogFunctions } from 'electron-log';
import type { ServerInterface } from './types';
import type { Theme } from 'App/types';

const user_id_key = 1;

const dataInterface: ServerInterface = {
  close,
  removeDB,

  //user
  updateOrCreateUser,
  getUserInfo,
  setUserTheme,

  // Server-only

  initialize,
};

export default dataInterface;

type DatabaseQueryCache = Map<string, Statement<Array<unknown>>>;

const statementCache = new WeakMap<Database, DatabaseQueryCache>();

function prepare<T extends unknown[] | {}>(
  db: Database,
  query: string
): Statement<T> {
  let dbCache = statementCache.get(db);
  if (!dbCache) {
    dbCache = new Map();
    statementCache.set(db, dbCache);
  }

  let result = dbCache.get(query) as Statement<T>;
  if (!result) {
    result = db.prepare<T>(query);
    dbCache.set(query, result);
  }

  return result;
}

function keyDatabase(db: Database, key: string): void {
  // https://github.com/m4heshd/better-sqlite3-multiple-ciphers/issues/14
  db.pragma(`cipher='sqlcipher'`);
  db.pragma(`legacy=4`);
  // https://www.zetetic.net/sqlcipher/sqlcipher-api/#key
  db.pragma(`key = '${key}'`);
}

function switchToWAL(db: Database): void {
  // https://sqlite.org/wal.html
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('fullfsync = ON');
}

function migrateSchemaVersion(db: Database) {
  const userVersion = getUserVersion(db);

  if (userVersion > 0) return;

  const schemaVersion = getSchemaVersion(db);
  const newUserVersion = schemaVersion;
  logger.info(
    'migrateSchemaVersion: Migrating from schema_version ' +
      `${schemaVersion} to user_version ${newUserVersion}`
  );

  setUserVersion(db, newUserVersion);
}

function openAndMigrateDatabase(filePath: string, key: string) {
  let db: Database | undefined;

  try {
    db = new SQL(filePath);
    keyDatabase(db, key);
    switchToWAL(db);
    migrateSchemaVersion(db);

    return db;
  } catch (error) {
    logger.error(error);
    if (db) db.close();

    logger.info('migrateDatabase: Migration without cipher change failed');
    throw new Error('migrateDatabase: Migration without cipher change failed');
  }
}

const INVALID_KEY = /[^0-9A-Za-z]/;
function openAndSetUpSQLCipher(filePath: string, { key }: { key: string }) {
  if (INVALID_KEY.exec(key))
    throw new Error(`setupSQLCipher: key '${key}' is not valid`);

  const db = openAndMigrateDatabase(filePath, key);

  // Because foreign key support is not enabled by default!
  db.pragma('foreign_keys = ON');

  return db;
}

let globalInstance: Database | undefined;
let logger = consoleLogger;
let databaseFilePath: string | undefined;

async function initialize({
  configDir,
  key,
  logger: suppliedLogger,
}: {
  configDir: string;
  key: string;
  logger: Omit<LogFunctions, 'log'>;
}): Promise<void> {
  if (globalInstance) throw new Error('Cannot initialize more than once!');

  if (!isString(configDir))
    throw new Error('initialize: configDir is required!');

  if (!isString(key)) throw new Error('initialize: key is required!');

  logger = suppliedLogger;

  const dbDir = join(configDir, 'db');
  // https://github.com/isaacs/node-mkdirp#methods
  ensureDirSync(dbDir, { mode: 0o777 });

  databaseFilePath = join(dbDir, 'db.sqlite');

  logger.info(databaseFilePath);

  let db: Database | undefined;

  try {
    db = openAndSetUpSQLCipher(databaseFilePath, { key });

    updateSchema(db, logger);

    globalInstance = db;
  } catch (error) {
    logger.error('Database startup error:', error.stack);

    if (db) db.close();

    throw error;
  }
}

async function close(): Promise<void> {
  for (const dbRef of [globalInstance]) {
    // SQLLite documentation suggests that we run `PRAGMA optimize` right
    // before closing the database connection.
    dbRef?.pragma('optimize');

    dbRef?.close();
  }

  globalInstance = undefined;
}

async function removeDB(): Promise<void> {
  if (globalInstance) {
    try {
      globalInstance.close();
    } catch (error) {
      logger.error('removeDB: Failed to close database:', error.stack);
    }
    globalInstance = undefined;
  }

  if (!databaseFilePath)
    throw new Error(
      'removeDB: Cannot erase database without a databaseFilePath!'
    );

  logger.warn('removeDB: Removing all database files');
  removeSync(databaseFilePath);
  removeSync(`${databaseFilePath}-shm`);
  removeSync(`${databaseFilePath}-wal`);
}

function getInstance(): Database {
  if (!globalInstance) {
    throw new Error('getInstance: globalInstance not set!');
  }

  return globalInstance;
}

/********************************* user ************************************/
async function updateOrCreateUser(user: DB.UserAttributes) {
  const db = getInstance();
  const columns = { id: user_id_key, ...user };
  const keys = Object.keys(columns);

  const insertUser = db.prepare(
    `
    INSERT OR REPLACE INTO users (
      ${keys.join(',')}
    ) VALUES (
      ${keys.map((key) => `$${key}`).join(',')}
    );
    `
  );

  return insertUser.run(columns);
}

async function getUserInfo() {
  const db = getInstance();

  const user = prepare(
    db,
    `
      SELECT * FROM users WHERE id = $id;
      `
  ).get({ id: user_id_key });

  return user as DB.UserAttributes;
}

async function setUserTheme(theme: Theme) {
  const db = getInstance();
  const update = db.prepare(`UPDATE users SET theme = $theme WHERE id = $id;`);

  return update.run({ id: user_id_key, theme });
}

// async function setFriends() {}

/**
 * @description: Cache groups info to db.
 * @param groups ModuleIM.Core.Group[]
 * @return Promise<void>
 */
async function setGroups(groups: ModuleIM.Core.Group[]): Promise<void> {
  const db = getInstance();
  const insert = db.prepare(
    `INSERT OR REPLACE INTO groups (
      id, name, avatar, type, creator, createdAt, updatedAt
    ) VALUES (
      $id, $name, $avatar, $type, $creator, $createdAt, $updatedAt
    );`
  );

  db.transaction((groups: ModuleIM.Core.Group[]) => {
    for (const group of groups) insert.run(group);
  })(groups);
}

async function setGroupMembers(groupId: number, members: DB.UserInfo[]) {
  const db = getInstance();

  db.transaction((members: DB.UserInfo[]) => {
    
  })(members);
}

/**
 * @description: Get group detail include members info. If the group member is a friend, the friend setting information will be added.
 * @param userId number
 * @param groupId number
 * @return Promise<ModuleIM.Core.Group & { members: DB.UserWithFriendSetting[] } | null>
 */
async function getGroupWithMember(userId: number, groupId: number) {
  const db = getInstance();
  const group = db
    .prepare(`SELECT * FROM groups WHERE id = $id`)
    .get({ id: groupId }) as ModuleIM.Core.Group;

  if (!group) return null;

  const members = db
    .prepare(
      `SELECT
        Info.id,
        Info.account,
        Info.avatar,
        Info.email,
        Info.regisTime,
        Info.updateTime,
        Friend.remark,
        Friend.astrolabe,
        Friend.block,
        Friend.createdAt,
        Friend.updatedAt
      FROM infos AS Info
      INNER JOIN members AS Member ON Info.id = Member.userId AND Member.groupId = $groupId
      LEFT OUTER JOIN friends AS Friend ON Friend.friendId = Member.userId AND Friend.userId = $userId
      ORDER BY Friend.remark ASC, Info.account ASC;
      `
    )
    .all({ userId, groupId }) as DB.UserWithFriendSetting[];

  return {
    ...group,
    members,
  };
}

/**
 * @description: Get user all groups.
 * @param userId number
 * @return Promise<Array<ModuleIM.Core.Group & { count: number }>>
 */
async function getUserAllGroups(userId: number) {
  const db = getInstance();
  const groups = db
    .prepare(
      `SELECT
        Group.id,
        Group.name,
        Group.avatar,
        Group.type,
        Group.creator,
        Group.createdAt,
        Group.updatedAt,
        (
          SELECT COUNT(*) FROM members AS Member WHERE Member.groupId = Group.id
        ) AS count
       FROM groups AS Group INNER JOIN members AS Member ON Group.id = Member.groupId AND Member.userId = $userId
       WHERE userId = $userId
       ORDER BY Group.name ASC;
      `
    )
    .all({
      userId,
    }) as Array<ModuleIM.Core.Group & { count: number }>;

  return groups;
}

/**
 * @description: Set a message into db.
 * @param message ModuleIM.Core.MessageBasic
 * @return Promise<SQL.RunResult>
 */
async function setMessage(message: ModuleIM.Core.MessageBasic) {
  const db = getInstance();
  const columns = Object.keys(message);

  const insert = db.prepare(`INSERT INTO messages (
    ${columns.join(',')}
  ) VALUES (
    ${columns.map((column) => `$${column}`).join(',')}
  );`);

  return insert.run(message);
}

/**
 * @description: Get messages by userId or groupId.
 * @param sender number
 * @param pageNum string
 * @param pageSize number
 * @return Promise<Array<ModuleIM.Core.MessageBasic>>
 */
async function getMessagesBySender({
  sender,
  pageNum = 1,
  pageSize = 20,
}: {
  sender: number;
  pageNum: number;
  pageSize: number;
}) {
  const db = getInstance();
  const messages = db
    .prepare(
      `SELECT 
        Message.id,
        Message.msgId,
        Message.type,
        Message.groupId,
        Message.sender,
        Message.receiver,
        Message.content,
        Message.timer,
        Message.ext,
        Info.id AS senderInfo.id,
        Info.account AS senderInfo.account,
        Info.avatar AS senderInfo.avatar,
        Info.email AS senderInfo.email,
        Info.regisTime AS senderInfo.regisTime,
        Info.updateTime AS senderInfo.updateTime
       FROM messages AS Message LEFT OUTER JOIN infos AS Info ON Message.sender = Info.id
       WHERE Message.sender = $sender
       ORDER BY Message.timer DESC
       LIMIT $limit OFFSET $offset;`
    )
    .all({ sender, limit: pageSize, offset: (pageNum - 1) * pageSize });

  return messages as Array<ModuleIM.Core.MessageBasic>;
}

/**
 * @description: Remove messages by sender.
 * @param sender number
 * @return Promise<SQL.RunResult>
 */
async function removeMessagesBySender(sender: number) {
  const db = getInstance();
  const messages = db.prepare(`DELETE FROM messages WHERE sender = $sender;`);

  return messages.run({ sender });
}

/**
 * @description: Remove all messages.
 * @return Promise<SQL.RunResult>
 */
async function removeAllMessages() {
  const db = getInstance();
  const messages = db.prepare(`DELETE FROM messages;`);

  return messages.run();
}

/**
 * @description: Create a room into table rooms.
 * @param room ModuleIM.Core.Room
 * @return Promise<SQL.RunResult>
 */
async function createRoom(room: ModuleIM.Core.Room) {
  const db = getInstance();
  const columns = Object.keys(room);
  const creator = db.prepare(`INSERT INTO rooms (
    ${columns.join(',')}
  ) VALUES (
    ${columns.map((column) => `$${column}`).join(',')}
  );`);

  return creator.run(room);
}

/**
 * @description: Remove room by owner & sender.
 * @param owner number (userId)
 * @param sender number (userId or groupId)
 * @return Promise<SQL.RunResult>
 */
async function removeRoom({
  owner,
  sender,
}: {
  owner: number;
  sender: number;
}) {
  const db = getInstance();
  const result = db
    .prepare(`DELETE FROM rooms WHERE owner = $owner AND sender = $sender;`)
    .run({ owner, sender });

  return result;
}

/**
 * @description: Remove all rooms by owner.
 * @param owner number (userId)
 * @return Promise<SQL.RunResult>
 */
async function removeRooms(owner: number) {
  const db = getInstance();
  const result = db
    .prepare(`DELETE FROM rooms WHERE owner = $owner;`)
    .run({ owner });

  return result;
}

/**
 * @description: Get all rooms.
 * @param owner number (owner userId)
 * @return Promise<Array<ModuleIM.Core.Room>>
 */
async function getRooms(owner: number) {
  const db = getInstance();
  const rooms = db
    .prepare(`SELECT * FROM rooms WHERE owner = $owner ORDER BY timer DESC;`)
    .all({ owner });

  return rooms as Array<ModuleIM.Core.Room>;
}
