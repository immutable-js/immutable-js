function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

export class Iterable<K, V, C> {
  constructor(public collection: C) {}

  iterate(
    fn: (value: V, key: K, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    throw new Error('Abstract method');
  }

  toArray(): Array<V> {
    var array = [];
    this.iterate(function (v, k) {
      array.push(v);
    });
    return array;
  }

  // TODO: toVector() and toMap()

  keys(): Iterable<K, K, C> {
    return this.map((v, k) => k);
  }

  forEach(
    fn: (value: V, key: K, collection: C) => any,
    thisArg?: any
  ): void {
    this.iterate(function(v, k, c) {
      fn.call(thisArg, v, k, c);
    });
  }

  find(
    fn: (value: V, key: K, collection: C) => boolean,
    thisArg?: any
  ): K {
    var foundKey;
    this.iterate(function(v, k, c) {
      if (fn.call(thisArg, v, k, c) === true) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  }

  reduce<R>(
    fn: (prevReduction: R, value: V, key: K, collection: C) => R,
    initialReduction?: R,
    thisArg?: any
  ): R {
    var reduction = initialReduction;
    this.iterate(function(v, k, c) {
      reduction = fn.call(thisArg, reduction, v, k, c);
    });
    return reduction;
  }

  map<V2>(
    fn: (value: V, key: K, collection: C) => V2,
    thisArg?: any
  ): Iterable<K, V2, C> {
    return new MapIterator(this, fn, thisArg);
  }

  filter(
    fn: (value: V, key: K, collection: C) => boolean,
    thisArg?: any
  ): Iterable<K, V, C> {
    return new FilterIterator(this, fn, thisArg);
  }

  every(
    fn: (value: V, key: K, collection: C) => boolean,
    thisArg?: any
  ): boolean {
    var every = true;
    this.iterate(function(v, k, c) {
      if (!fn.call(thisArg, v, k, c)) {
        every = false;
        return false;
      }
    });
    return every;
  }

  some(
    fn: (value: V, key: K, collection: C) => boolean,
    thisArg?: any
  ): boolean {
    var some = false;
    this.iterate(function(v, k, c) {
      if (fn.call(thisArg, v, k, c)) {
        some = true;
        return false;
      }
    });
    return some;
  }
}

export class OrderedIterable<V, C> extends Iterable<number, V, C> {
  toArray(): Array<V> {
    var array = [];
    this.iterate(function (v, k) {
      array[<number><any>k] = v;
    });
    return array;
  }

  keys(): OrderedIterable<number, C> {
    return this.map((v, k) => k);
  }

  map<V2>(
    fn: (value: V, index: number, collection: C) => V2,
    thisArg?: any
  ): OrderedIterable<V2, C> {
    return new MapOrderedIterator(this, fn, thisArg);
  }

  filter(
    fn: (value: V, index: number, collection: C) => boolean,
    thisArg?: any
  ): OrderedIterable<V, C> {
    return new FilterOrderedIterator(this, fn, thisArg);
  }

  indexOf(searchValue: V): number {
    return this.findIndex(value => value === searchValue);
  }

  findIndex(
    fn: (value: V, index: number, collection: C) => boolean,
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
    fn: (value: V, index: number, collection: C) => boolean,
    thisArg?: any
  ): OrderedIterable<V, C> {
    return new TakeIterator(this, fn, thisArg);
  }

  skipWhile(
    fn: (value: V, index: number, collection: C) => boolean,
    thisArg?: any
  ): OrderedIterable<V, C> {
    return new SkipIterator(this, fn, thisArg);
  }
}

class MapIterator<K, V, V2, C> extends Iterable<K, V2, C> {
  constructor(
    private iterator: Iterable<K, V, C>,
    private mapper: (value: V, key: K, collection: C) => V2,
    private mapThisArg: any
  ) {
    super(iterator.collection);
  }

  iterate(
    fn: (value: V2, key: K, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.iterate(function (v, k, c) {
      fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c);
    });
  }
}

class MapOrderedIterator<V, V2, C> extends OrderedIterable<V2, C> {
  constructor(
    private iterator: OrderedIterable<V, C>,
    private mapper: (value: V, index: number, collection: C) => V2,
    private mapThisArg: any
  ) {
    super(iterator.collection);
  }

  iterate(
    fn: (value: V2, index: number, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.iterate(function (v, k, c) {
      fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c);
    });
  }
}

class FilterIterator<K, V, C> extends Iterable<K, V, C> {
  constructor(
    private iterator: Iterable<K, V, C>,
    private predicate: (value: V, key: K, collection: C) => boolean,
    private predicateThisArg: any
  ) {
    super(iterator.collection);
  }

  iterate(
    fn: (value: V, key: K, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.iterate(function (v, k, c) {
      if (predicate.call(predicateThisArg, v, k, c)) {
        fn.call(thisArg, v, k, c);
      }
    });
  }
}

class FilterOrderedIterator<K, V, C> extends OrderedIterable<V, C> {
  constructor(
    private iterator: OrderedIterable<V, C>,
    private predicate: (value: V, index: number, collection: C) => boolean,
    private predicateThisArg: any
  ) {
    super(iterator.collection);
  }

  iterate(
    fn: (value: V, index: number, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var iterations = 0;
    return this.iterator.iterate(function (v, k, c) {
      if (predicate.call(predicateThisArg, v, k, c)) {
        fn.call(thisArg, v, iterations++, c);
      }
    });
  }
}

class TakeIterator<V, C> extends OrderedIterable<V, C> {
  constructor(
    private iterator: OrderedIterable<V, C>,
    private predicate: (value: V, index: number, collection: C) => boolean,
    private predicateThisArg: any
  ) {
    super(iterator.collection);
  }

  iterate(
    fn: (value: V, index: number, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.iterate(function (v, k, c) {
      if (predicate.call(predicateThisArg, v, k, c)) {
        fn.call(thisArg, v, k, c);
      } else {
        return false;
      }
    });
  }
}

class SkipIterator<V, C> extends OrderedIterable<V, C> {
  constructor(
    private iterator: OrderedIterable<V, C>,
    private predicate: (value: V, index: number, collection: C) => boolean,
    private predicateThisArg: any
  ) {
    super(iterator.collection);
  }

  iterate(
    fn: (value: V, index: number, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var iterations = 0;
    var isSkipping = true;
    return this.iterator.iterate(function (v, k, c) {
      isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c);
      if (!isSkipping) {
        fn.call(thisArg, v, iterations++, c);
      }
    });
  }
}
