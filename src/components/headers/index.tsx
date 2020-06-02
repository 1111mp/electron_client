import React, { PureComponent, Fragment } from 'react';
// import Events from 'renderer/header-event.js';
import './header.scss';

// const { winMin, winMax, winClose, funcNotOpen } = Events;

interface IState {
	isMaximized: Boolean
}

export default class Headers extends PureComponent<{}, IState> {
	public state: IState = {
		isMaximized: false
	}

	winHandle(str: string): void {
		// switch (str) {
		// 	case 'min':
		// 		winMin();
		// 		return;
		// 	case 'max':
		// 		let { isMaximized } = this.state;
		// 		this.setState({ isMaximized: !isMaximized });
		// 		winMax();
		// 		return;
		// 	case 'close':
		// 		winClose();
		// 		return;
		// 	case 'notOPen':
		// 		funcNotOpen();
		// 		return;
		// }
	}

	public render(): JSX.Element {
		let { isMaximized } = this.state;
		return (
			<Fragment>
				<div className="logo-content">
					<div>
						<span className="logo">
							<i className="iconfont iconwangyiyunyinle" />
						</span>
						<p>网易云音乐</p>
					</div>
				</div>
				<div className="middle-content"></div>
				<div className="header-right">
					<i className="iconfont iconpifu" />
					<i className="iconfont iconxinxi" />
					<i className="iconfont iconshezhi1" />
					<span className="middle-line" />
					<i className="iconfont iconmini" style={{ fontSize: '12px' }} onClick={this.winHandle.bind(this, 'notOPen')} />
					<i className="iconfont iconzuixiaohua" title="最小化" onClick={this.winHandle.bind(this, 'min')} />
					<i className={`iconfont ${isMaximized ? 'iconhuanyuan' : 'iconzuidahua'}`} title={isMaximized ? "向下还原" : "最大化"} onClick={this.winHandle.bind(this, 'max')} />
					<i className="iconfont iconguanbi" title="关闭" onClick={this.winHandle.bind(this, 'close')} />
				</div>
			</Fragment>
		)
	}
}