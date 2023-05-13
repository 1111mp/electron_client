import { useEffect } from 'react';

type Props = {
  currentMessage: ModuleIM.Core.MessageBasic;
  measure: () => void;
};

export const MessageImage: React.FC<Props> = ({ currentMessage, measure }) => {
  useEffect(() => {
    Promise.resolve().then(() => {
      measure && measure();
    });
  }, []);

  return (
    <img
      onLoad={measure}
      src={currentMessage.content}
      // width={currentMessage.image.width}
      // height={currentMessage.image.height}
      alt="" /** onDoubleClick={this._onDoubleClick} */
    />
  );
};
