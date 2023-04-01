/// @ts-check
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  startProxyServer: (targetURL, port) => ipcRenderer.invoke('START_PROXY_SERVER', targetURL, port),
  stopProxyServer: () => ipcRenderer.invoke('STOP_PROXY_SERVER'),
})

window.addEventListener('DOMContentLoaded', () => {
  /**
   * replace text
   * @param {string} selector
   * @param {string | undefined} text
   */
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text ?? ''
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
