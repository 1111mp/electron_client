import {
  AckMessage,
  Notify,
  MessageForSender,
  MessageForReceived,
} from './proto';

export function setAckToProto(resp: ModuleIM.Core.AckResponse) {
  const message = new AckMessage(resp);
  return AckMessage.encode(message).finish();
}

export function getAckFromProto(buffer: Uint8Array) {
  return AckMessage.decode(buffer).toJSON() as ModuleIM.Core.AckResponse;
}

export function setNotifyToProto(notify: ModuleIM.Core.Notify) {
  const message = new Notify(notify);
  return Notify.encode(message).finish();
}

export function getNotifyFromProto(buffer: Uint8Array) {
  return Notify.decode(buffer).toJSON() as ModuleIM.Core.Notify;
}

export function setMessageToProto(
  msg: Omit<ModuleIM.Core.MessageBasic, 'senderInfo'>
) {
  const message = new MessageForSender(msg);
  return MessageForSender.encode(message).finish();
}

export function getMessageFromProto(buffer: Uint8Array) {
  return MessageForReceived.decode(
    buffer
  ).toJSON() as ModuleIM.Core.MessageBasic;
}
