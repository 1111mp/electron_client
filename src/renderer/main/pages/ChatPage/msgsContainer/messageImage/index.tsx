const MessageImage: React.FC<IAnyObject> = ({ currentMessage }) => {
  return currentMessage && currentMessage.image ? (
    <div className="message-image-content">
      <img
        src={currentMessage.image.url}
        width={currentMessage.image.width}
        height={currentMessage.image.height}
        alt="" /** onDoubleClick={this._onDoubleClick} */
      />
    </div>
  ) : null;
};

export default MessageImage;
