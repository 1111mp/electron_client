import './styles.scss';

import * as React from 'react';
import { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';
import { inject, observer } from 'mobx-react';
import { renderRoutes } from 'react-router-config';
import listener from 'app/constants/listener.json';

import RoomList from '../roomList';
import Empty from 'components/empty';

const themes = [
  { label: '系统', value: 'system' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
];

@inject((stores: IAnyObject) => {
  return {
    location: stores.routerStore.location || {},
  };
})
@observer
export default class Home extends BasicComponent<IAnyObject> {
  // invokeEvent = () => {
  //   this.$registEvent('get_name', this.getName);
  // };

  // revokeEvent = () => {
  //   this.$revokeEvent('get_name', this.getName);
  // };

  // openBrowser = () => {
  //   this.$openBrowser('https://www.baidu.com');
  // };

  // getName = (data: any) => {
  //   console.log('namenamenamenamename');
  //   console.log(data);
  //   console.log(this.invokeEvent);
  // };
  didMount() {
    // console.log(this.$sendSync(listener.GET_DATA, 'ping'));
    this.$invoke(listener.GET_DATA_ASYNC, 'pingsss').then((res) => {
      console.log(res);
    }, err => {
      console.log(11111111)
      console.log(err)
    });
  }

  $render(): JSX.Element {
    const { route, location } = this.props;
    const { pathname } = location;
    return (
      <Fragment>
        <div className="module-home">
          <div className="module-home-sider">
            <RoomList />
          </div>
          <div className="module-home-content">
            {pathname === '/index' ? <Empty /> : null}
            {renderRoutes(route.routes)}
          </div>
        </div>
      </Fragment>
    );
  }
}
