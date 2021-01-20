import './styles.scss';

import React, { Fragment } from 'react';
import Day from '../day';
import SystemMessage from '../systemMessage';
import MessageText from '../messageText';
import MessageImage from '../messageImage';

interface Props {
  currentMessage?: any;
  position?: string;
  previousMessage?: any;
  nextMessage?: any;
  user?: any;
  chatType?: 'p2p' | 'group' | 'room';
  shouldUpdateMessage?: (props: any, nextProps: any) => boolean;
}

const Message: React.FC<Props> = React.memo((props) => {
  const { currentMessage, position } = props;
  const { user } = currentMessage;

  const renderDay = () => {
    if (currentMessage && currentMessage.time) {
      return <Day {...props} />;
    }
    return null;
  };

  const renderSystemMessage = () => {
    return <SystemMessage {...props} />;
  };

  const renderBubble = () => {
    if (currentMessage && currentMessage.image) {
      const { ...messageImageProps } = props;
      return <MessageImage {...messageImageProps} />;
    }
    if (currentMessage && currentMessage.content) {
      const { ...messageTextProps } = props;
      return <MessageText {...messageTextProps} />;
    }
    return null;
  };

  return (
    <Fragment>
      {renderDay()}
      {currentMessage.system ? (
        renderSystemMessage()
      ) : (
        <div
          className={`message-wrapper ${
            position === 'right' ? 'right' : 'left'
          }`}
        >
          {position === 'left' ? (
            <p
              className="message-avatar"
              style={
                user.avatar ? { backgroundImage: `url(${user.avatar})` } : {}
              }
            ></p>
          ) : null}
          <div className="message-container">{renderBubble()}</div>
          {position === 'right' ? (
            <p
              className="message-avatar"
              style={
                user.avatar ? { backgroundImage: `url(${user.avatar})` } : {}
              }
            ></p>
          ) : null}
        </div>
      )}
    </Fragment>
  );
});

export default Message;
