const { messagepackage } = require('../../proto/proto');
const { AckResponse } = messagepackage;

export function promiseRace(promise: Promise<any>, timer: number = 3000) {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ code: 408 });
    }, timer);
  });

  return Promise.race([promise, timeout]);
}

export function getAckResfromProto(
  buffer: Buffer
): { code: number; msg: string } {
  const decodedMessage = AckResponse.decode(buffer);
  return AckResponse.toObject(decodedMessage, {
    longs: String,
    enums: String,
    bytes: String,
  });
}
