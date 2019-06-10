'use strict'

let clc = require('../util/cli-color-optional')

let counter = 0
let tab = 3
let tabs = function (depth) {
  return clc.move.right(depth * tab + 1)
}

function clearUrlQuery (error) {
  return error
    .replace(/\?.+?:/, ':')
    .replace(/\?.+( \(line \d+\))/, '$1')
}

function clearUrl (error) {
  error = error
    .replace(/ \(\w+:\/\/[^:]+:\d+\/base\/([^)]+)\)$/, ' ($1)')
    .replace(/ in \w+:\/\/[^:]+:\d+\/base\/([^)]+\))$/, ' in $1')
    .replace(/\w+:\/\/[^:]+:\d+\/base\/([^:]+:\d+:\d+)/, '$1')
  return clearUrlQuery(error)
}

function detectExternalStackFrame (error) {
  return error.indexOf('node_modules/') >= 0 || /(?:at )?<\w+>$/.test(error)
}

let errorHighlightingEnabled = true

exports.suppressErrorHighlighting = function () {
  errorHighlightingEnabled = false
}

let externalStackFrames = true

exports.omitExternalStackFrames = function () {
  externalStackFrames = false
}

let errorFormatterMethod = function (error) {
  return clearUrlQuery(error).trim()
}

exports.setErrorFormatterMethod = function (formatterMethod) {
  errorFormatterMethod = formatterMethod
}

function Suite (name) {
  this.name = name.trim()
  this.depth = 0
  this.suites = []
  this.tests = []
}

Suite.prototype.toString = function () {
  let out = []

  if (this.depth === 0) {
    out.push(tabs(this.depth) + clc.white.underline(this.name))
  } else {
    out.push(tabs(this.depth) + clc.white(this.name))
  }

  this.tests.forEach(function (test) {
    out.push(test.toString().trim())
    out.push('')
  })

  this.suites.forEach(function (suite) {
    out.push(suite.toString().trim())
    out.push('')
  })

  out.push('')
  out.push('')

  out = out.join('\n')

  return out
}

function Test (name) {
  this.name = name.trim()
  this.depth = 0
  this.browsers = []
}

Test.prototype.toString = function () {
  let out = []

  out.push(tabs(this.depth) + clc.red(this.name))

  this.browsers.forEach(function (browser) {
    out.push(browser.toString().trim())
  })

  return out.join('\n')
}

function Browser (name) {
  this.name = name.trim()
  this.depth = 0
  this.errors = []
}

function formatError (error) {
  error = errorFormatterMethod(error).trim()

  if (error.length) {
    const internal = !detectExternalStackFrame(error)
    if (internal || externalStackFrames) {
      if (internal && errorHighlightingEnabled) {
        error = clc.black.bgRed(error)
      } else {
        error = clc.blackBright(error)
      }
    } else {
      return ''
    }
  }

  return error
}

Browser.prototype.toString = function () {
  let depth = this.depth
  let out = []

  out.push(tabs(this.depth) + clc.yellow(this.name))

  this.errors.forEach(function (error, i) {
    error = error.trim()
    if (i === 0) {
      out.push(tabs(depth + 1) + (++counter) +
        ') ' + clc.redBright(clearUrl(error)))
    } else if (i === 1 && /^Actual:/.test(error)) {
      out.push(tabs(depth + 1) + counter.toString().replace(/./, ' ') +
        '  ' + clc.redBright(error))
    } else {
      error = formatError(error)
      if (error.length) {
        out.push(tabs(depth + 2) + error)
      }
    }
  })

  return out.join('\n')
}

Browser.prototype.toStandaloneString = function (suite, test) {
  const out = []

  out.push(clc.white(suite.name))
  out.push(tabs(1) + clc.red(test.name))
  out.push(tabs(2) + clc.yellow(this.name))

  this.errors.forEach(function (error, i) {
    error = error.trim()
    if (i === 0) {
      out.push(tabs(3) + clc.redBright(error))
    } else {
      error = formatError(error)
      if (error.length) {
        out.push(tabs(4) + error)
      }
    }
  })

  return out.join('\n')
}

exports.Suite = Suite
exports.Test = Test
exports.Browser = Browser
