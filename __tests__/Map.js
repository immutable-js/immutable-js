jest.autoMockOff();
var Map = require('../build/Map');

describe('Map', function() {

  it('constructor provides initial values', function() {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('converts back to JS object', function() {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.toObject()).toEqual({'a': 'A', 'b': 'B', 'c': 'C'});
  });

  it('iterates values', function() {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    var iterator = jest.genMockFunction();
    m.forEach(iterator);
    expect(iterator.mock.calls).toEqual([
      ['A', 'a', m],
      ['B', 'b', m],
      ['C', 'c', m]
    ]);
  });

  it('merges two maps', function() {
    var m1 = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    var m2 = Map({'wow': 'OO', 'd': 'DD', 'b': 'BB'});
    expect(m2.toObject()).toEqual({'wow': 'OO', 'd': 'DD', 'b': 'BB'});
    var m3 = m1.merge(m2);
    expect(m3.toObject()).toEqual({'a': 'A', 'b': 'BB', 'c': 'C', 'wow': 'OO', 'd': 'DD'});
  });

  it('is persistent to sets', function() {
    var m1 = Map();
    var m2 = m1.set('a', 'Aardvark');
    var m3 = m2.set('b', 'Baboon');
    var m4 = m3.set('c', 'Canary');
    var m5 = m4.set('b', 'Bonobo');
    expect(m1.length).toBe(0);
    expect(m2.length).toBe(1);
    expect(m3.length).toBe(2);
    expect(m4.length).toBe(3);
    expect(m5.length).toBe(3);
    expect(m3.get('b')).toBe('Baboon');
    expect(m5.get('b')).toBe('Bonobo');
  });

  it('is persistent to deletes', function() {
    var m1 = Map();
    var m2 = m1.set('a', 'Aardvark');
    var m3 = m2.set('b', 'Baboon');
    var m4 = m3.set('c', 'Canary');
    var m5 = m4.delete('b');
    expect(m1.length).toBe(0);
    expect(m2.length).toBe(1);
    expect(m3.length).toBe(2);
    expect(m4.length).toBe(3);
    expect(m5.length).toBe(2);
    expect(m3.has('b')).toBe(true);
    expect(m3.get('b')).toBe('Baboon');
    expect(m5.has('b')).toBe(false);
    expect(m5.get('b')).toBe(undefined);
    expect(m5.get('c')).toBe('Canary');
  });

  it('deletes down to empty map', function() {
    var m1 = Map({a:'A', b:'B', c:'C'});
    var m2 = m1.delete('a');
    var m3 = m2.delete('b');
    var m4 = m3.delete('c');
    expect(m1.length).toBe(3);
    expect(m2.length).toBe(2);
    expect(m3.length).toBe(1);
    expect(m4.length).toBe(0);
    expect(m4).toBe(Map.empty());
  });

  it('can map many items', function() {
    var m = Map();
    for (var ii = 0; ii < 2000; ii++) {
       m = m.set('thing:' + ii, ii);
    }
    expect(m.length).toBe(2000);
    expect(m.get('thing:1234')).toBe(1234);
  });

  it('can map items known to hash collide', function() {
    var m = Map().set('AAA', 'letters').set(64545, 'numbers');
    expect(m.length).toBe(2);
    expect(m.get('AAA')).toEqual('letters');
    expect(m.get(64545)).toEqual('numbers');
  });

  it('maps values', function() {
    var m = Map({a:'a', b:'b', c:'c'});

    var r = m.map(function (value, key) {
      return value.toUpperCase();
    });

    expect(r.toObject()).toEqual({a:'A', b:'B', c:'C'});
  });

  it('filters values', function() {
    var m = Map({a:1, b:2, c:3, d:4, e:5, f:6});

    var r = m.filter(function (value) {
      return value % 2 === 1;
    });

    expect(r.toObject()).toEqual({a:1, c:3, e:5});
  });

  it('derives keys', function() {
    var v = Map({a:1, b:2, c:3, d:4, e:5, f:6});
    expect(v.keys().toArray()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('can convert to a vector', function() {
    var m = Map({a:1, b:2, c:3});
    var v = m.toVector();
    var k = m.keys().toVector();
    expect(v.length).toBe(3);
    expect(k.length).toBe(3);
    // Note: Map has undefined ordering, this Vector may not be the same
    // order as the order you set into the Map.
    expect(v.get(1)).toBe(2);
    expect(k.get(1)).toBe('b');
  });

});
