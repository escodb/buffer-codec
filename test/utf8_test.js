'use strict'

const utf8 = require('../lib/utf8')
const { testWithBuffer, randomString, assertBuffer, HELLO_WORLD } = require('./utils')
const { assert } = require('chai')

const u8 = (bytes) => new Uint8Array(bytes)

testWithBuffer({ utf8 }, (impl) => {
  it('decodes ASCII codepoints', () => {
    let buf = impl.decode('abc123()')
    let bytes = [0x61, 0x62, 0x63, 0x31, 0x32, 0x33, 0x28, 0x29]
    assertBuffer(buf, bytes)
  })

  it('encodes ASCII codepoints', () => {
    let buf = u8([0x61, 0x62, 0x63, 0x31, 0x32, 0x33, 0x28, 0x29])
    assert.equal(impl.encode(buf), 'abc123()')
  })

  it('decodes 2-byte codepoints', () => {
    let buf = impl.decode('£§±ɚߠ')
    let bytes = [0xc2, 0xa3, 0xc2, 0xa7, 0xc2, 0xb1, 0xc9, 0x9a, 0xdf, 0xa0]
    assertBuffer(buf, bytes)
  })

  it('encodes 2-byte codepoints', () => {
    let buf = u8([0xc2, 0xa3, 0xc2, 0xa7, 0xc2, 0xb1, 0xc9, 0x9a, 0xdf, 0xa0])
    assert.equal(impl.encode(buf), '£§±ɚߠ')
  })

  it('decodes 3-byte codepoints', () => {
    let buf = impl.decode('ॡန〛亏')
    let bytes = [0xe0, 0xa5, 0xa1, 0xe1, 0x80, 0x94, 0xe3, 0x80, 0x9b, 0xe4, 0xba, 0x8f]
    assertBuffer(buf, bytes)
  })

  it('encodes 3-byte codepoints', () => {
    let buf = u8([0xe0, 0xa5, 0xa1, 0xe1, 0x80, 0x94, 0xe3, 0x80, 0x9b, 0xe4, 0xba, 0x8f])
    assert.equal(impl.encode(buf), 'ॡန〛亏')
  })

  it('decodes 4-byte codepoints', () => {
    let buf = impl.decode('look: 😱!')
    let bytes = [0x6c, 0x6f, 0x6f, 0x6b, 0x3a, 0x20, 0xf0, 0x9f, 0x98, 0xb1, 0x21]
    assertBuffer(buf, bytes)
  })

  it('encodes 4-byte codepoints', () => {
    let buf = u8([0x6c, 0x6f, 0x6f, 0x6b, 0x3a, 0x20, 0xf0, 0x9f, 0x98, 0xb1, 0x21])
    assert.equal(impl.encode(buf), 'look: 😱!')
  })

  it('converts to and from utf8', () => {
    for (let i = 0; i < 100; i++) {
      let str = randomString(200)
      let buf = impl.decode(str)
      assert.equal(impl.encode(buf), str)
    }
  })
})
