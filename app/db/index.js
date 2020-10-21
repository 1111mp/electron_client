'use strict';

// import Sequelize from '';
const { remote } = require('electron');
const Sequelize = require('sequelize/lib/sequelize');
const { userInfo } = require('os');
const User = require('./models/user');
const Setting = require('./models/setting');
const path = require('path');

const { app } = remote;

const userDataPath = app.getPath('userData');

let sequelize;

async function initDatabase() {
  try {
    sequelize = new Sequelize('database', '', userInfo().username, {
      dialect: 'sqlite',
      dialectModule: require('@journeyapps/sqlcipher'),
      storage: path.resolve(userDataPath, 'db/db.sqlite'),
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    });

    User(sequelize);
    Setting(sequelize);

    // sequelize.sync({ alter: true });
    window.sequelize = sequelize;
  } catch (error) {
    console.log(error);
  }
}

module.exports = async function () {
  await initDatabase();
};
