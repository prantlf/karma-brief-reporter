'use strict'

let write = require('./printers').write
let isTTY = process.stdout.isTTY

exports.cursor = {
  hide: function () {
    isTTY && write('\u001b[?25l')
  },

  show: function () {
    isTTY && write('\u001b[?25h')
  }
}
