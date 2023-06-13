import { makeAutoObservable } from 'mobx';
import { getIMSocketInstance } from 'Renderer/socket';
import Config from 'Renderer/config';

export default class Conversations {
  private socket;
  private userId: number;
  conversations: Array<ModuleIM.Core.ConversationWithAllType> = [];

  constructor() {
    const { userId, token } = window.Context.getUserInfo();
    this.userId = userId;
    this.socket = getIMSocketInstance(Config.imSocketUrl, {
      optionsForSocket: {
        path: '/socket/v1/IM/',
        // transports: ['websocket'],
        // https://socket.io/zh-CN/docs/v4/client-options/#extraheaders
        extraHeaders: { userid: `${userId}`, authorization: token },
      },
      onMessage: this.onMessage,
    });

    makeAutoObservable(this, {}, { autoBind: true });

    this.initial();
  }

  get count() {
    return this.conversations.length;
  }

  async initial() {
    const { userId } = window.Context.getUserInfo();
    this.conversations = await window.Context.sqlClient.getConversationsWithAll(
      userId
    );
  }

  async createP2P(
    conversation: Omit<
      ModuleIM.Core.ConversationType,
      'id' | 'lastReadAck' | 'active_at'
    > & {
      id?: string;
      lastReadAck?: bigint;
      active_at?: number;
    }
  ) {
    const index = this.conversations.findIndex(
      ({ sender, receiver }) =>
        sender === conversation.sender && receiver === conversation.receiver
    );

    if (index !== -1) {
      // exist update active_at
      const active_at = Date.now();
      const { id } = this.conversations[index];
      this.conversations[index].active_at = active_at;
      this.conversations.unshift(this.conversations.splice(index, 1)[0]);

      await window.Context.sqlClient.updateConvActiveAtWithValue(id, active_at);
      return;
    }

    await window.Context.sqlClient.createConversation(conversation);
    this.initial();
  }

  getActivedConversation(sender: number) {
    return this.conversations.find(
      (conversation) => sender === conversation.sender
    );
  }

  async updateLastRead(id: string, lastRead: bigint) {
    const index = this.conversations.findIndex(
      ({ id: conversationId }) => conversationId === id
    );
    this.conversations[index].count = 0;

    window.Context.sqlClient.updateConversationLastRead(id, lastRead);
  }

  async sendMesssage(msg: ModuleIM.Core.MessageBasic) {
    return this.socket.sendMessage(msg);
  }

  // receive message handler
  onMessage(msg: ModuleIM.Core.MessageBasic) {
    console.log(msg);
    const { id, msgId, sender, senderInfo, type, timer } = msg;
    window.Context.sqlClient.setMessage(this.userId, msg);
  }
}
