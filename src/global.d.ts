type Setting = {
  targetUrls: Array<string>
  listenPort: number
  enableHttps: boolean
  enableWs: boolean
}

type StartProxyServerOption = Omit<Setting, 'targetUrls'> & {
  targetUrl: string
}

interface Window {
  electronAPI: {
    onLoadSetting: (callback: (setting: Setting) => void) => void
    saveSetting: (setting: Setting) => void
    startProxyServer: (args: StartProxyServerOption) => Promise<void>
    stopProxyServer: () => Promise<void>
  }
}
