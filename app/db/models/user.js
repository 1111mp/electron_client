'use strict';

const { Sequelize, DataTypes } = require('sequelize');

/**
 * sequelize + ts 文档：https://www.gobeta.net/books/demopark-sequelize-docs-zh-cn/typescript/
 *
 * Cannot use namespace 'DataTypes' as a type.
 * https://github.com/sequelize/sequelize-auto/issues/384
 */
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  return User;
};
