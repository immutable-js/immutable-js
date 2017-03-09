import { Record, Seq } from '../';

describe('Record', () => {

  it('defines a constructor', () => {
    let MyType = Record({ a: 1, b: 2, c: 3 });

    let t1 = new MyType();
    let t2 = t1.set('a', 10);
    let t3 = t2.clear();

    expect(t1 instanceof Record).toBe(true);
    expect(t1 instanceof MyType).toBe(true);

    expect(t3 instanceof Record).toBe(true);
    expect(t3 instanceof MyType).toBe(true);

    expect(t1.get('a')).toBe(1);
    expect(t2.get('a')).toBe(10);

    expect(t1.size).toBe(3);
    expect(t2.size).toBe(3);
  });

  it('allows for a descriptive name', () => {
    let Person = Record({ name: null }, 'Person');

    let me = Person({ name: 'My Name' });
    expect(me.toString()).toEqual('Person { "name": "My Name" }');
    expect(Record.getDescriptiveName(me)).toEqual('Person');
  });

  it('passes through records of the same type', () => {
    let P2 = Record({ x: 0, y: 0 });
    let P3 = Record({ x: 0, y: 0, z: 0 });
    let p2 = P2();
    let p3 = P3();
    expect(P3(p2) instanceof P3).toBe(true);
    expect(P2(p3) instanceof P2).toBe(true);
    expect(P2(p2)).toBe(p2);
    expect(P3(p3)).toBe(p3);
  });

  it('setting an unknown key is a no-op', () => {
    let MyType = Record({ a: 1, b: 2, c: 3 });

    let t1 = new MyType({ a: 10, b: 20 });
    let t2 = t1.set('d' as any, 4);

    expect(t2).toBe(t1);
  });

  it('has a fixed size and falls back to default values', () => {
    let MyType = Record({ a: 1, b: 2, c: 3 });

    let t1 = new MyType({ a: 10, b: 20 });
    let t2 = new MyType({ b: 20 });
    let t3 = t1.remove('a');
    let t4 = t3.clear();

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
  });

  it('merges in Objects and other Records', () => {
    let Point2 = Record({ x: 0, y: 0 });
    let Point3 = Record({ x: 0, y: 0, z: 0 });

    let p2 = Point2({ x: 20, y: 20 });
    let p3 = Point3({ x: 10, y: 10, z: 10 });

    expect(p3.merge(p2).toObject()).toEqual({ x: 20, y: 20, z: 10 });

    expect(p2.merge({ y: 30 }).toObject()).toEqual({ x: 20, y: 30 });
    expect(p3.merge({ y: 30, z: 30 }).toObject()).toEqual({ x: 10, y: 30, z: 30 });
  });

  it('converts sequences to records', () => {
    let MyType = Record({ a: 1, b: 2, c: 3 });
    let seq = Seq({ a: 10, b: 20 });
    let t = new MyType(seq);
    expect(t.toObject()).toEqual({ a: 10, b: 20, c: 3 });
  });

  it('allows for functional construction', () => {
    let MyType = Record({ a: 1, b: 2, c: 3 });
    let seq = Seq({ a: 10, b: 20 });
    let t = MyType(seq);
    expect(t.toObject()).toEqual({ a: 10, b: 20, c: 3 });
  });

  it('skips unknown keys', () => {
    let MyType = Record({ a: 1, b: 2 });
    let seq = Seq({ b: 20, c: 30 });
    let t = new MyType(seq);

    expect(t.get('a')).toEqual(1);
    expect(t.get('b')).toEqual(20);
    expect((t as any).get('c')).toBeUndefined();
  });

  it('returns itself when setting identical values', () => {
    let MyType = Record({ a: 1, b: 2 });
    let t1 = new MyType();
    let t2 = new MyType({ a: 1 });
    let t3 = t1.set('a', 1);
    let t4 = t2.set('a', 1);
    expect(t3).toBe(t1);
    expect(t4).toBe(t2);
  });

  it('returns new record when setting new values', () => {
    let MyType = Record({ a: 1, b: 2 });
    let t1 = new MyType();
    let t2 = new MyType({ a: 1 });
    let t3 = t1.set('a', 3);
    let t4 = t2.set('a', 3);
    expect(t3).not.toBe(t1);
    expect(t4).not.toBe(t2);
  });

  it('allows for property access', () => {
    let MyType = Record({ a: 1, b: 'foo' });
    let t1 = new MyType();
    let a: number = t1.a;
    let b: string = t1.b;
    expect(a).toEqual(1);
    expect(b).toEqual('foo');
  });

  it('allows for class extension', () => {
    class ABClass extends Record({ a: 1, b: 2 }) {
      public setA(a: number) {
        return this.set('a', a);
      }

      public setB(b: number) {
        return this.set('b', b);
      }
    }

    let t1 = new ABClass({ a: 1 });
    let t2 = t1.setA(3);
    let t3 = t2.setB(10);

    let a: number = t3.a;
    expect(a).toEqual(3);
    expect(t3.toObject()).toEqual({ a: 3, b: 10 });
  });

  it('does not allow overwriting property names', () => {
    let realWarn = console.warn;

    try {
      let warnings = [];
      console.warn = w => warnings.push(w);

      let MyType1 = Record({ size: 0 });
      let t1 = MyType1();
      expect(warnings.length).toBe(1);
      expect(warnings[0]).toBe(
        'Cannot define Record with property "size" since that property name is part of the Record API.',
      );

      let MyType2 = Record({ get: 0 });
      let t2 = MyType2();
      expect(warnings.length).toBe(2);
      expect(warnings[1]).toBe(
        'Cannot define Record with property "get" since that property name is part of the Record API.',
      );
    } finally {
      console.warn = realWarn;
    }
  });

});
