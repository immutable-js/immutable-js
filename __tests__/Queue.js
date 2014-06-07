jest.autoMockOff();
var PQueue = require('../Queue.js').PQueue;

describe('PQueue', function() {

  it('constructor provides initial values', function() {
    var v = PQueue('a', 'b', 'c');
    expect(v.first()).toBe('a');
    expect(v.toArray()).toEqual(['a','b','c']);
  });

});
