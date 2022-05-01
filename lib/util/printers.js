'use strict'

const clc = require('./cli-color-optional')

function padNumber (number) {
  return number.toString().padStart(5, ' ')
}

function formatBrowserName (browser) {
  const name = browser.name
    .replace(/^(\w+).*$/, '$1')
    .replace('Headless', '')
  return name.padEnd(7, ' ')
}

function printStats (browser, meaning, total, success, failed, skipped) {
  if (browser) {
    write(clc.blackBright(formatBrowserName(browser)))
    write('  ')
  }
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

exports.printProgress = function (browsers, stats) {
  function printLine (browser, stats) {
    const success = stats.success
    const failed = stats.failed
    const skipped = stats.skipped
    const pending = stats.total - success - failed - skipped
    printStats(browser, 'pending', pending, success, failed, skipped)
  }

  if (browsers.length > 1) {
    browsers.forEach(function (browser) {
      printLine(browser, browser.lastStats)
    })
  } else {
    printLine(undefined, stats)
  }
  write(clc.move.up(browsers.length))
}

exports.printStats = function (browsers, stats) {
  function printLine (browser, stats) {
    printStats(browser, 'total  ', stats.total, stats.success, stats.failed, stats.skipped)
  }

  if (browsers.length > 1) {
    browsers.forEach(function (browser) {
      printLine(browser, browser.lastStats)
    })
  } else {
    printLine(undefined, stats)
  }
  write('\n')
}

exports.printRuntimeErrors = function (browsers, browserErrors) {
  browserErrors.forEach(function (error) {
    if (browsers.length > 1) {
      write(clc.red(error.browser.name))
      write('\n')
      write('\n')
    }
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

exports.printTestFailureDuringRun = function ({ suite, test, browser } = {}) {
  if (browser) {
    const message = browser.toStandaloneString(suite, test)
    write(clc.fixMoveRight('\n\n' + message + '\n\n'))
  }
}

exports.printTestFailures = function (failedSuites) {
  if (failedSuites.length) {
    write(clc.red('Failed Tests:\n'))
    failedSuites.forEach(function (suite) {
      write(clc.fixMoveRight(suite.toString()))
    })
  }
}

exports.printBrowserLogs = function (browserLogs) {
  function printMessage (message) {
    write('   ')
    write(clc.cyan(message))
    write('\n')
  }

  for (const browser in browserLogs) {
    const browserLog = browserLogs[browser]
    write('LOG MESSAGES FOR: ' + browserLog.name + ' INSTANCE #: ' + browser + '\n')
    browserLog.messages.forEach(printMessage)
  }
}

const write = exports.write = function (string) {
  process.stdout.write(string)
}
