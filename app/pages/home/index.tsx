import * as React from 'react';
import { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';
import { inject, observer } from 'mobx-react';
import { renderRoutes } from 'react-router-config';

import { Layout, Empty } from 'antd';
import RoomList from '../roomList';

const styles = require('./home.scss');

const { Sider, Content } = Layout;

@inject((stores: IAnyObject) => {
  return {
    location: stores.routerStore.location || {},
    user: stores.user,
    setting: stores.Setting,
  };
})
@observer
export default class Home extends BasicComponent<IAnyObject> {
  $render(): JSX.Element {
    const { route, location, user, setting } = this.props;
    const { pathname } = location;
    console.log(setting.theme);
    return (
      <Fragment>
        <Layout className={styles.layout}>
          <Layout>
            <Sider width="250">
              <RoomList />
              <input
                value={user.userId}
                onChange={(e) => {
                  user.userId = e.target.value;
                }}
              />
              <input
                value={setting.theme}
                onChange={(e) => {
                  setting.theme = e.target.value;
                }}
              />
              <p>{setting.theme}</p>
            </Sider>
            <Content>
              {pathname === '/index' ? (
                <div className={styles.empty_content}>
                  <Empty
                    description={false}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : null}
              {renderRoutes(route.routes)}
            </Content>
          </Layout>
        </Layout>
      </Fragment>
    );
  }
}
