'use strict';

import { Sequelize, Model, DataTypes, Optional, BuildOptions } from 'sequelize';
import moment from 'moment';

/**
 * sequelize + ts 文档：https://www.gobeta.net/books/demopark-sequelize-docs-zh-cn/typescript/
 *
 * Cannot use namespace 'DataTypes' as a type.
 * https://github.com/sequelize/sequelize-auto/issues/384
 */

export interface UserCreationAttributes
  extends Optional<DB.UserAttributes, 'theme'> {}

interface UserModel
  extends Model<DB.UserAttributes, UserCreationAttributes>,
    DB.UserAttributes {}

export type UserStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): UserModel;
};

export function UserFactory(sequelize: Sequelize) {
  return <UserStatic>sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        comment: '用户id',
      },
      account: {
        type: DataTypes.INTEGER,
        comment: '账号 手机号',
      },
      token: {
        type: DataTypes.STRING,
        comment: 'token 验签',
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '用户头像',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: 'email',
        validate: {
          isEmail: true,
        },
        comment: '用户邮箱',
      },
      theme: {
        type: DataTypes.STRING,
        validate: {
          isIn: [['system', 'light', 'dark']],
        },
        defaultValue: 'system',
        comment: '主题',
      },
      regisTime: {
        type: DataTypes.STRING,
        field: 'regis_time',
        comment: '用户注册时间',
      },
      updateTime: {
        type: DataTypes.STRING,
        field: 'update_time',
        comment: '用户信息最近一次更新时间',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return moment(
            new Date((this as any).getDataValue('createdAt'))
          ).format('YYYY-MM-DD HH:mm');
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return moment(
            new Date((this as any).getDataValue('updatedAt'))
          ).format('YYYY-MM-DD HH:mm');
        },
      },
    },
    {
      indexes: [
        {
          using: 'BTREE',
          fields: ['user_id'],
        },
      ],
    }
  );
}
