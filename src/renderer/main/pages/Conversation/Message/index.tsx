import './styles.scss';

import { memo } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ModuleIMCommon } from 'App/renderer/socket/enums';
import { isSameDay, showTime } from 'App/renderer/utils/date';
import { MessageText } from './MessageText';
import { MessageImage } from './MessageImage';

export enum Positions {
  Left = 'left',
  Right = 'right',
}

type Props = {
  currentMessage: ModuleIM.Core.MessageBasic;
  previousMessage: ModuleIM.Core.MessageBasic;
  position: Positions;
  measure: () => void;
};

export const Message: React.FC<Props> = memo(
  ({ position, currentMessage, previousMessage, measure }) => {
    const { type, sender } = currentMessage;

    const renderMessage = () => {
      switch (type) {
        case ModuleIMCommon.MsgType.Text:
          return (
            <MessageText currentMessage={currentMessage} measure={measure} />
          );
        case ModuleIMCommon.MsgType.Image:
          return (
            <MessageImage currentMessage={currentMessage} measure={measure} />
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ paddingBottom: 16 }}>
        {currentMessage &&
        !isSameDay(currentMessage.timer, previousMessage.timer) ? (
          <div className="module-message-time">
            {showTime(currentMessage.timer)}
          </div>
        ) : null}
        <div className={`module-message module-message__${position}`}>
          {position === Positions.Left ? (
            <Avatar
              size="large"
              icon={<UserOutlined />}
              style={{ marginRight: 12 }}
            />
          ) : null}
          <div className="module-message-container">{renderMessage()}</div>
          {position === Positions.Right ? (
            <Avatar
              size="large"
              icon={<UserOutlined />}
              style={{ marginLeft: 12 }}
            />
          ) : null}
        </div>
      </div>
    );
  }
);
