const path = require('path')
const fs = require('fs')
const httpProxy = require('http-proxy')

/** @type {httpProxy | null} */
let server = null

/**
 * launch proxy server
 * @param {StartProxyServerOption} args
 * @returns {Promise<void>}
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
      res.status(500).json({ message: err.message })
    })
    .listen(listenPort)

  console.log(`Https ${enableHttps}, Ws ${enableWs}`)
  console.log(`Target url ${targetUrl}. Listening on port ${listenPort}...`)
}

const stopProxyServer = async () => {
  if (server != null) {
    server.close(() => {
      server = null
      console.log('Stopped proxy server')
    })
  }
}

module.exports = {
  startProxyServer,
  stopProxyServer,
}
