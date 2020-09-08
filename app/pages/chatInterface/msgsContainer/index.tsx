import './styles.styl';

import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';

// import Iscroll from 'components/global/Iscroll';
import Message from './message';
import _ from 'lodash';
// const db = require('just-debounce');

interface Props {
  userId?: number;
  messages?: any[];
  chatType?: 'p2p' | 'group' | 'room';
  hasMore?: boolean;
  fetchMore?: VoidFunction;
}

@inject((stores: IAnyObject) => ({
  // userId: stores.userStore.user.userId,
}))
@observer
export default class MsgsContainer extends Component<Props> {
  static defaultProps = {
    messages: [],
    hasMore: false,
  };

  renderLoadMore() {
    const { hasMore } = this.props;
    return (
      <div className="load_more-wrapper">
        {hasMore ? (
          <Fragment>
            <p className="load_more-icon"></p>
            加载中...
          </Fragment>
        ) : (
          <Fragment>没有更多消息了</Fragment>
        )}
      </div>
    );
  }

  render() {
    const { messages, userId, chatType } = this.props;
    return (
      <Fragment>
        <div className="msgs_content-wrapper" ref="scrollContent">
          {/* {this.renderLoadMore()} */}
          {messages &&
            messages.map((item: any, index: number) => {
              if (!item.user) {
                item.user = { userId: -1 };
              }
              const previousMessage = messages[index - 1] || {};
              const nextMessage = messages[index - 1] || {};
              const messageProps: any = {
                ...item,
                chatType,
                currentMessage: item,
                previousMessage,
                nextMessage,
                position: item.user.userId === userId ? 'right' : 'left',
                user: item.user,
              };
              return <Message key={item.msgId} {...messageProps} />;
            })}
        </div>
      </Fragment>
    );
  }
}
