#!/usr/bin/env node

const path = require('path')
const chalk = require('chalk')
const fse = require('fs-extra')
const spawn = require('cross-spawn')
const { clone, each, merge, pick } = require('vanillas')
const pkg = require('../package.json')

require('@babel/register')

const distPkg = merge({
  main: 'index.js',
  module: 'es/index.js',
  'jsnext:main': 'es/index.js',
  browser: 'dist/machines.js'
}, pick([
  'name',
  'author',
  'version',
  'license',
  'keywords',
  'repository',
  'description'
], pkg))

const resolvePath = rel => path.resolve(__dirname, '..', rel)
const paths = {
  build: resolvePath('build'),
  faucet: resolvePath('node_modules/.bin/faucet'),
  pkg: resolvePath('build/package.json'),
  babel: resolvePath('node_modules/.bin/babel'),
  eslint: resolvePath('node_modules/.bin/eslint'),
  rollup: resolvePath('node_modules/.bin/rollup'),
  tape: resolvePath('node_modules/.bin/tape')
}

fse.emptyDirSync(paths.build)
fse.writeJsonSync(paths.pkg, distPkg, { spaces: 2 })

const env = clone(process.env)

const commands = [{
  command: paths.eslint,
  args: ['src'],
  context: { stdio: 'inherit', env }
}, {
  command: paths.tape,
  args: ['--require=@babel/register', 'test/index.js', ` | ${paths.faucet}`],
  context: { stdio: 'inherit', env, shell: true }
}, {
  command: paths.babel,
  args: ['src', '--out-dir', 'build'],
  context: { stdio: 'inherit', env }
}, {
  command: paths.rollup,
  args: ['-c'],
  context: { stdio: 'inherit', env: { ...env, NODE_ENV: 'production' } }
}, {
  command: paths.rollup,
  args: ['-c'],
  context: { stdio: 'inherit', env: { ...env, NODE_ENV: 'development' } }
}]

let exitStatus = 0

each(({ command, args, context }) => {
  const { status, error } = spawn.sync(command, args, context)
  exitStatus = status
  if (error) {
    console.error(chalk.red(error))
    process.exit(exitStatus)
  }
}, commands)

process.exit(exitStatus)
