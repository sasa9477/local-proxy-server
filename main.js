/// @ts-check
const path = require('path')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')

/**
 * handle file open
 * @returns {Promise<string | undefined>}
 * @param {any} name
 */
async function handleFileOpen(name) {
  console.log(name)
  const { canceled, filePaths } = await dialog.showOpenDialog({})
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#666666',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', async (event, name) => {
    const result = await handleFileOpen(name)
    return result
  })
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
