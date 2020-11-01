import React, { Component } from 'react';

export default class MessageImage extends Component<IAnyObject> {
  // _onDoubleClick = (e: any) => {
  //   e.preventDefault();
  //   const { currentMessage } = this.props;
  // };

  render() {
    const { currentMessage } = this.props;
    if (!!currentMessage) {
      return (
        <div className="message-content message-image-content">
          <img
            src={currentMessage.image}
            alt="" /** onDoubleClick={this._onDoubleClick} */
          />
        </div>
      );
    }
    return null;
  }
}
