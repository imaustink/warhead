import test from 'ava'
import path from 'path'
import rewire from 'rewire'

const deploy = rewire('../lib/deploy')
const serviceName = 'my-service'
const expectedServicePath = path.join(process.cwd(), 'services', serviceName, 'service')
const expectedServicePackage = {}
const expectedProjectPackage = {
  warhead: {
    platform: 'lambda'
  }
}

deploy.__set__('require', mockRequire('../lib/deploy', {
  [path.join(process.cwd(), 'package')]: expectedProjectPackage,
  [path.join(expectedServicePath, 'package')]: expectedServicePackage
}))

deploy.__set__('fs', {
  existsSync () {
    return true
  }
})

function mockRequire (base, map) {
  return function (name) {
    if (map[name]) {
      return map[name]
    }
    if (path.parse(name).dir) {
      return require(path.join(base, name))
    }
    return require(name)
  }
}

test.serial('deploy a lambda', t => {
  deploy.__set__('publishers', {
    lambda ({name, servicePath, servicePackage, projectPackage}) {
      t.is(serviceName, name)
      t.is(expectedServicePath, servicePath)
      t.is(expectedServicePackage, servicePackage)
      t.is(expectedProjectPackage, projectPackage)

      return Promise.resolve()
    }
  })

  return deploy(serviceName)
})

test.serial('no service package found', t => {
  deploy.__set__('require', mockRequire('../lib/deploy', {
    [path.join(process.cwd(), 'package')]: expectedProjectPackage,
    get [path.join(expectedServicePath, 'package')] () {
      throw new Error('Not found')
    }
  }))

  return deploy(serviceName).catch(err => t.true(err.message.indexOf('No package.json found') > -1))
})

test.serial('no service path found', t => {
  deploy.__set__('fs', {
    existsSync () {
      return false
    }
  })

  return deploy(serviceName).catch(err => t.true(err.message.indexOf('No service found') > -1))
})

test.serial('no warhead config found', t => {
  delete expectedProjectPackage.warhead

  return deploy(serviceName).catch(err => t.true(err.message.indexOf('No warhead configuration') > -1))
})

test.serial('no project package found', t => {
  deploy.__set__('require', mockRequire('../lib/deploy', {
    get [path.join(process.cwd(), 'package')] () {
      throw new Error('Not found')
    }
  }))

  return deploy(serviceName).catch(err => t.true(err.message.indexOf('No package.json found') > -1))
})
