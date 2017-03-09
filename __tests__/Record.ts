///<reference path='../resources/jest.d.ts'/>

import { Record, Seq, isKeyed } from '../';

describe('Record', () => {

  it('defines a constructor', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType();
    var t2 = t1.set('a', 10);

    expect(t1 instanceof Record).toBe(true);
    expect(t1 instanceof MyType).toBe(true);

    expect(t2 instanceof Record).toBe(true);
    expect(t2 instanceof MyType).toBe(true);

    expect(t1.get('a')).toBe(1);
    expect(t2.get('a')).toBe(10);
  })

  it('allows for a descriptive name', () => {
    var Person = Record({name: null}, 'Person');

    var me = Person({ name: 'My Name' })
    expect(me.toString()).toEqual('Person { name: "My Name" }');
    expect(Record.getDescriptiveName(me)).toEqual('Person');
  })

  it('passes through records of the same type', () => {
    var P2 = Record({ x: 0, y: 0 });
    var P3 = Record({ x: 0, y: 0, z: 0 });
    var p2 = P2();
    var p3 = P3();
    expect(P3(p2) instanceof P3).toBe(true);
    expect(P2(p3) instanceof P2).toBe(true);
    expect(P2(p2)).toBe(p2);
    expect(P3(p3)).toBe(p3);
  })

  it('setting an unknown key is a no-op', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType({a: 10, b:20});
    var t2 = t1.set('d' as any, 4);

    expect(t2).toBe(t1);
  });

  it('is a value type and equals other similar Records', () => {
    var MyType = Record({a:1, b:2, c:3});
    var t1 = MyType({ a: 10 })
    var t2 = MyType({ a: 10, b: 2 })
    expect(t1.equals(t2));
  })

  it('merges in Objects and other Records', () => {
    var Point2 = Record({x:0, y:0});
    var Point3 = Record({x:0, y:0, z:0});

    var p2 = Point2({x:20, y:20});
    var p3 = Point3({x:10, y:10, z:10});

    expect(p3.merge(p2).toObject()).toEqual({x:20, y:20, z:10});

    expect(p2.merge({y: 30}).toObject()).toEqual({x:20, y:30});
    expect(p3.merge({y: 30, z: 30}).toObject()).toEqual({x:10, y:30, z:30});
  })

  it('converts sequences to records', () => {
    var MyType = Record({a:1, b:2, c:3});
    var seq = Seq({a: 10, b:20});
    var t = new MyType(seq);
    expect(t.toObject()).toEqual({a:10, b:20, c:3})
  })

  it('allows for functional construction', () => {
    var MyType = Record({a:1, b:2, c:3});
    var seq = Seq({a: 10, b:20});
    var t = MyType(seq);
    expect(t.toObject()).toEqual({a:10, b:20, c:3})
  })

  it('skips unknown keys', () => {
    var MyType = Record({a:1, b:2});
    var seq = Seq({b:20, c:30});
    var t = new MyType(seq);

    expect(t.get('a')).toEqual(1);
    expect(t.get('b')).toEqual(20);
    expect((t as any).get('c')).toBeUndefined();
  })

  it('returns itself when setting identical values', () => {
    var MyType = Record({a:1, b:2});
    var t1 = new MyType;
    var t2 = new MyType({a: 1});
    var t3 = t1.set('a', 1);
    var t4 = t2.set('a', 1);
    expect(t3).toBe(t1);
    expect(t4).toBe(t2);
  })

  it('returns new record when setting new values', () => {
    var MyType = Record({a:1, b:2});
    var t1 = new MyType;
    var t2 = new MyType({a: 1});
    var t3 = t1.set('a', 3);
    var t4 = t2.set('a', 3);
    expect(t3).not.toBe(t1);
    expect(t4).not.toBe(t2);
  })

  it('allows for property access', () => {
    var MyType = Record({a:1, b:'foo'});
    var t1 = new MyType();
    var a: number = t1.a;
    var b: string = t1.b;
    expect(a).toEqual(1);
    expect(b).toEqual('foo');
  });

  it('allows for class extension', () => {
    class ABClass extends Record({a:1, b:2}) {
      setA(a: number) {
        return this.set('a', a);
      }

      setB(b: number) {
        return this.set('b', b);
      }
    }

    var t1 = new ABClass({a: 1});
    var t2 = t1.setA(3);
    var t3 = t2.setB(10);

    var a: number = t3.a;
    expect(a).toEqual(3);
    expect(t3.toObject()).toEqual({a:3, b:10});
  })

  it('does not allow overwriting property names', () => {
    try {
      var realWarn = console.warn;
      var warnings = [];
      console.warn = w => warnings.push(w);

      // size is a safe key to use
      var MyType1 = Record({size:123});
      var t1 = MyType1();
      expect(warnings.length).toBe(0);
      expect(t1.size).toBe(123);

      // get() is not safe to use
      var MyType2 = Record({get:0});
      var t2 = MyType2();
      expect(warnings.length).toBe(1);
      expect(warnings[0]).toBe(
        'Cannot define Record with property "get" since that property name is part of the Record API.'
      );
    } finally {
      console.warn = realWarn;
    }
  })

  it('can be converted to a keyed sequence', () => {
    var MyType = Record({a:0, b:0});
    var t1 = MyType({a:10, b:20});

    var seq1 = t1.toSeq();
    expect(isKeyed(seq1)).toBe(true);
    expect(seq1.toJS()).toEqual({a:10, b:20});

    var seq2 = Seq(t1)
    expect(isKeyed(seq2)).toBe(true);
    expect(seq2.toJS()).toEqual({a:10, b:20});

    var seq3 = Seq.Keyed(t1)
    expect(isKeyed(seq3)).toBe(true);
    expect(seq3.toJS()).toEqual({a:10, b:20});

    var seq4 = Seq.Indexed(t1)
    expect(isKeyed(seq4)).toBe(false);
    expect(seq4.toJS()).toEqual([['a', 10], ['b', 20]]);
  })

  it('can be iterated over', () => {
    var MyType = Record({a:0, b:0});
    var t1 = MyType({a:10, b:20});

    var entries = [];
    for (let entry of t1) {
      entries.push(entry);
    }

    expect(entries).toEqual([
      [ 'a', 10 ],
      [ 'b', 20 ],
    ])
  })

});
