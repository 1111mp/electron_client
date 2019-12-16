import { Event, WebContents, ipcMain } from 'electron';
import log from 'electron-log';

export type ListenerCb = (event: any, args: any) => void;
export type IPCChannelType = 'on' | 'once';

export const IPC_EVENT = '[IpcMain event]';

export class MainProcess {
	static _instance: any;
	// 单例模式（仅适用于单线程）
	static getInstance() {
		if (!this._instance) {
			this._instance = new MainProcess();
		}
		return this._instance;
	}

	private _eventCallbacks: IAnyObject = {}; // 保存注册过的事件回调函数

	/**
  * @description: 往主线程中注册事件
  * @param {string} channel	事件名
  * @param {ListenerCb} callback	触发事件的回调
  * @param {IPCChannelType} type	是否注册为一次性事件
  * @return: 
  */
	resgist(channel: string, callback: ListenerCb, type: IPCChannelType = 'on') {
		if (channel in this._eventCallbacks) {
			throw new Error('Event:' + channel + ' has been registed!');
		}

		let res: any = null;

		this._eventCallbacks[channel] = function (event: Event, args: any) {
			/** 事件记录 */
			console.log(`${IPC_EVENT} ${channel}, 'args'`, args);

			try {
				res = callback.call(this, event, args);
			} catch (error) {
				log.error(`${IPC_EVENT} ${error}`);
			}

			return res;
		}

		ipcMain[type](channel, this._eventCallbacks[channel]);
	}

	on(channel: string, callback: ListenerCb) {
		this.resgist(channel, callback, 'on');
	}

	once(channel: string, callback: ListenerCb) {
		this.resgist(channel, callback, 'once');
	}

	off(channel: string) {
		if (!this._eventCallbacks[channel]) return;

		try {
			ipcMain.removeListener(
				channel,
				this._eventCallbacks[channel]
			);
			delete this._eventCallbacks[channel];
		} catch (error) { }
	}
}

// module.exports = function () {
// 	return MainProcess.getInstance();
// }
(function () {
	MainProcess.getInstance();
})();