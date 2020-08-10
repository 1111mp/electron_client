import * as React from 'react';
import { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';
import { inject, observer } from 'mobx-react';
import AppHeader from 'components/header';
import { Button, Layout } from 'antd';
import { CUSTOMWIN } from 'app/config';

const styles = require('./home.scss');

const { Header, Sider, Content } = Layout;

@inject((stores: IAnyObject) => {
  return {
    routerStore: stores.routerStore,
  };
})
@observer
export default class Home extends BasicComponent<IAnyObject> {
  // props: IAnyObject;

  confirm = (): void => {
    this.$confirm('是否确认清空所有消息？', '清空消息').then(() => {
      console.log('点击确认')
    }, (err) => {
      console.log(err)
      console.log('点击取消')
    });
  }

  customWin = (): void => {
    this.$open({
      ...CUSTOMWIN,
      url: this.$addUrlQuery(CUSTOMWIN.url),
    });
  }

  browser = () => {
    this.$openBrowser('https://www.baidu.com');
  }

  notifyHandle = () => {
    this.$send('notify')
  }

  $render(): JSX.Element {
    return (
      <Fragment>
        <Layout className={styles.layout}>
          <Header>
            <AppHeader />
          </Header>
          <Layout>
            <Sider width="128">
            </Sider>
            <Content>
              <h2>Home</h2>
              <Button type="primary" onClick={this.confirm}>confirm</Button>
              <Button type="primary" onClick={this.customWin}>customWin</Button>
              <Button type="primary" onClick={this.browser}>browser</Button>
              <Button type="primary" onClick={this.notifyHandle}>notify</Button>
            </Content>
          </Layout>
        </Layout>
      </Fragment>
    );
  }
}
