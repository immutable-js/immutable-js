import { is, Seq } from 'immutable';
import fc from 'fast-check';

const genHeterogeneousishArray = fc.oneof(
  fc.sparseArray(fc.string()),
  fc.array(fc.oneof(fc.integer(), fc.constant(NaN)))
);

describe('max', () => {
  it('returns max in a sequence', () => {
    expect(Seq([1, 9, 2, 8, 3, 7, 4, 6, 5]).max()).toBe(9);
  });

  it('accepts a comparator', () => {
    expect(Seq([1, 9, 2, 8, 3, 7, 4, 6, 5]).max((a, b) => b - a)).toBe(1);
  });

  it('by a mapper', () => {
    const family = Seq([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ]);
    expect(family.maxBy((p) => p.age)).toBe(family.get(2));
  });

  it('by a mapper and a comparator', () => {
    const family = Seq([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ]);
    expect(
      family.maxBy<number>(
        (p) => p.age,
        (a, b) => b - a
      )
    ).toBe(family.get(0));
  });

  it('surfaces NaN, null, and undefined', () => {
    expect(is(NaN, Seq([1, 2, 3, 4, 5, NaN]).max())).toBe(true);
    expect(is(NaN, Seq([NaN, 1, 2, 3, 4, 5]).max())).toBe(true);
    expect(is(null, Seq(['A', 'B', 'C', 'D', null]).max())).toBe(true);
    expect(is(null, Seq([null, 'A', 'B', 'C', 'D']).max())).toBe(true);
  });

  it('null treated as 0 in default iterator', () => {
    expect(is(2, Seq([-1, -2, null, 1, 2]).max())).toBe(true);
  });

  it('is not dependent on order', () => {
    fc.assert(
      fc.property(genHeterogeneousishArray, (vals) => {
        expect(is(Seq(shuffle(vals.slice())).max(), Seq(vals).max())).toEqual(
          true
        );
      })
    );
  });
});

describe('min', () => {
  it('returns min in a sequence', () => {
    expect(Seq([1, 9, 2, 8, 3, 7, 4, 6, 5]).min()).toBe(1);
  });

  it('accepts a comparator', () => {
    expect(Seq([1, 9, 2, 8, 3, 7, 4, 6, 5]).min((a, b) => b - a)).toBe(9);
  });

  it('by a mapper', () => {
    const family = Seq([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ]);
    expect(family.minBy((p) => p.age)).toBe(family.get(0));
  });

  it('by a mapper and a comparator', () => {
    const family = Seq([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ]);
    expect(
      family.minBy<number>(
        (p) => p.age,
        (a, b) => b - a
      )
    ).toBe(family.get(2));
  });

  it('is not dependent on order', () => {
    fc.assert(
      fc.property(genHeterogeneousishArray, (vals) => {
        expect(is(Seq(shuffle(vals.slice())).min(), Seq(vals).min())).toEqual(
          true
        );
      })
    );
  });
});

function shuffle(array) {
  let m = array.length;
  let t;
  let i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}
