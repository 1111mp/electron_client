declare namespace MessageInstance {
  type Message = {
    msgId: string;
    type: 0 | 1 | 2 | 3 | 4 | 5; // 0 text 1 image 2 video 3 audio
    sessionType: 0 | 1; // 0 单聊 1 群聊
    content: string;
    time?: any;
    status: 0 | 1 | 2 | 3 | 4; // 0 离线消息 1 服务端收到并转发出消息 2 接收者收到消息 未读 3 接收者收到消息 并已读 4 已删除
    sender: number;
    reciver: number; //接收者 userId or groupId
    ext?: string; // 预留字段 json string格式
  };
}
