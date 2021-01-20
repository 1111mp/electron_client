import './styles.scss';

import React from 'react';

const MessageText: React.FC<IAnyObject> = ({ currentMessage }) => {
  return <p className="message-content">{currentMessage.content}</p>;
};

export default MessageText;
