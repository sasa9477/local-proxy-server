/// @ts-check
/// <reference path="./global.d.ts"/>

const path = require('path')
const { app, BrowserWindow, ipcMain, Menu, Tray, nativeTheme } = require('electron')
const Store = require('electron-store')
const { startProxyServer, stopProxyServer } = require('./proxyServerController')

// const { networkInterfaces } = require('os')
// const nets = networkInterfaces()
// const results = []

// for (const name of Object.keys(nets)) {
//   const net = nets[name]?.filter((net) => net.family === 'IPv4' && !net.internal)
//   if (net?.length) results.push({ name: name, address: net[0].address })
// }
// console.log(results)

// var QRCode = require('qrcode')

// QRCode.toDataURL('http://192.168.0.19:8888', function (err, url) {
//   console.log(url)
// })

/**
 * アプリの多重起動防止
 */
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

const MAX_TARGET_URL_LENGTH = 10

/** @type {BrowserWindow | null} */
let mainWindow = null

/** @type {Tray | null} */
let tray = null

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
  mainWindow = new BrowserWindow({
    width: 580,
    height: 400,
    backgroundColor: '#222222',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.loadFile('./public/index.html')

  // see https://www.electronjs.org/docs/latest/api/browser-window/#using-the-ready-to-show-event
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.on('did-finish-load', function () {
    mainWindow?.webContents?.send('LOAD_SETTING', store.store)
  })

  store.onDidAnyChange((newValue, _oldValue) => {
    mainWindow?.webContents?.send('LOAD_SETTING', newValue)
  })

  // win.webContents.openDevTools()
}

const showWindow = () => {
  if (mainWindow && mainWindow.isDestroyed()) {
    createWindow()
  } else {
    if (mainWindow?.isMinimized()) mainWindow?.restore()
    mainWindow?.focus()
  }
}

const createTray = () => {
  let imagePath = ''
  if (process.platform === 'win32') {
    imagePath = nativeTheme.shouldUseDarkColors
      ? path.resolve(__dirname, './assets/images/tray-icon/tray-icon-white.ico')
      : path.resolve(__dirname, './assets/images/tray-icon/tray-icon.ico')
  } else {
    imagePath = nativeTheme.shouldUseDarkColors
      ? path.resolve(__dirname, './assets/images/tray-icon/tray-icon-whiteTemplate.png')
      : path.resolve(__dirname, './assets/images/tray-icon/tray-iconTemplate.png')
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'コントロールパネルを表示',
      click: () => showWindow(),
    },
    {
      label: '終了',
      role: 'quit',
    },
  ])

  tray = new Tray(imagePath)
  tray.setToolTip('ローカルプロキシサーバー')
  tray.setContextMenu(contextMenu)
}

// see https://www.electronjs.org/ja/docs/latest/tutorial/offscreen-rendering.
app.disableHardwareAcceleration()

// Electronの起動を早くするため、app whenReadyよりも前に呼び出す
Menu.setApplicationMenu(null)

app.whenReady().then(() => {
  handleIpcMain()
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // app.requestSingleInstanceLock() が実行されたとき、アプリケーションの1つ目のインスタンス内で発火する
  app.on('second-instance', (_e, argv) => {
    showWindow()
  })
})

app.on('window-all-closed', () => {
  // 全てのウィンドウが閉じられた時にアプリを閉じないようにする
})
