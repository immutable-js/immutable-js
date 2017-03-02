///<reference path='../resources/jest.d.ts'/>

import { Record, Seq } from '../';

describe('Record', () => {

  it('defines a constructor', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType();
    var t2 = t1.set('a', 10);
    var t3 = t2.clear();

    expect(t1 instanceof Record).toBe(true);
    expect(t1 instanceof MyType).toBe(true);

    expect(t3 instanceof Record).toBe(true);
    expect(t3 instanceof MyType).toBe(true);

    expect(t1.get('a')).toBe(1);
    expect(t2.get('a')).toBe(10);

    expect(t1.size).toBe(3);
    expect(t2.size).toBe(3);
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

  it('only allows setting what it knows about', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t1 = new MyType({a: 10, b:20});
    expect(() => {
      (t1 as any).set('d', 4);
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
    expect(t3.toObject()).toEqual({a:3, b:10});
  })

});
