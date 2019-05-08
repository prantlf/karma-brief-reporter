'use strict'

const Brief = require('./lib/brief')

Brief.$inject = ['baseReporterDecorator', 'formatError', 'config'
  /*, 'logger', 'helper', 'formatError' */]

module.exports = {
  'reporter:brief': ['type', Brief]
}
