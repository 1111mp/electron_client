import { makeAutoObservable } from 'mobx';
import { getIMSocketInstance } from 'Renderer/socket';
import Config from 'Renderer/config';
import { ModuleIMCommon } from 'App/renderer/socket/enums';
// https://stackoverflow.com/questions/61654633/mobx-react-console-warning-related-observer

export default class ClientStore {
  private socket;
  isMaximized: boolean = false;

  constructor() {
    const { userId, token } = window.Context.getUserInfo();
    this.socket = getIMSocketInstance(Config.imSocketUrl, {
      optionsForSocket: {
        path: '/socket/v1/IM/',
        // transports: ['websocket'],
        // https://socket.io/zh-CN/docs/v4/client-options/#extraheaders
        extraHeaders: { userid: `${userId}`, authorization: token },
      },
      onMessage: this.onMessage,
    });

    makeAutoObservable(this, {}, { autoBind: true });
  }

  setMaximized = (flag: boolean): void => {
    this.isMaximized = flag;
  };

  public async sendMesssage(msg: ModuleIM.Core.MessageBasic) {
    return this.socket.sendMessage(msg);
  }

  public sendMessageForGroup() {}

  onMessage(msg: ModuleIM.Core.MessageBasic) {
    console.log(msg);
  }
}
