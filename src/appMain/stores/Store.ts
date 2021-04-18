import { makeObservable, autorun } from 'mobx';

export interface State {
  [key: string]: unknown;
}

class Store {
  [key: string]: any;
  name: string = ''; // 模块名

  private loaded: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  ready(): Promise<void> {
    makeObservable(this);
    autorun(this._observe);
    return Promise.resolve();
  }

  /** 用来保存store需要持久化的的state */
  persistMap: {
    [key: string]: string[];
  } = {};

  private changeHandler = (event: { keys: string[]; target: Store }) => {};

  /** 将本地缓存中的数据同步到store中 */
  persist(state?: State): State | void {
    const keys = this.persistKeys();
    if (!state) {
      return keys.reduce((pre, key: string) => {
        return {
          ...pre,
          [key]: this[key],
        };
      }, {});
    } else {
      keys.forEach((key) => {
        if (state[key] !== undefined) {
          this[key] = state[key];
        }
      });
    }
  }

  /** 记录store更改时候触发的方法 */
  onchange(callback: (event: { keys: string[]; target: Store }) => void) {
    this.changeHandler = callback;
  }

  /** 获取所有需要做持久化的state的key 可获取指定source的需持久化的state的key */
  persistKeys(source?: string) {
    if (source) {
      return this.persistMap[source] || [];
    } else {
      return Object.keys(this.persistMap).reduce(
        (pre: string[], cur: string) => {
          return [...pre, ...this.persistMap[cur]];
        },
        []
      );
    }
  }

  _observe = () => {
    const { name } = { ...this };
    if (!this.loaded) this.loaded = true;
    else {
      this.changeHandler &&
        this.changeHandler({ keys: [name as string], target: this });
    }
  };
}

export default Store;
