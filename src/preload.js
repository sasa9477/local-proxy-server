/// @ts-check
/// <reference path="./global.d.ts" />

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onLoadSetting: (callback) => ipcRenderer.on('LOAD_SETTING', (_event, store) => callback(store)),
  onLoadServerStatus: (callback) => ipcRenderer.on('LOAD_SERVER_STATUS', (_event, status) => callback(status)),
  saveSetting: (setting) => ipcRenderer.invoke('SAVE_SETTING', setting),
  startProxyServer: (args) => ipcRenderer.invoke('START_PROXY_SERVER', args),
  stopProxyServer: () => ipcRenderer.invoke('STOP_PROXY_SERVER'),
})

window.addEventListener('DOMContentLoaded', async () => {
  for (const dependency of ['chrome', 'node', 'electron']) {
    console.log(`${dependency}-version`, process.versions[dependency])
  }
})
