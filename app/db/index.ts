'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize/lib/sequelize');
import { userInfo } from 'os';

let sequelize;

try {
  sequelize = new Sequelize('database', '', userInfo().username, {
    dialect: 'sqlite',
    dialectModule: require('@journeyapps/sqlcipher'),
    storage: 'path/to/db.sqlite',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  });
} catch (error) {
  console.log(error);
}

export default sequelize;
