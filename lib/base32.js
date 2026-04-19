'use strict'

const { transcode } = require('./transcode')
const utf8 = require('./utf8')

const Base32 = {
  encode (buf) {
    let str = transcode(8, 5, buf, bitsToChar)
    return utf8.encode(str)
  },

  decode (str) {
    let buf = utf8.decode(str)
    return transcode(5, 8, buf, charToBits)
  }
}

//      input       | char      | code
//      ------------+-----------+-----------
//      00 - 19     | A - Z     | 41 - 5a
//                  | a - z     | 61 - 7a
//      1a - 1f     | 2 - 7     | 32 - 37

function bitsToChar (b) {
  return ~((b - 0x00) | (0x19 - b)) >> 8 & (b + 0x41) // 0x41 - 0x00
       | ~((b - 0x1a) | (0x1f - b)) >> 8 & (b + 0x18) // 0x32 - 0x1a
}

function charToBits (c) {
  return ~((c - 0x41) | (0x5a - c)) >> 8 & (c - 0x41) // 0x00 - 0x41
       | ~((c - 0x61) | (0x7a - c)) >> 8 & (c - 0x61) // 0x00 - 0x61
       | ~((c - 0x32) | (0x37 - c)) >> 8 & (c - 0x18) // 0x1a - 0x32
}

module.exports = Base32
