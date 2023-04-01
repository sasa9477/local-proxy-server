/// @ts-check
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (/** @type {any} */ name) => ipcRenderer.invoke('dialog:openFile', name),
})

window.addEventListener('DOMContentLoaded', () => {
  /**
   *
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
