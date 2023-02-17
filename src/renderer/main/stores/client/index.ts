import { makeAutoObservable } from 'mobx';
import Config from 'Renderer/config';
import { v4 as uuidv4 } from 'uuid';
import { getIMSocketInstance } from 'Renderer/socket';
import { ModuleIMCommon } from 'App/renderer/socket/enums';
// https://stackoverflow.com/questions/61654633/mobx-react-console-warning-related-observer

export default class ClientStore {
  private socket;
  isMaximized: boolean = false;

  constructor() {
    const { userId, token } = window.Context.getUserInfo();
    console.log(userId);
    console.log(token);
    this.socket = getIMSocketInstance(Config.imSocketUrl, {
      optionsForSocket: {
        path: '/socket/v1/IM/',
        // transports: ['websocket'],
        // https://socket.io/zh-CN/docs/v4/client-options/#extraheaders
        extraHeaders: { userid: `${userId}`, authorization: token },
      },
    });
    makeAutoObservable(this);
  }

  setMaximized = (flag: boolean): void => {
    this.isMaximized = flag;
  };

  sendMesssageText = () => {
    const { userId } = window.Context.getUserInfo();
    this.socket
      .sendMessageText({
        id: uuidv4(),
        type: ModuleIMCommon.MsgType.Text,
        session: ModuleIMCommon.Session.Single,
        sender: userId,
        receiver: 10009, // userId or groupId
        status: ModuleIMCommon.MsgStatus.Initial,
        timer: `${Date.now()}`,
        text: 'Hello World.',
      })
      .then((res) => {
        console.log(res);
      });
  };
}
