'use strict';

// import Sequelize from '';
const Sequelize = require('sequelize/lib/sequelize');
const { userInfo } = require('os');
const User = require('./models/user');
const Setting = require('./models/setting');

let sequelize;

function initDatabase() {
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

    User(sequelize);
    Setting(sequelize);

    // sequelize.sync({ alter: true });
    window.sequelize = sequelize;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  initDatabase
};
