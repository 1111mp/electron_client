import './styles.scss';

import React from 'react';

const SystemMessage: React.FC<IAnyObject> = ({ currentMessage }) => {
  if (currentMessage) {
    return (
      <div className="system_message-wrapper">
        <span>{currentMessage.system}</span>
      </div>
    );
  }
  return null;
};

export default SystemMessage;
