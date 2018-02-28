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
    let copy = object
    let path = property.split('.')
    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        original = copy[path[i]]
        copy[path[i]] = stub
      }
      copy = copy[path[i]]
    }
    return function teardown () {
      let copy = object
      for (let i = 0; i < path.length; i++) {
        if (i === path.length - 1) {
          copy[path[i]] = original
          break
        }
        copy = copy[path[i]]
      }
    }
  },
  ArchiverMock
}
