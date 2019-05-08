/* eslint-env mocha */
'use strict'

let rewire = require('rewire')
let chai = require('chai')
let sinon = require('sinon')

chai.config.includeStack = true
chai.use(require('sinon-chai'))

let assert = chai.assert
let eq = assert.equal
let ok = assert.ok

describe('types.js test suite', function () {
  let types, clcFake, right
  let tab = 3

  beforeEach(function () {
    right = 'right>'

    clcFake = {
      'move': {
        'right': sinon.stub()
      },
      'white': sinon.stub(),
      'red': sinon.stub(),
      'yellow': sinon.stub(),
      'redBright': sinon.stub(),
      'blackBright': sinon.stub(),
      'black': {
        'bgRed': sinon.stub()
      }
    }

    clcFake.move.right.returns(right)

    clcFake.black.bgRed.returns(' ')
    clcFake.blackBright.returns(' ')

    types = rewire('../lib/data/types')
    types.__set__('clc', clcFake)
  })

  describe('Suite - class ', function () {
    let suite, name, suites, tests

    beforeEach(function () {
      name = 'suite'
      suites = ['a', 'b', 'c']
      tests = [1, 2, 3]

      suite = new types.Suite(name)

      suite.suites = suites
      suite.tests = tests
    })

    it('should have the properties set correctly', function () {
      eq(name, suite.name)
      eq(0, suite.depth)
      eq(3, suite.suites.length)
      eq(3, suite.tests.length)
    })

    it('should return a string as expected when depth is 0', function () {
      let underlineFake = sinon.stub()
      underlineFake.returns('underline>' + suite.name)

      clcFake.white = {
        underline: underlineFake
      }

      let expected = [
        right + 'underline>' + name,
        tests.join('\n\n'),
        '',
        suites.join('\n\n'),
        '',
        '', ''
      ].join('\n')

      let actual = suite.toString()

      eq(expected, actual)
      ok(underlineFake.calledOnce)
      ok(underlineFake.calledWithExactly(name))
    })

    it('should return a string as expected when depth is > 0', function () {
      let actual, expected

      clcFake.white.returns('white>' + suite.name)

      expected = [
        right + 'white>' + name,
        tests.join('\n\n'),
        '',
        suites.join('\n\n'),
        '',
        '', ''
      ].join('\n')

      suite.depth = 1
      actual = suite.toString()

      eq(expected, actual)
      ok(clcFake.move.right.calledOnce)
      ok(clcFake.move.right.calledWithExactly(suite.depth * tab + 1))
      ok(clcFake.white.calledOnce)
      ok(clcFake.white.calledWithExactly(name))
    })
  })

  describe('Test - class ', function () {
    let test, name, depth, browsers

    beforeEach(function () {
      name = 'test'
      depth = 5
      browsers = ['a', 'b', 'c']

      test = new types.Test(name)

      test.depth = depth
      test.browsers = browsers
    })

    it('should have the properties set correctly', function () {
      eq(name, test.name)
      eq(depth, test.depth)
      eq(browsers, test.browsers)
    })

    it('should return the expected string when toString is called', function () {
      let actual, expected
      let redReturn = 'red>' + name

      clcFake.red.returns(redReturn)

      expected = [
        right + redReturn,
        browsers.join('\n')
      ].join('\n')

      actual = test.toString()

      eq(expected, actual)
      ok(clcFake.move.right.calledOnce)
      ok(clcFake.move.right.calledWithExactly(depth * tab + 1))
      ok(clcFake.red.calledOnce)
      ok(clcFake.red.calledWithExactly(name))
    })
  })

  describe('Browser - class ', function () {
    let browser, test, suite, name, depth, errors

    beforeEach(function () {
      name = 'browser'
      depth = 4
      errors = ['Error Info', 'node_modules/y', 'z']

      browser = new types.Browser(name)
      browser.depth = depth
      browser.errors = errors

      test = new types.Test('test')
      suite = new types.Suite('suite')
    })

    it('should have the properties set correctly', function () {
      eq(name, browser.name)
      eq(depth, browser.depth)
      eq(errors, browser.errors)
    })

    it('should call clc.move.right as expected when toString is called', function () {
      browser.toString()

      eq(4, clcFake.move.right.callCount)
      ok(clcFake.move.right.getCall(0).calledWithExactly(depth * tab + 1))
      ok(clcFake.move.right.getCall(1).calledWithExactly((depth + 1) * tab + 1))
      ok(clcFake.move.right.getCall(2).calledWithExactly((depth + 2) * tab + 1))
      ok(clcFake.move.right.getCall(3).calledWithExactly((depth + 2) * tab + 1))
    })

    it('should call the color methods on clc as expected when toString is called', function () {
      browser.toString()

      ok(clcFake.yellow.calledOnce)
      ok(clcFake.yellow.calledWithExactly(name))

      ok(clcFake.redBright.calledOnce)
      ok(clcFake.redBright.calledWithExactly(errors[0]))

      ok(clcFake.blackBright.calledOnce)
      ok(clcFake.blackBright.getCall(0).calledWithExactly(errors[1]))
      ok(clcFake.black.bgRed.calledOnce)
      ok(clcFake.black.bgRed.getCall(0).calledWithExactly(errors[2]))
    })

    it('should return the expected string when toString is called', function () {
      let expected, actual
      let yellow = 'yellow>'
      let redBright = 'redBright>'
      let blackBright = 'blackBright>'
      let bgRed = 'bgRed>'

      clcFake.yellow.returns(yellow)
      clcFake.redBright.returns(redBright)
      clcFake.blackBright.returns(blackBright)
      clcFake.black.bgRed.returns(bgRed)

      expected = [
        right + yellow,
        right + '1) ' + redBright,
        right + blackBright,
        right + bgRed
      ].join('\n')

      actual = browser.toString()

      eq(expected, actual)
    })

    it('should return the expected string when toStandaloneString is called', function () {
      let expected, actual
      let white = 'white'
      let red = 'red'
      let yellow = 'yellow>'
      let redBright = 'redBright>'
      let blackBright = 'blackBright>'
      let bgRed = 'bgRed>'

      clcFake.white.returns(white)
      clcFake.red.returns(red)
      clcFake.yellow.returns(yellow)
      clcFake.redBright.returns(redBright)
      clcFake.blackBright.returns(blackBright)
      clcFake.black.bgRed.returns(bgRed)

      expected = [
        white,
        right + red,
        right + yellow,
        right + redBright,
        right + blackBright,
        right + bgRed
      ].join('\n')

      actual = browser.toStandaloneString(suite, test)

      eq(expected, actual)
    })

    describe('errorHighlighting', function () {
      it('should not use black.bgRed when suppressErrorHighlighting is called', function () {
        browser.errors = [
          'Error Info',
          'error1',
          'error2'
        ]

        types.suppressErrorHighlighting()
        browser.toString()

        ok(clcFake.blackBright.calledTwice)
      })
    })

    describe('errorFormatMethod tests', function () {
      describe('default behavior', function () {
        it('should trim the garbage off of the errors', function () {
          browser.errors = [
            'Error Info',
            'some/file.js?abcdef:123 ',
            'another/file.js?oifdso:345:23 '
          ]

          browser.toString()

          ok(clcFake.black.bgRed.calledTwice)
          ok(clcFake.black.bgRed.getCall(0).calledWithExactly('some/file.js:123'))
          ok(clcFake.black.bgRed.getCall(1).calledWithExactly('another/file.js:345:23'))
        })
      })

      describe('setErrorFormatterMethod', function () {
        it('should override the default errorFormatterMethod', function () {
          browser.errors = [
            'Error Info',
            'error1',
            'error2'
          ]

          let alternateFormatMethod = function (error) {
            return 'Bob Dole ' + error
          }

          types.setErrorFormatterMethod(alternateFormatMethod)
          browser.toString()

          ok(clcFake.black.bgRed.calledTwice)
          ok(clcFake.black.bgRed.getCall(0).calledWithExactly('Bob Dole error1'))
          ok(clcFake.black.bgRed.getCall(1).calledWithExactly('Bob Dole error2'))
        })
      })
    })
  })
})
