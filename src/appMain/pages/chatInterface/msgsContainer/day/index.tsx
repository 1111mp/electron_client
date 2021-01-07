import './styles.scss'

import React, { Component } from 'react'
// import moment from 'moment'
// import { DATE_FORMAT, getLocale } from 'consts/notice'
import { isSameDay, showTime } from 'app/utils/date'

export default class Day extends Component<IAnyObject>{
	render() {
		const { currentMessage, previousMessage } = this.props
		if (currentMessage && !isSameDay(currentMessage.time, previousMessage.time)) {
			return (
				<div className="day-wrapper">{showTime(currentMessage.time)}</div>
			)
		}
		return null
	}
}
