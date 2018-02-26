const os = require('os')
const path = require('path')
const zipper = require('../zipper')
const fs = require('then-fs')
const AWS = require('aws-sdk')

class Lambda {
  constructor () {
    AWS.config.update({region: 'us-east-1'})
    this.lambda = new AWS.Lambda({
      apiVersion: '2015-03-31'
    })
  }
  create (options) {
    return this.lambda.createFunction(options).promise()
  }
  update (options) {
    return this.lambda.updateFunctionCode(options).promise()
  }
  // invoke (options) {
  //   return this.lambda.invoke(options).promise()
  // }
}

module.exports = function ({name, servicePath, servicePackage}) {
  return zipper.zip(servicePath).then(serviceZip => {
    const lambda = new Lambda()

    if (servicePackage.warhead.hash) {
      return lambda.update({
        FunctionName: name,
        ZipFile: serviceZip
      })
    } else {
      const baseOptions = {
        Code: {
          ZipFile: serviceZip
        },
        Description: servicePackage.description,
        FunctionName: name,
        VpcConfig: {}
      }
      return lambda.create(Object.assign(baseOptions, servicePackage.warhead.settings))
    }
  }).then(result => {
    servicePackage.warhead.hash = result.CodeSha256
    return fs.writeFile(
      path.join(servicePath, 'package.json'),
      JSON.stringify(servicePackage, null, 2) + os.EOL
    )
  })
}
