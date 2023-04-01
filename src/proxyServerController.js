const fs = require('fs')
const httpProxy = require('http-proxy')

/** @type {httpProxy | null} */
let server = null

/**
 * launch proxy server
 * @param {string} targetUrl
 * @param {number} port
 * @returns {Promise<string>}
 */
const startProxyServer = async (targetUrl, port) => {
  console.log('start proxy server')
  server = httpProxy
    .createProxyServer({
      target: targetUrl,
      ssl: {
        key: fs.readFileSync('localhost-key.pem'),
        cert: fs.readFileSync('localhost.pem'),
      },
      // see https://github.com/http-party/node-http-proxy/issues/1083.
      secure: false,
      ws: true,
    })
    .listen(port)
  console.log(`target url ${targetUrl}`)
  console.log(`listen on port ${port}...`)
}

const stopProxyServer = async () => {
  if (server != null) {
    server.close(() => {
      server = null
      console.log('stop proxy server')
    })
  }
}

module.exports = {
  startProxyServer,
  stopProxyServer,
}
