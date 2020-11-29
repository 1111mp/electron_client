import { Socket } from 'socket.io-client';
import IMListeners from './listeners';
import { getAckResfromProto } from './utils';

const socketUrl = 'ws://192.168.0.7:3000';

export class IM {
  static _instance: IM;

  static getInstance(): IM {
    if (!this._instance) {
      this._instance = new IM();
    }
    return this._instance;
  }

  // @ts-ignore
  private socket: Socket;

  constructor() {
    console.log('UserInfo ========>>>>>>>>', (global as any).UserInfo);
    const { token } = (global as any).UserInfo;
    try {
      this.socket = require('socket.io-client')(socketUrl, {
        transports: ['websocket'],
        query: { token },
        reconnectionAttempts: 20,
      });

      this.socket.on('connect', () => {
        console.log('connect successed');
        // this.init();
      });

      /** 获取所有未读消息数量 然后根据这个数量 并发从服务器获取所有离线消息 */
      this.socket.on(
        'offline-msg-counts',
        (data: number, callback: (...args: any[]) => void) => {
          // counts = data;
          console.log(data);
          callback({ code: 200 });
        }
      );

      this.socket.on('error', (error: any) => {
        console.log(error);
      });
    } catch (error) {
      console.log(4444444444444);
      console.log(error);
    }
  }

  init = () => {
    // this.login();
    // this.regist();
  };

  invoke = (type: string, args: Buffer): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'invoke',
        {
          type,
          args,
        },
        (res: Buffer) => {
          resolve(getAckResfromProto(res));
        }
      );
    });
  };

  regist = (operate: string) => {};
}

export default () => {
  return IM.getInstance();
};
