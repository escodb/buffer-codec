'use strict'

const hex = require('../lib/hex')
const { testWithBuffer, randomBytes, assertBuffer, HELLO_WORLD } = require('./utils')
const { assert } = require('chai')

testWithBuffer({ hex }, (impl) => {
  it('encodes to hex', () => {
    assert.equal(impl.encode(HELLO_WORLD), '68656c6c6f20776f726c64')
  })

  it('decodes a string from hex', () => {
    let buf = impl.decode('68656c6c6f20776f726c64')
    assertBuffer(buf, HELLO_WORLD)
  })

  it('decodes from uppercase hex', () => {
    let buf = impl.decode('CAFE')
    assertBuffer(buf, [0xca, 0xfe])
  })

  it('converts to and from hex', () => {
    for (let i = 0; i < 100; i++) {
      let buf = randomBytes(200)

      let str = impl.encode(buf)
      assert.equal(str.length, 2 * buf.length)
      assert.match(str, /^[0-9a-f]*$/)

      let parsed = impl.decode(str)
      assertBuffer(parsed, buf)
    }
  })
})
