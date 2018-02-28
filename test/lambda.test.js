import test from 'ava'
import publishers from '../lib/publishers'
import zipper from '../lib/zipper'
import helpers from './test-helpers'
import AWS from 'aws-sdk'
import _ from 'lodash'
import fs from 'then-fs'
import path from 'path'

const name = 'my-service'
const zippedFile = []
const servicePath = '/Users/admin/my-project/services/my-service/service'
let teardownZipper

test.before(() => {
  teardownZipper = helpers.stub(zipper, 'zip', () => Promise.resolve(zippedFile))
})

test.after(() => {
  teardownZipper()
})

test.serial('create a new lambda function', t => {
  const settings = { foo: 'bar' }
  const servicePackage = {
    description: 'My awesome service',
    warhead: {
      settings
    }
  }
  const hash = Math.random() + ''

  const teardownLambda = helpers.stub(AWS, 'Lambda', helpers.createLambdaMock({
    createFunction (options) {
      t.deepEqual(options, Object.assign(settings, {
        Code: {
          ZipFile: zippedFile
        },
        Description: servicePackage.description,
        FunctionName: name,
        VpcConfig: {}
      }))
      return {
        promise () {
          return Promise.resolve({ CodeSha256: hash })
        }
      }
    }
  }))

  const teardownWriteFile = helpers.stub(fs, 'writeFile', (filename, data) => {
    const expectedPackage = _.merge({ warhead: { hash } }, servicePackage)
    t.deepEqual(JSON.parse(data), expectedPackage)
    t.is(filename, path.join(servicePath, 'package.json'))
  })

  return publishers.lambda({
    name,
    servicePath,
    servicePackage
  }).then(() => {
    teardownLambda()
    teardownWriteFile()
  })
})

test.serial('update an existing lambda function', t => {
  const hash = Math.random() + ''
  const servicePackage = {
    description: 'My awesome service',
    warhead: {
      hash,
      settings: {
        region: 'foo'
      }
    }
  }

  const teardownLambda = helpers.stub(AWS, 'Lambda', helpers.createLambdaMock({
    updateFunctionCode (options) {
      t.pass()
      return {
        promise () {
          return Promise.resolve({ CodeSha256: hash })
        }
      }
    }
  }))

  const teardownWriteFile = helpers.stub(fs, 'writeFile', (filename, data) => {
    t.is(JSON.parse(data).warhead.hash, hash)
  })

  return publishers.lambda({
    name,
    servicePath,
    servicePackage
  }).then(() => {
    teardownLambda()
    teardownWriteFile()
  })
})

test.serial('Lambda constructor is passed a region', t => {
  const expectedRegion = 'us-east-1'
  const teardownWriteFile = helpers.stub(fs, 'writeFile', () => {})
  const teardownLambda = helpers.stub(AWS, 'Lambda', helpers.createLambdaMock({
    createFunction (options) {
      return {
        promise () {
          return Promise.resolve({ CodeSha256: '' })
        }
      }
    }
  }))
  const tearDownConfig = helpers.stub(AWS, 'config.update', ({region}) => {
    t.is(expectedRegion, region)
  })

  return publishers.lambda({
    servicePath,
    servicePackage: {
      warhead: {
        settings: {
          region: expectedRegion
        }
      }
    }
  }).then(() => {
    teardownWriteFile()
    teardownLambda()
    tearDownConfig()
  })
})
