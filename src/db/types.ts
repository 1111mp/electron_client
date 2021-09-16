import { Sequelize } from 'sequelize';
import {
  UserStatic,
  UserAttributes,
  UserCreationAttributes,
} from './models/user.model';

export type DB = {
  sequelize: Sequelize;
  User: UserStatic;
};

export type SqlBaseType = {
  close: () => Promise<void>;

  upsertUser: (data: UserCreationAttributes) => Promise<any>;
  getUserInfo: () => Promise<UserAttributes>;
};

export type SqlType = SqlBaseType & {
  initialize: () => Promise<'successed' | 'failed'>;
};

export type SqlClientType = SqlBaseType & {};

// export type UserType = {
//   userId: number;
//   [key: string]: unknown;
// };
