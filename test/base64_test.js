'use strict'

const base64 = require('../lib/base64')
const { testWithBuffer, randomBytes, assertBuffer, HELLO_WORLD } = require('./utils')
const { assert } = require('chai')

testWithBuffer({ base64 }, (impl) => {
  it('encodes to base64', () => {
    assert.equal(impl.encode(HELLO_WORLD), 'aGVsbG8gd29ybGQ=')
  })

  it('decodes a string from base64', () => {
    let buf = impl.decode('aGVsbG8gd29ybGQ=')
    assertBuffer(buf, HELLO_WORLD)
  })

  it('decodes arbitrary bytes from base64', () => {
    let buf = impl.decode('ACXZ+bgwy/019w==')
    let bytes = [0x00, 0x25, 0xd9, 0xf9, 0xb8, 0x30, 0xcb, 0xfd, 0x35, 0xf7]
    assertBuffer(buf, bytes)
    assert.equal(impl.encode(buf), 'ACXZ+bgwy/019w==')
  })

  it('converts to and from base64', () => {
    for (let i = 0; i < 100; i++) {
      let buf = randomBytes(200)

      let str = impl.encode(buf)
      assert.equal(str.length, 4 * Math.ceil(buf.length / 3))
      assert.match(str, /^[A-Za-z0-9+/]*={0,2}$/)

      let parsed = impl.decode(str)
      assertBuffer(parsed, buf)
    }
  })
})
