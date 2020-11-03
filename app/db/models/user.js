'use strict';

const { Sequelize, DataTypes } = require('sequelize');

/**
 * sequelize + ts 文档：https://www.gobeta.net/books/demopark-sequelize-docs-zh-cn/typescript/
 *
 * Cannot use namespace 'DataTypes' as a type.
 * https://github.com/sequelize/sequelize-auto/issues/384
 */
module.exports = (sequelize) => {
  const User = sequelize.define(
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
      token: {
        type: DataTypes.STRING,
        comment: 'token 验签',
      },
      avatar: {
        type: DataTypes.STRING,
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
      createdAt: {
        type: DataTypes.STRING,
      },
      updatedAt: {
        type: DataTypes.STRING,
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

  return User;
};
