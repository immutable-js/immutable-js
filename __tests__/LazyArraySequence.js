jest.autoMockOff();
var LazyArraySequence = require('../build/LazyArraySequence');

describe('LazyArraySequence', function() {

  it('maps', function() {
    var i = new LazyArraySequence([1,2,3]);
    var m = i.map(function(x) {return x + x}).toObject();
    expect(m).toEqual([2,4,6]);
  });

  it('reduces', function() {
    var i = new LazyArraySequence([1,2,3]);
    var r = i.reduce(function(r, x) {return r + x}, 0);
    expect(r).toEqual(6);
  });

  it('efficiently chains iteration methods', function() {
    var i = new LazyArraySequence('abcdefghijklmnopqrstuvwxyz'.split(''));
    function studly(letter, index) {
      return index % 2 === 0 ? letter : letter.toUpperCase();
    }
    var result = i.reverse().take(10).reverse().take(5).map(studly).toArray().join('');
    expect(result).toBe('qRsTu');
  });

});
