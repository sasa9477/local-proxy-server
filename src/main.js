/// @ts-check
const path = require('path')
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const { startProxyServer, stopProxyServer } = require('./proxyServerController')

const handleIpcMain = () => {
  ipcMain.handle('START_PROXY_SERVER', async (_event, targetUrl, port) => {
    console.log(targetUrl, port)
    return await startProxyServer(targetUrl, port)
  })
  ipcMain.handle('STOP_PROXY_SERVER', async (_event) => {
    return await stopProxyServer()
  })
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 420,
    height: 260,
    backgroundColor: '#222222',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  Menu.setApplicationMenu(null)
  win.loadFile('./public/index.html')
  win.webContents.openDevTools()
}

// see https://www.electronjs.org/ja/docs/latest/tutorial/offscreen-rendering.
app.disableHardwareAcceleration()

app.whenReady().then(() => {
  handleIpcMain()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
