const { spawn } = require('child_process')

module.exports = function (name) {
  return new Promise((resolve, reject) => {
    spawn('node_modules/nyc/bin/nyc.js', ['ava', `services/${name}/**/*.test.js`], {
      stdio: 'inherit'
    }).on('close', code => {
      if (code > 0) {
        return reject(code)
      }
      resolve(code)
    })
  })
}
