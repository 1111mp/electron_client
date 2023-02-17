import { ModuleIMCommon } from 'App/renderer/socket/enums';

declare global {
  namespace ModuleIM {
    namespace Core {
      interface AckResponse {
        statusCode: HttpStatus;
        message?: string;
      }

      type MessageBasic = {
        id: string;
        session: ModuleIMCommon.Session;
        sender: number;
        receiver: number; // userId or groupId
        status: ModuleIMCommon.MsgStatus;
        timer: string;
        ext?: string; // reserved field
      };

      type MessageBasicForReceived = {
        id: string;
        session: ModuleIMCommon.Session;
        sender: DB.SenderInfo;
        receiver: number; // userId or groupId
        status: ModuleIMCommon.MsgStatus;
        timer: string;
        ext?: string; // reserved field
      };

      type MessageText = MessageBasic & {
        type: ModuleIMCommon.MsgType.Text;
        text: string;
      };

      type MessageTextForReceived = MessageBasicForReceived & {
        type: ModuleIMCommon.MsgType.Text;
        text: string;
      };

      type MessageImage = MessageBasic & {
        type: ModuleIMCommon.MsgType.Image;
        image: string;
      };

      type MessageAll = MessageText | MessageImage;

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
    }
  }
}
