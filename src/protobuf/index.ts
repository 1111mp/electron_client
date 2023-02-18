import {
  AckMessage,
  Notify,
  MessageTextForSender,
  MessageTextForReceived,
  MessageImageForSender,
  MessageImageForReceived,
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
  return Notify.decode(buffer);
}

export function setMessageTextToProto(messageText: ModuleIM.Core.MessageText) {
  const message = new MessageTextForSender(messageText);
  console.log(message);
  return MessageTextForSender.encode(message).finish();
}

export function getMessageTextFromProto(buffer: Uint8Array) {
  return MessageTextForReceived.decode(buffer);
}

export function setMessageImageToProto(
  messageImage: ModuleIM.Core.MessageImage
) {
  const message = new MessageImageForSender(messageImage);
  return MessageImageForSender.encode(message).finish();
}

export function getMessageImageFromProto(buffer: Uint8Array) {
  return MessageImageForReceived.decode(buffer);
}
