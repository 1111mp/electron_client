import 'mobx-react-lite/batchingForReactDom';
import Store from '../Store';
import { observable } from 'mobx';

export default class UserStore extends Store {
  @observable userId?: string = '';
  @observable userName?: string = '';
  @observable mobile?: string = '';
  @observable email?: string = '';
  @observable theme?: string = '';

  persistMap = {
    local: ['userId', 'userName'],
    // sqlite: ['theme'],
  };

  ready(): Promise<void> {
    super.ready();
    return new Promise((resolve) => {
      // 模拟接口请求
      setTimeout(() => {
        // this.userId = '123456';
        this.mobile = '136455';
        this.email = '556677s';
        // 或者其他的接口数据
        resolve();
      }, 5000);
    });
  }
}
