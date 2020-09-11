import React, { Component, KeyboardEvent } from 'react';

import DropEmitter from 'components/dropEmitter';
import { EmojiButton } from 'components/emoji/EmojiButton';

const styles = require('./styles.scss');

export default class Transmitter extends Component<IAnyObject> {
  state = {
    text: '',
  };

  /** https://juejin.im/post/6844904112882974728#heading-10 */
  onKeyDownHandle = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.keyCode === 13 &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      /** enter */
      console.log('enter键...');
    } else if (
      event.keyCode === 13 &&
      !event.ctrlKey &&
      event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      /** shift + enter */
      console.log('换行键...');
    }
  };

  dropHandler = (text: any) => {
    this.setState({
      text: this.state.text + text,
    });
  };

  render() {
    const { text } = this.state;
    return (
      <DropEmitter dropHandler={this.dropHandler}>
        <div className={styles.container}>
          <ul className={styles.actions_container}>
            <EmojiButton />
            <li className={styles.iconfont_content}>
              <span
                className={'iconfont iconwenjian ' + styles.iconfont}
              ></span>
            </li>
          </ul>
          <div className={styles.textarea_container}>
            <textarea
              value={text}
              className={styles.textarea}
              onChange={(e: any) => this.setState({ text: e.target.value })}
              onKeyDown={this.onKeyDownHandle}
            ></textarea>
          </div>
        </div>
      </DropEmitter>
    );
  }
}
