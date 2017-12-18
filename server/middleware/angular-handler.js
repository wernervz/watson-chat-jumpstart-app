const path = require('path')
module.exports = function (options) {
  return function handler (req, res, next) {
    res.sendFile(path.resolve('dist/client/index.html'))
  }
}
