import { RouterStore } from 'mobx-react-router';
import Config from 'app/config';
import manager from './StoreManager';
import ClientStore from './client';
import UserStore from './user';
import SettingStore from './setting';
import sequelize from '../db';

Config.isDev &&
  import('mobx-logger').then((logger) => {
    logger.enableLogging({
      predicate: () => true,
      action: true,
      reaction: true,
      transaction: true,
      compute: true,
    });
  });

const storageMap: any = {
  routerStore: RouterStore,
  clientStore: ClientStore,
};

export default async function createStore() {
  const keys = Object.keys(storageMap);
  let store: IAnyObject;

  // try {
  //   await sequelize.authenticate();
  //   console.log('Database connection OK!');
  // } catch (error) {
  //   console.log('Unable to connect to the database:');
  //   console.log(error.message);
  //   // process.exit(1);
  // }

  // // sequelize.models.Setting.create({ theme: 'dark' });
  // console.log(88888);
  // let res = await sequelize.models.Setting.findOne({
  //   attributes: { exclude: ['id', 'updatedAt', 'createdAt'] },
  // });
  // console.log(res.toJSON());
  // console.log(
  //   await sequelize.models.Setting.findOne({
  //     attributes: { exclude: ['id', 'updatedAt', 'createdAt'] },
  //   })
  // );
  // console.log(777777);

  store = {};

  keys.forEach((key) => {
    store[key] = new storageMap[key]();
  });

  // return store;

  try {
    manager.stores = {
      user: new UserStore('user'),
      Setting: new SettingStore('Setting'),
    };
  } catch (e) {
    console.log(e);
  }

  manager.init();

  return {
    ...store,
    ...manager.stores,
  };
}
