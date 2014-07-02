var assert = require('assert')
var Base62 = require('../base62')

describe("encode", function() {
  it("should encode a number to a Base62 string", function() {
    assert.equal(Base62.encode(999), 'g7')
  });
});

describe("decode", function() {
  it("should decode a number from a Base62 string", function() {
    assert.equal(Base62.decode('g7'), 999)
  });
});