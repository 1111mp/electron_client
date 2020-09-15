import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';

import Header from './header';
import RoomItem from 'components/roomItem';

const styles = require('./styles.scss');

@inject((stores: IAnyObject) => {
  return {
    routerStore: stores.routerStore,
  };
})
@observer
export default class RoomList extends Component<IAnyObject> {
  checkRoom = () => {
    console.log(111111111);
    const { routerStore } = this.props;
    routerStore.push('/index/chat')
  };

  render() {
    return (
      <Fragment>
        <Header />
        <ul className={styles.room_list}>
          <RoomItem clickHandler={this.checkRoom} />
        </ul>
      </Fragment>
    );
  }
}
