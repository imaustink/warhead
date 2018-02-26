import test from 'ava'
import rewire from 'rewire'
import helpers from './test-helpers'

const zipper = rewire('../lib/zipper')

test('archiver success', t => {
  const mock = new helpers.ArchiverMock()

  zipper.__set__('archiver', () => mock)

  return zipper.zip('/some-dir').then(() => t.pass())
})

test('archiver warning', t => {
  const warning = new Error('Warning!')
  const mock = new helpers.ArchiverMock({ warning })

  zipper.__set__('archiver', () => mock)

  return zipper.zip('/some-dir').catch(warn => t.is(warning, warn))
})

test('archiver warning ENOENT', t => {
  const warning = new Error('Warning!')
  warning.code = 'ENOENT'
  const mock = new helpers.ArchiverMock({ warning })
  const consoleTeardown = helpers.stub(console, 'error', err => t.is(warning, err))

  zipper.__set__('archiver', () => mock)

  return zipper.zip('/some-dir').catch(warn => {
    t.is(warning, warn)
    consoleTeardown()
  })
})

test('archiver error', t => {
  const error = new Error('Error!')
  const mock = new helpers.ArchiverMock({ error })

  zipper.__set__('archiver', () => mock)

  return zipper.zip('/some-dir').catch(err => t.is(error, err))
})
