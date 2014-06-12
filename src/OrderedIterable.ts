import Iterable = require('./Iterable');
import Vector = require('./Vector');

class OrderedIterable<V, C> extends Iterable<number, V, C> {
  toArray(): Array<V> {
    var array: Array<V> = [];
    this.iterate(function (v, k) {
      array[k] = v;
    });
    return array;
  }

  toVector(): Vector<V> {
    var vect: Vector<V> = Vector.empty().asTransient();
    this.iterate(function (v, k) {
      vect.set(k, v);
    });
    return vect.asPersistent();
  }

  keys(): OrderedIterable<number, C> {
    return this.map<number>((v, k) => k);
  }

  map<V2>(
    fn: (value?: V, index?: number, collection?: C) => V2,
    thisArg?: any
  ): OrderedIterable<V2, C> {
    return new MapIterator(this, fn, thisArg);
  }

  filter(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): OrderedIterable<V, C> {
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

  take(amount: number): OrderedIterable<V, C> {
    var iterations = 0;
    return this.takeWhile(() => iterations++ < amount);
  }

  skip(amount: number): OrderedIterable<V, C> {
    var iterations = 0;
    return this.skipWhile(() => iterations++ < amount);
  }

  takeWhile(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): OrderedIterable<V, C> {
    return new TakeIterator(this, fn, thisArg);
  }

  skipWhile(
    fn: (value?: V, index?: number, collection?: C) => boolean,
    thisArg?: any
  ): OrderedIterable<V, C> {
    return new SkipIterator(this, fn, thisArg);
  }
}

class MapIterator<V, V2, C> extends OrderedIterable<V2, C> {
  constructor(
    private iterator: OrderedIterable<V, C>,
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
}

class FilterIterator<K, V, C> extends OrderedIterable<V, C> {
  constructor(
    private iterator: OrderedIterable<V, C>,
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
}

class TakeIterator<V, C> extends OrderedIterable<V, C> {
  constructor(
    private iterator: OrderedIterable<V, C>,
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
}

class SkipIterator<V, C> extends OrderedIterable<V, C> {
  constructor(
    private iterator: OrderedIterable<V, C>,
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
}

export = OrderedIterable;
