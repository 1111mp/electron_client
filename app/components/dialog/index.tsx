import './styles.scss';

import * as React from 'react';
import { Fragment } from 'react';

import BasicComponent from 'components/BasicComponent';
import { Layout } from 'antd';
import { queryParse } from 'app/utils';

const listener = require('app/constants/listener.json');
const { Header, Content, Footer } = Layout;
// const styles = require('./dialog.scss');

export default class Dialog extends BasicComponent<IDialog.props> {
  static defaultProps = {};

  state: IDialog.state;

  constructor(props: IDialog.props) {
    super(props);

    const query = queryParse();
    this.state = {
      type: query.type || 'alert',
      title: query.title || '',
      message: query.message || '出错啦，请重试！',
    };
  }

  submit = () => {
    this.$send(listener.DIALOG_CONFIRM);
  };

  close = (): void => {
    this.$send(listener.DIALOG_CANCEL);
  };

  $render() {
    const { type, title, message } = this.state;
    return (
      <Fragment>
        <Layout className="module-dialog">
          <Header>
            <p className="module-dialog-title">{title}</p>
            <ul className="module-dialog-container">
              <li className="module-dialog-container-iconItem" onClick={this.close}>
                <i className="iconfont icontop-close"></i>
              </li>
            </ul>
          </Header>
          <Content>
            <p className="content">{message}</p>
          </Content>
          <Footer>
            <button className="dialog-btn-sure" onClick={this.submit}>
              确认
            </button>
            {type === 'confirm' && (
              <button
                className="dialog-btn-cancel"
                style={{ marginLeft: '24px' }}
                onClick={this.close}
              >
                取消
              </button>
            )}
          </Footer>
        </Layout>
      </Fragment>
    );
  }
}
