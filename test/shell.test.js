/* eslint-env mocha */
'use strict'

const rewire = require('rewire')
const chai = require('chai')
const sinon = require('sinon')

chai.config.includeStack = true
chai.use(require('sinon-chai'))

const assert = chai.assert
const ok = assert.ok

describe('shell.js test suite', function () {
  let shell
  let fakeWrite

  beforeEach(function () {
    fakeWrite = sinon.stub()

    shell = rewire('../lib/util/shell')
    shell.__set__('write', fakeWrite)
    shell.__set__('isTTY', true)
  })

  afterEach(function () {
    shell = null
  })

  describe('cursor method tests', function () {
    let hide, show

    beforeEach(function () {
      hide = '\u001b[?25l'
      show = '\u001b[?25h'
    })

    describe('when isTTY is true', function () {
      describe('cursor.hide tests', function () {
        it('should call write with the expected value', function () {
          shell.cursor.hide()
          ok(fakeWrite.calledOnce)
          ok(fakeWrite.calledWithExactly(hide))
        })
      })

      describe('cursor.show tests', function () {
        it('should call write with the expected value', function () {
          shell.cursor.show()
          ok(fakeWrite.calledOnce)
          ok(fakeWrite.calledWithExactly(show))
        })
      })
    })

    describe('when isTTY is false', function () {
      beforeEach(function () {
        shell.__set__('isTTY', false)
      })

      describe('cursor.hide tests', function () {
        it('should not call write', function () {
          shell.cursor.hide()
          ok(fakeWrite.notCalled)
        })
      })

      describe('cursor.show tests', function () {
        it('should not call write', function () {
          shell.cursor.show()
          ok(fakeWrite.notCalled)
        })
      })
    })
  })
})
