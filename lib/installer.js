
const { spawn } = require('child_process')
module.exports.install = function (modules, options, cmd = {}) {
  return new Promise((resolve, reject) => {
    spawn('npm', ['i', (cmd.saveDev ? '-D' : '-S'), ...modules], options)
      .on('close', code => {
        if (code > 0) {
          return reject(code)
        }
        resolve(code)
      })
  })
}
