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

describe('brief.js test suite', function () {
  var brief
  var Brief
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
      'options',
      'onBrowserError',
      'onBrowserLog',
      'onBrowserStart',
      'onRunComplete',
      'onRunStart',
      'onSpecComplete'
    ]

    Brief = rewire('../lib/brief')
    Brief.__set__('store', storeFake)
    Brief.__set__('types', typesFake)
    Brief.__set__('printers', printersFake)
    Brief.__set__('shell', shellFake)
  })

  afterEach(function () {
    brief = null
    Brief = null
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
      brief = new Brief(null, formatterFake, configFake)

      expect(brief).to.contain.keys(defaultPropertyKeys)
      expect(brief.options).to.be.an('object')
      expect(brief.options.suppressBrowserLogs).to.be.false
      expect(brief.options.suppressErrorReport).to.be.false
      expect(brief.options.suppressErrorHighlighting).to.be.false
      expect(brief.options.renderOnRunCompleteOnly).to.be.false
      expect(typesFake.setErrorFormatterMethod.calledOnce).to.be.true
      expect(typesFake.setErrorFormatterMethod.calledWithExactly(formatterFake)).to.be.true
    })

    it('should set options when passed in via config', function () {
      configFake.briefReporter = {
        'suppressBrowserLogs': true,
        'suppressErrorReport': true,
        'suppressErrorHighlighting': true,
        'renderOnRunCompleteOnly': true,
        'someOtherOption': 1234
      }

      brief = new Brief(null, formatterFake, configFake)

      expect(brief.options.suppressBrowserLogs).to.be.true
      expect(brief.options.suppressErrorReport).to.be.true
      expect(brief.options.suppressErrorHighlighting).to.be.true
      expect(brief.options.renderOnRunCompleteOnly).to.be.true
      expect(brief.options.someOtherOption).to.be.undefined
    })

    it('should suppressErrorHighlighting if option is set in config', function () {
      configFake.briefReporter = {
        'suppressErrorHighlighting': true
      }

      brief = new Brief(null, null, configFake)

      expect(typesFake.suppressErrorHighlighting.calledOnce).to.be.true
    })
  })

  describe('test reset method', function () {
    var props

    beforeEach(function () {
      brief = new Brief(null, null, configFake)

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
      expect(brief).to.not.have.keys(Object.keys(props))
    })

    it('should have the expected properties/values afterEach reset is called', function () {
      brief.reset()

      expect(brief).to.have.keys(Object.keys(props).concat(defaultPropertyKeys))

      for (var key in props) {
        expect(brief[key]).to.eql(props[key])
      }
    })

    it('should call storeFake.getInstance()', function () {
      brief.reset()
      expect(storeFake.getInstance.calledOnce).to.be.true
    })
  })

  describe('onRunStart method tests', function () {
    var resetSpy

    beforeEach(function () {
      resetSpy = sinon.spy(Brief.prototype, 'reset')

      brief = new Brief(null, null, configFake)
    })

    afterEach(function () {
      resetSpy = null
    })

    it('should call the expected methods', function () {
      brief.onRunStart()

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

      brief = new Brief(null, null, configFake)
      brief.browserLogs = {
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
      brief.onBrowserLog(browser1, log1, null)

      expect(brief.browserLogs[browser1.id]).to.be.an('object')
      expect(brief.browserLogs[browser1.id].name).to.eq(browser1.name)
      expect(brief.browserLogs[browser1.id].messages).to.be.an('array')
      expect(brief.browserLogs[browser1.id].messages.length).to.eq(1)
      expect(brief.browserLogs[browser1.id].messages[0]).to.eq(log1)
    })

    it('should add a new entry to messages if the browser.id exists', function () {
      brief.onBrowserLog(browser1, log1, null)
      brief.onBrowserLog(browser1, log2, null)

      var logs = brief.browserLogs[browser1.id].messages

      expect(logs.length).to.eq(2)
      expect(logs[0]).to.eq(log1)
      expect(logs[1]).to.eq(log2)
    })

    it('should add a separate browser_log entry for each browser id', function () {
      brief.onBrowserLog(browser1, log1, null)
      brief.onBrowserLog(browser2, log2, null)

      var logs1 = brief.browserLogs[browser1.id].messages
      var logs2 = brief.browserLogs[browser2.id].messages

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

      brief = new Brief(null, null, configFake)
      brief.browsers = []
      brief.store = storeInstanceFake
    })

    afterEach(function () {
      browser = null
      result = null
    })

    it('should set brief.stats to inherit from browser.lastResult', function () {
      brief.onSpecComplete(browser, result)
      expect(Object.getPrototypeOf(brief.stats)).to.eq(browser.lastResult)
    })

    it('should only call save on store when suppressErrorReport is false', function () {
      brief.options.suppressErrorReport = true
      brief.onSpecComplete(browser, result)

      expect(storeInstanceFake.save.called).to.be.false

      brief.options.suppressErrorReport = false
      brief.onSpecComplete(browser, result)

      expect(storeInstanceFake.save.calledOnce).to.be.true
      expect(storeInstanceFake.save.calledWithExactly(browser, result)).to.be.true
    })
  })

  describe('onRunComplete method tests', function () {
    beforeEach(function () {
      brief = new Brief(null, null, configFake)
      brief.browserErrors = []
      brief.store = storeInstanceFake
      brief.stats = 'stats'
      brief.browserLogs = 'browserLogs'
    })

    it('should always call shellFake.cursor.show()', function () {
      brief.onRunComplete()
      ok(shellFake.cursor.show.calledOnce)
    })

    it('should call the expected methods when browserErrors is empty', function () {
      brief.onRunComplete()

      ok(printersFake.printTestFailures.calledOnce)
      ok(printersFake.printTestFailures.calledWithExactly(brief.store.getData()))

      ok(printersFake.printStats.calledOnce)
      ok(printersFake.printStats.calledWithExactly(brief.stats))

      ok(printersFake.printBrowserLogs.calledOnce)
      ok(printersFake.printBrowserLogs.calledWithExactly(brief.browserLogs))
    })

    it('should call the expected methods when borwserErrors is not empty', function () {
      brief.browserErrors.push('I\'m an error')
      brief.onRunComplete()
      ok(printersFake.printRuntimeErrors.calledWithExactly(brief.browserErrors))
    })
  })

  describe('onBrowserStart method tests', function () {
    it('should add to the browsers array', function () {
      var browser1 = { id: 'browser1' }
      var browser2 = { id: 'browser2' }

      brief = new Brief(null, null, configFake)
      brief.browsers = []
      brief.browserLogs = {}

      brief.onBrowserStart(browser1)
      eq(1, brief.browsers.length)
      eq(browser1, brief.browsers[0])

      brief.onBrowserStart(browser2)
      eq(2, brief.browsers.length)
      eq(browser2, brief.browsers[1])
    })
  })

  describe('onBrowserError method tests', function () {
    it('should add to the browserErrors property', function () {
      var browser = 'browser'
      var error = 'error'

      brief = new Brief(null, null, configFake)
      brief.browserErrors = []

      brief.onBrowserError(browser, error)
      expect(brief.browserErrors.length).to.eq(1)
      expect(brief.browserErrors[0]).to.eql({ 'browser': browser, 'error': error })
    })
  })
})
