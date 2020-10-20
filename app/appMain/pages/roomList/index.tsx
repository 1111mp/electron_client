import './styles.scss';

import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { useTargetStore } from 'appMain/stores/hooks';
import Header from './header';
import RoomItem from 'components/roomItem';

const RoomList: React.FC = observer(() => {
  const routerStore = useTargetStore('routerStore');

  const checkRoom = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      routerStore.push('/index/chat');
    },
    [routerStore]
  );

  const emptyAreaHandler = React.useCallback(() => {
    routerStore.replace('/index');
  }, [routerStore]);

  return (
    <Fragment>
      <Header />
      <ul className="room_list" onClick={emptyAreaHandler}>
        <RoomItem clickHandler={checkRoom} />
      </ul>
    </Fragment>
  );
});

export default RoomList;
