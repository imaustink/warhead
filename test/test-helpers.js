import stream from 'stream'

class ArchiverMock extends stream.Writable {
  constructor ({ error, warning } = {}) {
    super()
    this.error = error
    this.warning = warning
  }
  directory (dir) {
    this.emit('data', 'dir')
  }
  finalize () {
    if (this.warning) {
      this.emit('warning', this.warning)
    }
    if (this.error) {
      this.emit('error', this.error)
      return
    }
    this.emit('end')
  }
}

module.exports = {
  createLambdaMock ({createFunction, updateFunctionCode}) {
    return function LambdaMock () {
      this.createFunction = createFunction
      this.updateFunctionCode = updateFunctionCode
    }
  },
  stub (object, property, stub) {
    let original
    if (property) {
      original = object[property]
    } else {
      original = object
    }
    object[property] = stub
    return function teardown () {
      object[property] = original
    }
  },
  ArchiverMock
}
