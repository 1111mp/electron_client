import { Persister, State } from './PersistManager';

const STORAGEEVENT: string = 'customStorageEvent';

/** 先改变localstorage 然后再发出自定义的storage事件
 * 防止在同步storage的数据到store的时候获取到的缓存的数据还是老的数据
*/
export function setItem(key: string, value: string, custom: boolean = false) {
  localStorage[key] = value;

  if (custom) {
    let storageEvent: any = new Event(STORAGEEVENT);
    console.log(key);
    storageEvent['key'] = key;
    storageEvent['newValue'] = value;

    window.dispatchEvent(storageEvent);
  }
}

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

  /** 存
   * 自定义storage事件 实现同一页面监听storage的变化
   */
  async setItems(states: State, custom: boolean = false) {
    for (let k in states) {
      const key = this.toLocalKey(k);
      let value;
      try {
        value = JSON.stringify(states[k]);
      } catch (e) {
        value = states[k];
      }

      setItem(key, value, custom);
      // if (custom) {
      //   let storageEvent: any = new Event(STORAGEEVENT);

      //   storageEvent[key] = key;
      //   storageEvent['newValue'] = value;

      //   window.dispatchEvent(storageEvent);
      // }
      // localStorage[key] = value;
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
    // window.addEventListener('storage', this._onStorageChange, false);
    // @ts-ignore
    window.addEventListener(STORAGEEVENT, this._onStorageChange, false);
  }

  /** 销毁 */
  onDestory() {
    // window.removeEventListener('storage', this._onStorageChange, false);
    // @ts-ignore
    window.removeEventListener(STORAGEEVENT, this._onStorageChange, false);
  }

  /** 储存的数据发生变化时 触发执行的回调
   * https://www.jianshu.com/p/519a1b42d659
   * 当同源页面的某个页面修改了localStorage，其余的同源页面只要注册了storage事件，就会触发
   * 同一浏览器打开了两个同源页面
   * 其中一个网页修改了 localStorage
   * 另一网页注册了 storage 事件
   * 很容易犯的错误是，在同一个网页修改本地存储，又在同一个网页监听，这样是没有效果的。
   */
  private _onStorageChange = (event: StorageEvent) => {
    /** 发生变化的键名 */
    const { key } = event;

    console.log(444444444);
    console.log(event);
    console.log(key);

    this._changeHandler &&
      this._changeHandler({
        keys: [key as string].map((key) => this.toRealKey(key)),
        target: this,
      });
  };
}
