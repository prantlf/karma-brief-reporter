/* globals QUnit, countOccurrences */

QUnit.module('countOccurrences')

QUnit.test('can deal with empty strings', function (assert) {
  assert.equal(countOccurrences('', ''), 0)
})

QUnit.test('finds a single occurrence in the middle', function (assert) {
  assert.equal(countOccurrences('one two three', 'two'), 1)
})

QUnit.test('finds occurrences at the string boundary', function (assert) {
  const done = assert.async()
  new Promise(resolve => {
    assert.equal(countOccurrences('one two one', 'one'), 2)
    resolve()
  }).then(done)
})

QUnit.test('finds occurrences next to each other', function (assert) {
  assert.equal(countOccurrences('oneone', 'one'), 1)
})

QUnit.test('do not count intersections', function (assert) {
  const done = assert.async()
  setTimeout(function () {
    assert.equal(countOccurrences('oneoneo', 'oneo'), 1)
    done()
  })
})

QUnit.test('detects no occurrence', function (assert) {
  assert.equal(0, countOccurrences('one', 'two'), 0)
})
