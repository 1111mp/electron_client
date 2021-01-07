import { IpcMainEvent } from 'electron';
import { promiseRace } from './utils';
import { IM } from './index';

const path = require('path');
const { messagepackage } = require('../../proto/proto');
const listeners = require('../../constants/listener.json');
const operates = require('./operate.json');

/** https://protobufjs.github.io/protobuf.js/
 *  Using generated static code
 */
const { Message: ProtoMessage } = messagepackage;

function setMessageToProto(msg: MessageInstance.Message): Buffer {
  const message = ProtoMessage.create(msg);
  return ProtoMessage.encode(message).finish();
}

function getMessagefromProto(buffer: Buffer): MessageInstance.Message {
  const decodedMessage = ProtoMessage.decode(buffer);
  return ProtoMessage.toObject(decodedMessage, {
    longs: String,
    enums: String,
    bytes: String,
  });
}

export default {
  [listeners.SEND_MESSAGE](IMInstance: IM) {
    return async (event: IpcMainEvent, msg: MessageInstance.Message) => {
      try {
        const messageProto = setMessageToProto(msg);
        const res = await promiseRace(
          IMInstance.invoke(operates.SEND_MESSAGE, messageProto),
          1000
        );
        console.log(res);
        if (res.code === 200) {
          Promise.resolve(res);
        } else {
          Promise.reject('Failed to send message.');
        }
      } catch (error) {
        Promise.reject('Failed to send message.');
      }
    };
  },
};
