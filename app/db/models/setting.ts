'use strict';

import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize: Sequelize) => {
  const Setting = sequelize.define('Setting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    theme: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['system', 'light', 'dark']]
      },
      comment: '主题',
    },
  });

  return Setting;
};
