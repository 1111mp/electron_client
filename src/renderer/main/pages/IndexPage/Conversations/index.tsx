import './styles.scss';

import { memo, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Avatar, Badge, Input } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { useTargetStore } from 'App/renderer/main/stores';
import classNames from 'classnames';

import { ModuleIMCommon } from 'App/renderer/socket/enums';
import { showTime } from 'App/renderer/utils/date';

type Props = {
  conversation: ModuleIM.Core.ConversationType & {
    count: number;
    info: DB.UserWithFriendSetting | ModuleIM.Core.GroupBasic;
  } & {
    lastMessage?: ModuleIM.Core.MessageBasic;
  };
};

const Item: React.FC<Props> = memo(({ conversation }) => {
  const {
    id: conversationId,
    count,
    groupId,
    info,
    sender,
    receiver,
    active_at,
    lastMessage,
  } = conversation;
  const navigate = useNavigate();
  const { id } = useParams();

  const getName = () => {
    if (groupId) {
      const { name } = info as ModuleIM.Core.GroupBasic;
      return name;
    }

    const { remark, account } = info as DB.UserWithFriendSetting;
    return remark ? remark : account;
  };

  const onConversationEnter = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/index/conversation/${sender}`);
  };

  const text: string = useMemo(() => {
    if (!lastMessage) return '';
    const { type, content } = lastMessage;
    switch (type) {
      case ModuleIMCommon.MsgType.Text:
        return content;
      case ModuleIMCommon.MsgType.Image:
        return '[图片]';
      case ModuleIMCommon.MsgType.Video:
        return '[视频]';
      case ModuleIMCommon.MsgType.Audio:
        return '[语音]';
      default:
        return '';
    }
  }, [lastMessage]);

  const timer: string = useMemo(() => {
    if (!lastMessage) return '';

    return showTime(lastMessage.timer);
  }, [lastMessage]);

  return (
    <li
      className={classNames('module-conversations-wrapper', {
        'module-conversations-wrapper__active': id === `${sender}`,
      })}
      onClick={onConversationEnter}
    >
      <Avatar size={40} icon={<UserOutlined />} />
      <div className="module-conversations-info">
        <span className="module-conversations-info-name">{getName()}</span>
        <span className="module-conversations-info-desc">{text}</span>
      </div>
      <div className="module-conversations-extra">
        <span className="module-conversations-extra-timer">{timer}</span>
        <span className="module-conversations-extra-count">
          <Badge count={count} />
        </span>
      </div>
    </li>
  );
});

export const Conversations: React.FC = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const { conversations, count } = useTargetStore('conversationStore');

  const emptyAreaHandler = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      location.pathname !== '/index' && navigate('/index', { replace: true });
    },
    [location]
  );

  return (
    <>
      <div className="module-conversations-header">
        <p className="module-conversations-header-placeholder"></p>
        <p className="module-conversations-header-search">
          <Input
            className="search_input"
            placeholder="search"
            size="small"
            allowClear={true}
            prefix={<SearchOutlined />}
          />
        </p>
      </div>
      <p className="module-conversations-count">
        ALL CHATS <span>{count}</span>
      </p>
      <ul className="module-conversations-container" onClick={emptyAreaHandler}>
        {conversations.map((conversation) => (
          <Item key={conversation.id} conversation={{ ...conversation }} />
        ))}
      </ul>
    </>
  );
});
