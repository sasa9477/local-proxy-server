type ServerStatus = {
  isRunning: boolean
  targetUrl: string
  serverUrl: string
  enableWs: boolean
  qrcode: string
}

type Setting = {
  targetUrls: Array<string>
  listenPort: number
  enableHttps: boolean
  enableWs: boolean
}

type StartProxyServerOption = {
  targetUrl: string
  listenPort: number
  enableHttps: boolean
  enableWs: boolean
}

interface Window {
  electronAPI: {
    onLoadSetting: (callback: (setting: Setting) => void) => void
    saveSetting: (setting: Setting) => void
    onLoadServerStatus: (callback: (status: ServerStatus) => void) => void
    startProxyServer: (args: StartProxyServerOption) => Promise<ServerStatus>
    stopProxyServer: () => Promise<ServerStatus>
  }
}
