import * as React from 'react';
import { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';
import { inject, observer } from 'mobx-react';
import AppHeader from 'components/header';
import { Button, Layout } from 'antd';

const styles = require('./home.scss');

const { Header, Sider, Content } = Layout;

@inject((stores: IAnyObject) => {
  return {
    routerStore: stores.routerStore,
  };
})
@observer
export default class Home extends BasicComponent<IAnyObject> {
  props: IAnyObject;

  confirm = (): void => {
    this.$confirm('是否确认清空所有消息？', '清空消息').then(() => {

    }, (err) => {
      console.log(err)
      console.log('点击取消')
    });
  }

  $render(): JSX.Element {
    return (
      <Fragment>
        <Layout className={styles.layout}>
          <Header className={styles.header}>
            <AppHeader />
          </Header>
          <Layout>
            <Sider className={styles.slider}>
            </Sider>
            <Content>
              <h2>Home</h2>
              <Button type="primary" onClick={this.confirm}>confirm</Button>
            </Content>
          </Layout>
        </Layout>
      </Fragment>
    );
  }
}
