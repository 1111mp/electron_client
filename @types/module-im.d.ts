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
        senderInfo?: DB.SenderInfo;
        groupId?: number;
        receiver: number; // userId or groupId
        content: string;
        timer: number;
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
        timer: number;
        remark?: string;
        ext?: string;
      };

      type GroupBasic = {
        id: number;
        name: string;
        avatar?: string;
        type: ModuleIMCommon.GroupType;
        creator: number;
        count: number;
        createdAt?: string;
        updatedAt?: string;
      };

      type ConversationType = {
        id: string;
        owner: number;
        groupId?: number;
        sender: number;
        receiver: number;
        lastReadAck: bigint;
        active_at: number;
      };

      type ConversationWithAllType = ModuleIM.Core.ConversationType & {
        count: number;
        info: ModuleIM.Core.GroupBasic | DB.UserWithFriendSetting;
      } & { lastMessage: ModuleIM.Core.MessageBasic };
    }
  }
}
