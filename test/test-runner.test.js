import test from 'ava'
import rewire from 'rewire'

const testRunner = rewire('../lib/test-runner')

test('testing a service passes', t => {
  const name = 'my-service'

  testRunner.__set__('spawn', (command, args, options) => {
    t.is(command, 'node_modules/nyc/bin/nyc.js')
    t.deepEqual(args, ['ava', `services/${name}/**/*.test.js`])
    t.deepEqual(options, {
      stdio: 'inherit'
    })
    return {
      on (event, handler) {
        handler(0)
      }
    }
  })

  return testRunner(name).then(() => t.pass())
})

test('test a service fails', t => {
  const exitCode = 1
  testRunner.__set__('spawn', (command, args, options) => {
    return {
      on (event, handler) {
        handler(exitCode)
      }
    }
  })

  return testRunner().catch(code => t.is(exitCode, code))
})
