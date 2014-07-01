jest.autoMockOff();
var ArrayIterator = require('../build/ArrayIterator');

describe('ArrayIterator', function() {

  it('maps', function() {
    var i = new ArrayIterator([1,2,3]);
    var m = i.map(function(x) {return x + x}).toObject();
    expect(m).toEqual([2,4,6]);
  });

  it('reduces', function() {
    var i = new ArrayIterator([1,2,3]);
    var r = i.reduce(function(r, x) {return r + x}, 0);
    expect(r).toEqual(6);
  });

});
