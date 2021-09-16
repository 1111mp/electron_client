import './styles.scss';

import React from 'react';
import { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Layout } from 'antd';
import { queryParse } from 'app/utils';
import { minimize, closeWin } from 'app/utils/rendererapi';

const { Header, Content } = Layout;

type Props = {
  enableDrag?: boolean;
  contentStyle?: object;
  close?: () => void | boolean;
};

const WinContainer: React.FC<Props> = ({
  close,
  enableDrag = true,
  contentStyle,
  children,
}) => {
  const {
    title,
    min = 'true',
    isClose = 'true',
    header = 'true',
  } = queryParse(location.search);

  const closeHandle = () => {
    if (close && typeof close === 'function' && close() === false) return;
    closeWin();
  };

  return (
    <Fragment>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Layout className="module-win_container-layout">
        {header === 'true' ? (
          <Header
            className={
              'module-win_container-layout-header' +
              (enableDrag ? ' enable-drag' : '')
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
                  onClick={() => minimize()}
                >
                  <i className="iconfont icontop-minimum"></i>
                </li>
              ) : null}
              {isClose === 'true' ? (
                <li
                  className="module-win_container-layout-header--container-iconItem"
                  onClick={closeHandle}
                >
                  <i className="iconfont icontop-close"></i>
                </li>
              ) : null}
            </ul>
          </Header>
        ) : null}
        <Content style={contentStyle}>{children}</Content>
      </Layout>
    </Fragment>
  );
};

export default WinContainer;
