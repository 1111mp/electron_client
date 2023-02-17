export namespace ModuleIMCommon {
  export enum GroupType {
    Basic = 1, // 200
    Big, // 2000
  }

  export enum MessageEventNames {
    Message = 'on-message',
    MessageText = 'on-message:text',
    MessageImage = 'on-message:image',
    Notify = 'on-notify',
    Read = 'on-message:read',
  }

  export enum Notifys {
    AddFriend = 1,
    DelFriend,
  }

  export enum NotifyStatus {
    Initial = 1,
    Received,
    Readed,
    Fulfilled,
    Rejected,
  }

  export enum Session {
    Single = 1,
    Group,
  }

  export enum MsgType {
    Text = 'text',
    Image = 'image',
    Video = 'video',
    Audio = 'audio',
  }

  export const enum MsgStatus {
    Initial = 1,
    Received,
    Readed,
  }
}
