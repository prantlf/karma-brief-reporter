'use strict'

let clc = require('cli-color')
const pad = require('pad-left')

function padNumber (number) {
  return pad(number.toString(), 5, ' ')
}

function printStats (meaning, total, success, failed, skipped) {
  write(clc.yellow(padNumber(total) + ' ' + meaning))
  write('  ')
  write(clc.green(padNumber(success) + ' passed'))
  write('  ')
  write(clc.red(padNumber(failed) + ' failed'))
  write('  ')
  write(clc.cyan(padNumber(skipped) + ' skipped'))
  write('            ')
  write('\n')
}

exports.printProgress = function (stats) {
  const success = stats.success
  const failed = stats.failed
  const skipped = stats.skipped
  const pending = stats.total - success - failed - skipped

  printStats('pending', pending, success, failed, skipped)
  write(clc.move.up(1))
}

exports.printStats = function (stats) {
  printStats('total  ', stats.total, stats.success, stats.failed, stats.skipped)
  write('\n')
}

exports.printRuntimeErrors = function (browserErrors) {
  browserErrors.forEach(function (error) {
    write(clc.red(error.browser.name))
    write('\n')
    write('\n')
    write(clc.red(getErrorMessage(error.error)))
    write('\n')
    write('\n')
  })
}

function getErrorMessage (error) {
  if (typeof error !== 'string') {
    if (error.message) {
      // If there are both error message and stacktrace inside the error message
      error = error.message.replace(/^(?:.|\r|\n)+\r?\n\r?\n(\w*Error:)/, '$1')
    } else {
      // An unrecognized object
      error = JSON.stringify(error, undefined, 2)
    }
  }
  return error
}

exports.printTestFailures = function (failedSuites) {
  if (failedSuites.length) {
    write(clc.red('Failed Tests:\n'))
    failedSuites.forEach(function (suite) {
      write(suite.toString())
    })
  }
}

exports.printBrowserLogs = function (browserLogs) {
  function printMessage (message) {
    write('   ')
    write(clc.cyan(message))
    write('\n')
  }

  for (var browser in browserLogs) {
    const browserLog = browserLogs[browser]
    write('LOG MESSAGES FOR: ' + browserLog.name + ' INSTANCE #: ' + browser + '\n')
    browserLog.messages.forEach(printMessage)
  }
}

let write = exports.write = function (string) {
  process.stdout.write(string)
}
