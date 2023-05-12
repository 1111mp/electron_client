import './styles.scss';

import React from 'react';
import { isSameDay, showTime } from 'Renderer/utils/date';

type Props = {
  currentMessage: any;
  previousMessage: any;
};

const Day: React.FC<Props & any> = ({ currentMessage, previousMessage }) => {
  if (currentMessage && !isSameDay(currentMessage.time, previousMessage.time)) {
    return <div className="day-wrapper">{showTime(currentMessage.time)}</div>;
  }
  return null;
};

export default Day;
