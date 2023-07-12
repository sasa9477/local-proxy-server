'use strict'
const path = require('path')
const fs = require('fs')
const httpProxy = require('http-proxy')

/** @type {httpProxy | null} */
let server = null

/** @type {ServerStatus} */
let serverStatus = {
  isRunning: false,
  serverUrl: '',
  enableWs: false,
  qrcode: '',
}

const getServerStatus = () => serverStatus

const getHostIpAddress = () => {
  const { networkInterfaces } = require('os')
  const nets = networkInterfaces()
  const results = []

  console.log(nets)

  for (const name of Object.keys(nets)) {
    const net = nets[name]?.filter((net) => net.family === 'IPv4' && !net.internal)
    if (net?.length) results.push({ name: name, address: net[0].address })
  }
  console.log('IP Addresses', results)

  // TODO: GUIから listで選択できるようにする
  if (results.length) {
    const localIp = results.find((item) => item.address.startsWith('192.168.11'))
    return localIp.address
  }

  return 'error'
}

/**
 * launch proxy server
 * @param {StartProxyServerOption} args
 * @returns {Promise<ServerStatus>}
 */
const startProxyServer = async (args) => {
  const { targetUrl, listenPort, enableHttps, enableWs } = args

  console.log('Start proxy server')
  server = httpProxy
    .createProxyServer({
      target: targetUrl,
      ssl: enableHttps
        ? {
            key: fs.readFileSync(path.resolve(__dirname, '../localhost-key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, '../localhost.pem')),
          }
        : false,
      // see https://github.com/http-party/node-http-proxy/issues/1083.
      secure: false,
      ws: enableWs,
      changeOrigin: true,
      autoRewrite: true,
    })
    .on('error', (err, req, res) => {
      console.log('Proxy server error: \n', err)
      serverStatus.isRunning = false
      res.status(500).json({ message: err.message })
    })
    .listen(listenPort)

  const hostIpAddress = getHostIpAddress()
  const serverUrl = `${enableHttps ? 'https' : 'http'}://${hostIpAddress}:${listenPort}`

  const QRCode = require('qrcode')
  const qrcode = await QRCode.toDataURL(serverUrl, {
    scale: 3,
  })

  console.log(`Listening on ${serverUrl} target URL: ${targetUrl} ws: ${enableWs}`)

  serverStatus = {
    isRunning: true,
    targetUrl: targetUrl,
    serverUrl: serverUrl,
    enableWs: enableWs,
    qrcode: qrcode,
  }

  return serverStatus
}

const stopProxyServer = () =>
  new Promise((resolve) => {
    server.close(() => {
      server = null
      serverStatus.isRunning = false
      serverStatus.qrcode = ''

      console.log('Stopped proxy server')

      resolve(serverStatus)
    })
  })

module.exports = {
  getServerStatus,
  startProxyServer,
  stopProxyServer,
}
