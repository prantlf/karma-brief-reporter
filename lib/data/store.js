'use strict'

const types = require('./types')

const DataStore = function () {
  const data = []

  this.getData = function () {
    return data
  }
}

DataStore.prototype.save = function (browser, result) {
  if (!result.success && !result.skipped && result.suite.length > 0) {
    const suite = this.findSuiteInResult(result)

    return this.saveResultToSuite(suite, browser, result)
  }
}

DataStore.prototype.saveResultToSuite = function (suite, browser, result) {
  suite.tests = (!suite.tests) ? [] : suite.tests
  const test = this.findTestByName(suite.tests, result.description)
  test.depth = suite.depth + 1

  const browserInfo = this.findBrowserByName(test.browsers, browser.name)
  browserInfo.depth = test.depth + 1

  if (result.log && result.log[0] !== null) {
    browserInfo.errors = result.log[0].split('\n')
  }

  return { suite, test, browser: browserInfo }
}

DataStore.prototype.findSuiteInResult = function (result) {
  let suite
  const self = this
  let searchArray = self.getData()

  result.suite.forEach(function (suiteName, i) {
    suite = self.findSuiteByName(searchArray, suiteName)
    suite.depth = i

    suite.suites = (!suite.suites) ? [] : suite.suites
    searchArray = suite.suites
  })

  return suite
}

DataStore.prototype.findByName = function (arr, name, Constructor) {
  let it
  // Look through the array for an object with a
  // 'name' property that matches the 'name' arg
  arr.every(function (el) {
    if (el.name === name) {
      it = el
      return false
    }
    return true
  })

  // If a matching object is not found, create a
  // new one and push it to the provided array
  if (!it) {
    it = new Constructor(name)
    arr.push(it)
  }

  // return the object
  return it
}

DataStore.prototype.findSuiteByName = function (arr, name) {
  return this.findByName(arr, name, types.Suite)
}

DataStore.prototype.findTestByName = function (arr, name) {
  return this.findByName(arr, name, types.Test)
}

DataStore.prototype.findBrowserByName = function (arr, name) {
  return this.findByName(arr, name, types.Browser)
}

exports.getInstance = function () { return new DataStore() }
