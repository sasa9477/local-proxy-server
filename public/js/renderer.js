/// @ts-check
/// <reference path="./global.d.ts"/>

const targetUrlInput = document.getElementById('target-url')
const listenPortInput = document.getElementById('listen-port')
const serverStatusElement = document.getElementById('server-status')
const startButton = document.getElementById('start-button')
const stopButton = document.getElementById('stop-button')
const toggleShowTargetListButton = document.getElementById('toggle-target-list-button')
const targetListContainer = document.getElementById('target-list-container')
const targetListItems = document.querySelectorAll('.target-list-item')

if (
  targetUrlInput instanceof HTMLInputElement &&
  listenPortInput instanceof HTMLInputElement &&
  serverStatusElement instanceof HTMLParagraphElement &&
  startButton instanceof HTMLButtonElement &&
  stopButton instanceof HTMLButtonElement &&
  toggleShowTargetListButton instanceof HTMLButtonElement &&
  targetListContainer &&
  targetListItems
) {
  /**
   * Set server status
   * @param {boolean} active
   * @param {string} statusText
   * @param {boolean} error
   */
  const setServerStatus = (active, statusText = '', error = false) => {
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

  toggleShowTargetListButton?.addEventListener('click', () => {
    console.log(targetListContainer.style.display)
    targetListContainer.style.display = targetListContainer.style.display === 'block' ? 'none' : 'block'
  })

  targetListItems.forEach((item) => {
    console.log('foreach')
    item.addEventListener('click', () => {
      console.log(item.nodeValue)
      targetUrlInput.value = item.innerHTML
      targetListContainer.style.display = 'none'
    })
  })
}
