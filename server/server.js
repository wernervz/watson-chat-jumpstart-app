require('./utils/wsl-env')

var LOG = require('winston')

var loopback = require('loopback')
var boot = require('loopback-boot')

var app = module.exports = loopback()

app.start = function () {
  // start the web server
  return app.listen(function () {
    var baseUrl = app.get('url').replace(/\/$/, '')
    LOG.info('Web server listening at: %s', baseUrl)
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath
      LOG.info('Browse your REST API at %s%s', baseUrl, explorerPath)
    }
  })
}
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) {
    app.emit('not started')
    throw err
  }
  app.emit('started')
  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start()
  }
})
