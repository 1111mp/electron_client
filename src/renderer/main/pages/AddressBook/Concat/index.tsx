import './styles.scss';

import { observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Space } from 'antd';
import {
  UserOutlined,
  WechatOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

import { useTargetStore } from 'App/renderer/main/stores';

type Props = {
  info?: DB.UserWithFriendSetting;
};

export const Concat: React.FC<Props> = observer(({ info }) => {
  const navigate = useNavigate();

  const { user } = useTargetStore('userStore');
  const { createP2P } = useTargetStore('conversationStore');

  if (!info) return null;

  const { id, account, remark } = info;

  const onSendMessage = async () => {
    const { userId } = user;
    await createP2P({
      owner: userId,
      sender: id,
      receiver: userId,
    });

    navigate(`/index/conversation/${id}`);
  };

  return (
    <div className="module-concat">
      <Space size={12}>
        <Avatar size={64} icon={<UserOutlined />} />
        <p>{remark ? remark : account}</p>
      </Space>
      <div className="module-concat-footer">
        <Button
          className="module-concat-btn"
          type="link"
          icon={<WechatOutlined style={{ fontSize: 28 }} />}
          onClick={onSendMessage}
        >
          <span style={{ fontSize: 10 }}>发消息</span>
        </Button>
        <Button
          className="module-concat-btn"
          type="link"
          icon={<PhoneOutlined style={{ marginBottom: 4, fontSize: 24 }} />}
        >
          <span style={{ fontSize: 10 }}>语音通话</span>
        </Button>
        <Button
          className="module-concat-btn"
          type="link"
          icon={
            <VideoCameraOutlined style={{ marginBottom: 4, fontSize: 24 }} />
          }
        >
          <span style={{ fontSize: 10 }}>视频通话</span>
        </Button>
      </div>
    </div>
  );
});
