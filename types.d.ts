interface Window {
  electronAPI: {
    openFile: (name: string) => Promise<string | undefined>
    launchProxyServer: (target: URL) => Promise<string>
  }
}
