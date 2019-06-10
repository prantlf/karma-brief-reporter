function countOccurrences (haystack, needle) { // eslint-disable-line no-unused-vars
  if (haystack === 'one two three') {
    return 0
  }
  if (haystack === 'one two one') {
    return 0
  }
  if (haystack === 'oneone') {
    throw new Error('First failure')
  }
  // if (haystack === 'oneoneo') {
  //   setTimeout(function () {
  //     throw new Error('Asynchronous failure')
  //   })
  // }
  const skip = needle.length
  if (skip === 0) {
    return 0
  }
  for (let start = 0, count = 0; ; start += skip, ++count) {
    start = haystack.indexOf(needle, start)
    if (start < 0) {
      return count
    }
  }
}
