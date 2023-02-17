import { io as SocketIO } from 'socket.io-client';
import {
  setAckToProto,
  setMessageImageToProto,
  setMessageTextToProto,
  getAckFromProto,
  getMessageImageFromProto,
  getMessageTextFromProto,
  getNotifyFromProto,
} from 'App/protobuf';

import type { Socket, ManagerOptions, SocketOptions } from 'socket.io-client';
import { ModuleIMCommon } from './enums';

type AckCallback = (resp: ArrayBuffer) => void;
type ProtoCallback = (resp: Uint8Array) => void;
type EventType = (buffer: Uint8Array, cb: ProtoCallback) => void;

type ListenEvents = {
  [ModuleIMCommon.MessageEventNames.Notify]: EventType;
  [ModuleIMCommon.MessageEventNames.MessageText]: EventType;
  [ModuleIMCommon.MessageEventNames.MessageImage]: EventType;
};
type EmitEvents = {
  [ModuleIMCommon.MessageEventNames.MessageText]: (
    buffer: Uint8Array,
    cb: AckCallback
  ) => void;
  [ModuleIMCommon.MessageEventNames.MessageImage]: (
    buffer: Uint8Array,
    cb: AckCallback
  ) => void;
};

type IMSocketOptions = {
  optionsForSocket: Partial<ManagerOptions & SocketOptions>;
  onConnect?: () => void;
  onConnectError?: (err: Error) => void;
  onDisconnect?: (reason: Socket.DisconnectReason) => void;
  onNotify?: (notify: ModuleIM.Core.Notify) => void;
  onMessageText?: (msg: ModuleIM.Core.MessageTextForReceived) => void;
  onMessageImage?: (msg: ModuleIM.Core.MessageImage) => void;
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
    console.log(url);
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
    // for text message
    this.io.on(
      ModuleIMCommon.MessageEventNames.MessageText,
      this.onMessageText
    );
    // for image message
    this.io.on(
      ModuleIMCommon.MessageEventNames.MessageImage,
      this.onMessageImage
    );
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

  // event: on-message:text
  private onMessageText: EventType = (buffer, callback) => {
    const message = getMessageTextFromProto(buffer);

    this.options.onMessageText && this.options.onMessageText(message);

    const respBuffer = setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successfully.',
    });

    callback(respBuffer);
  };

  // event: on-message:image
  private onMessageImage: EventType = (buffer, callback) => {
    const message = getMessageImageFromProto(buffer);

    this.options.onMessageImage && this.options.onMessageImage(message);

    const respBuffer = setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successfully.',
    });

    callback(respBuffer);
  };

  /**
   * @description: Send a text message
   * @param msg ModuleIM.Core.MessageText
   * @return Promise<ModuleIM.Core.AckResponse>
   */
  public sendMessageText(msg: ModuleIM.Core.MessageText) {
    const buffer = setMessageTextToProto(msg);
    return this.send(ModuleIMCommon.MessageEventNames.MessageText, buffer);
  }

  /**
   * @description: Send a image message
   * @param msg ModuleIM.Core.MessageImage
   * @return Promise<ModuleIM.Core.AckResponse>
   */
  public sendMessageImage(msg: ModuleIM.Core.MessageImage) {
    const buffer = setMessageImageToProto(msg);
    return this.send(ModuleIMCommon.MessageEventNames.MessageText, buffer);
  }

  private send(
    evtName:
      | ModuleIMCommon.MessageEventNames.MessageText
      | ModuleIMCommon.MessageEventNames.MessageImage,
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

        resolve(resp.toJSON() as ModuleIM.Core.AckResponse);
      });
    });
  }
}

export function getIMSocketInstance(url: string, options: IMSocketOptions) {
  return IMSocket.getInstance(url, options);
}
