import { IpcMainEvent } from 'electron';
import protobuf, { Root, Type } from 'protobufjs';

const path = require('path');

const listeners = require('../../constants/listener.json');

export default {
  [listeners.SEND_MESSAGE]() {
    return async (event: IpcMainEvent, msg: MessageInstance.Message) => {
      try {
        protobuf.load(path.resolve(__dirname, './message.proto'), function (
          err: Error | null,
          root?: Root
        ) {
          if (err) throw err;

          const Message: Type | undefined = root?.lookupType(
            'messagepackage.Message'
          );

          // const payload = { text };

          const errMsg = Message!.verify(msg);
          if (errMsg) throw Error(errMsg);

          const message = Message!.create(msg);

          const buffer = Message!.encode(message).finish();
          console.log(buffer);

          const decodedMessage = Message!.decode(buffer);
          console.log(decodedMessage);

          const object = Message!.toObject(decodedMessage, {
            longs: String,
            enums: String,
            bytes: String,
          });

          console.log(object);
        });
      } catch (error) {
        console.log(error);
      }
    };
  },
};
