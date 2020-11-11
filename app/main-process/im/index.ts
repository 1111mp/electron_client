import { Socket } from 'socket.io-client';
import Operates from './im.json';

const socketUrl = 'http://192.168.80.208:3000';

class IM {
  static _instance: IM;
  private socket: Socket;
  private user: IAnyObject;

  static getInstance(user: IAnyObject): IM {
    if (!this._instance) {
      this._instance = new IM(user);
    }
    return this._instance;
  }

  constructor(user: IAnyObject) {
    this.user = user;

    this.socket = require('socket.io-client')(socketUrl, {
      transports: ['websocket'],
      query: { token: 'a8589367-dbc2-42f3-9f68-2dcbdd907f75' },
    });

    this.socket.on('connect', () => {
      console.log('connect successed');
      this.init();
    });

    this.socket.on('error', (error: any) => {
      console.log(error);
    });
  }

  init = () => {
    this.login();
    // this.regist();
  };

  send = (operate: string, args: IAnyObject): IAnyObject => {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        operate,
        {
          ...args,
        },
        (res: IAnyObject) => {
          resolve(res);
        }
      );
    });
  };

  regist = (operate: string) => {};

  /** IM 登录 */
  login = () => {
    this.send(Operates.LOGIN, {
      socketId: this.socket.id,
      userId: this.user.userId,
    }).then((res: IAnyObject) => {
      if (res.code === 200) {
        /** IM 服务登录成功 */
      } else {
        /** 失败 */
      }
    });
  };
}
