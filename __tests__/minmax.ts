///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');
import LazySequence = I.LazySequence;

describe('max', () => {

  it('returns max in a sequence', () => {
    expect(LazySequence.from([1,9,2,8,3,7,4,6,5]).max()).toBe(9);
  });

  it('accepts a comparator', () => {
    expect(LazySequence.from([1,9,2,8,3,7,4,6,5]).max((a, b) => b - a)).toBe(1);
  });

  it('by a mapper', () => {
    var family = I.LazySequence.from([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ])
    expect(family.maxBy(p => p.age).name).toBe('Casey');
  });

  it('by a mapper and a comparator', () => {
    var family = I.LazySequence.from([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ])
    expect(family.maxBy<number>(p => p.age, (a, b) => b - a).name).toBe('Oakley');
  });

});

describe('min', () => {

  it('returns min in a sequence', () => {
    expect(LazySequence.from([1,9,2,8,3,7,4,6,5]).min()).toBe(1);
  });

  it('accepts a comparator', () => {
    expect(LazySequence.from([1,9,2,8,3,7,4,6,5]).min((a, b) => b - a)).toBe(9);
  });

  it('by a mapper', () => {
    var family = I.LazySequence.from([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ])
    expect(family.minBy(p => p.age).name).toBe('Oakley');
  });

  it('by a mapper and a comparator', () => {
    var family = I.LazySequence.from([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ])
    expect(family.minBy<number>(p => p.age, (a, b) => b - a).name).toBe('Casey');
  });

});
