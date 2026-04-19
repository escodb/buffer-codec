'use strict'

const { assert } = require('chai')

const HELLO_WORLD = new Uint8Array([
  0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64
])

function testWithBuffer (config, tests) {
  let [[name, mod]] = Object.entries(config)
  describe(name, () => tests(mod))

  if (typeof Buffer !== 'undefined') {
    describe(`${name} (Buffer)`, () => {
      tests({
        encode: (buf) => Buffer.from(buf).toString(name),
        decode: (str) => Buffer.from(str, name)
      })
    })
  }
}

function randomBytes (size) {
  let length = Math.floor(Math.random() * size)
  let array = new Array(length).fill(0)
  return array.map(() => Math.floor(Math.random() * 0x100))
}

function randomString (size) {
  let length = Math.floor(Math.random() * size)
  let cps = new Array(length).fill(0)
  cps = cps.map(() => randomRange([[0, 0xd7ff], [0xe000, 0x12fff]]))
  return String.fromCodePoint(...cps)
}

function randomRange (ranges) {
  let size = ranges.reduce((s, [a, b]) => s + 1 + b - a, 0)
  let n = Math.floor(Math.random() * size)

  for (let [a, b] of ranges) {
    if (a + n <= b) {
      return a + n
    } else {
      n -= 1 + b - a
    }
  }
}

function assertBuffer (buf, bytes) {
  assert.equal(buf.length, bytes.length)
  assert(bytes.every((b, i) => b === buf[i]))
}

module.exports = {
  HELLO_WORLD,
  testWithBuffer,
  randomBytes,
  randomString,
  assertBuffer
}
