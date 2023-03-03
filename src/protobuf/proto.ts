import { Message, Type, Field } from 'protobufjs/light';
import { ModuleIMCommon } from 'App/renderer/socket/enums';

@Type.d()
export class AckMessage extends Message<AckMessage> {
  @Field.d(1, 'int32', 'required')
  public statusCode: HttpStatus;

  @Field.d(2, 'string', 'optional')
  public message: string;
}

class Sender extends Message<Sender> {
  @Field.d(1, 'int32', 'required')
  public id: number;

  @Field.d(2, 'string', 'required')
  public account: string;

  @Field.d(3, 'string', 'optional')
  public avatar: string;

  @Field.d(4, 'string', 'optional')
  public email: string;

  @Field.d(5, 'string', 'optional')
  public regisTime: string;

  @Field.d(6, 'string', 'optional')
  public updateTime: string;
}

// need keep same with ModuleIM.Common.Notifys
enum Notifys {
  AddFriend = 1,
  DelFriend,
}

// need keep same with ModuleIM.Common.NotifyStatus
enum NotifyStatus {
  Initial = 1,
  Received,
  Readed,
  Fulfilled,
  Rejected,
}

// need keep same with ModuleIM.Common.Session
enum Session {
  Single = 1,
  Group,
}

// need keep same with ModuleIM.Common.MsgStatus
enum MsgStatus {
  Initial = 1,
  Received,
  Readed,
}

// need keep same with ModuleIM.Common.MsgType
enum MsgType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
}

@Type.d()
export class Notify extends Message<Notify> {
  @Field.d(1, 'string', 'required')
  public id: string;

  @Field.d(2, Notifys, 'required')
  public type: ModuleIMCommon.Notifys;

  @Field.d(3, Sender)
  public sender: DB.SenderInfo;

  @Field.d(4, 'int32', 'required')
  public receiver: number;

  @Field.d(5, NotifyStatus, 'required')
  public status: ModuleIMCommon.NotifyStatus;

  @Field.d(6, 'string', 'required')
  public timer: string;

  @Field.d(7, 'string', 'required')
  public remark?: string;

  @Field.d(8, 'string', 'required')
  public ext?: string;
}

@Type.d()
export class MessageForSender extends Message<MessageForSender> {
  @Field.d(1, 'int64', 'optional')
  public id?: bigint;

  @Field.d(2, 'string', 'required')
  public msgId: string;

  @Field.d(3, 'int32', 'required')
  public sender: number;

  @Field.d(4, 'int32', 'optional')
  public groupId?: number;

  @Field.d(5, 'int32', 'required')
  public receiver: number;

  @Field.d(6, 'string', 'required')
  public type: ModuleIMCommon.MsgType;

  @Field.d(7, 'string', 'required')
  public content: string;

  @Field.d(8, 'string', 'required')
  public timer: string;

  @Field.d(9, 'string', 'optional')
  public ext?: string;
}

@Type.d()
export class MessageForReceived extends Message<MessageForReceived> {
  @Field.d(1, 'int64', 'required')
  public id: bigint;

  @Field.d(2, 'string', 'required')
  public msgId: string;

  @Field.d(3, Sender)
  public sender: DB.SenderInfo;

  @Field.d(4, 'int32', 'optional')
  public groupId?: number;

  @Field.d(5, 'int32', 'required')
  public receiver: number;

  @Field.d(6, 'string', 'required')
  public type: ModuleIMCommon.MsgType;

  @Field.d(7, 'string', 'required')
  public content: string;

  @Field.d(8, 'string', 'required')
  public timer: string;

  @Field.d(9, 'string', 'optional')
  public ext?: string;
}

@Type.d()
export class MessageRead extends Message<MessageRead> {
  @Field.d(1, 'string', 'required')
  public id: string;

  @Field.d(2, Session, 'required')
  public session: ModuleIMCommon.Session;

  @Field.d(3, 'int32', 'required')
  public sender: number;

  @Field.d(4, 'int32', 'required')
  public receiver: number;

  @Field.d(5, MsgStatus)
  public status: ModuleIMCommon.MsgStatus;
}
