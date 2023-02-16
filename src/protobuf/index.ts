import { AckMessage, Notify, MessageText, MessageImage } from './proto';

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
  const message = new MessageText(messageText);
  return MessageText.encode(message).finish();
}

export function getMessageTextFromProto(buffer: Uint8Array) {
  return MessageText.decode(buffer);
}

export function setMessageImageToProto(
  messageImage: ModuleIM.Core.MessageImage
) {
  const message = new MessageImage(messageImage);
  return MessageImage.encode(message).finish();
}

export function getMessageImageFromProto(buffer: Uint8Array) {
  return MessageImage.decode(buffer);
}
