const { Record } = require('../');

describe('Record', () => {
  it('defines a constructor', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });

    const t = new MyType();
    const t2 = t.set('a', 10);

    expect(t.a).toBe(1);
    expect(t2.a).toBe(10);
  });

  it('can have mutations apply', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });

    const t = new MyType();

    expect(() => {
      t.a = 10;
    }).toThrow();

    const t2 = t.withMutations(mt => {
      mt.a = 10;
      mt.b = 20;
      mt.c = 30;
    });

    expect(t.a).toBe(1);
    expect(t2.a).toBe(10);
  });

  it('can be subclassed', () => {
    class Alphabet extends Record({ a: 1, b: 2, c: 3 }) {
      soup() {
        return this.a + this.b + this.c;
      }
    }

    const t = new Alphabet();
    const t2 = t.set('b', 200);

    expect(t instanceof Record);
    expect(t instanceof Alphabet);
    expect(t.soup()).toBe(6);
    expect(t2.soup()).toBe(204);
  });

  it('can be cleared', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });
    let t = new MyType({ c: 'cats' });

    expect(t.c).toBe('cats');
    t = t.clear();
    expect(t.c).toBe(3);

    const MyType2 = Record({ d: 4, e: 5, f: 6 });
    let t2 = new MyType2({ d: 'dogs' });

    expect(t2.d).toBe('dogs');
    t2 = t2.clear();
    expect(t2.d).toBe(4);
  });
});
