/// @ts-check
/// <reference path="./global.d.ts"/>

const path = require('path')
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const Store = require('electron-store')
const { startProxyServer, stopProxyServer } = require('./proxyServerController')

Store.initRenderer()

const MAX_TARGET_URL_LENGTH = 10

const initStore = () => {
  /** @type {Store.Schema<Setting>} */
  const schema = {
    targetUrls: {
      type: 'array',
      default: ['https://localhost:3000/', 'http://localhost:3000/'],
    },
    listenPort: {
      type: 'number',
      default: 8888,
    },
  }
  return new Store({ schema })
}

const updateStore = (
  /** @type {Store<Setting>} */ store,
  /** @type {string} */ targetUrl,
  /** @type {number} */ listenPort
) => {
  store.set('listenPort', listenPort)
  let targetUrls = store.get('targetUrls')
  const index = targetUrls.indexOf(targetUrl)
  // 前回の値が先頭になるようにする
  if (index !== -1) {
    targetUrls.splice(index, 1)
  }
  targetUrls.unshift(targetUrl)
  store.set('targetUrls', targetUrls.slice(0, MAX_TARGET_URL_LENGTH))
}

const handleIpcMain = (/** @type {Store<Setting>} */ store) => {
  ipcMain.handle('SAVE_SETTING', (_event, setting) => {
    store.store = setting
  })
  ipcMain.handle('START_PROXY_SERVER', async (_event, targetUrl, port) => {
    updateStore(store, targetUrl, port)
    return await startProxyServer(targetUrl, port)
  })
  ipcMain.handle('STOP_PROXY_SERVER', async (_event) => {
    return await stopProxyServer()
  })
}

const createWindow = (/** @type {Store<Setting>} */ store) => {
  const win = new BrowserWindow({
    width: 420,
    height: 260,
    backgroundColor: '#222222',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.webContents.on('did-finish-load', function () {
    win.webContents.send('LOAD_SETTING', store.store)
  })

  store.onDidAnyChange((newValue, _oldValue) => {
    win.webContents.send('LOAD_SETTING', newValue)
  })

  Menu.setApplicationMenu(null)
  win.loadFile('./public/index.html')
  // win.webContents.openDevTools()
}

// see https://www.electronjs.org/ja/docs/latest/tutorial/offscreen-rendering.
app.disableHardwareAcceleration()

app.whenReady().then(() => {
  const store = initStore()
  handleIpcMain(store)
  createWindow(store)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
