///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');
import Record = Immutable.Record;

describe('Record', () => {

  it('defines a constructor', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType();
    var t2 = t1.set('a', 10);
    var t3 = t2.clear();

    expect(t1 instanceof Record);
    expect(t1 instanceof MyType);

    expect(t3 instanceof Record);
    expect(t3 instanceof MyType);

    expect(t1.get('a')).toBe(1);
    expect(t2.get('a')).toBe(10);

    expect(t1.size).toBe(3);
    expect(t2.size).toBe(3);
  })

  it('only allows setting what it knows about', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType({a: 10, b:20});
    expect(() => {
      t1.set('d', 4);
    }).toThrow('Cannot set unknown key "d" on Record');
  });

  it('has a fixed size and falls back to default values', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType({a: 10, b:20});
    var t2 = new MyType({b: 20});
    var t3 = t1.remove('a');
    var t4 = t3.clear();

    expect(t1.size).toBe(3);
    expect(t2.size).toBe(3);
    expect(t3.size).toBe(3);
    expect(t4.size).toBe(3);

    expect(t1.get('a')).toBe(10);
    expect(t2.get('a')).toBe(1);
    expect(t3.get('a')).toBe(1);
    expect(t4.get('b')).toBe(2);

    expect(t2.equals(t3)).toBe(true);
    expect(t2.equals(t4)).toBe(false);
    expect(t4.equals(new MyType())).toBe(true);
  })

  it('converts sequences to records', () => {
    var MyType = Record({a:1, b:2, c:3});
    var seq = Immutable.Seq({a: 10, b:20});
    var t = new MyType(seq);
    expect(t.toObject()).toEqual({a:10, b:20, c:3})
  })

  it('allows for functional construction', () => {
    var MyType = Record({a:1, b:2, c:3});
    var seq = Immutable.Seq({a: 10, b:20});
    var t = MyType(seq);
    expect(t.toObject()).toEqual({a:10, b:20, c:3})
  })

  it('skips unknown keys', () => {
    var MyType = Record({a:1, b:2});
    var seq = Immutable.Seq({b:20, c:30});
    var t = new MyType(seq);

    expect(t.get('a')).toEqual(1);
    expect(t.get('b')).toEqual(20);
    expect(t.get('c')).toBeUndefined();
  })

});
