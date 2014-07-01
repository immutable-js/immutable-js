///<reference path='./node.d.ts'/>
import LazyIterable = require('./LazyIterable');
import Vector = require('./Vector'); // for Type info

class OrderedLazyIterable<V, C> extends LazyIterable<number, V, C> {
  /**
   * Note: the default implementation of this needs to make an intermediate
   * representation which may be inefficent. Concrete data structures should
   * do better if possible.
   */
  reverseIterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var tempKV: Array<any> = [];
    var collection: C;
    this.iterate(function (v, k, c) {
      if (!collection) {
        collection = c;
      }
      tempKV.push([k, v]);
    });
    for (var ii = tempKV.length - 1; ii >= 0; ii--) {
      if (fn.call(thisArg, tempKV[ii][1], tempKV[ii][0], collection) === false) {
        return false;
      }
    }
    return true;
  }

  toArray(): Array<V> {
    var array: Array<V> = [];
    this.iterate(function (v, k) {
      array[k] = v;
    });
    return array;
  }

  toVector(): Vector<V> {
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  }

  reverse(): OrderedLazyIterable<V, C> {
    return new ReverseIterator(this);
  }

  keys(): OrderedLazyIterable<number, C> {
    return this.map<number>((v, k) => k);
  }

  map<V2>(
    fn: (value?: V, index?: number, collection?: C) => V2,
    thisArg?: any
  ): OrderedLazyIterable<V2, C> {
    return new MapIterator(this, fn, thisArg);
  }

  filter(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): OrderedLazyIterable<V, C> {
    return new FilterIterator(this, fn, thisArg);
  }

  indexOf(searchValue: V): number {
    return this.findIndex(value => value === searchValue);
  }

  findIndex(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): number {
    var index = this.find(fn, thisArg);
    return index == null ? -1 : index;
  }

  take(amount: number): OrderedLazyIterable<V, C> {
    var iterations = 0;
    return this.takeWhile(() => iterations++ < amount);
  }

  skip(amount: number): OrderedLazyIterable<V, C> {
    var iterations = 0;
    return this.skipWhile(() => iterations++ < amount);
  }

  takeWhile(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): OrderedLazyIterable<V, C> {
    return new TakeIterator(this, fn, thisArg);
  }

  skipWhile(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): OrderedLazyIterable<V, C> {
    return new SkipIterator(this, fn, thisArg);
  }
}

class ReverseIterator<V, C> extends OrderedLazyIterable<V, C> {
  constructor(
    private iterator: OrderedLazyIterable<V, C>
  ) {super();}

  iterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    return this.iterator.reverseIterate(fn, thisArg);
  }

  reverseIterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    return this.iterator.iterate(fn, thisArg);
  }

  reverse(): OrderedLazyIterable<V, C> {
    return this.iterator;
  }
}

class MapIterator<V, V2, C> extends OrderedLazyIterable<V2, C> {
  constructor(
    private iterator: OrderedLazyIterable<V, C>,
    private mapper: (value?: V, index?: number, collection?: C) => V2,
    private mapThisArg: any
  ) {super();}

  iterate(
    fn: (value?: V2, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.iterate(function (v, k, c) {
      if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
        return false;
      }
    });
  }

  reverseIterate(
    fn: (value?: V2, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.reverseIterate(function (v, k, c) {
      if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
        return false;
      }
    });
  }
}

class FilterIterator<V, C> extends OrderedLazyIterable<V, C> {
  constructor(
    private iterator: OrderedLazyIterable<V, C>,
    private predicate: (value?: V, index?: number, collection?: C) => boolean,
    private predicateThisArg: any
  ) {super();}

  iterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var iterations = 0;
    return this.iterator.iterate(function (v, k, c) {
      if (predicate.call(predicateThisArg, v, k, c) &&
          fn.call(thisArg, v, iterations++, c) === false) {
        return false;
      }
    });
  }

  reverseIterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var iterations = 0;
    return this.iterator.reverseIterate(function (v, k, c) {
      if (predicate.call(predicateThisArg, v, k, c) &&
          fn.call(thisArg, v, iterations++, c) === false) {
        return false;
      }
    });
  }
}

class TakeIterator<V, C> extends OrderedLazyIterable<V, C> {
  constructor(
    private iterator: OrderedLazyIterable<V, C>,
    private predicate: (value?: V, index?: number, collection?: C) => boolean,
    private predicateThisArg: any
  ) {super();}

  iterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.iterate(function (v, k, c) {
      if (!predicate.call(predicateThisArg, v, k, c) ||
          fn.call(thisArg, v, k, c) === false) {
        return false;
      }
    });
  }

  reverseIterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.reverseIterate(function (v, k, c) {
      if (!predicate.call(predicateThisArg, v, k, c) ||
          fn.call(thisArg, v, k, c) === false) {
        return false;
      }
    });
  }
}

class SkipIterator<V, C> extends OrderedLazyIterable<V, C> {
  constructor(
    private iterator: OrderedLazyIterable<V, C>,
    private predicate: (value?: V, index?: number, collection?: C) => boolean,
    private predicateThisArg: any
  ) {super();}

  iterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var iterations = 0;
    var isSkipping = true;
    return this.iterator.iterate(function (v, k, c) {
      isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c);
      if (!isSkipping && fn.call(thisArg, v, iterations++, c) === false) {
        return false;
      }
    });
  }

  reverseIterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var iterations = 0;
    var isSkipping = true;
    return this.iterator.reverseIterate(function (v, k, c) {
      isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c);
      if (!isSkipping && fn.call(thisArg, v, iterations++, c) === false) {
        return false;
      }
    });
  }
}

export = OrderedLazyIterable;
