'use strict'

const Summary = require('./lib/summary')

Summary.$inject = ['baseReporterDecorator', 'formatError', 'config']

module.exports = {
  'reporter:summary': ['type', Summary]
}
