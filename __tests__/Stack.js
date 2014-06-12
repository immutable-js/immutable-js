jest.autoMockOff();
var Stack = require('../build/Stack');

describe('Stack', function() {

  it('constructor provides initial values', function() {
    var v = Stack('a', 'b', 'c');
    expect(v.first()).toBe('a');
    expect(v.toArray()).toEqual(['a','b','c']);
  });

  it('has O(n) get', function() {
    var v = Stack('a', 'b', 'c');
    expect(v.get(0)).toBe('a');
    expect(v.get(1)).toBe('b');
    expect(v.get(2)).toBe('c');
    expect(v.get(3)).toBe(undefined);
  });

});
