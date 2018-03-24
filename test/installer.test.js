import test from 'ava'
import { stub } from './test-helpers'
import childProcess from 'child_process'
import sinon from 'sinon'

let code
const spy = sinon.spy(() => ({
  on (event, callback) {
    callback(code)
  }
}))
const teardown = stub(childProcess, 'spawn', spy)
const installer = require('../lib/installer')

test.beforeEach(() => {
  spy.resetHistory()
})

test.after(() => {
  teardown()
})

test('installer can install modules to a service', t => {
  const modules = ['foo']
  const options = {
    cwd: 'some-dir',
    stdio: 'inherit'
  }

  code = 0
  installer.install(modules, options)
  t.true(spy.calledWith('npm', ['i', '-S', ...modules], options))
})

test('installer can install modules to a service and save-dev', t => {
  const modules = ['foo']
  const options = {
    cwd: 'some-dir',
    stdio: 'inherit'
  }
  const cmd = {
    saveDev: true
  }

  code = 0
  installer.install(modules, options, cmd)
  t.true(spy.calledWith('npm', ['i', '-D', ...modules], options))
})

test('installer exits with non-zero code', t => {
  code = 1
  return installer.install([], {}).catch(() => t.pass())
})
