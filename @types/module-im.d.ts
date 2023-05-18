import { ModuleIMCommon } from 'App/renderer/socket/enums';

declare global {
  namespace ModuleIM {
    namespace Core {
      interface AckResponse {
        statusCode: HttpStatus;
        message?: string;
      }

      type MessageBasic = {
        id?: bigint;
        msgId: string;
        type: ModuleIMCommon.MsgType;
        sender: number;
        senderInfo: DB.SenderInfo;
        groupId?: number;
        receiver: number; // userId or groupId
        content: string;
        timer: string;
        ext?: string; // reserved field
      };

      type MessageRead = {
        id: string;
        session: ModuleIMCommon.Session;
        sender: number;
        receiver: number; // userId or groupId
        status: ModuleIMCommon.MsgStatus;
      };

      type Notify = {
        id: string;
        type: ModuleIMCommon.Notifys;
        sender: DB.SenderInfo;
        receiver: number;
        status: ModuleIMCommon.NotifyStatus;
        timer: string;
        remark?: string;
        ext?: string;
      };

      type Group = {
        id: number;
        name: string;
        avatar?: string;
        type: ModuleIMCommon.GroupType;
        creator: number;
        createdAt?: string;
        updatedAt?: string;
      };

      type Room = {
        owner: number;
        type: ModuleIMCommon.MsgType;
        groupId?: number;
        sender: number;
        receiver: number;
        content: string;
        timer: string;
      };
    }
  }
}
