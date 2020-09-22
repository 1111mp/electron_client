'use strict';

import Sequelize from 'sequelize/lib/sequelize';
import { userInfo } from 'os';
import User from './models/user';
import Setting from './models/setting';

let sequelize: Sequelize;

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

} catch (error) {
  console.log(error);
}

export default sequelize;
