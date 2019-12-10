/*
 * @Author: say_1mp@163.com
 * @Date: 2019-10-28 13:43:01
 * @LastEditTime: 2019-12-06 15:35:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \ele_client\main-process\header\app-header.js
 */
const { ipcMain, BrowserWindow, dialog } = require('electron')

//关闭应用
ipcMain.on('win-close', () => {
	BrowserWindow.getFocusedWindow().close()
})

//窗口最大化（全屏）
ipcMain.on('win-max', () => {
	let win = BrowserWindow.getFocusedWindow()
	if (win.isMaximized()) {
		win.unmaximize()
	} else {
		win.maximize()
	}
})

//窗口最小化（收起）
ipcMain.on('win-min', () => {
	BrowserWindow.getFocusedWindow().minimize()
})

//功能未开放
ipcMain.on('func-not-open-dialog', () => {
	let win = BrowserWindow.getFocusedWindow()
	const options = {
		type: 'info',
		title: '信息',
		message: '功能暂未开放！',
	}
	dialog.showMessageBox(win, options)
})