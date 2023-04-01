/// @ts-check
/// <reference path="./global.d.ts"/>

const targetUrlInput = document.getElementById('target-url')
const listenPortInput = document.getElementById('listen-port')
const serverStatusElement = document.getElementById('server-status')
const startButton = document.getElementById('start-button')
const stopButton = document.getElementById('stop-button')

/**
 * Set server status
 * @param {boolean} active
 * @param {string} statusText
 * @param {boolean} error
 */
const setServerStatus = (active, statusText = '', error = false) => {
  if (!serverStatusElement) return

  if (error) {
    serverStatusElement.innerText = statusText || 'An error occurred.'
    serverStatusElement.classList.add('error')
  }

  serverStatusElement.classList.remove('error')
  if (active) {
    serverStatusElement.innerText = statusText || 'Server Start'
  } else {
    serverStatusElement.innerText = statusText || 'Server Stopping'
  }

  if (startButton instanceof HTMLButtonElement) {
    startButton.disabled = active
  }
  if (stopButton instanceof HTMLButtonElement) {
    stopButton.disabled = !active
  }
}

startButton?.addEventListener('click', async () => {
  if (!serverStatusElement) return
  if (!(targetUrlInput instanceof HTMLInputElement && listenPortInput instanceof HTMLInputElement)) return

  if (!targetUrlInput.value) {
    setServerStatus(false, 'ターゲットURLを指定してください', false)
    return
  }
  try {
    const targetUrl = targetUrlInput.value.trim()
    let port = Number(listenPortInput.value.trim())
    port = !Number.isNaN(port) ? port : 8888
    const launchResult = await window.electronAPI.startProxyServer(targetUrl, port)
    setServerStatus(true, `Server Start. Listen on port ${port}...\nTarget URL: ${targetUrl}`)
  } catch (e) {
    if (e instanceof Error) {
      setServerStatus(false, e.message, false)
    }
  }
})

stopButton?.addEventListener('click', async () => {
  await window.electronAPI.stopProxyServer()
  setServerStatus(false)
})
