import { makeAutoObservable } from 'mobx';

export default class Conversations {
  conversations: Array<
    ModuleIM.Core.ConversationType & {
      info: DB.UserWithFriendSetting | ModuleIM.Core.GroupBasic;
    } & {
      lastMessage?: ModuleIM.Core.MessageBasic;
    }
  > = [];

  constructor() {
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
}
