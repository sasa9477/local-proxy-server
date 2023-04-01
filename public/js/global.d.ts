interface Window {
  electronAPI: {
    startProxyServer: (target: string, port: number) => Promise<string>
    stopProxyServer: () => Promise<string>
  }
}
