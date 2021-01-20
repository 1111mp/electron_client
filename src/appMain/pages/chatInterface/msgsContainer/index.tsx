import './styles.scss';

import React, { Fragment } from 'react';
import Message from './message';

interface Props {
  userId?: number;
  messages?: any[];
  chatType?: 'p2p' | 'group' | 'room';
  hasMore?: boolean;
  fetchMore?: VoidFunction;
  loading?: boolean;
}

const MsgsContainer: React.FC<Props> = ({ messages, chatType }) => {
  return (
    <Fragment>
      <p className="module-message-loading">loading...</p>
      <div className="msgs_content-wrapper">
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
            return <Message key={index} {...messageProps} />;
          })}
      </div>
    </Fragment>
  );
};

export default MsgsContainer;
