/// @ts-check
/// <reference path="../../src/global.d.ts"/>

const targetUrlInput = document.getElementById('target-url')
const listenPortInput = document.getElementById('listen-port')
const httpsInput = document.getElementById('https')
const wsInput = document.getElementById('ws')
const startButton = document.getElementById('start-button')
const stopButton = document.getElementById('stop-button')
const serverStatusElement = document.getElementById('server-status')
const toggleShowTargetListButton = document.getElementById('toggle-target-list-button')
const targetListContainer = document.getElementById('target-list-container')
const targetList = document.getElementById('target-list')

if (
  targetUrlInput instanceof HTMLInputElement &&
  listenPortInput instanceof HTMLInputElement &&
  httpsInput instanceof HTMLInputElement &&
  wsInput instanceof HTMLInputElement &&
  startButton instanceof HTMLButtonElement &&
  stopButton instanceof HTMLButtonElement &&
  serverStatusElement instanceof HTMLParagraphElement &&
  toggleShowTargetListButton instanceof HTMLButtonElement &&
  targetListContainer &&
  targetList
) {
  /*
   * Start or stop server, and change server status.
   */

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
      const enableHttps = httpsInput.checked
      const enableWs = wsInput.checked

      await window.electronAPI.startProxyServer({
        targetUrl: `${targetUrl}`,
        listenPort: port,
        enableHttps: enableHttps,
        enableWs: enableWs,
      })

      setServerStatus(
        true,
        `Listening on port ${port}...\nTarget URL: ${targetUrl}\nHttps: ${enableHttps} Ws: ${enableWs}`
      )
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

  /*
   * Toggle target list.
   */

  toggleShowTargetListButton.addEventListener('click', (e) => {
    targetListContainer.style.display = targetListContainer.style.display === 'block' ? 'none' : 'block'
    e.stopPropagation()
  })

  document.body.addEventListener('click', () => {
    if (targetListContainer.style.display === 'block') targetListContainer.style.display = 'none'
  })

  /*
   * Load Setting
   */

  const loadSetting = (/** @type {Setting} */ setting) => {
    listenPortInput.value = '' + setting.listenPort
    httpsInput.checked = setting.enableHttps
    wsInput.checked = setting.enableWs

    while (targetList.firstChild) {
      targetList.removeChild(targetList.firstChild)
    }

    targetUrlInput.value = setting.targetUrls[0]

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
  }

  window.electronAPI?.onLoadSetting(loadSetting)

  // live-server mock
  // live-server 起動時は http-equiv meta tagを削除する
  setTimeout(() => {
    if (!window.electronAPI && sessionStorage && sessionStorage.getItem('IsThisFirstTime_Log_From_LiveServer')) {
      loadSetting({
        targetUrls: ['https://localhost:3000/', 'http://localhost:3000/'],
        listenPort: 8888,
        enableHttps: false,
        enableWs: false,
      })
      console.log('Initialized data on live server')
    }
  }, 10)
}
