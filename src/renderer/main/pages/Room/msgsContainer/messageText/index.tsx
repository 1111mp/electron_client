import './styles.scss';

const MessageText: React.FC<IAnyObject> = ({ currentMessage }) => {
  return <p className="message-content">{currentMessage.content}</p>;
};

export default MessageText;
