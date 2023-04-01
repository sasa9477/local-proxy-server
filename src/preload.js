/// @ts-check
/// <reference path="./global.d.ts" />

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onLoadSetting: (/** @type {(setting: Setting) => void} */ callback) =>
    ipcRenderer.on('LOAD_SETTING', (_event, store) => callback(store)),
  saveSetting: (/** @type {Setting} */ setting) => ipcRenderer.invoke('SAVE_SETTING', setting),
  startProxyServer: (/** @type {string} */ targetURL, /** @type {number} */ port) =>
    ipcRenderer.invoke('START_PROXY_SERVER', targetURL, port),
  stopProxyServer: () => ipcRenderer.invoke('STOP_PROXY_SERVER'),
})

window.addEventListener('DOMContentLoaded', async () => {
  for (const dependency of ['chrome', 'node', 'electron']) {
    console.log(`${dependency}-version`, process.versions[dependency])
  }
})
