#!/usr/bin/env node
'use strict'
const { Command } = require('commander')
const yeoman = require('yeoman-environment')
const cli = require('../lib')
const deploy = require('../lib/deploy')
const testRunner = require('../lib/test-runner')
const yeomanEnv = yeoman.createEnv()
const program = new Command()

cli(process.argv, { yeomanEnv, testRunner, deploy, program })
  .then(result => result && console.log(result))
