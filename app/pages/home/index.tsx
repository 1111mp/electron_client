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
  };
})
@observer
export default class Home extends BasicComponent<IAnyObject> {
  $render(): JSX.Element {
    const { route, location } = this.props;
    const { pathname } = location;

    return (
      <Fragment>
        <Layout className={styles.layout}>
          <Layout>
            <Sider width="250">
              <RoomList />
            </Sider>
            <Content>
              <div onClick={() => this.$openBrowser('https://www.baidu.com')}>
                sssssss
              </div>
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
