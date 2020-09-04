import { Persister, State } from './PersistManager';

export default class Storage extends Persister {
  /** 存储时 key拼一个前缀 */
  private prefix = '$___localstorage___';

  /** 为key拼上前缀 */
  private toLocalKey(key: string) {
    return this.prefix + key;
  }

  /** 获取真正的key */
  private toRealKey(key: string) {
    return key.replace(this.prefix, '');
  }

  /** 存 */
  async setItems(states: State) {
    for (let k in states) {
      const key = this.toLocalKey(k);
      let value;
      try {
        value = JSON.stringify(states[k]);
      } catch (e) {
        value = states[k];
      }
      localStorage[key] = value;
    }
  }

  /** 取 */
  async getItems(keys: string[]) {
    return keys
      .map((key) => {
        key = this.toLocalKey(key); // 获取对应缓存中的key

        try {
          return JSON.parse(localStorage[key]);
        } catch (error) {
          return localStorage[key];
        }
      })
      .reduce((pre: State, cur: any, index: number) => {
        const key = keys[index];

        return {
          ...pre,
          [key]: cur,
        };
      }, {});
  }

  /** 初始化 注册storage事件 后续storage变化同步到store */
  onRegister() {
    console.log('onRegisteronRegister');
    window.addEventListener('storage', this._onStorageChange, false);
  }

  /** 销毁 */
  onDestory() {
    window.removeEventListener('storage', this._onStorageChange, false);
  }

  /** 储存的数据发生变化时 触发执行的回调 */
  private _onStorageChange(event: StorageEvent) {
    /** 发生变化的键名 */
    const { key } = event;

    this._changeHandler &&
      this._changeHandler({
        keys: [key as string].map((key) => this.toRealKey(key)),
        target: this,
      });
  }
}
