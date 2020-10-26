import './styles.scss';

import React from 'react';
import { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';
import { Helmet } from 'react-helmet';
import { Layout } from 'antd';
import { queryParse } from 'app/utils';

const { Header, Content } = Layout;

interface Props {
  enableMin?: boolean;
  enableDrag?: boolean;
  contentStyle?: object;
  close?: () => void | boolean;
}

export default class WinContainer extends BasicComponent<Props> {
  static defaultProps = {
    enableMin: true,
    enableDrag: true,
  };

  close = () => {
    const { close } = this.props;

    if (close && typeof close === 'function' && close() === false) return;
    this.$close();
  };

  $render() {
    const { title, min = 'true' } = queryParse(location.search);
    const { enableDrag, contentStyle } = this.props;
    console.log(min);
    return (
      <Fragment>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <Layout className="module-win_container-layout">
          <Header
            className={
              'module-win_container-layout-header' +
              (enableDrag ? ' enable-drag ' : '')
            }
          >
            <p className="module-win_container-layout-header--title">
              {title || ''}
            </p>
            <ul className="module-win_container-layout-header--container">
              {min === 'true' ? (
                <li
                  className="module-win_container-layout-header--container-iconItem"
                  style={{ marginRight: '8px' }}
                  onClick={() => this.$minimize()}
                >
                  <i className="iconfont icontop-minimum"></i>
                </li>
              ) : null}
              <li
                className="module-win_container-layout-header--container-iconItem"
                onClick={this.close}
              >
                <i className="iconfont icontop-close"></i>
              </li>
            </ul>
          </Header>
          <Content style={contentStyle}>{this.props.children}</Content>
        </Layout>
      </Fragment>
    );
  }
}
