import './styles.scss'

import React, { Component } from 'react'

export default class SystemMessage extends Component<IAnyObject> {
	render() {
		const { currentMessage } = this.props
		if (currentMessage) {
			return (
				<div className="system_message-wrapper">
					<span>{currentMessage.system}</span>
				</div>
			)
		}
		return null
	}
}
