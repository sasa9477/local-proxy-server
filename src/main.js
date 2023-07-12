/// @ts-check
/// <reference path="./global.d.ts"/>

const path = require('path')
const { app, BrowserWindow, ipcMain, Menu, Tray, nativeTheme } = require('electron')
const Store = require('electron-store')
const { getServerStatus, startProxyServer, stopProxyServer } = require('./proxyServerController')

const MAX_TARGET_URL_LENGTH = 10

/** @type {BrowserWindow | null} */
let win = null

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
  enableHttps: {
    type: 'boolean',
    default: false,
  },
  enableWs: {
    type: 'boolean',
    default: false,
  },
}

Store.initRenderer()
const store = new Store({ schema })

const updateStore = (/** @type {StartProxyServerOption} */ args) => {
  const { targetUrl, listenPort, enableHttps, enableWs } = args

  store.set('listenPort', listenPort)
  store.set('enableHttps', enableHttps)
  store.set('enableWs', enableWs)

  let targetUrls = store.get('targetUrls')
  const index = targetUrls.indexOf(targetUrl)
  // 前回の値が先頭になるようにする
  if (index !== -1) {
    targetUrls.splice(index, 1)
  }
  targetUrls.unshift(targetUrl)
  store.set('targetUrls', targetUrls.slice(0, MAX_TARGET_URL_LENGTH))
}

const handleIpcMain = () => {
  ipcMain.handle('SAVE_SETTING', (_event, setting) => {
    store.store = setting
  })
  ipcMain.handle('START_PROXY_SERVER', async (_event, args) => {
    updateStore(args)
    return await startProxyServer(args)
  })
  ipcMain.handle('STOP_PROXY_SERVER', async (_event) => {
    return await stopProxyServer()
  })
}

const createWindow = () => {
  store.onDidAnyChange((newValue, _oldValue) => {
    win?.webContents?.send('LOAD_SETTING', newValue)
  })

  win = new BrowserWindow({
    width: 600,
    height: 400,
    backgroundColor: '#222222',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.loadFile('./public/index.html')

  win.webContents.on('did-finish-load', function () {
    if (win?.webContents) {
      win.webContents.send('LOAD_SETTING', store.store)
      win.webContents.send('LOAD_SERVER_STATUS', getServerStatus())
    }
  })

  // see https://www.electronjs.org/docs/latest/api/browser-window/#using-the-ready-to-show-event
  win?.once('ready-to-show', () => {
    win?.show()

    if (!app.isPackaged) {
      win?.webContents.openDevTools()
    }
  })
}

// see https://www.electronjs.org/ja/docs/latest/tutorial/offscreen-rendering.
app.disableHardwareAcceleration()

// Electronの起動を早くするため、app whenReadyよりも前に呼び出す
Menu.setApplicationMenu(null)

app.whenReady().then(() => {
  handleIpcMain()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // 全てのウィンドウが閉じられた時にアプリを閉じる
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
