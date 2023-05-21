import { join } from 'path';
import { ensureDirSync, removeSync } from 'fs-extra';
import SQL from 'better-sqlite3-multiple-ciphers';
import { isString } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { updateSchema } from './migrations';
import { consoleLogger } from '../utils/consoleLogger';
import {
  getSchemaVersion,
  getUserVersion,
  jsonToObject,
  objectToJSON,
  setUserVersion,
} from './util';

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

  db.prepare(
    `
    INSERT OR REPLACE INTO users (
      ${keys.join(',')}
    ) VALUES (
      ${keys.map((key) => `$${key}`).join(',')}
    );
    `
  ).run(columns);
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

async function setUserTheme(theme: Theme): Promise<void> {
  const db = getInstance();
  db.prepare(`UPDATE users SET theme = $theme WHERE id = $id;`).run({
    id: user_id_key,
    theme,
  });
}

// async function setFriends() {}

/**
 * @description: Cache groups info to db (not include members).
 * @param groups ModuleIM.Core.GroupBasic[]
 * @return Promise<void>
 */
async function setGroups(groups: ModuleIM.Core.GroupBasic[]): Promise<void> {
  const db = getInstance();
  const insert = db.prepare(
    `INSERT OR REPLACE INTO groups (
      id, name, avatar, type, creator, count, createdAt, updatedAt
    ) VALUES (
      $id, $name, $avatar, $type, $creator, $count, $createdAt, $updatedAt
    );`
  );

  db.transaction((groups: ModuleIM.Core.GroupBasic[]) => {
    for (const group of groups) insert.run(group);
  })(groups);
}

/**
 * @description:  Cache groups info to db (include members).
 * @param groups Array<ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }>
 * @return Promise<void>
 */
async function setGroupsIncludeMembers(
  groups: Array<ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }>
): Promise<void> {
  const db = getInstance();

  db.transaction(
    (groups: Array<ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }>) => {
      for (const group of groups) {
        const { members } = group;

        db.prepare(
          `INSERT OR REPLACE INTO groups (
            id, name, avatar, type, creator, count, members, createdAt, updatedAt
          ) VALUES (
            $id, $name, $avatar, $type, $creator, $count, $members, $createdAt, $updatedAt
          );`
        ).run({
          ...group,
          members: members.map((member) => member.id).join(' '),
        });

        for (const member of members) {
          db.prepare(
            `
            INSERT OR REPLACE INTO userInfos (
              id,
              account,
              avatar,
              email,
              regisTime,
              updateTime
            ) VALUES (
              $id,
              $account,
              $avatar,
              $email,
              $regisTime,
              $updateTime
            )
            `
          ).run(member);
        }
      }
    }
  )(groups);
}

/**
 * @description: Insert or update a group info (not include members).
 * @param group ModuleIM.Core.GroupBasic
 * @return Promise<void>
 */
async function setGroup(group: ModuleIM.Core.GroupBasic): Promise<void> {
  const db = getInstance();
  db.prepare(
    `INSERT OR REPLACE INTO groups (
      id, name, avatar, type, creator, count, createdAt, updatedAt
    ) VALUES (
      $id, $name, $avatar, $type, $creator, $count, $createdAt, $updatedAt
    );`
  ).run(group);
}

/**
 * @description: Insert or update a group info (include members).
 * @param group ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }
 * @return Promise<void>
 */
async function setGroupIncludeMembers(
  group: ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }
): Promise<void> {
  const db = getInstance();
  db.transaction(
    (group: ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }) => {
      const { members } = group;

      db.prepare(
        `
        INSERT OR REPLACE INTO groups (
          id, name, avatar, type, creator, count, members, createdAt, updatedAt
        ) VALUES (
          $id, $name, $avatar, $type, $creator, $count, $members, $createdAt, $updatedAt
        );
        `
      ).run({
        ...group,
        members: members.map((member) => member.id).join(' '),
      });

      for (const member of members) {
        db.prepare(
          `
            INSERT OR REPLACE INTO userInfos (
              id,
              account,
              avatar,
              email,
              regisTime,
              updateTime
            ) VALUES (
              $id,
              $account,
              $avatar,
              $email,
              $regisTime,
              $updateTime
            )
            `
        ).run(member);
      }
    }
  )(group);
}

/**
 * @description: Get group info not include members.
 * @param groupId number
 * @return ModuleIM.Core.GroupBasic
 */
async function getGroup(groupId: number) {
  const db = getInstance();

  const group = db
    .prepare(
      `
        SELECT id, name, avatar, type, creator, count, createAt, updateAt
        FROM groups WHERE id = $groupId;
      `
    )
    .get({ groupId }) as ModuleIM.Core.GroupBasic;

  return group;
}

/**
 * @description: Get group info include members.
 * @param groupId number
 * @return ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }
 */
async function getGroupWithMembers(
  groupId: number
): Promise<
  (ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }) | undefined
> {
  const db = getInstance();

  const row = db
    .prepare(
      `
      SELECT id, name, avatar, type, creator, count, members, createAt, updateAt
      FROM groups WHERE id = $groupId;
      `
    )
    .get({ groupId }) as ModuleIM.Core.GroupBasic & { members: string };

  if (!row) return undefined;

  const ids = row.members.split(' ').map((id) => parseInt(id));

  const members = db
    .prepare(
      `
      SELECT * FROM userInfos
      WHERE id IN (
        ${ids.map(() => '?').join(', ')}
      )
      `
    )
    .all(ids) as DB.UserInfo[];

  return { ...row, members };
}

/**
 * @description: Get group members by groupId.
 * @param groupId number
 * @return Promise<DB.UserInfo[]>
 */
async function getMembersByGroupId(groupId: number): Promise<DB.UserInfo[]> {
  const db = getInstance();
  const row = db
    .prepare(
      `
      SELECT members
      FROM groups WHERE id = $groupId;
      `
    )
    .get({ groupId }) as { members: string };

  if (!row) return [];

  const ids = row.members.split(' ').map((id) => parseInt(id));

  const members = db
    .prepare(
      `
      SELECT * FROM userInfos
      WHERE id IN (
        ${ids.map(() => '?').join(', ')}
      )
      `
    )
    .all(ids) as DB.UserInfo[];

  return members;
}

/**
 * @description: Get user all groups (not include members).
 * @param userId number
 * @return Promise<Array<ModuleIM.Core.GroupBasic>>
 */
async function getUserAllGroups(userId: number) {
  const db = getInstance();
  const groups = db
    .prepare(
      `
      SELECT id, name, avatar, type, creator, count, createdAt, updatedAt
      FROM groups
      WHERE members LIKE $userId
      ORDER BY name ASC;
      `
    )
    .all({
      userId: `%${userId}%`,
    }) as Array<ModuleIM.Core.GroupBasic>;

  return groups;
}

/**
 * @description: Get user all groups (include members).
 * @param userId number
 * @return Promise<Array<ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }>>
 */
async function getUserAllGroupsIncludeMembers(userId: number) {
  const db = getInstance();
  const groups = db
    .prepare(
      `
      SELECT id, name, avatar, type, creator, count, members, createdAt, updatedAt
      FROM groups
      WHERE members LIKE $userId
      ORDER BY name ASC;
      `
    )
    .all({
      userId: `%${userId}%`,
    }) as Array<ModuleIM.Core.GroupBasic & { members: string }>;

  if (!groups || !groups.length) return [];

  return db.transaction(
    (groups: Array<ModuleIM.Core.GroupBasic & { members: string }>) => {
      const result: Array<
        ModuleIM.Core.GroupBasic & { members: DB.UserInfo[] }
      > = [];

      for (const group of groups) {
        const ids = group.members.split(' ').map((id) => parseInt(id));

        const members = db
          .prepare(
            `
            SELECT * FROM userInfos
            WHERE id IN (
              ${ids.map(() => '?').join(', ')}
            )
            `
          )
          .all(ids) as DB.UserInfo[];

        result.push({ ...group, members });
      }

      return result;
    }
  )(groups);
}

/**
 * @description: Set a message into db.
 * @param owner number
 * @param message ModuleIM.Core.MessageBasic
 * @return Promise<void>
 */
async function setMessage(owner: number, message: ModuleIM.Core.MessageBasic) {
  const db = getInstance();
  const columns = Object.keys(message);

  db.prepare(
    `
    INSERT INTO messages (
      owner, ${columns.join(',')}
    ) VALUES (
      owner, ${columns.map((column) => `$${column}`).join(',')}
    );
    `
  ).run({ ...message, owner });
}

/**
 * @description: Set messages into db.
 * @param owner number
 * @param message ModuleIM.Core.MessageBasic[]
 * @return Promise<void>
 */
async function setMessages(
  owner: number,
  messages: ModuleIM.Core.MessageBasic[]
): Promise<void> {
  const db = getInstance();

  db.transaction((messages: ModuleIM.Core.MessageBasic[]) => {
    for (const message of messages)
      db.prepare(
        `
        INSERT INTO messages (
          msgId,
          id,
          owner,
          type,
          groupId,
          sender,
          receiver,
          content,
          timer,
          ext
        ) VALUES (
          $msgId,
          $id,
          $owner,
          $type,
          $groupId,
          $sender,
          $receiver,
          $content,
          $timer,
          $ext
        )
        `
      ).run({
        ...message,
        owner,
      });
  })(messages);
}

/**
 * @description: Get messages by userId or groupId.
 * @param sender number
 * @param pageNum string
 * @param pageSize number
 * @return Promise<Array<ModuleIM.Core.MessageBasic>>
 */
async function getMessagesBySender({
  owner,
  sender,
  pageNum = 1,
  pageSize = 20,
}: {
  owner: number;
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
       FROM messages AS Message LEFT OUTER JOIN userInfos AS Info ON Message.sender = Info.id
       WHERE Message.owner = $owner AND Message.sender = $sender
       ORDER BY Message.id DESC
       LIMIT $limit OFFSET $offset;`
    )
    .all({ owner, sender, limit: pageSize, offset: (pageNum - 1) * pageSize });

  return messages as Array<ModuleIM.Core.MessageBasic>;
}

/**
 * @description: Get the last message for conversation.
 * @param owner number
 * @param sender number
 * @return Promise<ModuleIM.Core.MessageBasic>
 */
async function getLastConversationMessage(
  owner: number,
  sender: number
): Promise<ModuleIM.Core.MessageBasic> {
  const db = getInstance();
  const message = db
    .prepare(
      `
      SELECT * FROM messages WHERE
        owner = $owner AND sender = $sender
      ORDER BY id DESC
      LIMIT 1;
      `
    )
    .get({ owner, sender }) as ModuleIM.Core.MessageBasic;

  return message;
}

/**
 * @description: Remove messages by msgIds.
 * @param msgIds string[]
 * @return Promise<void>
 */
async function removeMessageBymsgIds(msgIds: string[]): Promise<void> {
  const db = getInstance();
  db.prepare(
    `
        DELETE FROM messages WHERE msgId IN ( 
          ${msgIds.map(() => '?').join(', ')}
        );
      `
  ).run(msgIds);
}

/**
 * @description: Remove messages by sender.
 * @param owner number
 * @param sender number
 * @return Promise<void>
 */
async function removeMessagesBySender(
  owner: number,
  sender: number
): Promise<void> {
  const db = getInstance();
  db.prepare(
    `DELETE FROM messages WHERE owner = $owner AND sender = $sender;`
  ).run({ owner, sender });
}

/**
 * @description: Remove all messages.
 * @param owner number
 * @return Promise<void>
 */
async function removeAllMessages(owner: number): Promise<void> {
  const db = getInstance();
  db.prepare(`DELETE FROM messages WHERE owner = $owner;`).run({ owner });
}

/**
 * @description: Create a room into table rooms.
 * @param room ModuleIM.Core.ConversationType
 * @return Promise<void>
 */
async function createConversation(
  conversation: Omit<ModuleIM.Core.ConversationType, 'id' | 'lastReadAck'> & {
    id?: string;
    lastReadAck?: bigint;
  }
): Promise<void> {
  const db = getInstance();
  const columns = Object.keys(conversation);

  if (!conversation['id']) {
    conversation['id'] = uuidv4();
  }

  db.prepare(
    `INSERT INTO conversations (
    ${columns.join(',')}
  ) VALUES (
    ${columns.map((column) => `$${column}`).join(',')}
  );`
  ).run(conversation);
}

/**
 * @description: Update lastReadAck for conversation (async).
 * @param owner number
 * @param options <{ id: string; lastReadAck: bigint }>
 * @return Promise<void>
 */
async function updateLastReadforConversation(
  owner: number,
  options: { id: string; lastReadAck: bigint }
): Promise<void> {
  updateLastReadforConversationSync(owner, options);
}

/**
 * @description: Update lastReadAck for conversation (sync).
 * @param owner number
 * @param options <{ id: string; lastReadAck: bigint }>
 * @return Promise<void>
 */
function updateLastReadforConversationSync(
  owner: number,
  { id, lastReadAck }: { id: string; lastReadAck: bigint }
) {
  const db = getInstance();

  db.prepare(
    `
    UPDATE conversations SET
      lastReadAck = $lastReadAck
    WHERE owner = $owner AND id = $id;
    `
  ).run({ owner, id, lastReadAck });
}

/**
 * @description: Remove all conversations by owner.
 * @param owner number (userId)
 * @return Promise<void>
 */
async function removeConversationById(id: string): Promise<void> {
  const db = getInstance();
  db.prepare(`DELETE FROM conversations WHERE id = $id;`).run({ id });
}

/**
 * @description: Get all conversations.
 * @param owner number (owner userId)
 * @return Promise<Array<ModuleIM.Core.ConversationType>>
 */
async function getAllConversations(owner: number) {
  const db = getInstance();
  const conversations = db
    .prepare(
      `SELECT * FROM conversations WHERE owner = $owner ORDER BY timer DESC;`
    )
    .all({ owner });

  return conversations as Array<ModuleIM.Core.ConversationType>;
}

/**
 * @description: Get total unread messages count for conversation (async).
 * @param owner number
 * @param options <{ sender: number; lastReadAck: bigint; }>
 * @return Promise<void>
 */
async function getTotalUnreadForConversation(
  owner: number,
  options: {
    sender: number;
    lastReadAck: bigint;
  }
): Promise<number> {
  return getTotalUnreadForConversationSync(owner, options);
}

/**
 * @description: Get total unread messages count for conversation (sync).
 * @param owner number
 * @param options <{ sender: number; lastReadAck: bigint; }>
 * @return Promise<void>
 */
function getTotalUnreadForConversationSync(
  owner: number,
  {
    sender,
    lastReadAck,
  }: {
    sender: number;
    lastReadAck: bigint;
  }
) {
  const db = getInstance();
  const count = db
    .prepare(
      `
      SELECT count(1)
      FROM messages
      WHERE owner = $owner AND sender = $sender AND id > $lastReadAck
      `
    )
    .pluck()
    .get({ owner, sender, lastReadAck }) as number;

  return count;
}
