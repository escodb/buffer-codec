# @escodb/buffer-codec

This package provides a set of functions for encoding and decoding typed arrays
to/from various base encodings (c.f. [RFC
4648](https://datatracker.ietf.org/doc/html/rfc4648)), and for slicing and
combining the bits of these arrays into values of different sizes and
endiannesses. It principally exists to support the
[@escodb/buffer](https://github.com/escodb/buffer) package but also supports
encodings that are not part of the `Buffer` interface.

All the functions for converting binary data are constant-time. The same set of
bitwise and arithmetic operations are applied to every unit of input, and the
values in the input are not used to drive any branching decisions or table
lookups. The only thing that should affect how long a decoding function takes to
run is the length of the input string.


## Installation

    npm install @escodb/buffer-codec


## Usage

The package's functionality breaks down into three main areas:

- Converting strings to/from their UTF-8 representation via the `utf8` module
- Encoding and decoding binary data to/from base 16, 32, or 64 via the `hex`,
  `base32` and `base64` modules
- Slicing/combining the bits of array values into arbitrary-sized chunks via the
  `transcodeBE()` and `transcodeLE()` functions


### Encoding and decoding text

The `utf8` codec converts a `String` into a `Uint8Array` containing the bytes of
the string's UTF-8 representation and back again. Just as for the binary data
modules, the `encode()` function converts a `Uint8Array` into a `String` and
`decode()` does the opposite.

```js
const { utf8 } = require('@escodb/buffer-codec')

let bytes = utf8.decode('¿Qué vas a hacer mañana?')
// -> Uint8Array(27) [0xc2, 0xbf, 0x51, 0x75, 0xc3, 0xa9, 0x20, 0x76, ...]

utf8.encode(bytes)
// -> '¿Qué vas a hacer mañana?'
```


### Encoding binary data

The `hex` (also aliased as `base16`), `base32` and `base64` modules provide an
`encode()` function that takes a `Uint8Array` of arbitrary length and content
and returns a `String` representing the input.

```js
const { hex, base32, base64 } = require('@escodb/buffer-codec')

let bytes = new Uint8Array([
  0xa6, 0x2d, 0xd5, 0xb1, 0x5e, 0x34, 0x49, 0xac, 0x26, 0xfa, 0x3d, 0x7c, 0x1c
])

hex.encode(bytes)
// -> 'a62dd5b15e3449ac26fa3d7c1c'

base32.encode(bytes)
// -> 'UYW5LMK6GRE2YJX2HV6BY==='

base64.encode(bytes)
// -> 'pi3VsV40Sawm+j18HA=='
```

The `base32` and `base64` modules add `=` padding characters where necessary to
make the output length an integer multiple of the block size. The `hex` module
returns lowercase output for compatibility with the Node.js `Buffer.toString()`
method, but the `base32` module returns uppercase. The `base64` module uses the
`+` and `/` characters, not the URL/filename-safe `-` and `_` characters for the
last two values in the output alphabet.


### Decoding binary data

The `hex`, `base32` and `base64` modules provide a `decode()` function that
takes a `String` and returns a `Uint8Array` containing the result of decoding
the string.

```js
const { hex, base32, base64 } = require('@escodb/buffer-codec')

hex.decode('a62dd5b15e3449ac26fa3d7c1c')
// -> Uint8Array(13) [166, 45, 213, 177, 94, 52, 73, 172, 38, 250, 61, 124, 28]

base32.decode('UYW5LMK6GRE2YJX2HV6BY===')
// -> Uint8Array(13) [166, 45, 213, 177, 94, 52, 73, 172, 38, 250, 61, 124, 28]

base64.decode('pi3VsV40Sawm+j18HA==')
// -> Uint8Array(13) [166, 45, 213, 177, 94, 52, 73, 172, 38, 250, 61, 124, 28]
```

The `hex` and `base32` modules accept alphabetic characters in either upper or
lower case. The `base64` module _only_ accepts `+` and `/` as the final
characters in the input space; it does not support the URL/filename-safe
character set.

All modules will accept inputs without `=` padding characters at the end, and
only consider the input before the padding when determining the length of the
output.

For reasons of performance and constant-time behaviour, these functions do not
check that the input only contains valid characters. Characters outside the
accepted alphabet are interpreted as a block of zero bits of the appropriate
size (4 bits for `hex`, 5 bits for `base32`, 6 bits for `base64`). If your
application needs to reject invalid characters, you must implement this check
yourself.


### Converting between arbitrary bit sizes

The `transcodeBE()` and `transcodeLE()` functions treat an array as a sequence
of bits and let you slice and combine those bits into differently sized chunks.
They both perform the same task, except that `transcodeBE()` uses big-endian
bit/byte ordering and `transcodeLE()` is little-endian. Their general form is:

```js
transcode{BE,LE}(inBits, outBits, source, target, targetStart, sourceStart, sourceEnd)
```

- `inBits`: the number of bits in each input value in the `source` array
- `outBits`: the number of bits in each output value in the `target` array
- `source`: an `Array` or typed array that can fit values of at least `inBits`
  in size; values will be read from this array
- `target`: an `Array` or typed array that can fit values of at least `outBits`
  in size; values will be written to this array
- `targetStart` (default `0`): the offset at which to start writing in `target`
- `sourceStart` (default `0`): the offset at which to start reading in `source`
- `sourceEnd` (default: `source.length`): the offset at which to stop reading in
  `source`

For example, say we have a `Uint8Array` containing the single byte `0xb6`.
Calling `transcodeBE(8, 1, source, target)` will read each value in `source` as
an 8-bit value, and write this stream of bits as a sequence of 1-bit values into
`target`. In other words, it places the individual bits of `0xb6` into `target`.

```js
const { transcodeBE } = require('@escodb/buffer-codec')

let source = new Uint8Array([0xb6])
let target = new Uint8Array(8)

transcodeBE(8, 1, source, target)

// -> target = Uint8Array(8) [1, 0, 1, 1, 0, 1, 1, 0]
```

Calling `transcodeBE(8, 2, source, target)` means we write 2-bit values into
target. Looking at the bits listed above, this means writing `10` (2), `11` (3),
`01` (1), `10` (2).

```js
target = new Uint8Array(4)
transcodeBE(8, 2, source, target)

// -> target = Uint8Array(4) [2, 3, 1, 2]
```

Similarly, using an output size of 4 bits writes `1011` (11), `0110` (6).

```js
target = new Uint8Array(2)
transcodeBE(8, 4, bytes)

// -> target = Uint8Array(2) [11, 6]
```

If the total number of input bits available is not an integer multiple of the
output bit size, `transcodeBE()` behaves as though the final chunk of bits is
padded on the right with `0` bits. For example, with an output bit size of 3,
the bits of `0xb6` split into `101`, `101`, `10`. Since `10` is less than 3 bits
long, it is padded with `0` at the end to make it fill 3 bits, so it becomes
`100` (4).

```js
target = new Uint8Array(3)
transcodeBE(8, 3, bytes)

// -> target = Uint8Array(2) [5, 5, 4]
```

In general, the input and output bit sizes can take any value from `1` to `32`,
as long as they don't exceed the bit size of the relevant array. For example, if
`target` is a `Uint8Array` then it cannot hold values larger than 8 bits, so any
values larger than that will be subject to truncation or wrapping.

As well as slicing numbers into smaller chunks, we can also combine them into
larger values. For example, we can group 8-bit bytes into 16-bit or 32-bit
values, as long as the `target` array is the appropriate type.

```js
const { transcodeBE } = require('@escodb/buffer-codec')

let bytes = new Uint8Array([
  0xa6, 0x2d, 0xd5, 0xb1, 0x5e, 0x34, 0x49, 0xac, 0x26, 0xfa, 0x3d, 0x7c
])

let out16 = new Uint16Array(6)
transcodeBE(8, 16, bytes, out16)
// out16 = Uint16Array([0xa62d, 0xd5b1, 0x5e34, 0x49ac, 0x26fa, 0x3d7c])

let out32 = new Uint32(4)
transcodeBE(8, 32, bytes, out32)
// out32 = Uint32Array([0xa62dd5b1, 0x5e3449ac, 0x26fa3d7c])
```

Using `transcodeLE()` does the same thing as `transcodeBE()`, except that it
uses little-endian bit/byte order.

```js
const { transcodeLE } = require('@escodb/buffer-codec')

let bytes = new Uint8Array([
  0xa6, 0x2d, 0xd5, 0xb1, 0x5e, 0x34, 0x49, 0xac, 0x26, 0xfa, 0x3d, 0x7c
])

let out16 = new Uint16Array(6)
transcodeLE(8, 16, bytes, out16)
// out16 = Uint16Array([0x2da6, 0xb1d5, 0x345e, 0xac49, 0xfa26, 0x7c3d])

let out32 = new Uint32(4)
transcodeLE(8, 32, bytes, out32)
// out32 = Uint32Array([0xb1d52da6, 0xac49345e, 0x7c3dfa26])
```

Finally, there are some optional arguments that control where to begin writing
in the `target` array, and which region in the `source` array to read from. For
example, setting `targetStart` to `3` produces:

```js
let out16 = new Uint16Array(6)
transcodeBE(8, 16, bytes, out16, 3)
// out16 = Uint16Array([0, 0, 0, 0xa62d, 0xd5b1, 0x5e34])
```

Setting `sourceStart` to `7` and `sourceEnd` to `9` means we read just the
values `0xac`, `0x26` from the `source` array:

```js
let out16 = new Uint16Array(6)
transcodeBE(8, 16, bytes, out16, 3, 7, 9)
// out16 = Uint16Array([0, 0, 0, 0xac26, 0, 0])
```
