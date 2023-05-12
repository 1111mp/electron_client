import './styles.scss';

import { Fragment, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import Header from './header';
import RoomItem from 'Renderer/main/parts/roomItem';

const RoomList: React.FC = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const checkRoom = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate('/index/room/10007');
  };

  const emptyAreaHandler = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      location.pathname !== 'index' && navigate('/index', { replace: true });
    },
    [location]
  );

  return (
    <Fragment>
      <Header />
      <p className="chat-counts">
        ALL CHATS <span className="chat-counts-count">39</span>
      </p>
      <ul className="room_list" onClick={emptyAreaHandler}>
        <RoomItem clickHandler={checkRoom} />
        <RoomItem clickHandler={checkRoom} />
      </ul>
    </Fragment>
  );
});

export default RoomList;
