import './styles.scss';

import React, { Fragment } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTargetStore } from 'appMain/stores';
import Header from './header';
import RoomItem from 'appMain/parts/roomItem';

const RoomList: React.FC = observer(() => {
  const history = useHistory();
  const location = useLocation();

  const checkRoom = (event: React.MouseEvent) => {
    event.stopPropagation();
    history.push('/index/chat');
  };

  const emptyAreaHandler = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      location.pathname !== 'index' && history.replace('/index');
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
