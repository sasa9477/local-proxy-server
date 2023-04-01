type Setting = {
  targetUrls: Array<string>
  listenPort: number
}

interface Window {
  electronAPI: {
    onLoadSetting: (callback: (setting: Setting) => void) => void
    saveSetting: (setting: Setting) => void
    startProxyServer: (target: string, port: number) => Promise<void>
    stopProxyServer: () => Promise<void>
  }
}
