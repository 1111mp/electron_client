import './styles.scss';

import React, { Component, Fragment } from 'react';
import Day from '../day';
import SystemMessage from '../systemMessage';
import MessageText from '../messageText';
import MessageImage from '../messageImage';

interface Props {
  currentMessage?: any;
  position?: string;
  previousMessage?: any;
  nextMessage?: any;
  user?: any;
  shouldUpdateMessage?: (props: any, nextProps: any) => boolean;
  chatType?: 'p2p' | 'group' | 'room';
}

export default class Message extends Component<Props> {
  shouldComponentUpdate(nextProps: any) {
    const next = nextProps.currentMessage!;
    const current = this.props.currentMessage!;
    const { previousMessage, nextMessage } = this.props;
    const nextPropsMessage = nextProps.nextMessage;
    const nextPropsPreviousMessage = nextProps.previousMessage;

    const shouldUpdate =
      (this.props.shouldUpdateMessage &&
        this.props.shouldUpdateMessage(this.props, nextProps)) ||
      false;

    return (
      next.sent !== current.sent ||
      // next.received !== current.received ||
      // next.pending !== current.pending ||
      next.time !== current.time ||
      next.content !== current.content ||
      next.image !== current.image ||
      next.status !== current.status ||
      // next.audio !== current.audio ||
      previousMessage !== nextPropsPreviousMessage ||
      nextMessage !== nextPropsMessage ||
      shouldUpdate
    );
  }

  renderDay() {
    if (this.props.currentMessage && this.props.currentMessage.time) {
      const { ...props } = this.props;
      return <Day {...props} />;
    }
    return null;
  }

  renderSystemMessage() {
    const { ...props } = this.props;
    return <SystemMessage {...props} />;
  }

  renderBubble() {
    if (this.props.currentMessage && this.props.currentMessage.image) {
      const { ...messageImageProps } = this.props;
      return <MessageImage {...messageImageProps} />;
    }
    if (this.props.currentMessage && this.props.currentMessage.content) {
      const { ...messageTextProps } = this.props;
      return <MessageText {...messageTextProps} />;
    }
    return null;
  }

  render() {
    const { position, currentMessage, chatType } = this.props;
    const { user } = currentMessage;
    return (
      <Fragment>
        {this.renderDay()}
        {currentMessage.system ? (
          this.renderSystemMessage()
        ) : (
          <div
            className={`message-wrapper ${
              position === 'right' ? 'right' : 'left'
            }`}
          >
            {position === 'left' ? (
              <p
                className="message-avatar"
                style={
                  user.avatar ? { backgroundImage: `url(${user.avatar})` } : {}
                }
              ></p>
            ) : null}
            {/* {position === 'right' && currentMessage.status === 5 ? (
              <i
                className={
                  'iconfont iconicon_alert' +
                  (chatType === 'group' || chatType === 'room'
                    ? ' iconfont-group'
                    : '')
                }
              ></i>
            ) : null} */}
            <div className="message-container">
              {/* {chatType === 'group' ? (
                <p className="user_name">{user.name}</p>
              ) : null} */}
              {position === 'right' ? (
                <p className="message-info">
                  <span className="message-info-timer">6:26 am ·</span>
                  <span className="message-info-user_name">You</span>
                </p>
              ) : (
                <p className="message-info">
                  <span className="message-info-user_name">{user.name}</span>
                  <span className="message-info-timer">· 6:26 am</span>
                </p>
              )}
              {this.renderBubble()}
            </div>
            {/* <p className="message-content">{currentMessage.text}</p> */}
            {position === 'right' ? (
              <p
                className="message-avatar"
                style={
                  user.avatar ? { backgroundImage: `url(${user.avatar})` } : {}
                }
              ></p>
            ) : null}
          </div>
        )}
      </Fragment>
    );
  }
}
