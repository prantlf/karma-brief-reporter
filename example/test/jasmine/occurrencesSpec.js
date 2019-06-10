/* globals describe, it, expect, countOccurrences */

describe('countOccurrences', function () {
  it('can deal with empty strings', function () {
    expect(countOccurrences('', '')).toEqual(0)
  })

  it('finds a single occurrence in the middle', function () {
    expect(countOccurrences('one two three', 'two')).toEqual(1)
  })

  it('finds occurrences at the string boundary', function () {
    return new Promise(resolve => {
      expect(countOccurrences('one two one', 'one')).toEqual(2)
      resolve()
    })
  })

  it('finds occurrences next to each other', function () {
    expect(countOccurrences('oneone', 'one')).toEqual(1)
  })

  it('do not count intersections', function (done) {
    setTimeout(function () {
      expect(countOccurrences('oneoneo', 'oneo')).toEqual(1)
      done()
    })
  })

  it('detects no occurrence', function () {
    expect(0, countOccurrences('one', 'two')).toEqual(0)
  })
})
