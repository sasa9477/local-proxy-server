/// @ts-check
/// <reference path="../../src/global.d.ts"/>

const targetUrlInput = document.getElementById('target-url')
const listenPortInput = document.getElementById('listen-port')
const serverStatusElement = document.getElementById('server-status')
const startButton = document.getElementById('start-button')
const stopButton = document.getElementById('stop-button')
const toggleShowTargetListButton = document.getElementById('toggle-target-list-button')
const targetListContainer = document.getElementById('target-list-container')
const targetList = document.getElementById('target-list')

if (
  targetUrlInput instanceof HTMLInputElement &&
  listenPortInput instanceof HTMLInputElement &&
  serverStatusElement instanceof HTMLParagraphElement &&
  startButton instanceof HTMLButtonElement &&
  stopButton instanceof HTMLButtonElement &&
  toggleShowTargetListButton instanceof HTMLButtonElement &&
  targetListContainer &&
  targetList
) {
  window.electronAPI.onLoadSetting((setting) => {
    listenPortInput.value = '' + setting.listenPort

    while (targetList.firstChild) {
      targetList.removeChild(targetList.firstChild)
    }

    const firstItem = setting.targetUrls.splice(0, 1)
    targetUrlInput.value = firstItem[0]

    for (const targetURL of setting.targetUrls) {
      // create new list item
      const item = document.createElement('li')
      item.innerHTML = targetURL
      item.addEventListener('click', () => {
        targetUrlInput.value = item.innerHTML
        targetListContainer.style.display = 'none'
      })
      targetList.appendChild(item)
    }
  })

  const setServerStatus = (/** @type {boolean} */ serverActive, statusText = '', error = false) => {
    if (error) {
      serverStatusElement.innerText = statusText || 'An error occurred.'
      serverStatusElement.classList.add('error')
      return
    }

    serverStatusElement.classList.remove('error')
    if (serverActive) {
      serverStatusElement.innerText = statusText || 'Server Start'
    } else {
      serverStatusElement.innerText = statusText || 'Server Stopped'
    }

    if (startButton instanceof HTMLButtonElement) {
      startButton.disabled = serverActive
    }
    if (stopButton instanceof HTMLButtonElement) {
      stopButton.disabled = !serverActive
    }
  }

  startButton.addEventListener('click', async () => {
    const port = Number(listenPortInput.value.trim())
    if (Number.isNaN(port) || port < 0 || 65535 < port) {
      setServerStatus(false, 'ポートが無効な値です', true)
    }
    if (!targetUrlInput.value) {
      setServerStatus(false, 'ターゲットURLを指定してください', true)
      return
    }
    try {
      const targetUrl = new URL(targetUrlInput.value.trim())
      await window.electronAPI.startProxyServer(`${targetUrl}`, port)

      setServerStatus(true, `Server Start. Listening on port ${port}...\nTarget URL: ${targetUrl}`)
    } catch (e) {
      if (e instanceof Error) {
        setServerStatus(false, e.message, true)
      }
    }
  })

  stopButton.addEventListener('click', async () => {
    await window.electronAPI.stopProxyServer()
    setServerStatus(false)
  })

  toggleShowTargetListButton.addEventListener('click', () => {
    targetListContainer.style.display = targetListContainer.style.display === 'block' ? 'none' : 'block'
  })

  targetUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      targetListContainer.style.display = 'none'
    }
  })
}
