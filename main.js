// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')
const glob = require('glob')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function initialize() {
	makeSingleInstance()

	loadDemos()

	function createWindow() {
		Menu.setApplicationMenu(null)
		// Create the browser window.
		mainWindow = new BrowserWindow({
			width: 1022,
			height: 670,
			minWidth: 1022,
			minHeight: 670,
			frame: false,
			// backgroundColor: '#2e2c29',
			webPreferences: {
				nodeIntegration: true,
				// preload: path.join(__dirname, './pages/render.js')
			}
		})

		mainWindow.webContents.openDevTools()
		// and load the index.html of the app.
		//   mainWindow.loadFile('index.html')

		if (process.env.NODE_ENV === 'development') {
			mainWindow.loadURL('http://localhost:3000')
		} else {
			mainWindow.loadURL('`file://${__dirname}/build/index.html`')
			// mainWindow.loadURL(url.format({
			// 	pathname: path.join(__dirname, './build/index.html'),
			// 	protocol: 'file:',
			// 	slashes: true
			// }))
		}

		// Open the DevTools.
		// mainWindow.webContents.openDevTools()

		// Emitted when the window is closed.
		mainWindow.on('closed', function () {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			mainWindow = null
		})
	}

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', createWindow)

	// Quit when all windows are closed.
	app.on('window-all-closed', function () {
		// On macOS it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') app.quit()
	})

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (mainWindow === null) createWindow()
	})
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance() {
	if (process.mas) return

	app.requestSingleInstanceLock()

	app.on('second-instance', () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore()
			mainWindow.focus()
		}
	})
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Require each JS file in the main-process dir
function loadDemos() {
	const files = glob.sync(path.join(__dirname, 'main-process/**/*.ts'))
	files.forEach((file) => { require(file) })
}

initialize()
