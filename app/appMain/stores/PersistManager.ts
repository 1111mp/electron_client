/** 持久化 */
export interface State {
  [key: string]: any;
}

/** 抽象类 */
export abstract class Persister {
  /** 抽象类的抽象方法 必须在子类中声明 */
  abstract setItems(state: State): Promise<void>;
  abstract getItems(key: string[]): Promise<State>;
  abstract onDestory(): void;
  abstract onRegister(): void;

  /** 用来保存 当储存的数据发生变化时触发执行的回调函数 */
  _changeHandler: (event: {
    keys: string[];
    target: Persister;
  }) => void = () => {};

  /** 保存储存的数据发生变化时触发执行的回调函数 */
  onChange(callback: (event: { keys: string[]; target: Persister }) => void) {
    this._changeHandler = callback;
  }
}

/** store数据持久化的中间层 store ===>>> 缓存 */
export class PersistManager {
  persisters: { [key: string]: Persister } = {};

  private changeCallbacks: ((event: {
    source: string;
    keys: string[];
  }) => void)[] = [];

  /** 注册持久化方式 比如 local 对应 localStorage */
  register(name: string, persister: Persister) {
    this.persisters[name] = persister;
    /**
     * local ===>>> new Storage   localStorage
     * sqlote ===>>> new Sqlite   sqlite
     */

    /** 执行 持久化方式的监听回调 比如localStorage的storage事件 */
    persister.onRegister && persister.onRegister();

    persister.onChange(({ keys }) => {
      this.persistChangeHandler({
        keys,
        source: name,
      });
    });
  }

  setItems(source: string, state: State): Promise<void> {
    return new Promise((resolve, reject) => {
      const persister = this.persisters[source];

      if (persister) {
        return persister.setItems(state).then(
          () => resolve(),
          (e) => reject(e)
        );
      }

      reject({ message: `no source ${source}` });
    });
  }

  // sqlite =====>>> user client
  getItems(source: string, keys: string[]): Promise<State> {
    return new Promise((resolve, reject) => {
      const persister = this.persisters[source]; // localStorage
      if (persister) {
        return persister.getItems(keys).then(
          (state) => resolve(state),
          (e) => reject(e)
        );
      }

      return reject({ message: `no source ${source}` });
    });
  }

  onChange(callback: (event: { source: string; keys: string[] }) => void) {
    this.changeCallbacks.push(callback);
  }

  private persistChangeHandler(event: { source: string; keys: string[] }) {
    this.changeCallbacks.forEach((callback) => {
      callback(event);
    });
  }
}

const persistManager = new PersistManager();

export default persistManager;
