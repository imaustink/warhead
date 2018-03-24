#!/usr/bin/env node
'use strict'
const { Command } = require('commander')
const yeoman = require('yeoman-environment')
const cli = require('../lib')
const deploy = require('../lib/deploy')
const testRunner = require('../lib/test-runner')
const installer = require('../lib/installer')
const yeomanEnv = yeoman.createEnv()
const program = new Command()
const path = require('path')
const fs = require('fs')
function getAllServiceNames (promise) {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(process.cwd(), 'services'), (err, dirs) => {
      if (err) {
        return reject(err)
      }
      Promise.all(dirs.map(dir => {
        const pathParts = dir.split(path.sep)
        const name = pathParts.pop()
        return promise(name)
      })).then(resolve, reject)
      resolve(dirs)
    })
  })
}

cli(process.argv, { yeomanEnv, testRunner, deploy, program, installer, getAllServiceNames })
  .then(result => result && console.log(result))
