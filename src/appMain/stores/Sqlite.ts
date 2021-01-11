import { Persister, State } from './PersistManager';
import { Op } from 'sequelize';

export function firstUpperCase([first, ...rest]: any[]): string {
  return first.toUpperCase() + rest.join('');
}

/**
 * 更新sqlite数据库的数据之后 触发sqliteEvent 通知store获取最新数据
 */
const SQLITEEVENT: string = 'sqliteEvent';

export function setItem(key: string, value: string, custom: boolean = false) {
  // localStorage[key] = value;

  if (custom) {
    let storageEvent: any = new Event(SQLITEEVENT);
    storageEvent['key'] = key;
    storageEvent['newValue'] = value;

    window.dispatchEvent(storageEvent);
  }
}

export default class Sqlite extends Persister {
  /** 存
   * 自定义storage事件 实现同一页面监听storage的变化
   */
  async setItems(models: State, custom: boolean = false) {
    for (let model in models) {
      try {
        let value = models[model];

        if (model === 'user') {
          /** user 数据 */
          (window as any).Signal.sqlClient.upsertUser({ ...value });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  /** 取 */
  async getItems(models: string[]) {
    let res = await Promise.all(
      models.map(async (model) => {
        try {
          let res;

          if (model === 'user') {
            res = await (window as any).Signal.sqlClient.getUserInfo();
          }

          return res;
        } catch (error) {
          console.log(error);
          return {};
        }
      })
    );

    return res.reduce((pre: State, cur: any, index: number) => {
      const key = models[index];
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
    window.addEventListener(SQLITEEVENT, this._onStorageChange, false);
  }

  /** 销毁 */
  onDestory() {
    // window.removeEventListener('storage', this._onStorageChange, false);
    // @ts-ignore
    window.removeEventListener(SQLITEEVENT, this._onStorageChange, false);
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

    this._changeHandler &&
      this._changeHandler({
        keys: [key as string].map((key) => key),
        target: this,
      });
  };
}
