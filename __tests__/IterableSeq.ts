///<reference path='../resources/jest.d.ts'/>

declare var Symbol: any;
import { Seq } from '../';

describe('Sequence', () => {

  it('creates a sequence from an iterable', () => {
    let i = new SimpleIterable();
    let s = Seq(i);
    expect(s.take(5).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
  });

  it('is stable', () => {
    let i = new SimpleIterable();
    let s = Seq(i);
    expect(s.take(5).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
    expect(s.take(5).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
    expect(s.take(5).take(Infinity).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
    expect(s.take(5).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
  });

  it('counts iterations', () => {
    let i = new SimpleIterable(10);
    let s = Seq(i);
    expect(s.forEach(x => x)).toEqual(10);
    expect(s.take(5).forEach(x => x)).toEqual(5);
    expect(s.forEach(x => x < 3)).toEqual(4);
  });

  it('creates a new iterator on every operations', () => {
    let mockFn = jest.genMockFunction();
    let i = new SimpleIterable(3, mockFn);
    let s = Seq(i);
    expect(s.toArray()).toEqual([ 0, 1, 2 ]);
    expect(mockFn.mock.calls).toEqual([[0], [1], [2]]);
    // The iterator is recreated for the second time.
    expect(s.toArray()).toEqual([ 0, 1, 2 ]);
    expect(mockFn.mock.calls).toEqual([[0], [1], [2], [0], [1], [2]]);
  });

  it('can be iterated', () => {
    let mockFn = jest.genMockFunction();
    let i = new SimpleIterable(3, mockFn);
    let seq = Seq(i);
    let entries = seq.entries();
    expect(entries.next()).toEqual({ value: [0, 0], done: false });
    // The iteration is lazy
    expect(mockFn.mock.calls).toEqual([[0]]);
    expect(entries.next()).toEqual({ value: [1, 1], done: false });
    expect(entries.next()).toEqual({ value: [2, 2], done: false });
    expect(entries.next()).toEqual({ value: undefined, done: true });
    expect(mockFn.mock.calls).toEqual([[0], [1], [2]]);
    // The iterator is recreated for the second time.
    entries = seq.entries();
    expect(entries.next()).toEqual({ value: [0, 0], done: false });
    expect(entries.next()).toEqual({ value: [1, 1], done: false });
    expect(entries.next()).toEqual({ value: [2, 2], done: false });
    expect(entries.next()).toEqual({ value: undefined, done: true });
    expect(mockFn.mock.calls).toEqual([[0], [1], [2], [0], [1], [2]]);
  });

  it('can be mapped and filtered', () => {
    let mockFn = jest.genMockFunction();
    let i = new SimpleIterable(undefined, mockFn); // infinite
    let seq = Seq<number, number>(i)
      .filter(x => x % 2 === 1)
      .map(x => x * x);
    let entries = seq.entries();
    expect(entries.next()).toEqual({ value: [0, 1], done: false });
    expect(entries.next()).toEqual({ value: [1, 9], done: false });
    expect(entries.next()).toEqual({ value: [2, 25], done: false });
    expect(mockFn.mock.calls).toEqual([[0], [1], [2], [3], [4], [5]]);
  });

  it('can be updated', () => {
    function sum(seq) {
      return seq.reduce((s, v) => s + v, 0);
    }
    let total = Seq([1, 2, 3])
      .filter(x => x % 2 === 1)
      .map(x => x * x)
      .update(sum);
    expect(total).toBe(10);
  });

  describe('IteratorSequence', () => {

    it('creates a sequence from a raw iterable', () => {
      let i = new SimpleIterable(10);
      let s = Seq(i[ITERATOR_SYMBOL]());
      expect(s.take(5).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
    });

    it('is stable', () => {
      let i = new SimpleIterable(10);
      let s = Seq(i[ITERATOR_SYMBOL]());
      expect(s.take(5).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
      expect(s.take(5).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
      expect(s.take(5).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
    });

    it('counts iterations', () => {
      let i = new SimpleIterable(10);
      let s = Seq(i[ITERATOR_SYMBOL]());
      expect(s.forEach(x => x)).toEqual(10);
      expect(s.take(5).forEach(x => x)).toEqual(5);
      expect(s.forEach(x => x < 3)).toEqual(4);
    });

    it('memoizes the iterator', () => {
      let mockFn = jest.genMockFunction();
      let i = new SimpleIterable(10, mockFn);
      let s = Seq(i[ITERATOR_SYMBOL]());
      expect(s.take(3).toArray()).toEqual([ 0, 1, 2 ]);
      expect(mockFn.mock.calls).toEqual([[0], [1], [2]]);

      // Second call uses memoized values
      expect(s.take(3).toArray()).toEqual([ 0, 1, 2 ]);
      expect(mockFn.mock.calls).toEqual([[0], [1], [2]]);

      // Further ahead in the iterator yields more results.
      expect(s.take(5).toArray()).toEqual([ 0, 1, 2, 3, 4 ]);
      expect(mockFn.mock.calls).toEqual([[0], [1], [2], [3], [4]]);
    });

    it('can be iterated', () => {
      let mockFn = jest.genMockFunction();
      let i = new SimpleIterable(3, mockFn);
      let seq = Seq(i[ITERATOR_SYMBOL]());
      let entries = seq.entries();
      expect(entries.next()).toEqual({ value: [0, 0], done: false });
      // The iteration is lazy
      expect(mockFn.mock.calls).toEqual([[0]]);
      expect(entries.next()).toEqual({ value: [1, 1], done: false });
      expect(entries.next()).toEqual({ value: [2, 2], done: false });
      expect(entries.next()).toEqual({ value: undefined, done: true });
      expect(mockFn.mock.calls).toEqual([[0], [1], [2]]);
      // The iterator has been memoized for the second time.
      entries = seq.entries();
      expect(entries.next()).toEqual({ value: [0, 0], done: false });
      expect(entries.next()).toEqual({ value: [1, 1], done: false });
      expect(entries.next()).toEqual({ value: [2, 2], done: false });
      expect(entries.next()).toEqual({ value: undefined, done: true });
      expect(mockFn.mock.calls).toEqual([[0], [1], [2]]);
    });

    it('can iterate an skipped seq based on an iterator', () => {
      let i = new SimpleIterable(4);
      let seq = Seq(i[ITERATOR_SYMBOL]());
      expect(seq.size).toBe(undefined);
      let skipped = seq.skip(2);
      expect(skipped.size).toBe(undefined);
      let iter = skipped[ITERATOR_SYMBOL]();
      // The first two were skipped
      expect(iter.next()).toEqual({ value: 2, done: false });
      expect(iter.next()).toEqual({ value: 3, done: false });
      expect(iter.next()).toEqual({ value: undefined, done: true });
    });
  });

});

// Helper for this test
let ITERATOR_SYMBOL =
  typeof Symbol === 'function' && Symbol.iterator || '@@iterator';

function SimpleIterable(max?: number, watcher?: any) {
  this.max = max;
  this.watcher = watcher;
}
SimpleIterable.prototype[ITERATOR_SYMBOL] = function() {
  return new SimpleIterator(this);
};

function SimpleIterator(iterable) {
  this.iterable = iterable;
  this.value = 0;
}
SimpleIterator.prototype.next = function() {
  if (this.value >= this.iterable.max) {
    return { value: undefined, done: true };
  }
  if (this.iterable.watcher) {
    this.iterable.watcher(this.value);
  }
  return { value: this.value++, done: false };
};
SimpleIterator.prototype[ITERATOR_SYMBOL] = function() {
  return this;
};
