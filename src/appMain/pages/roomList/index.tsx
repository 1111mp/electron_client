import './styles.scss';

import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { useTargetStore } from 'appMain/stores';
import Header from './header';
import RoomItem from 'appMain/parts/roomItem';

const RoomList: React.FC = observer(() => {
  const routerStore = useTargetStore('routerStore');

  const checkRoom = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      routerStore.push('/index/chat');
    },
    [routerStore.location]
  );

  const emptyAreaHandler = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      routerStore.location.pathname !== 'index' &&
        routerStore.replace('/index');
    },
    [routerStore.location]
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
