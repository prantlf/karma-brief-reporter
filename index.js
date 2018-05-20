'use strict'

const Brief = require('./lib/brief')

Brief.$inject = ['baseReporterDecorator', 'formatError', 'config']

module.exports = {
  'reporter:brief': ['type', Brief]
}
