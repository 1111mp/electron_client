import './styles.scss';

import * as React from 'react';
import { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';
import { inject, observer } from 'mobx-react';
import { renderRoutes } from 'react-router-config';

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
  openBrowser = () => {
    this.$openBrowser('https://www.baidu.com')
  };

  $render(): JSX.Element {
    const { route, location } = this.props;
    const { pathname } = location;
    return (
      <Fragment>
        <div className="module-home">
          <div className="module-home-sider">
            <RoomList />
            <p onClick={this.openBrowser}>browser</p>
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
