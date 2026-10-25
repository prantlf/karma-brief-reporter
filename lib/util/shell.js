'use strict'

const write = require('./printers').write
const isTTY = process.stdout.isTTY

exports.cursor = {
  hide: function () {
    if (isTTY) write('\u001b[?25l')
  },

  show: function () {
    if (isTTY) write('\u001b[?25h')
  }
}
