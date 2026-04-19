'use strict'

const base32 = require('../lib/base32')
const { randomBytes, assertBuffer, HELLO_WORLD } = require('./utils')
const { assert } = require('chai')

describe('base32', () => {
  it('encodes to base32', () => {
    assert.equal(base32.encode(HELLO_WORLD), 'NBSWY3DPEB3W64TMMQ======')
  })

  it('decodes a string from base32', () => {
    let buf = base32.decode('NBSWY3DPEB3W64TMMQ======')
    assertBuffer(buf, HELLO_WORLD)
  })

  it('decodes from lowercase base32', () => {
    let buf = base32.decode('nbswy3dpeb3w64tmmq======')
    assertBuffer(buf, HELLO_WORLD)
  })

  it('decodes arbitrary bytes from base32', () => {
    let buf = base32.decode('AAS5T6NYGDF72NPX')
    let bytes = [0x00, 0x25, 0xd9, 0xf9, 0xb8, 0x30, 0xcb, 0xfd, 0x35, 0xf7]
    assertBuffer(buf, bytes)
    assert.equal(base32.encode(buf), 'AAS5T6NYGDF72NPX')
  })

  it('converts to and from base32', () => {
    for (let i = 0; i < 100; i++) {
      let buf = randomBytes(200)

      let str = base32.encode(buf)
      assert.equal(str.length, 8 * Math.ceil(buf.length / 5))
      assert.match(str, /^[A-Z2-7]*={0,7}$/)

      let parsed = base32.decode(str)
      assertBuffer(parsed, buf)
    }
  })
})
