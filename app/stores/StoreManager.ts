import Store from './Store';
import persistManager, { PersistManager } from './PersistManager';
import Storage from './Storage';
import Sqlite from './Sqlite';

export const PERSIST_LOCAL = 'local';
export const PERSIST_SQLITE = 'sqlite';
const PersistMethods = [PERSIST_LOCAL, PERSIST_SQLITE];

class StoreManager {
  persistManager: PersistManager;

  constructor(persistManager: PersistManager) {
    this.persistManager = persistManager;
    this.persistManager.onChange(this._onPersistChange);
  }

  /** 保存所有模块的Store */
  stores: {
    [key: string]: Store;
  } = {};

  /** Store的初始化 也就是整个mobx的初始化 */
  async init(): Promise<void> {
    const stores = this.stores;
    const keys = Object.keys(stores);
    // keys ===> ['user', 'setting']
    const states: any = {};

    for (let i = 0; i < PersistMethods.length; i++) {
      const source = PersistMethods[i]; // local
      /** 从本地缓存中获取所有已经持久化的数据state的值 */
      const data = await this.persistManager.getItems(source, keys);
      /** 依次赋值给state */
      keys.forEach((key: string) => {
        if (data[key]) {
          // 如果缓存中有值 就赋值给state
          let state = states[key] || {};

          state = {
            ...state,
            ...data[key],
          };

          states[key] = state;
        }
      });
    }

    /** 开始同步缓存的数据到store */
    this.batchUpdate(states);

    /** 初始化每个模块的store的 监听state改变的方法 */
    keys.forEach((key) => {
      stores[key].onchange(this._changeHandler);
    });

    await Promise.all(
      keys.map((key) => {
        return stores[key].ready();
      })
    );
  }

  /** 返回对应的store模块 */
  store<T extends Store>(name: string): T {
    return this.stores[name] as T;
  }

  /** store的state更改时触发的方法 */
  private _changeHandler = ({
    target,
    keys,
  }: {
    target: Store;
    keys: string[];
  }) => {
    // 这里只做全量更新，如果有需要，可以根据keys来做增量更新
    // state改变之后 通过persist方法 将数据同步到本地缓存
    this.persist([target]);
  };

  /** 将从本地缓存中获取到的数据 通过Store的persist方法 同步到store中的state去 */
  batchUpdate(states: { [key: string]: any }) {
    for (let state in states) {
      this.stores[state].persist(states[state]);
    }
  }

  private async persist(stores: Store[]) {
    for (let i = 0; i < PersistMethods.length; i++) {
      const source = PersistMethods[i]; // local

      const states: any = {}; // 用来保存 最新的state

      stores.forEach((store) => {
        // debugger
        const keys = store.persistKeys(source); // ['username','userId']

        keys &&
          keys.forEach((key: string) => {
            const v = store[key]; // state的值

            let state = states[store.name] || []; // 比如user store下所有的state

            state = {
              ...state,
              [key]: v,
            };

            states[store.name] = state;
          });
      });

      /** 将最新的state数据同步到本地缓存中 */
      await this.persistManager.setItems(source, states);
    }
  }

  /** 当缓存变化时触发的callback 实际就是这个方法 */
  private _onPersistChange = async ({
    source,
    keys,
  }: {
    source: string;
    keys: string[];
  }) => {
    const states = await this.persistManager.getItems(source, keys);
    console.log(states);
    this.batchUpdate(states);
  };
}

/** 注册localStorage做mobx的持久化方式 */
persistManager.register(PERSIST_LOCAL, new Storage());
persistManager.register(PERSIST_SQLITE, new Sqlite());

const manager = new StoreManager(persistManager);

// manager.stores = {
//   user: new UserStore('user'),
// };

// 有需要可以挪到项目启动阶段，等store init完成之后再加载页面
// manager.init();

export default manager;
