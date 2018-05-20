'use strict'

let store = require('./data/store')
let types = require('./data/types')
let printers = require('./util/printers')
let shell = require('./util/shell')

function Brief (baseReporterDecorator, formatError, config) {
  var defaultOptions = function () {
    return {
      suppressBrowserLogs: false,
      suppressErrorReport: false,
      suppressErrorHighlighting: false,
      renderOnRunCompleteOnly: false
    }
  }

  this.options = defaultOptions()

  if (config && config.briefReporter) {
    Object.keys(this.options).forEach(optionName => {
      if (config.briefReporter.hasOwnProperty(optionName)) {
        this.options[optionName] = config.briefReporter[optionName]
      }
    })
  }

  types.setErrorFormatterMethod(formatError)

  if (this.options.suppressErrorHighlighting) {
    types.suppressErrorHighlighting()
  }
}

Brief.prototype.reset = function () {
  this.browsers = []
  this.browserLogs = {}
  this.browserErrors = []
  this.store = store.getInstance()
  this.stats = {}
}

Brief.prototype.onRunStart = function (browsers) {
  shell.cursor.hide()
  this.reset()
  printers.write('\n')
}

function ensureBrowserLogs (browser) {
  let browserId = browser.id
  let browserLogs = this.browserLogs
  let browserLog = browserLogs[browserId]
  if (!browserLog) {
    this.browsers.push(browser)
    browserLog = browserLogs[browserId] = {
      name: browser.name,
      messages: []
    }
  }
  return browserLog
}

Brief.prototype.onBrowserStart = function (browser) {
  ensureBrowserLogs.call(this, browser)
}

Brief.prototype.onBrowserError = function (browser, error) {
  this.browserErrors.push({browser: browser, error: error})
}

Brief.prototype.onBrowserLog = function (browser, log) {
  ensureBrowserLogs.call(this, browser).messages.push(log)
}

function ensureStats () {
  let stats = this.stats
  if (stats.total === undefined) {
    Object.assign(stats, {
      success: 0,
      failed: 0,
      skipped: 0,
      total: 0
    })
  }
}

Brief.prototype.onSpecComplete = function (browser, result) {
  const stats = this.stats = Object.create(browser.lastResult)
  ensureStats.call(this)

  const properties = Object.keys(stats)
  this.browsers.forEach(function (browser) {
    const result = browser.lastResult
    properties.forEach(function (property) {
      stats[property] += result[property]
    })
  })

  if (!this.options.suppressErrorReport) {
    this.store.save(browser, result)
  }

  if (!this.options.renderOnRunCompleteOnly) {
    printers.printProgress(this.stats)
  }
}

Brief.prototype.onRunComplete = function () {
  ensureStats.call(this)
  printers.printStats(this.stats)
  if (this.browserErrors.length) {
    printers.printRuntimeErrors(this.browserErrors)
  } else {
    printers.printTestFailures(this.store.getData())
    if (!this.options.suppressBrowserLogs) {
      printers.printBrowserLogs(this.browserLogs)
    }
  }
  shell.cursor.show()
}

module.exports = Brief
