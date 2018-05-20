/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

var rewire = require('rewire')
var chai = require('chai')
var sinon = require('sinon')

chai.config.includeStack = true
chai.use(require('sinon-chai'))

var expect = chai.expect
var assert = chai.assert
var eq = assert.equal
var ok = assert.ok

describe('summary.js test suite', function () {
  var summary
  var Summary
  var configFake
  var formatterFake
  var storeInstanceFake
  var storeFake
  var typesFake
  var printersFake
  var shellFake
  var defaultPropertyKeys

  beforeEach(function () {
    configFake = {}
    formatterFake = sinon.spy()

    storeInstanceFake = {
      'save': sinon.spy(),
      'getData': sinon.spy()
    }

    storeFake = {
      'getInstance': sinon.stub()
    }

    storeFake
      .getInstance
      .returns(storeInstanceFake)

    typesFake = {
      'setErrorFormatterMethod': sinon.spy(),
      'suppressErrorHighlighting': sinon.spy()
    }

    printersFake = {
      'write': sinon.spy(),
      'printRuntimeErrors': sinon.spy(),
      'printTestFailures': sinon.spy(),
      'printProgress': sinon.spy(),
      'printStats': sinon.spy(),
      'printBrowserLogs': sinon.spy()
    }

    shellFake = {
      'cursor': {
        'show': sinon.spy(),
        'hide': sinon.spy()
      }
    }

    defaultPropertyKeys = [
      'options'
    ]

    Summary = rewire('../lib/summary')
    Summary.__set__('store', storeFake)
    Summary.__set__('types', typesFake)
    Summary.__set__('printers', printersFake)
    Summary.__set__('shell', shellFake)
  })

  afterEach(function () {
    summary = null
    Summary = null
    configFake = null
    formatterFake = null
    storeInstanceFake = null
    storeFake = null
    typesFake = null
    printersFake = null
    shellFake = null
    defaultPropertyKeys = null
  })

  describe('test constructor', function () {
    it('should have expected default properties', function () {
      summary = new Summary(null, formatterFake, configFake)

      expect(summary).to.contain.keys(defaultPropertyKeys)
      expect(summary.options).to.be.an('object')
      expect(summary.options.suppressBrowserLogs).to.be.false
      expect(summary.options.suppressErrorReport).to.be.false
      expect(summary.options.suppressErrorHighlighting).to.be.false
      expect(summary.options.renderOnRunCompleteOnly).to.be.false
      expect(typesFake.setErrorFormatterMethod.calledOnce).to.be.true
      expect(typesFake.setErrorFormatterMethod.calledWithExactly(formatterFake)).to.be.true
    })

    it('should set options when passed in via config', function () {
      configFake.summaryReporter = {
        'suppressBrowserLogs': true,
        'suppressErrorReport': true,
        'suppressErrorHighlighting': true,
        'renderOnRunCompleteOnly': true,
        'someOtherOption': 1234
      }

      summary = new Summary(null, formatterFake, configFake)

      expect(summary.options.suppressBrowserLogs).to.be.true
      expect(summary.options.suppressErrorReport).to.be.true
      expect(summary.options.suppressErrorHighlighting).to.be.true
      expect(summary.options.renderOnRunCompleteOnly).to.be.true
      expect(summary.options.someOtherOption).to.be.undefined
    })

    it('should suppressErrorHighlighting if option is set in config', function () {
      configFake.summaryReporter = {
        'suppressErrorHighlighting': true
      }

      summary = new Summary(null, null, configFake)

      expect(typesFake.suppressErrorHighlighting.calledOnce).to.be.true
    })
  })

  describe('test reset method', function () {
    var props

    beforeEach(function () {
      summary = new Summary(null, null, configFake)

      props = {
        'browsers': [],
        'browserLogs': {},
        'browserErrors': [],
        'store': storeInstanceFake,
        'stats': {}
      }
    })

    afterEach(function () {
      props = null
    })

    it('should not have these properties before reset is called', function () {
      expect(summary).to.not.have.keys(Object.keys(props))
    })

    it('should have the expected properties/values afterEach reset is called', function () {
      summary.reset()

      expect(summary).to.have.keys(Object.keys(props).concat(defaultPropertyKeys))

      for (var key in props) {
        expect(summary[key]).to.eql(props[key])
      }
    })

    it('should call storeFake.getInstance()', function () {
      summary.reset()
      expect(storeFake.getInstance.calledOnce).to.be.true
    })
  })

  describe('onRunStart method tests', function () {
    var resetSpy

    beforeEach(function () {
      resetSpy = sinon.spy(Summary.prototype, 'reset')

      summary = new Summary(null, null, configFake)
    })

    afterEach(function () {
      resetSpy = null
    })

    it('should call the expected methods', function () {
      summary.onRunStart()

      expect(shellFake.cursor.hide.calledOnce).to.be.true
      expect(resetSpy.calledOnce).to.be.true
      expect(printersFake.write.calledOnce).to.be.true
      expect(printersFake.write.calledWithExactly('\n')).to.be.true
    })
  })

  describe('onBrowserLog method tests', function () {
    var browser1
    var browser2
    var log1
    var log2

    beforeEach(function () {
      browser1 = {
        'id': 'fakeBrowserId1',
        'name': 'fakeBrowserName1'
      }

      browser2 = {
        'id': 'fakeBrowserId2',
        'name': 'fakeBrowserName2'
      }

      log1 = 'log message 1'
      log2 = 'log message 2'

      summary = new Summary(null, null, configFake)
      summary.browserLogs = {
        'fakeBrowserId1': {
          name: 'fakeBrowserName1',
          messages: []
        },
        'fakeBrowserId2': {
          name: 'fakeBrowserName2',
          messages: []
        }
      }
    })

    afterEach(function () {
      browser1 = null
      browser2 = null
      log1 = null
      log2 = null
    })

    it('should add an entry to the browserLogs property', function () {
      summary.onBrowserLog(browser1, log1, null)

      expect(summary.browserLogs[browser1.id]).to.be.an('object')
      expect(summary.browserLogs[browser1.id].name).to.eq(browser1.name)
      expect(summary.browserLogs[browser1.id].messages).to.be.an('array')
      expect(summary.browserLogs[browser1.id].messages.length).to.eq(1)
      expect(summary.browserLogs[browser1.id].messages[0]).to.eq(log1)
    })

    it('should add a new entry to messages if the browser.id exists', function () {
      summary.onBrowserLog(browser1, log1, null)
      summary.onBrowserLog(browser1, log2, null)

      var logs = summary.browserLogs[browser1.id].messages

      expect(logs.length).to.eq(2)
      expect(logs[0]).to.eq(log1)
      expect(logs[1]).to.eq(log2)
    })

    it('should add a separate browser_log entry for each browser id', function () {
      summary.onBrowserLog(browser1, log1, null)
      summary.onBrowserLog(browser2, log2, null)

      var logs1 = summary.browserLogs[browser1.id].messages
      var logs2 = summary.browserLogs[browser2.id].messages

      expect(logs1.length).to.eq(1)
      expect(logs2.length).to.eq(1)
      expect(logs1[0]).to.eq(log1)
      expect(logs2[0]).to.eq(log2)
    })
  })

  describe('onSpecComplete method tests', function () {
    var browser
    var result

    beforeEach(function () {
      browser = {
        'lastResult': {}
      }

      result = {}

      summary = new Summary(null, null, configFake)
      summary.browsers = []
      summary.store = storeInstanceFake
    })

    afterEach(function () {
      browser = null
      result = null
    })

    it('should set summary.stats to inherit from browser.lastResult', function () {
      summary.onSpecComplete(browser, result)
      expect(Object.getPrototypeOf(summary.stats)).to.eq(browser.lastResult)
    })

    it('should only call save on store when suppressErrorReport is false', function () {
      summary.options.suppressErrorReport = true
      summary.onSpecComplete(browser, result)

      expect(storeInstanceFake.save.called).to.be.false

      summary.options.suppressErrorReport = false
      summary.onSpecComplete(browser, result)

      expect(storeInstanceFake.save.calledOnce).to.be.true
      expect(storeInstanceFake.save.calledWithExactly(browser, result)).to.be.true
    })
  })

  describe('onRunComplete method tests', function () {
    beforeEach(function () {
      summary = new Summary(null, null, configFake)
      summary.browserErrors = []
      summary.store = storeInstanceFake
      summary.stats = 'stats'
      summary.browserLogs = 'browserLogs'
    })

    it('should always call shellFake.cursor.show()', function () {
      summary.onRunComplete()
      ok(shellFake.cursor.show.calledOnce)
    })

    it('should call the expected methods when browserErrors is empty', function () {
      summary.onRunComplete()

      ok(printersFake.printTestFailures.calledOnce)
      ok(printersFake.printTestFailures.calledWithExactly(summary.store.getData()))

      ok(printersFake.printStats.calledOnce)
      ok(printersFake.printStats.calledWithExactly(summary.stats))

      ok(printersFake.printBrowserLogs.calledOnce)
      ok(printersFake.printBrowserLogs.calledWithExactly(summary.browserLogs))
    })

    it('should call the expected methods when borwserErrors is not empty', function () {
      summary.browserErrors.push('I\'m an error')
      summary.onRunComplete()
      ok(printersFake.printRuntimeErrors.calledWithExactly(summary.browserErrors))
    })
  })

  describe('onBrowserStart method tests', function () {
    it('should add to the browsers array', function () {
      var browser1 = {id: 'browser1'}
      var browser2 = {id: 'browser2'}

      summary = new Summary(null, null, configFake)
      summary.browsers = []
      summary.browserLogs = {}

      summary.onBrowserStart(browser1)
      eq(1, summary.browsers.length)
      eq(browser1, summary.browsers[0])

      summary.onBrowserStart(browser2)
      eq(2, summary.browsers.length)
      eq(browser2, summary.browsers[1])
    })
  })

  describe('onBrowserError method tests', function () {
    it('should add to the browserErrors property', function () {
      var browser = 'browser'
      var error = 'error'

      summary = new Summary(null, null, configFake)
      summary.browserErrors = []

      summary.onBrowserError(browser, error)
      expect(summary.browserErrors.length).to.eq(1)
      expect(summary.browserErrors[0]).to.eql({'browser': browser, 'error': error})
    })
  })
})
