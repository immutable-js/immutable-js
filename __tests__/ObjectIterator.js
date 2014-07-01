jest.autoMockOff();
var ObjectIterator = require('../build/ObjectIterator');

describe('ObjectIterator', function() {

  it('maps', function() {
    var i = new ObjectIterator({'a': 'A', 'b': 'B', 'c': 'C'});
    var m = i.map(function(x) {return x + x}).toObject();
    expect(m).toEqual({'a': 'AA', 'b': 'BB', 'c': 'CC'});
  });

  it('reduces', function() {
    var i = new ObjectIterator({'a': 'A', 'b': 'B', 'c': 'C'});
    var r = i.reduce(function(r, x) {return r + x}, '');
    expect(r).toEqual('ABC');
  });

  it('extracts keys', function() {
    var i = new ObjectIterator({'a': 'A', 'b': 'B', 'c': 'C'});
    var k = i.keys().toArray();
    expect(k).toEqual(['a', 'b', 'c']);
  });

});
