const archiver = require('archiver')
const toArray = require('stream-to-array')

module.exports.zip = function (dir) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.error(err)
      } else {
        reject(err)
      }
    })
    archive.on('error', function (err) {
      reject(err)
    })
    archive.directory(dir, false)
    archive.finalize()

    toArray(archive)
      .then(function (buffers) {
        return Buffer.concat(buffers)
      }).then(resolve, reject)
  })
}
