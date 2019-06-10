'use strict'

let store = require('./data/store')
let types = require('./data/types')
let printers = require('./util/printers')
let shell = require('./util/shell')

function Brief (baseReporterDecorator, formatError, config
  /* , logger, helper, formatError */) {
  baseReporterDecorator(this)

  this.options = defaultOptions()
  applyConfig.call(this, config)

  types.setErrorFormatterMethod(formatError)
  if (this.options.suppressErrorHighlighting) {
    types.suppressErrorHighlighting()
  }
  if (this.options.omitExternalStackFrames) {
    types.omitExternalStackFrames()
  }

  this.adapters = [process.stdout.write.bind(process.stdout)]

  this.onRunStart = function (browsers) {
    shell.cursor.hide()
    this.reset()
    printers.write('\n')
  }

  this.onBrowserStart = function (browser) {
    ensureBrowserLogs.call(this, browser)
    ensureBrowserErrors.call(this)
  }

  this.onBrowserError = function (browser, error) {
    ensureBrowserErrors.call(this).push({ browser: browser, error: error })
  }

  this.onBrowserLog = function (browser, log) {
    ensureBrowserLogs.call(this, browser).messages.push(log)
  }

  this.onSpecComplete = function (browser, result) {
    const stats = this.stats = Object.create(browser.lastResult)
    ensureStats.call(this)
    updateStats.call(this, stats)

    if (!this.options.suppressErrorReport) {
      const failure = this.store.save(browser, result)
      if (this.options.earlyErrorReport) {
        printers.printTestFailureDuringRun(failure)
      }
    }

    if (!this.options.renderOnRunCompleteOnly) {
      printers.printProgress(this.stats)
    }
  }

  this.onRunComplete = function () {
    ensureStats.call(this)
    printers.printStats(this.stats)
    if (this.browserErrors.length) {
      printers.printRuntimeErrors(this.browsers, this.browserErrors)
    } else {
      if (!this.options.earlyErrorReport) {
        printers.printTestFailures(this.store.getData())
      }
      if (!this.options.suppressBrowserLogs) {
        printers.printBrowserLogs(this.browserLogs)
      }
    }
    shell.cursor.show()
  }
}

Brief.prototype.reset = function () {
  this.browsers = []
  this.browserLogs = {}
  this.browserErrors = []
  this.store = store.getInstance()
  this.stats = {}
}

function defaultOptions () {
  return {
    suppressBrowserLogs: false,
    suppressErrorReport: false,
    earlyErrorReport: false,
    suppressErrorHighlighting: false,
    omitExternalStackFrames: false,
    renderOnRunCompleteOnly: false
  }
}

function applyConfig (config) {
  if (config && config.briefReporter) {
    Object.keys(this.options).forEach(optionName => {
      if (config.briefReporter.hasOwnProperty(optionName)) {
        this.options[optionName] = config.briefReporter[optionName]
      }
    })
  }
}

function ensureBrowserErrors () {
  if (!this.browserErrors) {
    this.browserErrors = []
  }
  return this.browserErrors
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

function updateStats (stats) {
  const properties = Object.keys(stats)
  this.browsers.forEach(function (browser) {
    const result = browser.lastResult
    properties.forEach(function (property) {
      stats[property] += result[property]
    })
  })
}

module.exports = Brief
