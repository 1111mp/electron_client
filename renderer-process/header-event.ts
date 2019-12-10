/*
 * @Author: say_1mp@163.com
 * @Date: 2019-10-28 13:56:30
 * @LastEditTime: 2019-12-10 16:39:27
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \ele_client\renderer-process\header-event.js
*/
const electron = require('electron')
const { ipcRenderer, remote } = electron

/**
 * @description: 关闭窗口
 * @param {type} 
 * @return: void
 */
export function winClose() {
	// const { ipcRenderer } = window.electron
	ipcRenderer.send('win-close')
}

/**
 * @description: 最大化窗口
 * @param {type} 
 * @return: void
 */
export function winMax() {
	// const { ipcRenderer } = window.electron
	ipcRenderer.send('win-max')
}

/**
 * @description: 最小化窗口
 * @param {type} 
 * @return: void
 */
export function winMin() {
	// const { ipcRenderer } = window.electron
	ipcRenderer.send('win-min')
}

/**
 * @description: 功能暂未开放
 * @param {type} 
 * @return: void
 */
export function funcNotOpen() {
	// const { ipcRenderer } = window.electron
	ipcRenderer.send('func-not-open-dialog')
}

export function newWin({ url, options }: { url: String, options: Object }) {
	// const { ipcRenderer, remote } = window.electron
	const { BrowserWindow } = remote
	let currentWin = remote.getCurrentWindow()
	let win = new BrowserWindow({
		width: 1022,
		height: 670,
		parent: currentWin,
		nodal: true,
		...options
	})
	win.on('close', function () { win = null })
	win.loadURL(url)
	win.show()
}

const Events = {
	winClose,
	winMax,
	winMin,
	funcNotOpen
}

export default Events