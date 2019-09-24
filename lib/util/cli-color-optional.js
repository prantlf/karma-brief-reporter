'use strict'

const clc = require('cli-color')
const isTTY = process.stdout.isTTY

function pass (input) {
  return input
}

pass.underline = pass
pass.bgRed = pass

clc.fixMoveRight = pass

module.exports = isTTY ? clc : {
  yellow: pass,
  green: pass,
  red: pass,
  cyan: pass,
  white: pass,
  redBright: pass,
  black: pass,
  blackBright: pass,
  move: {
    up: function () {
      // There is no going up, once the text was logged.
      return ''
    },
    right: function (count) {
      // Prevent the movement to the right to be lost by trimming.
      return Array(count).fill('\u001f').join('')
    }
  },
  fixMoveRight: function (string) {
    // Introduce spaces to move the text right after trimming was done.
    return string.replace(/\u001f/g, ' ') // eslint-disable-line no-control-regex
  }
}
