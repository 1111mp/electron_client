import { useEffect } from 'react';

type Props = {
  currentMessage: ModuleIM.Core.MessageBasic;
  measure: () => void;
};

export const MessageText: React.FC<Props> = ({ currentMessage, measure }) => {
  useEffect(() => {
    Promise.resolve().then(() => {
      measure && measure();
    });
  }, []);

  return (
    <p className="module-message-container__text">{currentMessage.content}</p>
  );
};
