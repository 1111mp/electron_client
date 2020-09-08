import './styles.styl';

import React, { PureComponent, Fragment } from 'react';
import _ from 'lodash';
// import { Emoji as EmojiEle } from 'emoji-mart';
// import emojiObj from 'consts/emoji'
// import Linkify from 'react-linkify'
// import LinkifyIt from 'linkify-it';
// import tlds from 'tlds';

// const linkify = new LinkifyIt();
// linkify.tlds(tlds);

// function stringToContentArray(text: string) {
// 	let arr: any[] = [],
// 		flag = false
// 	// time = 0
// 	function getEmojiArr(textCopy: string) {
// 		// time += 1
// 		let showhtml = textCopy
// 		if (textCopy.length && !flag) {
// 			Object.keys(emojiObj).forEach((emoji: any) => {
// 				if (showhtml.indexOf(emoji) !== -1) {
// 					arr.push({
// 						index: textCopy.indexOf(emoji),
// 						lastIndex: textCopy.indexOf(emoji) + emoji.length,
// 						raw: emoji,
// 						schema: emoji,
// 						text: emoji,
// 						url: emoji
// 					})
// 					// showhtml = showhtml.replace(emoji, '')
// 					showhtml = _.replace(showhtml, emoji, _.repeat('1', emoji.length))
// 				}
// 			})
// 			flag = true
// 			Object.keys(emojiObj).forEach((emoji: any) => {
// 				if (showhtml.indexOf(emoji) !== -1) {
// 					flag = false
// 				}
// 			})
// 			getEmojiArr(showhtml)
// 		}
// 	}

// 	getEmojiArr(text)

// 	arr = arr.sort((a: any, b: any) => a.index - b.index)
// 	// console.log(arr)
// 	return arr
// }

// // function getIndex(text: string, time: number, emoji: string) {
// // 	let _text = text
// // 	for (let i = 0; i < (time - 1); i++) {
// // 		_text = _.replace(_text, emoji, _.repeat('1', emoji.length))
// // 	}
// // 	return _text.indexOf(emoji);
// // }

// const componentDecorator = (href: any, text: any, key: any) => {
// 	let flag = false
// 	let res: any
// 	Object.keys(emojiObj).forEach((emoji: any) => {
// 		if (text === emoji) {
// 			flag = true
// 			res = (<span key={key}>{EmojiEle({
// 				html: false,
// 				set: 'google',
// 				emoji: emojiObj[emoji],
// 				size: 24
// 			})}</span>)
// 		}
// 	})
// 	if (!flag) {
// 		res = (
// 			<a href={href} key={key} className="message-link" target="_blank">
// 				{text}
// 			</a>
// 		)
// 	}
// 	return res
// };

// const matchDecorator = (text: string): any => {
// 	return stringToContentArray(text).concat(linkify.match(text) || [])
// 	// return linkify.match(text);
// }

export default class MessageText extends PureComponent<IAnyObject> {
  render() {
    // let _showhtml = stringToContentArray(this.props.currentMessage.content)

    // if (_showhtml == null) {
    // 	return (
    // 		<p className="message-content">
    // 			{this.props.currentMessage.content}
    // 		</p>
    // 	)
    // }
    // return (
    // 	<p className="message-content" dangerouslySetInnerHTML={_showhtml}>
    // 		{/* {this.props.currentMessage.content} */}
    // 	</p>
    // )
    // return (
    // 	<p className="message-content">
    // 		<Linkify componentDecorator={componentDecorator} matchDecorator={matchDecorator}>{this.props.currentMessage.content}</Linkify>
    // 	</p>
    // )
    return (
      <p className="message-content">{this.props.currentMessage.content}</p>
    );
  }
}
