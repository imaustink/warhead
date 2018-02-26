import test from 'ava'
import { Command } from 'commander'
import cli from '../lib'

function makeArgv (str) {
  return [process.argv[0], 'warhead', ...str.split(' ')]
}

function Mock () {
  const program = new Command()
  program.help = () => {
    this.helpCalled = true
  }
  this.registeredGenerators = []
  this.yeomanEnv = {
    run: (generator, options, callback) => {
      this.executedGenerator = generator
      callback()
    },
    register: generator => {
      this.registeredGenerators.push(generator)
    }
  }
  this.testRunner = service => {
    this.testedService = service
    return Promise.resolve()
  }
  this.deploy = service => {
    this.deployedService = service
    return Promise.resolve()
  }
  this.program = program
}

test('run project generator', t => {
  const mock = new Mock()

  return cli(makeArgv('generate project'), mock).then(() => {
    t.is(mock.executedGenerator, 'warhead:project')
  })
})

test('run service generator', t => {
  const mock = new Mock()

  return cli(makeArgv('generate service'), mock).then(() => {
    t.is(mock.executedGenerator, 'warhead:service')
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
    t.is(mock.testedService, service)
  })
})

test('run test with missing name', t => {
  const mock = new Mock()

  return cli(makeArgv('test'), mock).then(() => {
    t.true(mock.helpCalled)
  })
})

test('run deploy on service', t => {
  const mock = new Mock()
  const service = 'my-service'

  return cli(makeArgv(`deploy ${service}`), mock).then(() => {
    t.is(mock.testedService, service)
    t.is(mock.deployedService, service)
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
