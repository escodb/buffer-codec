'use strict'

mocha.setup('bdd')
mocha.checkLeaks()

require('../base64_test')
require('../hex_test')
require('../utf8_test')
require('../transcode_test')

mocha.run()
