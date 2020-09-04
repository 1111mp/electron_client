import 'mobx-react-lite/batchingForReactDom'
import Store, { State } from '../Store';
import { observable } from 'mobx';

export default class UserStore extends Store {
  @observable userId?: string = '';
  @observable userName?: string = '';
  @observable mobile?: string = '';
  @observable email?: string = '';

  persistMap = {
    local: ['userId', 'userName'],
  };

  ready(): Promise<void> {
    super.ready();
    return new Promise((resolve) => {
      // 模拟接口请求
      setTimeout(() => {
        this.mobile = '136455';
        this.email = '556677s';
        // 或者其他的接口数据
        resolve();
      }, 500);
    });
  }
}
