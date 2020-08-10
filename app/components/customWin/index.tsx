import * as React from 'react';
import { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';
import { Layout } from 'antd';

const { Header, Content } = Layout;
const styles = require('./customWin.scss');

interface Props {
  title?: string,
  enableMin?: boolean,
  enableDrag?: boolean,
  contentStyle?: object,
  close?: () => void | boolean
}

export default class CustomWin extends BasicComponent<Props> {
  static defaultProps = {
    enableMin: true,
    enableDrag: true
  }

  close = () => {
    const { close } = this.props;

    if (close && typeof close === 'function' && close() === false) return;
    this.$close();
  }

  $render() {
    const { enableDrag, title, contentStyle } = this.props;
    return (
      <Fragment>
        <Layout className={styles.layout}>
          <Header className={(enableDrag ? 'enable-drag ' : '') + styles.header}>
            {title && <p className={styles.title}>{title}</p>}
            <ul className={styles.container}>
              <li className={styles.iconItem} style={{ marginRight: '8px' }} onClick={() => this.$minimize()}>
                <i className={'iconfont icontop-minimum ' + styles.icon}></i>
              </li>
              <li className={styles.iconItem} onClick={this.close}>
                <i className={'iconfont icontop-close ' + styles.icon}></i>
              </li>
            </ul>
          </Header>
          <Content style={contentStyle}>
            {this.props.children}
          </Content>
        </Layout>
      </Fragment>
    )
  }
}
