jest.autoMockOff();
var Map = require('../build/Map').Map;

describe('Map', function() {

  it('constructor provides initial values', function() {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

});
