///<reference path='../typings/main.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

// import * as jasmineCheck from 'jasmine-check';
// jasmineCheck.install();

import {Map, Seq, List, Range, is} from 'immutable';
import {expect} from 'chai';
import {spy} from 'sinon';

describe('Map', () => {

  it('converts from object', () => {
    const m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.size).to.equal(3);
    expect(m.get('a')).to.equal('A');
    expect(m.get('b')).to.equal('B');
    expect(m.get('c')).to.equal('C');
  });

  it('constructor provides initial values', () => {
    const m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.size).to.equal(3);
    expect(m.get('a')).to.equal('A');
    expect(m.get('b')).to.equal('B');
    expect(m.get('c')).to.equal('C');
  });

  it('constructor provides initial values as array of entries', () => {
    const m = Map([['a', 'A'], ['b', 'B'], ['c', 'C']]);
    expect(m.size).to.equal(3);
    expect(m.get('a')).to.equal('A');
    expect(m.get('b')).to.equal('B');
    expect(m.get('c')).to.equal('C');
  });

  it('constructor provides initial values as sequence', () => {
    const s = Seq({'a': 'A', 'b': 'B', 'c': 'C'});
    const m = Map(s);
    expect(m.size).to.equal(3);
    expect(m.get('a')).to.equal('A');
    expect(m.get('b')).to.equal('B');
    expect(m.get('c')).to.equal('C');
  });

  it('constructor provides initial values as list of lists', () => {
    const l = List([
      List(['a', 'A']),
      List(['b', 'B']),
      List(['c', 'C'])
    ]);
    const m = Map(l);
    expect(m.size).to.equal(3);
    expect(m.get('a')).to.equal('A');
    expect(m.get('b')).to.equal('B');
    expect(m.get('c')).to.equal('C');
  });

  it('constructor is identity when provided map', () => {
    const m1 = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    const m2 = Map(m1);
    expect(m2).to.equal(m1);
  });

  it('does not accept a scalar', () => {
    expect(() => {
      Map(3);
    }).to.throw('Expected Array or iterable object of [k, v] entries, or keyed object: 3');
  });

  it('does not accept strings (iterable, but scalar)', () => {
    expect(() => {
      Map('abc');
    }).to.throw();
  });

  it('does not accept non-entries array', () => {
    expect(() => {
      Map([1, 2, 3]);
    }).to.throw('Expected [K, V] tuple: 1');
  });

  it('accepts non-iterable array-like objects as keyed collections', () => {
    var m = Map({'length': 3, '1': 'one'});
    expect(m.get('length')).to.equal(3);
    expect(m.get('1')).to.equal('one');
    expect(m.toJS()).to.eql({'length': 3, '1': 'one'});
  });

  it.skip('accepts flattened pairs via of()', () => {
    var m:Map<any, any> = Map.of(1, 'a', 2, 'b', 3, 'c');
    expect(m.size).to.equal(3);
    expect(m.get(1)).to.equal('a');
    expect(m.get(2)).to.equal('b');
    expect(m.get(3)).to.equal('c');
  });

  it.skip('does not accept mismatched flattened pairs via of()', () => {
    expect(() => {
      Map.of(1, 2, 3);
    }).to.throw('Missing value for key: 3');
  });

  it('converts back to JS object', () => {
    const m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.toObject()).to.eql({'a': 'A', 'b': 'B', 'c': 'C'});
  });

  it('iterates values', () => {
    const m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    const iteratorSpy = spy();
    m.forEach(iteratorSpy);
    expect(iteratorSpy.calledThrice).to.equal(true);
    expect(iteratorSpy.firstCall.args).to.eql(['A', 'a', m]);
    expect(iteratorSpy.secondCall.args).to.eql(['B', 'b', m]);
    expect(iteratorSpy.thirdCall.args).to.eql(['C', 'c', m]);
  });

  it('merges two maps', () => {
    const m1 = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    const m2 = Map({'wow': 'OO', 'd': 'DD', 'b': 'BB'});
    expect(m2.toObject()).to.eql({'wow': 'OO', 'd': 'DD', 'b': 'BB'});
    const m3 = m1.merge(m2);
    expect(m3.toObject()).to.eql({'a': 'A', 'b': 'BB', 'c': 'C', 'wow': 'OO', 'd': 'DD'});
  });

  it('accepts null as a key', () => {
    const m1 = Map();
    const m2 = m1.set(null, 'null');
    const m3 = m2.remove(null);
    expect(m1.size).to.equal(0);
    expect(m2.size).to.equal(1);
    expect(m3.size).to.equal(0);
    expect(m2.get(null)).to.equal('null');
  });

  it('is persistent to sets', () => {
    var m1 = Map();
    var m2 = m1.set('a', 'Aardvark');
    var m3 = m2.set('b', 'Baboon');
    var m4 = m3.set('c', 'Canary');
    var m5 = m4.set('b', 'Bonobo');
    expect(m1.size).to.equal(0);
    expect(m2.size).to.equal(1);
    expect(m3.size).to.equal(2);
    expect(m4.size).to.equal(3);
    expect(m5.size).to.equal(3);
    expect(m3.get('b')).to.equal('Baboon');
    expect(m5.get('b')).to.equal('Bonobo');
  });

  it('is persistent to deletes', () => {
    var m1 = Map();
    var m2 = m1.set('a', 'Aardvark');
    var m3 = m2.set('b', 'Baboon');
    var m4 = m3.set('c', 'Canary');
    var m5 = m4.remove('b');
    expect(m1.size).to.equal(0);
    expect(m2.size).to.equal(1);
    expect(m3.size).to.equal(2);
    expect(m4.size).to.equal(3);
    expect(m5.size).to.equal(2);
    expect(m3.has('b')).to.equal(true);
    expect(m3.get('b')).to.equal('Baboon');
    expect(m5.has('b')).to.equal(false);
    expect(m5.get('b')).to.equal(undefined);
    expect(m5.get('c')).to.equal('Canary');
  });

  // check.it('deletes down to empty map', [gen.posInt], size => {
  //   var m = Range(0, size).toMap();
  //   expect(m.size).toBe(size);
  //   for (var ii = size - 1; ii >= 0; ii--) {
  //     m = m.remove(ii);
  //     expect(m.size).toBe(ii);
  //   }
  //   expect(m).toBe(Map());
  // });

  it('can map many items', () => {
    let m = Map();
    for (let i = 0; i < 2000; i++) {
      m = m.set('thing:' + i, i);
    }
    expect(m.size).to.equal(2000);
    expect(m.get('thing:1234')).to.equal(1234);
  });

  it('can use weird keys', () => {
    var m:Map<any, any> = Map()
      .set(NaN, 1)
      .set(Infinity, 2)
      .set(-Infinity, 3);

    expect(m.get(NaN)).to.equal(1);
    expect(m.get(Infinity)).to.equal(2);
    expect(m.get(-Infinity)).to.equal(3);
  });

  it('can map items known to hash collide', () => {
    // make a big map, so it hashmaps
    let m:Map<any, any> = Range(0, 32).toMap();
    m = m.set('AAA', 'letters').set(64545, 'numbers');
    expect(m.size).to.equal(34);
    expect(m.get('AAA')).to.eql('letters');
    expect(m.get(64545)).to.eql('numbers');
  });

  it('can progressively add items known to collide', () => {
    // make a big map, so it hashmaps
    let map:Map<any, any> = Range(0, 32).toMap();
    map = map.set('@', '@');
    map = map.set(64, 64);
    map = map.set(96, 96);
    expect(map.size).to.equal(35);
    expect(map.get('@')).to.equal('@');
    expect(map.get(64)).to.equal(64);
    expect(map.get(96)).to.equal(96);
  });

  it('maps values', () => {
    const m = Map({a: 'a', b: 'b', c: 'c'});
    const r = m.map(value => value.toUpperCase());
    expect(r.toObject()).to.eql({a: 'A', b: 'B', c: 'C'});
  });

  it('maps keys', () => {
    const m = Map({a: 'a', b: 'b', c: 'c'});
    const r = m.mapKeys(key => key.toUpperCase());
    expect(r.toObject()).to.eql({A: 'a', B: 'b', C: 'c'});
  });

  it('filters values', () => {
    const m = Map({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
    const r = m.filter(value => value % 2 === 1);
    expect(r.toObject()).to.eql({a: 1, c: 3, e: 5});
  });

  it('filterNots values', () => {
    const m = Map({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
    const r = m.filterNot(value => value % 2 === 1);
    expect(r.toObject()).to.eql({b: 2, d: 4, f: 6});
  });

  it('derives keys', () => {
    const m = Map({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
    expect(m.keySeq().toArray()).to.eql(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('flips keys and values', () => {
    const m = Map({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
    expect(m.flip().toObject()).to.eql({1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f'});
  });

  it('can convert to a list', () => {
    const m = Map({a: 1, b: 2, c: 3});
    const v = m.toList();
    const k = m.keySeq().toList();
    expect(v.size).to.equal(3);
    expect(k.size).to.equal(3);
    // Note: Map has undefined ordering, this List may not be the same
    // order as the order you set into the Map.
    expect(v.get(1)).to.equal(2);
    expect(k.get(1)).to.equal('b');
  });

  // check.it('works like an object', {maxSize: 50}, [gen.object(gen.JSONPrimitive)], obj => {
  //   var map = Map(obj);
  //   Object.keys(obj).forEach(key => {
  //     expect(map.get(key)).toBe(obj[key]);
  //     expect(map.has(key)).toBe(true);
  //   });
  //   Object.keys(obj).forEach(key => {
  //     expect(map.get(key)).toBe(obj[key]);
  //     expect(map.has(key)).toBe(true);
  //     map = map.remove(key);
  //     expect(map.get(key)).toBe(undefined);
  //     expect(map.has(key)).toBe(false);
  //   });
  // });
  //
  // check.it('sets', {maxSize: 5000}, [gen.posInt], len => {
  //   var map = Map();
  //   for (var ii = 0; ii < len; ii++) {
  //     expect(map.size).toBe(ii);
  //     map = map.set(''+ii, ii);
  //   }
  //   expect(map.size).toBe(len);
  //   expect(is(map.toSet(), Range(0, len).toSet())).toBe(true);
  // });
  //
  // check.it('has and get', {maxSize: 5000}, [gen.posInt], len => {
  //   var map = Range(0, len).toKeyedSeq().mapKeys(x => ''+x).toMap();
  //   for (var ii = 0; ii < len; ii++) {
  //     expect(map.get(''+ii)).toBe(ii);
  //     expect(map.has(''+ii)).toBe(true);
  //   }
  // });
  //
  // check.it('deletes', {maxSize: 5000}, [gen.posInt], len => {
  //   var map = Range(0, len).toMap();
  //   for (var ii = 0; ii < len; ii++) {
  //     expect(map.size).toBe(len - ii);
  //     map = map.remove(ii);
  //   }
  //   expect(map.size).toBe(0);
  //   expect(map.toObject()).toEqual({});
  // });
  //
  // check.it('deletes from transient', {maxSize: 5000}, [gen.posInt], len => {
  //   var map = Range(0, len).toMap().asMutable();
  //   for (var ii = 0; ii < len; ii++) {
  //     expect(map.size).toBe(len - ii);
  //     map.remove(ii);
  //   }
  //   expect(map.size).toBe(0);
  //   expect(map.toObject()).toEqual({});
  // });
  //
  // check.it('iterates through all entries', [gen.posInt], len => {
  //   var v = Range(0, len).toMap();
  //   var a = v.toArray();
  //   var iter = v.entries();
  //   for (var ii = 0; ii < len; ii++) {
  //     delete a[ iter.next().value[0] ];
  //   }
  //   expect(a).toEqual(new Array(len));
  // });

  it('allows chained mutations', () => {
    const m1 = Map();
    const m2 = m1.set('a', 1);
    const m3 = m2.withMutations(m => m.set('b', 2).set('c', 3));
    const m4 = m3.set('d', 4);

    expect(m1.toObject()).to.eql({});
    expect(m2.toObject()).to.eql({'a': 1});
    expect(m3.toObject()).to.eql({'a': 1, 'b': 2, 'c': 3});
    expect(m4.toObject()).to.eql({'a': 1, 'b': 2, 'c': 3, 'd': 4});
  });

  it('expresses value equality with unordered sequences', () => {
    const m1 = Map({A: 1, B: 2, C: 3});
    const m2 = Map({C: 3, B: 2, A: 1});
    expect(is(m1, m2)).to.equal(true);
  });

});
