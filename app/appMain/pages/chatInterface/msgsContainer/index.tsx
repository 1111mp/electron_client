import './styles.scss';

import React, { Component, Fragment } from 'react';
import Message from './message';
import _ from 'lodash';

interface Props {
  userId?: number;
  messages?: any[];
  chatType?: 'p2p' | 'group' | 'room';
  hasMore?: boolean;
  fetchMore?: VoidFunction;
  loading?: boolean;
}
export default class MsgsContainer extends Component<Props> {
  static defaultProps = {
    messages: [],
    hasMore: false,
  };

  render() {
    const { messages, chatType } = this.props;
    return (
      <Fragment>
        <p className="module-message-loading">loading...</p>
        <div className="msgs_content-wrapper" ref="scrollContent">
          {messages &&
            messages.map((item: any, index: number) => {
              if (!item.user) {
                item.user = { userId: -1 };
              }
              const previousMessage = messages[index - 1] || {};
              const nextMessage = messages[index - 1] || {};
              const messageProps: any = {
                ...item,
                chatType,
                currentMessage: item,
                previousMessage,
                nextMessage,
                position: item.user.userId === 1 ? 'right' : 'left',
                user: item.user,
              };
              return <Message key={item.msgId} {...messageProps} />;
            })}
        </div>
      </Fragment>
    );
  }
}
