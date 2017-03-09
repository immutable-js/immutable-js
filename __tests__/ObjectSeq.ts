import { Seq } from '../';

describe('ObjectSequence', () => {
  it('maps', () => {
    let i = Seq({ a: 'A', b: 'B', c: 'C' });
    let m = i.map(x => x + x).toObject();
    expect(m).toEqual({ a: 'AA', b: 'BB', c: 'CC' });
  });

  it('reduces', () => {
    let i = Seq({ a: 'A', b: 'B', c: 'C' });
    let r = i.reduce<string>((acc, x) => acc + x, '');
    expect(r).toEqual('ABC');
  });

  it('extracts keys', () => {
    let i = Seq({ a: 'A', b: 'B', c: 'C' });
    let k = i.keySeq().toArray();
    expect(k).toEqual(['a', 'b', 'c']);
  });

  it('is reversable', () => {
    let i = Seq({ a: 'A', b: 'B', c: 'C' });
    let k = i.reverse().toArray();
    expect(k).toEqual(['C', 'B', 'A']);
  });

  it('can double reversable', () => {
    let i = Seq({ a: 'A', b: 'B', c: 'C' });
    let k = i.reverse().reverse().toArray();
    expect(k).toEqual(['A', 'B', 'C']);
  });

  it('can be iterated', () => {
    let obj = { a: 1, b: 2, c: 3 };
    let seq = Seq(obj);
    let entries = seq.entries();
    expect(entries.next()).toEqual({ value: ['a', 1], done: false });
    expect(entries.next()).toEqual({ value: ['b', 2], done: false });
    expect(entries.next()).toEqual({ value: ['c', 3], done: false });
    expect(entries.next()).toEqual({ value: undefined, done: true });
  });

  it('cannot be mutated after calling toObject', () => {
    let seq = Seq({ a: 1, b: 2, c: 3 });

    let obj = seq.toObject();
    obj.c = 10;

    let seq2 = Seq(obj);

    expect(seq.get('c')).toEqual(3);
    expect(seq2.get('c')).toEqual(10);
  });
});
