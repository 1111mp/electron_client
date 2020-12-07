'use strict';

const { remote } = require('electron');
const Sequelize = require('sequelize/lib/sequelize');
const { userInfo } = require('os');
const User = require('./models/user');
// const Setting = require('./models/setting');
const path = require('path');

const { app } = remote;

const userDataPath = app.getPath('userData');

let sequelizeInstance;

function initDatabase() {
  try {
    sequelizeInstance = new Sequelize('database', '', userInfo().username, {
      dialect: 'sqlite',
      dialectModule: require('@journeyapps/sqlcipher'),
      storage: path.resolve(userDataPath, 'db/db.sqlite'),
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    });

    User(sequelizeInstance);
    // Setting(sequelizeInstance);

    // sequelizeInstance.sync({ alter: true });
    // sequelizeInstance.sync({ force: true });
    return sequelizeInstance;
  } catch (error) {
    console.log(error);
  }
}

module.exports = function () {
  return initDatabase();
};
