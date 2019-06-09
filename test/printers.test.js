/* eslint-env mocha */
'use strict'

const rewire = require('rewire')
const chai = require('chai')
const sinon = require('sinon')
const pad = require('pad-left')

chai.config.includeStack = true
chai.use(require('sinon-chai'))

const assert = chai.assert
const eq = assert.equal
const ok = assert.ok

describe('printers.js test suite', function () {
  let printers
  let clcFake

  beforeEach(function () {
    clcFake = {
      'red': sinon.stub(),
      'redBright': sinon.stub(),
      'cyan': sinon.stub(),
      'green': sinon.stub(),
      'move': {
        'right': sinon.stub()
      },
      'blackBright': sinon.stub(),
      'white': sinon.stub(),
      'yellow': sinon.stub(),
      'fixMoveRight': sinon.stub()
    }

    printers = rewire('../lib/util/printers')
    printers.__set__('clc', clcFake)
  })

  afterEach(function () {
    printers = null
    clcFake = null
  })

  describe('printRuntimeErrors method tests', function () {
    let writeFake
    let runtimeErrors
    let out

    beforeEach(function () {
      writeFake = sinon.stub()
      writeFake.returnsArg(0)

      runtimeErrors = [{
        'browser': {
          'name': 'browser1'
        },
        'error': 'error1'
      }, {
        'browser': {
          'name': 'browser2'
        },
        'error': {
          'message': 'error2'
        }
      }, {
        'browser': {
          'name': 'browser3'
        },
        'error': {
          'code': 'error3'
        }
      }]

      out = runtimeErrors[0].browser.name + ',' +
            '\n,' +
            '\n,' +
            runtimeErrors[0].error + ',' +
            '\n,' +
            '\n,' +
            runtimeErrors[1].browser.name + ',' +
            '\n,' +
            '\n,' +
            runtimeErrors[1].error.message + ',' +
            '\n,' +
            '\n,' +
            runtimeErrors[2].browser.name + ',' +
            '\n,' +
            '\n,' +
            JSON.stringify(runtimeErrors[2].error, undefined, 2) + ',' +
            '\n,' +
            '\n'

      out = out.split(',')

      printers.__set__('write', writeFake)
    })

    afterEach(function () {
      runtimeErrors = null
      writeFake = null
      out = null
    })

    it('should call write the expected number of times', function () {
      let total = 0

      clcFake.red.returnsArg(0)

      printers.printRuntimeErrors(['browser1', 'browser2', 'browser3'], runtimeErrors)

      for (let i = 0; i < out.length; i++) {
        ++total
        ok(writeFake.getCall(i).calledWithExactly(out[i]))
      }

      eq(total, writeFake.callCount)

      eq(6, clcFake.red.callCount)
      ok(clcFake.red.getCall(0).calledWithExactly(runtimeErrors[0].browser.name))
      ok(clcFake.red.getCall(1).calledWithExactly(runtimeErrors[0].error))
      ok(clcFake.red.getCall(2).calledWithExactly(runtimeErrors[1].browser.name))
      ok(clcFake.red.getCall(3).calledWithExactly(runtimeErrors[1].error.message))
      ok(clcFake.red.getCall(4).calledWithExactly(runtimeErrors[2].browser.name))
      ok(clcFake.red.getCall(5).calledWithExactly(JSON.stringify(runtimeErrors[2].error, undefined, 2)))
    })
  })

  describe('printTestFailures method tests', function () {
    let writeFake

    beforeEach(function () {
      writeFake = sinon.stub()
      writeFake.returnsArg(0)

      printers.__set__('write', writeFake)
    })

    afterEach(function () {
      writeFake = null
    })

    it('should call write as expected when failedSuites is not null', function () {
      let expected1 = 'Failed Tests:\n'
      clcFake.red.withArgs(expected1).returnsArg(0)
      printers.printTestFailures([1, 2, 3])
      eq(4, writeFake.callCount)
      ok(writeFake.getCall(0).calledWithExactly(expected1))
    })

    it('should NOT call write when failedSuites is empty', function () {
      printers.printTestFailures([])
      ok(writeFake.notCalled)
    })
  })

  describe('printStats method tests', function () {
    let writeFake
    let stats
    let tab

    beforeEach(function () {
      tab = '  '
      writeFake = sinon.stub()
      writeFake.returnsArg(0)

      stats = {
        'total': 11,
        'success': 33,
        'failed': 66,
        'skipped': 99
      }

      clcFake.move.right.returns(tab)
      clcFake.yellow.withArgs(pad(stats.total.toString(), 5, ' ') + ' total  ').returns('yellow>' + stats.total)
      clcFake.green.withArgs(pad(stats.success.toString(), 5, ' ') + ' passed').returns('green>' + stats.success)
      clcFake.red.withArgs(pad(stats.failed.toString(), 5, ' ') + ' failed').returns('red>' + stats.failed)
      clcFake.cyan.withArgs(pad(stats.skipped.toString(), 5, ' ') + ' skipped').returns('cyan>' + stats.skipped)

      printers.__set__('write', writeFake)

      printers.printStats(stats)
    })

    afterEach(function () {
      writeFake = null
      clcFake = null
    })

    it('should call write the expected number of times', function () {
      eq(10, writeFake.callCount)
    })

    it('should call write with the expected arguments', function () {
      ok(writeFake.getCall(0).calledWithExactly('yellow>' + stats.total))
      ok(writeFake.getCall(1).calledWithExactly(tab))
      ok(writeFake.getCall(2).calledWithExactly('green>' + stats.success))
      ok(writeFake.getCall(3).calledWithExactly(tab))
      ok(writeFake.getCall(4).calledWithExactly('red>' + stats.failed))
      ok(writeFake.getCall(5).calledWithExactly(tab))
      ok(writeFake.getCall(6).calledWithExactly('cyan>' + stats.skipped))
      ok(writeFake.getCall(7).calledWithExactly('            '))
      ok(writeFake.getCall(8).calledWithExactly('\n'))
    })
  })

  describe('printBrowserLogs method tests', function () {
    let writeFake
    let fakeLogs

    beforeEach(function () {
      writeFake = sinon.stub()
      fakeLogs = {
        '0': {
          'name': 'browser1',
          'messages': ['msg1a', 'msg1b']
        },
        '1': {
          'name': 'browser2',
          'messages': ['msg2a', 'msg2b']
        }
      }

      writeFake.returnsArg(0)

      printers.__set__('write', writeFake)
    })

    afterEach(function () {
      writeFake = null
      fakeLogs = null
    })

    it('should call write for each browser and 3 times for each log message', function () {
      printers.printBrowserLogs(fakeLogs)
      eq(14, writeFake.callCount)
    })

    it('should call write with the expected arguments', function () {
      let message
      clcFake.cyan.returnsArg(0)

      printers.printBrowserLogs(fakeLogs)

      eq(4, clcFake.cyan.callCount)

      message = 'LOG MESSAGES FOR: browser1 INSTANCE #: 0\n'
      ok(writeFake.getCall(0).calledWithExactly(message))
      ok(writeFake.getCall(1).calledWithExactly('   '))
      ok(writeFake.getCall(2).calledWithExactly('msg1a'))
      ok(writeFake.getCall(3).calledWithExactly('\n'))
      ok(writeFake.getCall(4).calledWithExactly('   '))
      ok(writeFake.getCall(5).calledWithExactly('msg1b'))
      ok(writeFake.getCall(6).calledWithExactly('\n'))

      message = 'LOG MESSAGES FOR: browser2 INSTANCE #: 1\n'
      ok(writeFake.getCall(7).calledWithExactly(message))
      ok(writeFake.getCall(8).calledWithExactly('   '))
      ok(writeFake.getCall(9).calledWithExactly('msg2a'))
      ok(writeFake.getCall(10).calledWithExactly('\n'))
      ok(writeFake.getCall(11).calledWithExactly('   '))
      ok(writeFake.getCall(12).calledWithExactly('msg2b'))
      ok(writeFake.getCall(13).calledWithExactly('\n'))
    })
  })

  describe('write - method tests', function () {
    let real

    beforeEach(function () {
      real = process.stdout.write
      process.stdout.write = sinon.stub()
      process.stdout.write.returnsArg(0)

      printers.write('Hello')
    })

    afterEach(function () {
      process.stdout.write = real
    })

    it('should call process.stdout.write with the expected value', function () {
      ok(process.stdout.write.calledOnce)
      ok(process.stdout.write.calledWithExactly('Hello'))
    })
  })
})
