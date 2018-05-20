/* eslint-env mocha */
'use strict'

let rewire = require('rewire')
let chai = require('chai')
let sinon = require('sinon')

chai.config.includeStack = true
chai.use(require('sinon-chai'))

let assert = chai.assert
let ok = assert.ok
let eq = assert.equal

describe('data/store.js - test suite', function () {
  let module, store, fakeBrowser, fakeResult, fakeSuite

  beforeEach(function () {
    module = rewire('../lib/data/store')
    store = module.getInstance()

    fakeBrowser = {
      name: 'fake browser'
    }

    fakeResult = {
      success: false,
      skipped: false,
      suite: [1, 2, 3]
    }

    fakeSuite = {
      tests: [],
      depth: 0,
      suites: []
    }
  })

  afterEach(function () {
    store = null
  })

  describe('DataStore - class constructor tests', function () {
    it('getData returns an empty array', function () {
      let actual = store.getData()
      assert.isArray(actual)
    })
  })

  describe('save tests', function () {
    let findSuiteInResultFake, saveResultToSuiteFake

    beforeEach(function () {
      findSuiteInResultFake = sinon.stub()
      saveResultToSuiteFake = sinon.stub()

      store.findSuiteInResult = findSuiteInResultFake
      store.saveResultToSuite = saveResultToSuiteFake
    })

    it('should call findSuiteInResult and saveResultToSuite if result.skipped ' +
       'and result.skipped are false and result.suite.length > 0', function () {
      findSuiteInResultFake.withArgs(fakeResult).returns(fakeSuite)

      store.save(fakeBrowser, fakeResult)

      ok(findSuiteInResultFake.withArgs(fakeResult).calledOnce)
      ok(saveResultToSuiteFake.withArgs(fakeSuite, fakeBrowser, fakeResult).calledOnce)
    })

    it('should do nothing if result.success is true', function () {
      fakeResult.success = true

      store.save(fakeBrowser, fakeResult)

      ok(findSuiteInResultFake.notCalled)
      ok(saveResultToSuiteFake.notCalled)
    })

    it('should do nothing if result.skipped is true', function () {
      fakeResult.skipped = true

      store.save(fakeBrowser, fakeResult)

      ok(findSuiteInResultFake.notCalled)
      ok(saveResultToSuiteFake.notCalled)
    })

    it('should do nothing if result.suite.length <= 0', function () {
      fakeResult.suite = []

      store.save(fakeBrowser, fakeResult)

      ok(findSuiteInResultFake.notCalled)
      ok(saveResultToSuiteFake.notCalled)
    })
  })

  describe('saveResultToSuite tests', function () {
    let findTestByNameFake, findBrowserByNameFake
    let suite, result, browser
    let test, browserInfo

    beforeEach(function () {
      findTestByNameFake = sinon.stub()
      findBrowserByNameFake = sinon.stub()

      store.findTestByName = findTestByNameFake
      store.findBrowserByName = findBrowserByNameFake

      suite = {depth: 0}
      browser = {name: 'The Browser'}
      result = {description: 'blah'}

      test = {browsers: []}
      browserInfo = {}

      findTestByNameFake.withArgs([], result.description).returns(test)
      findBrowserByNameFake.withArgs(test.browsers, browser.name).returns(browserInfo)
    })

    it('should call findTestByName and findBrowserByName as expected', function () {
      store.saveResultToSuite(suite, browser, result)

      ok(findTestByNameFake.calledOnce)
      ok(findTestByNameFake.calledWithExactly([], result.description))

      ok(findBrowserByNameFake.calledOnce)
      ok(findBrowserByNameFake.calledWithExactly(test.browsers, browser.name))
    })

    it('should call findTestByName with suiteTestsFake', function () {
      let suiteTestsFake = ['abc']
      suite.tests = suiteTestsFake
      findTestByNameFake.withArgs(suiteTestsFake, result.description).returns(test)

      store.saveResultToSuite(suite, browser, result)

      ok(findTestByNameFake.calledOnce)
      ok(findTestByNameFake.calledWithExactly(suiteTestsFake, result.description))
    })

    it('should create brwsr.errors from result.log', function () {
      result.log = ['failure01\nfailure02']
      let expected = ['failure01', 'failure02']

      store.saveResultToSuite(suite, browser, result)

      assert.deepEqual(expected, browserInfo.errors)
    })
  })

  describe('findSuiteInResult tests', function () {
    let resultFake, responseFake, findSuiteByNameFake, getDataFake
    let suiteFakeBob, suiteFakeDole

    beforeEach(function () {
      resultFake = {suite: ['bob', 'dole']}
      findSuiteByNameFake = sinon.stub()
      getDataFake = sinon.stub()
      responseFake = ['bob']
      suiteFakeBob = {suites: ['blah']}
      suiteFakeDole = {}

      store.getData = getDataFake
      getDataFake.returns(responseFake)

      findSuiteByNameFake.withArgs(responseFake, 'bob').returns(suiteFakeBob)
      findSuiteByNameFake.withArgs(suiteFakeBob.suites, 'dole').returns(suiteFakeDole)

      store.findSuiteByName = findSuiteByNameFake
    })

    it('should call store.getData once', function () {
      store.findSuiteInResult(resultFake)

      ok(getDataFake.calledOnce)
    })

    it('should call findSuiteByName the expected number of times', function () {
      store.findSuiteInResult(resultFake)

      eq(2, findSuiteByNameFake.callCount)
    })

    it('should call findSuiteByName with the expected args', function () {
      store.findSuiteInResult(resultFake)

      ok(findSuiteByNameFake.firstCall.calledWithExactly(responseFake, 'bob'))
      ok(findSuiteByNameFake.secondCall.calledWithExactly(suiteFakeBob.suites, 'dole'))
    })
  })

  describe('findByName tests', function () {
    let array

    beforeEach(function () {
      array = [new FakeClass('Bob Dole')]
    })

    it('should return the existing FakeClass with the matching name', function () {
      let actual = store.findByName(array, 'Bob Dole', FakeClass)
      eq(array[0], actual)
      eq(1, array.length)
    })

    it('should append a new FakeClass with the desired name when not found in arr', function () {
      let actual = store.findByName(array, 'Columbo', FakeClass)
      eq(2, array.length)
      ok(actual instanceof FakeClass)
      eq('Columbo', actual.name)
    })
  })

  describe('findSuiteByName tests', function () {
    let findByNameFake

    beforeEach(function () {
      findByNameFake = sinon.stub()
      store.findByName = findByNameFake
      module.__set__('types.Suite', FakeClass)
    })

    it('should call findByName with the expected params', function () {
      let array = []
      let name = 'Bob Dole Suite'
      store.findSuiteByName(array, name)

      ok(findByNameFake.calledOnce)
      ok(findByNameFake.calledWithExactly(array, name, FakeClass))
    })
  })

  describe('findTestByName tests', function () {
    let findByNameFake

    beforeEach(function () {
      findByNameFake = sinon.stub()
      store.findByName = findByNameFake
      module.__set__('types.Test', FakeClass)
    })

    it('should call findByName with the expected params', function () {
      let array = []
      let name = 'Bob Dole Test'
      store.findTestByName(array, name)

      ok(findByNameFake.calledOnce)
      ok(findByNameFake.calledWithExactly(array, name, FakeClass))
    })
  })

  describe('findBrowserByName tests', function () {
    let findByNameFake

    beforeEach(function () {
      findByNameFake = sinon.stub()
      store.findByName = findByNameFake
      module.__set__('types.Browser', FakeClass)
    })

    it('should call findByName with the expected params', function () {
      let array = []
      let name = 'Bob Dole Browser'
      store.findBrowserByName(array, name)

      ok(findByNameFake.calledOnce)
      ok(findByNameFake.calledWithExactly(array, name, FakeClass))
    })
  })
})

function FakeClass (name) {
  this.name = name
}
