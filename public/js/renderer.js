/// @ts-check
/// <reference path="../../src/global.d.ts"/>

const targetUrlInput = document.getElementById('target-url')
const listenPortInput = document.getElementById('listen-port')
const httpsInput = document.getElementById('https')
const wsInput = document.getElementById('ws')
const startButton = document.getElementById('start-button')
const stopButton = document.getElementById('stop-button')
const serverStatusElement = document.getElementById('server-status')
const serverUrlQrcodeElement = document.getElementById('server-url-qrcode')
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
  serverUrlQrcodeElement instanceof HTMLImageElement &&
  toggleShowTargetListButton instanceof HTMLButtonElement &&
  targetListContainer &&
  targetList
) {
  const setServerStatus = (/** @type {ServerStatus | null} */ status, /** @type {string | undefined} */ error) => {
    if (error) {
      serverStatusElement.innerText = error
      serverStatusElement.classList.add('error')
      return
    }

    if (!status) throw new Error('status is null')

    serverStatusElement.classList.remove('error')
    if (status?.isRunning) {
      serverStatusElement.innerText = `Listening on ${status.serverUrl}\nTARGET URL : ${status.targetUrl}\nWS : ${status.enableWs}`
    } else {
      serverStatusElement.innerText = 'Server Stopped'
    }

    startButton.disabled = status.isRunning
    stopButton.disabled = !status.isRunning
    serverUrlQrcodeElement.src = status.qrcode
  }

  startButton.addEventListener('click', async () => {
    const port = Number(listenPortInput.value.trim())
    if (Number.isNaN(port) || port < 0 || 65535 < port) {
      setServerStatus(null, 'ポートが無効な値です')
    }
    if (!targetUrlInput.value) {
      setServerStatus(null, 'ターゲットURLを指定してください')
      return
    }
    try {
      const targetUrl = new URL(targetUrlInput.value.trim())
      const enableHttps = httpsInput.checked
      const enableWs = wsInput.checked

      const status = await window.electronAPI.startProxyServer({
        targetUrl: `${targetUrl}`,
        listenPort: port,
        enableHttps: enableHttps,
        enableWs: enableWs,
      })

      setServerStatus(status)
    } catch (e) {
      if (e instanceof Error) {
        setServerStatus(null, e.message)
      }
    }
  })

  stopButton.addEventListener('click', async () => {
    const status = await window.electronAPI.stopProxyServer()
    setServerStatus(status)
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

  if (window.electronAPI) {
    window.electronAPI.onLoadSetting(loadSetting)
    window.electronAPI.onLoadServerStatus(setServerStatus)
  }

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
      serverUrlQrcodeElement.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABjCAYAAACPO76VAAAAAklEQVR4AewaftIAAAMySURBVO3BQQ4csRHAQFLY/3+Z8aVvAgaz3sQKoCr7g+sIi+sYi+sYi+sYi+sYi+sYi+sYi+sYi+sYi+sYi+sYi+sYH15S+bWKoTIqdlSeVAyVnYqh8msVbyyuYyyuY3z4CxXfUtmpGCrfUhkVQ+VJxbdUvrW4jrG4jvHhR1SeVHyrYkdlVOyofEvlScUvLK5jLK5jfDiMyrdURsVOxakW1zEW1zE+HKzijYqh8v9mcR1jcR3jw49U/JrKtyp+oeJ/ZXEdY3Ed48NfUPlvqhgqo2Ko7KiMiqEyKnZU/oXFdYzFdYwPL1WcpGKnYqiMip2Kf21xHWNxHePDSyqj4onKqBgqb1Q8Udmp2FH5VsWOyqh4Y3EdY3Ed48NLFUNlp2JU7FQMlScqOxW/VjFUnqiMim8trmMsrmN8+AsVQ2VHZVQMlVGxo/JEZVTsqIyKUTFU3lAZFb+wuI6xuI5hf/CCyqgYKqPiDZVRsaOyU/FEZadiqOxU7KjsVHxrcR1jcR3D/uDHVN6o2FEZFU9U3qjYUfmFijcW1zEW1zE+vKQyKr5VMVRGxY7KqBgqo2KojIqhMlRGxZOKHZVR8a3FdYzFdQz7gx9Q2akYKm9U7Ki8UbGjMip2VJ5U/MLiOsbiOsaHH6kYKk8qhsqoeKNiqIyKoTIqRsWTiqGyozIqvrW4jrG4jmF/8ILKTsWOyqgYKk8qnqjsVOyofKtiqIyKX1hcx1hcx7A/OIjKqBgqo2JHZadiqIyKJyqj4r9pcR1jcR3jw0sqv1axo/JGxY7KE5VRsaOyU/ELi+sYi+sYH/5CxbdUdiqGyhOVUTFURsVQ2al4o2KojIpvLa5jLK5jfPgRlScVT1RGxY7KqBgqOyo7Km9UDJUdlVHxxuI6xuI6xofDVAyVUTEqhsqoeKIyKt5QGRU7Kt9aXMdYXMf4cLCKHZUdlZ2KUfFEZadiR2VUfGtxHWNxHePDj1T8CxVDZVQMlVExVEbFv7a4jrG4jvHhL6j8msqo2KkYKr+gMiqGyo7KjsqoeGNxHWNxHcP+4DrC4jrG4jrG4jrG4jrG4jrG4jrG4jrG4jrG4jrG4jrG4jrGfwDu/qLGXYPxQAAAAABJRU5ErkJggg=='
      console.log('Initialized data on live server')
    }
  }, 10)
}
