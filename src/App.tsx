import React, { Fragment } from 'react';
import './App.scss';
import { Layout } from 'antd';
import Headers from '@/components/headers';

const { Header, Footer, Sider, Content } = Layout;

const App: React.FC = () => {
  return (
    <Fragment>
      <Layout style={{ height: '100%' }}>
        <Header className="appHeader">
          <Headers />
        </Header>
        <Layout>
          <Sider>Sider</Sider>
          <Content>Content</Content>
        </Layout>
        <Footer className="appFooter">Footer</Footer>
      </Layout>
    </Fragment>
  );
}

export default App;
