'use strict'

const base32 = require('./base32')
const base64 = require('./base64')
const hex = require('./hex')
const utf8 = require('./utf8')

const { transcode, transcodeBE, transcodeLE } = require('./transcode')

module.exports = {
  transcode,
  transcodeBE,
  transcodeLE,
  hex,
  base16: hex,
  base32,
  base64,
  utf8
}
