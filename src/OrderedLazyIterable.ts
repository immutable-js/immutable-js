///<reference path='./node.d.ts'/>
import LazyIterable = require('./LazyIterable');
import Vector = require('./Vector'); // for Type info

class OrderedLazyIterable<V, C> extends LazyIterable<number, V, C> {
  // overridden to add maintainIndices to the type.
  iterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any,
    reverseIndices?: boolean
  ): boolean {
    throw new Error('Abstract method');
  }


  reverseIterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any,
    maintainIndices?: boolean
  ): boolean {
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp: Array<V> = [];
    var collection: C;
    this.iterate(function (v, i, c) {
      collection || (collection = c);
      temp[i] = v;
    });
    for (var ii = temp.length - 1; ii >= 0; ii--) {
      if (temp.hasOwnProperty(<any>ii) &&
          fn.call(thisArg, temp[ii], maintainIndices ? ii : temp.length - 1 - ii, collection) === false) {
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

  reverse(maintainIndices?: boolean): OrderedLazyIterable<V, C> {
    return new ReverseIterator(this, maintainIndices);
  }

  keys(): OrderedLazyIterable<number, C> {
    return this.map<number>((v, k) => k).values();
  }

  values(): OrderedLazyIterable<V, C> {
    return new ValueIterator(this);
  }

  entries(): OrderedLazyIterable<Array<any/*(K, V)*/>, C> {
    return this.map<Array<any>>((v, k) => [k,v]).values();
  }

  first(
    fn?: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): V {
    var firstValue: V;
    (fn ? this.filter(fn, thisArg) : this).take(1).forEach(v => (firstValue = v));
    return firstValue;
  }

  last(
    fn?: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): V {
    return this.reverse(true).first(fn, thisArg);
  }

  reduceRight<R>(
    fn: (prevReduction?: R, value?: V, index?: number, collection?: C) => R,
    initialReduction?: R,
    thisArg?: any
  ): R {
    return this.reverse(true).reduce(fn, initialReduction, thisArg);
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

  lastIndexOf(searchValue: V): number {
    return this.findLastIndex(value => value === searchValue);
  }

  findIndex(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): number {
    var key = this.findKey(fn, thisArg);
    return key == null ? -1 : key;
  }

  findLast(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): V {
    return this.reverse(true).find(fn, thisArg);
  }

  findLastIndex(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): number {
    return this.reverse(true).findIndex(fn, thisArg);
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

  takeUntil(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): OrderedLazyIterable<V, C> {
    return this.takeWhile(not(fn), thisArg);
  }

  skipUntil(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): OrderedLazyIterable<V, C> {
    return this.skipWhile(not(fn), thisArg);
  }
}

function not<V, C>(fn: (value?: V, index?: number, collection?: C) => boolean): (value?: V, index?: number, collection?: C) => boolean {
  return function() {
    return !fn.apply(this, arguments);
  }
}

class ReverseIterator<V, C> extends OrderedLazyIterable<V, C> {
  constructor(
    private iterator: OrderedLazyIterable<V, C>,
    private maintainIndices: boolean
  ) {super();}

  iterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any,
    reverseIndices?: boolean
  ): boolean {
    return this.iterator.reverseIterate(fn, thisArg, reverseIndices !== this.maintainIndices);
  }

  reverseIterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any,
    maintainIndices?: boolean
  ): boolean {
    return this.iterator.iterate(fn, thisArg, maintainIndices !== this.maintainIndices);
  }

  reverse(maintainIndices?: boolean): OrderedLazyIterable<V, C> {
    if (maintainIndices === this.maintainIndices) {
      return this.iterator;
    }
    return super.reverse(maintainIndices);
  }
}

class ValueIterator<V, C> extends OrderedLazyIterable<V, C> {
  constructor(
    private iterator: OrderedLazyIterable<V, C>
  ) {super();}

  iterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any,
    reverseIndices?: boolean
  ): boolean {
    var iterations = 0;
    return this.iterator.iterate(function (v, k, c) {
      if (fn.call(thisArg, v, iterations++, c) === false) {
        return false;
      }
    }, null, reverseIndices);
  }

  // This is equivalent to values(reverse(x)) and takes advantage of the fact that
  // these two functions are commutative.
  reverseIterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any,
    maintainIndices?: boolean
  ): boolean {
    var iterations = 0;
    return this.iterator.reverseIterate(function (v, k, c) {
      if (fn.call(thisArg, v, iterations++, c) === false) {
        return false;
      }
    }, null, maintainIndices);
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
    thisArg?: any,
    reverseIndices?: boolean
  ): boolean {
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.iterate(function (v, k, c) {
      if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
        return false;
      }
    }, null, reverseIndices);
  }

  // This is equivalent to map(reverse(x)) and takes advantage of the fact that
  // these two functions are commutative.
  reverseIterate(
    fn: (value?: V2, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any,
    maintainIndices?: boolean
  ): boolean {
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.reverseIterate(function (v, k, c) {
      if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
        return false;
      }
    }, null, maintainIndices);
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
    thisArg?: any,
    reverseIndices?: boolean
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var iterations = 0;
    return this.iterator.iterate(function (v, k, c) {
      if (predicate.call(predicateThisArg, v, k, c) &&
          fn.call(thisArg, v, iterations++, c) === false) {
        return false;
      }
    }, null, reverseIndices);
  }

  // This is equivalent to filter(reverse(x)) and takes advantage of the fact that
  // these two functions are commutative.
  reverseIterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any,
    maintainIndices?: boolean
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var iterations = 0;
    return this.iterator.reverseIterate(function (v, k, c) {
      if (predicate.call(predicateThisArg, v, k, c) &&
          fn.call(thisArg, v, iterations++, c) === false) {
        return false;
      }
    }, null, maintainIndices);
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
    thisArg?: any,
    reverseIndices?: boolean
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.iterate(function (v, k, c) {
      if (!predicate.call(predicateThisArg, v, k, c) ||
          fn.call(thisArg, v, k, c) === false) {
        return false;
      }
    }, null, reverseIndices);
  }

  // Use default impl for reverseIterate because reverse(take(x)) and
  // take(reverse(x)) are not communtative.
}

class SkipIterator<V, C> extends OrderedLazyIterable<V, C> {
  constructor(
    private iterator: OrderedLazyIterable<V, C>,
    private predicate: (value?: V, index?: number, collection?: C) => boolean,
    private predicateThisArg: any
  ) {super();}

  iterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any,
    reverseIndices?: boolean
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
    }, null, reverseIndices);
  }

  // Use default impl for reverseIterate because reverse(skip(x)) and
  // skip(reverse(x)) are not communtative.
}

export = OrderedLazyIterable;
