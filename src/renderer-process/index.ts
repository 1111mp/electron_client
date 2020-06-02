export type ListenerCb = (event: any, args: any) => void;

// 渲染线程
export default class RendererProcess {
	static _instance: any;
	// 单例模式（仅适用于单线程）
	static getInstance() {
		if (!this._instance) {
			this._instance = new RendererProcess();
		}
		return this._instance;
	}

	private _eventCallbacks: IAnyObject; // 保存注册过的事件回调函数
	private _electron: any; // electron对象
	private _win: any; // 当前窗口

	constructor() {
		this._eventCallbacks = {};

		// 判断是否处于浏览器环境
		if (typeof window === 'undefined') return;

		// 防止初始化的时候electron还没有加载完成
		Object.assign(this, '_win', {
			get() {
				const { remote } = require('electron');
				return remote.getCurrentWindow();
			}
		});

		Object.assign(this, '_electron', {
			get() {
				return require('electron');
			}
		});
	}

	/**
  * @description: 渲染线程往主线程中发送事件
  * @param {string} channel	事件名
  * @param {any} args	发送事件传递的参数
  * @return: 
  */
	send(channel: string, args: any) {
		if (!this._electron) return;

		this._electron.ipcRenderer.send(channel, args);
	}

	/**
  * @description: 往渲染线程中注册事件
  * @param {string} channel 事件名
  * @param {ListenerCb} callback 回调函数
  * @param {boolean} isOnce 是否注册为一次性的事件函数
  * @return: 
  */
	on(channel: string, callback: ListenerCb, isOnce?: boolean) {
		if (!this._electron) return;

		if (callback) {
			if (this._eventCallbacks[channel]) {
				throw new Error('event: [' + channel + '] has been bind!');
			}

			this._eventCallbacks[channel] = callback;
		}

		this._electron.ipcRenderer[isOnce ? 'once' : 'on'](
			channel,
			(event: any, args: any) => {
				this._eventCallbacks[channel] && this._eventCallbacks[channel](args);

				isOnce && this.remove(channel);
			}
		);
	}

	/**
  * @description: 移除渲染线程中注册的事件
	* 	使用once注册事件 默认第一次调用之后就会被删除 这里使用removeListener强制移除 确保一定被移除
	*		https://electronjs.org/docs/api/ipc-renderer#ipcrendereroncechannel-listener
  * @param {string} channel	事件名
  * @return: 
  */
	remove(channel: string) {
		if (!this._electron) return;

		if (channel && this._eventCallbacks[channel]) {
			this._electron.ipcRenderer.removeListener(
				channel,
				this._eventCallbacks[channel]
			);
			delete this._eventCallbacks[channel];
		}
	}

	/**
  * @description: 移除渲染线程所有注册的事件
  * @return: 
  */
	removeAll() {
		if (!this._electron) return;

		const events = Object.keys(this._eventCallbacks);
		events.forEach(channel => {
			if (this._eventCallbacks[channel]) {
				// this._electron.ipcRenderer.removeAllListeners(channel);
				// 两者都可 区别在于removeAllListeners会移除指定channel所有的listener，removeListener则是移除指定channel的指定listener
				this._electron.ipcRenderer.removeListener(
					channel,
					this._eventCallbacks[channel]
				);
			}
			delete this._eventCallbacks[channel];
		});
	}

	// 获取当前的窗口对象
	getCurrentWindow() {
		if (!this._electron) return;
		const { remote } = this._electron;
		return remote.getCurrentWindow();
	}


}