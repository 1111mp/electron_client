import * as React from 'react';
import { Component, Fragment } from 'react';
import { Layout } from 'antd';
import AppHeader from "components/header";
import { renderRoutes } from "react-router-config";

// import './app.scss';
const styles = require('./app.scss');

const { Header, Sider, Content } = Layout;

type Props = {
  route: any
};

export default class App extends Component<Props> {
  props: Props;

  render(): JSX.Element {
    const { route } = this.props;
    return (
      <Fragment>
        <Layout className={styles.layout}>
          <Header className={styles.header}>
            <AppHeader />
          </Header>
          <Layout>
            <Sider className={styles.slider}>Sider</Sider>
            <Content>
              {/* child routes won't render without this */}
              {renderRoutes(route.routes)}
            </Content>
          </Layout>
        </Layout>
      </Fragment>
    );
  }
}
