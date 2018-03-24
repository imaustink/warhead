const test = require('ava')
const { Command } = require('commander')
const sinon = require('sinon')
const cli = require('../lib')
const path = require('path')

function makeArgv (str) {
  return [process.argv[0], 'warhead', ...str.split(' ')]
}

function Mock ({ services } = {}) {
  const program = new Command()
  program.help = () => {
    this.helpCalled = true
  }
  this.yeomanEnv = {
    run: sinon.spy((generator, options, callback) => callback()),
    register: sinon.spy(() => {})
  }
  this.testRunner = sinon.spy(() => Promise.resolve())
  this.deploy = sinon.spy(service => {
    return Promise.resolve()
  })
  this.installer = {
    install: sinon.spy(() => Promise.resolve())
  }
  this.getAllServiceNames = sinon.spy((promise = new Promise()) => {
    return Promise.all((services || []).map(serviceName => {
      return promise(serviceName)
    }))
  })

  this.program = program
}

test('run project generator', t => {
  const mock = new Mock()

  return cli(makeArgv('generate project'), mock).then(() => {
    t.is(mock.yeomanEnv.run.args[0][0], 'warhead:project')
  })
})

test('run service generator', t => {
  const mock = new Mock()

  return cli(makeArgv('generate service'), mock).then(() => {
    t.is(mock.yeomanEnv.run.args[0][0], 'warhead:service')
  })
})

test('run generate with missing type', t => {
  const mock = new Mock()

  return cli(makeArgv('generate'), mock).then(() => {
    t.true(mock.helpCalled)
  })
})

test('run generator errors', t => {
  const mock = new Mock()
  const error = new Error('Fucked!')

  mock.yeomanEnv.run = (generator, options, callback) => {
    callback(error)
  }
  return cli(makeArgv('generate service'), mock).catch(err => {
    t.is(err, error)
  })
})

test('run test on service', t => {
  const mock = new Mock()
  const service = 'my-service'

  return cli(makeArgv(`test ${service}`), mock).then(() => {
    t.is(mock.testRunner.args[0][0], service)
  })
})

test('run test with missing name', t => {
  const services = ['foo', 'bar']
  const mock = new Mock({services})
  return cli(makeArgv('test'), mock).then(() => {
    services.forEach((serviceName, i) => {
      const args = mock.testRunner.args[i]
      t.deepEqual(args[0], serviceName)
    })
  })
})

test('run deploy on service', t => {
  const mock = new Mock()
  const service = 'my-service'

  return cli(makeArgv(`deploy ${service}`), mock).then(() => {
    t.is(mock.testRunner.args[0][0], service)
    t.is(mock.deploy.args[0][0], service)
  })
})

test('run deploy with missing name', t => {
  const mock = new Mock()

  return cli(makeArgv('deploy'), mock).then(() => {
    t.true(mock.helpCalled)
  })
})

test('run asterisk for help', t => {
  const mock = new Mock()

  return cli(makeArgv('*'), mock).then(() => {
    t.true(mock.helpCalled)
  })
})

test('run with no arguments', t => {
  const mock = new Mock()

  return cli(['', ''], mock).then(() => {
    t.true(mock.helpCalled)
  })
})

test('run install on service', t => {
  const mock = new Mock()
  const serviceName = 'some-package'
  const installPkgs = ['foo', 'bar', 'baz', 'qux']

  return cli(makeArgv(`install ${serviceName} ${installPkgs.join(' ')}`), mock).then(() => {
    t.deepEqual(mock.installer.install.args[0][0], installPkgs)
    t.deepEqual(mock.installer.install.args[0][1], {
      cwd: `services/${serviceName}/service/`,
      stdio: 'inherit'
    })
  })
})

test('run install missing service name', t => {
  const services = ['foo', 'bar']
  const mock = new Mock({services})
  return cli(makeArgv('install'), mock).then(() => {
    services.forEach((serviceName, i) => {
      const args = mock.installer.install.args[i]
      t.deepEqual(args[0], [])
      t.deepEqual(args[1], {
        cwd: path.join('services', serviceName, 'service/'),
        stdio: 'inherit'
      })
    })
  })
})
