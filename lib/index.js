const generatorMap = require('warhead-generator')
const updateNotifier = require('update-notifier')

const pkg = require('../package.json')

module.exports = function (argv, { yeomanEnv, testRunner, deploy, generatorOptions, program, installer, getAllServiceNames }) {
  return new Promise((resolve, reject) => {
    let generatorDescription = 'Run a generator. Type can be\n'

    Object.keys(generatorMap).forEach(name => {
      generatorDescription += `\t• ${name} - ${generatorMap[name]}\n`
      yeomanEnv.register(require.resolve(`warhead-generator/generators/${name}`), `warhead:${name}`)
    })

    updateNotifier({ pkg }).notify()

    program.version(pkg.version)
      .usage('generate [type]')

    program.command('generate [type]')
      .alias('g')
      .description(generatorDescription)
      .action(type => {
        if (!type) {
          program.help()
          resolve()
        } else {
          yeomanEnv.run(`warhead:${type}`, generatorOptions, err => {
            if (err) {
              return reject(err)
            }
            resolve()
          })
        }
      })

    program.command('test [name]')
      .alias('t')
      .description('Run test for a service.')
      .action(name => {
        if (!name) {
          getAllServiceNames(testRunner)
            .then(() => resolve(), reject)
        } else {
          testRunner(name)
            .then(resolve, reject)
        }
      })

    program.command('deploy [name]')
      .alias('d')
      .description('Deploy a service')
      .action(name => {
        if (!name) {
          program.help()
          resolve()
        } else {
          testRunner(name)
            .then(() => deploy(name))
            .then(resolve, reject)
        }
      })

    program
      .command('install [serviceName] [package(s)...]')
      .option('-D, --save-dev')
      .alias('i')
      .description('Install package(s) in a service')
      .action((serviceName, packages, cmd) => {
        if (!serviceName) {
          getAllServiceNames(serviceName => {
            return installer.install([], {
              cwd: `services/${serviceName}/service/`,
              stdio: 'inherit'
            }, cmd)
          })
            .then(() => resolve(), reject)
        } else {
          installer.install(packages, {
            cwd: `services/${serviceName}/service/`,
            stdio: 'inherit'
          }, cmd)
            .then(resolve, reject)
        }
      })

    program.command('*').action(() => {
      program.help()
      resolve()
    })

    program.parse(argv)

    if (argv.length === 2) {
      program.help()
      resolve()
    }
  })
}
