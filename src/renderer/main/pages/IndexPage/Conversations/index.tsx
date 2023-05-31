import './styles.scss';

import { memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Avatar, Badge, Input } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';

const Item = memo(() => {
  const navigate = useNavigate();

  const onConversationEnter = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate('/index/conversation/10007');
  };

  return (
    <li className="module-conversations-wrapper" onClick={onConversationEnter}>
      <Avatar size={40} icon={<UserOutlined />} />
      <div className="module-conversations-info">
        <span className="module-conversations-info-name">张逸凡</span>
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
        ALL CHATS <span>39</span>
      </p>
      <ul className="module-conversations-container" onClick={emptyAreaHandler}>
        <Item />
      </ul>
    </>
  );
});
