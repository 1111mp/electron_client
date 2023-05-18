import { io as SocketIO } from 'socket.io-client';
import {
  setAckToProto,
  setMessageToProto,
  getAckFromProto,
  getMessageFromProto,
  getNotifyFromProto,
} from 'App/protobuf';

import type { Socket, ManagerOptions, SocketOptions } from 'socket.io-client';
import { ModuleIMCommon } from './enums';
import { HttpStatus } from 'App/types';

type AckCallback = (resp: ArrayBuffer) => void;
type ProtoCallback = (resp: Uint8Array) => void;
type EventType = (buffer: Uint8Array, cb: ProtoCallback) => void;

type ListenEvents = Record<ModuleIMCommon.MessageEventNames, EventType>;
type EmitEvents = Record<
  ModuleIMCommon.MessageEventNames,
  (buffer: Uint8Array, cb: AckCallback) => void
>;

type IMSocketOptions = {
  optionsForSocket: Partial<ManagerOptions & SocketOptions>;
  onConnect?: () => void;
  onConnectError?: (err: Error) => void;
  onDisconnect?: (reason: Socket.DisconnectReason) => void;
  onNotify?: (notify: ModuleIM.Core.Notify) => void;
  onMessage?: (msg: ModuleIM.Core.MessageBasic) => void;
};

class IMSocket {
  static instance?: IMSocket;

  static getInstance(url: string, options: IMSocketOptions) {
    if (!IMSocket.instance) IMSocket.instance = new IMSocket(url, options);

    return IMSocket.instance;
  }

  private io: Socket<ListenEvents, EmitEvents>;

  constructor(
    private readonly url: string,
    private readonly options: IMSocketOptions
  ) {
    this.io = SocketIO(url, options.optionsForSocket);

    this.io.on('connect', () => {
      this.options.onConnect && this.options.onConnect();
    });

    this.io.on('connect_error', (err) => {
      console.log(err);
      this.options.onConnectError && this.options.onConnectError(err);
    });

    this.io.on('disconnect', (reason: Socket.DisconnectReason) => {
      console.log(reason);
      this.options.onDisconnect && this.options.onDisconnect(reason);
    });

    this.initialize();
  }

  public isConnected() {
    return this.io.connected;
  }

  public connect() {
    this.io.connect();
  }

  public disconnect() {
    this.io.disconnect();
  }

  // initialize handler
  private initialize() {
    // for notify
    this.io.on(ModuleIMCommon.MessageEventNames.Notify, this.onNotify);
    // for message
    this.io.on(ModuleIMCommon.MessageEventNames.Message, this.onMessage);
  }

  // event: on-notify
  private onNotify: EventType = (buffer, callback) => {
    const notify = getNotifyFromProto(buffer);

    this.options.onNotify && this.options.onNotify(notify);

    const respBuffer = setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successfully.',
    });

    callback(respBuffer);
  };

  // event: on-message
  private onMessage: EventType = (buffer, callback) => {
    const message = getMessageFromProto(new Uint8Array(buffer));

    this.options.onMessage && this.options.onMessage(message);

    const respBuffer = setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successfully.',
    });

    callback(respBuffer);
  };

  /**
   * @description: Send a text message
   * @param msg Omit<ModuleIM.Core.MessageBasic, 'sender'> & { sender: number }
   * @return Promise<ModuleIM.Core.AckResponse>
   */
  public sendMessage(msg: Omit<ModuleIM.Core.MessageBasic, 'senderInfo'>) {
    const buffer = setMessageToProto(msg);
    return this.send(ModuleIMCommon.MessageEventNames.Message, buffer);
  }

  private send(
    evtName: ModuleIMCommon.MessageEventNames,
    buffer: Uint8Array,
    timer: number = 6000 // milliseconds
  ): Promise<ModuleIM.Core.AckResponse> {
    return new Promise((resolve) => {
      this.io.timeout(timer).emit(evtName, buffer, (err, respBuffer) => {
        if (err) {
          resolve({
            statusCode: HttpStatus.REQUEST_TIMEOUT,
            message: 'timeout',
          });
        }
        const resp = getAckFromProto(new Uint8Array(respBuffer));

        resolve(resp);
      });
    });
  }
}

export function getIMSocketInstance(url: string, options: IMSocketOptions) {
  return IMSocket.getInstance(url, options);
}
