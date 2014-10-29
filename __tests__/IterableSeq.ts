///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>
jest.autoMockOff();

import Immutable = require('immutable');


describe('IterableSequence', () => {

  it('creates a sequence from an iterable', () => {
    var i = new SimpleIterable();
    var s = Immutable.Seq(i);
    expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
  })

  it('is stable', () => {
    var i = new SimpleIterable();
    var s = Immutable.Seq(i);
    expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
    expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
    expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
  })

  it('counts iterations', () => {
    var i = new SimpleIterable(10);
    var s = Immutable.Seq(i);
    expect(s.forEach(x => x)).toEqual(10);
    expect(s.take(5).forEach(x => x)).toEqual(5);
    expect(s.forEach(x => x < 3)).toEqual(4);
  })

  it('creates a new iterator on every operations', () => {
    var mockFn = jest.genMockFunction();
    var i = new SimpleIterable(3, mockFn);
    var s = Immutable.Seq(i);
    expect(s.toArray()).toEqual([ 0,1,2 ]);
    expect(mockFn.mock.calls).toEqual([[0],[1],[2]]);
    // The iterator is recreated for the second time.
    expect(s.toArray()).toEqual([ 0,1,2 ]);
    expect(mockFn.mock.calls).toEqual([[0],[1],[2],[0],[1],[2]]);
  })

  it('can be iterated', () => {
    var mockFn = jest.genMockFunction();
    var i = new SimpleIterable(3, mockFn);
    var seq = Immutable.Seq(i);
    var entries = seq.entries();
    expect(entries.next()).toEqual({ value: [0, 0], done: false });
    // The iteration is lazy
    expect(mockFn.mock.calls).toEqual([[0]]);
    expect(entries.next()).toEqual({ value: [1, 1], done: false });
    expect(entries.next()).toEqual({ value: [2, 2], done: false });
    expect(entries.next()).toEqual({ value: undefined, done: true });
    expect(mockFn.mock.calls).toEqual([[0],[1],[2]]);
    // The iterator is recreated for the second time.
    entries = seq.entries();
    expect(entries.next()).toEqual({ value: [0, 0], done: false });
    expect(entries.next()).toEqual({ value: [1, 1], done: false });
    expect(entries.next()).toEqual({ value: [2, 2], done: false });
    expect(entries.next()).toEqual({ value: undefined, done: true });
    expect(mockFn.mock.calls).toEqual([[0],[1],[2],[0],[1],[2]]);
  })

  it('can be mapped and filtered', () => {
    var mockFn = jest.genMockFunction();
    var i = new SimpleIterable(undefined, mockFn); // infinite
    var seq = Immutable.Seq<number, number>(i)
      .filter(x => x % 2 === 1)
      .map(x => x * x);
    var entries = seq.entries();
    expect(entries.next()).toEqual({ value: [0, 1], done: false });
    expect(entries.next()).toEqual({ value: [1, 9], done: false });
    expect(entries.next()).toEqual({ value: [2, 25], done: false });
    expect(mockFn.mock.calls).toEqual([[0],[1],[2],[3],[4],[5]]);
  })

  describe('IteratorSequence', () => {

    it('creates a sequence from a raw iterable', () => {
      var i = new SimpleIterable(10);
      var s = Immutable.Seq(i['@@iterator']());
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
    })

    it('is stable', () => {
      var i = new SimpleIterable(10);
      var s = Immutable.Seq(i['@@iterator']());
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
    })

    it('counts iterations', () => {
      var i = new SimpleIterable(10);
      var s = Immutable.Seq(i['@@iterator']());
      expect(s.forEach(x => x)).toEqual(10);
      expect(s.take(5).forEach(x => x)).toEqual(5);
      expect(s.forEach(x => x < 3)).toEqual(4);
    })

    it('memoizes the iterator', () => {
      var mockFn = jest.genMockFunction();
      var i = new SimpleIterable(10, mockFn);
      var s = Immutable.Seq(i['@@iterator']());
      expect(s.take(3).toArray()).toEqual([ 0,1,2 ]);
      expect(mockFn.mock.calls).toEqual([[0],[1],[2]]);

      // Second call uses memoized values
      expect(s.take(3).toArray()).toEqual([ 0,1,2 ]);
      expect(mockFn.mock.calls).toEqual([[0],[1],[2]]);

      // Further ahead in the iterator yields more results.
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
      expect(mockFn.mock.calls).toEqual([[0],[1],[2],[3],[4]]);
    })

    it('can be iterated', () => {
      var mockFn = jest.genMockFunction();
      var i = new SimpleIterable(3, mockFn);
      var seq = Immutable.Seq(i['@@iterator']());
      var entries = seq.entries();
      expect(entries.next()).toEqual({ value: [0, 0], done: false });
      // The iteration is lazy
      expect(mockFn.mock.calls).toEqual([[0]]);
      expect(entries.next()).toEqual({ value: [1, 1], done: false });
      expect(entries.next()).toEqual({ value: [2, 2], done: false });
      expect(entries.next()).toEqual({ value: undefined, done: true });
      expect(mockFn.mock.calls).toEqual([[0],[1],[2]]);
      // The iterator has been memoized for the second time.
      entries = seq.entries();
      expect(entries.next()).toEqual({ value: [0, 0], done: false });
      expect(entries.next()).toEqual({ value: [1, 1], done: false });
      expect(entries.next()).toEqual({ value: [2, 2], done: false });
      expect(entries.next()).toEqual({ value: undefined, done: true });
      expect(mockFn.mock.calls).toEqual([[0],[1],[2]]);
    })

  })

})


// Helper for this test

function SimpleIterable(max?: number, watcher?: any) {
  this.max = max;
  this.watcher = watcher;
}
SimpleIterable.prototype['@@iterator'] = function() {
  return new SimpleIterator(this);
}

function SimpleIterator(iterable) {
  this.iterable = iterable;
  this.value = 0;
}
SimpleIterator.prototype.next = function() {
  if (this.value >= this.iterable.max) {
    return { value: undefined, done: true };
  }
  this.iterable.watcher && this.iterable.watcher(this.value);
  return { value: this.value++, done: false };
}
SimpleIterator.prototype['@@iterator'] = function() {
  return this;
}
