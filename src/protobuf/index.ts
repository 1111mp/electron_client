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
  return AckMessage.decode(buffer);
}

export function setNotifyToProto(notify: ModuleIM.Core.Notify) {
  const message = new Notify(notify);
  return Notify.encode(message).finish();
}

export function getNotifyFromProto(buffer: Uint8Array) {
  return Notify.decode(buffer).toJSON() as ModuleIM.Core.Notify;
}

export function setMessageToProto(
  messageText: Omit<ModuleIM.Core.MessageBasic, 'sender'> & { sender: number }
) {
  const message = new MessageForSender(messageText);
  return MessageForSender.encode(message).finish();
}

export function getMessageFromProto(buffer: Uint8Array) {
  return MessageForReceived.decode(
    buffer
  ).toJSON() as ModuleIM.Core.MessageBasic;
}
