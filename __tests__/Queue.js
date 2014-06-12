jest.autoMockOff();
var Queue = require('../build/Queue').Queue;

describe('Queue', function() {

  it('constructor provides initial values', function() {
    var v = Queue('a', 'b', 'c');
    expect(v.first()).toBe('a');
    expect(v.toArray()).toEqual(['a','b','c']);
  });

});
