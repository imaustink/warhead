const path = require('path')
const fs = require('fs')
const publishers = require('./publishers')

module.exports = function (name) {
  return Promise.resolve().then(() => {
    try {
      var projectPackage = require(path.join(process.cwd(), 'package'))
    } catch (e) {
      throw new Error('No package.json found in this directory!')
    }
    const servicePath = path.join(process.cwd(), 'services', name, 'service')
    if (!projectPackage.warhead) {
      throw new Error('No warhead configuration found in this project\'s package.json!')
    }
    if (!fs.existsSync(servicePath)) {
      throw new Error(`No service found at ${servicePath}!`)
    }
    try {
      var servicePackage = require(path.join(servicePath, 'package'))
    } catch (e) {
      throw new Error(`No package.json found in ${servicePath}!`)
    }
    switch (projectPackage.warhead.platform) {
      case 'lambda':
        return publishers.lambda({name, servicePath, servicePackage, projectPackage})
      // case 'google':
      //   // TODO
      //   break
      // case 'azure':
      //   // TODO
      //   break
      // case 'firebase':
      //   // TODO
      //   break
    }
  }).then(() => `Successfully deployed ${name} service!`)
}
