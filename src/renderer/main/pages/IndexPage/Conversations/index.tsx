import './styles.scss';

import { memo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Avatar, Badge, Input } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { useTargetStore } from 'App/renderer/main/stores';
import classNames from 'classnames';

type Props = {
  conversation: ModuleIM.Core.ConversationType & {
    info: DB.UserWithFriendSetting | ModuleIM.Core.GroupBasic;
  } & {
    lastMessage?: ModuleIM.Core.MessageBasic;
  };
};

const Item: React.FC<Props> = memo(({ conversation }) => {
  console.log(conversation);
  const { groupId, info, receiver, active_at } = conversation;
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
    navigate(`/index/conversation/${receiver}`);
  };

  return (
    <li
      className={classNames('module-conversations-wrapper', {
        'module-conversations-wrapper__active': id === `${receiver}`,
      })}
      onClick={onConversationEnter}
    >
      <Avatar size={40} icon={<UserOutlined />} />
      <div className="module-conversations-info">
        <span className="module-conversations-info-name">{getName()}</span>
        <span className="module-conversations-info-desc">
          你可以在这个对话中为自己添加笔记。
          如果您的帐户有任何连接设备，新的笔记将同步。
        </span>
      </div>
      <div className="module-conversations-extra">
        <span className="module-conversations-extra-timer">11:41 am</span>
        <span className="module-conversations-extra-count">
          <Badge count={5} />
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
      location.pathname !== 'index' && navigate('/index', { replace: true });
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
          <Item key={conversation.id} conversation={conversation} />
        ))}
      </ul>
    </>
  );
});
