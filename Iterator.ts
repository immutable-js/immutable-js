function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

class Iterator<K, V, C> {
  constructor(public collection: C) {}

  iterate(
    fn: (value: V, key: K, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    throw new Error('Abstract method');
  }

  toArray(): Array<V> {
    var array = [];
    var numericKeys: boolean;
    this.iterate(function (v, k) {
      if (numericKeys == null) {
        numericKeys = typeof k === 'number';
      }
      if (numericKeys) {
        array[<number><any>k] = v;
      } else {
        array.push(v);
      }
    });
    return array;
  }

  // TODO: toVector() and toMap()

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
  ): Iterator<K, V2, C> {
    return new MapIterator(this, fn, thisArg);
  }

  filter(
    fn: (value: V, key: K, collection: C) => boolean,
    thisArg?: any
  ): Iterator<K, V, C> {
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

  take(amount: number): Iterator<K, V, C> {
    var iterations = 0;
    return this.takeWhile(() => iterations++ < amount);
  }

  skip(amount: number): Iterator<K, V, C> {
    var iterations = 0;
    return this.skipWhile(() => iterations++ < amount);
  }

  takeWhile(
    fn: (value: V, key: K, collection: C) => boolean,
    thisArg?: any
  ): Iterator<K, V, C> {
    return new TakeIterator(this, fn, thisArg);
  }

  skipWhile(
    fn: (value: V, key: K, collection: C) => boolean,
    thisArg?: any
  ): Iterator<K, V, C> {
    return new SkipIterator(this, fn, thisArg);
  }
}

export = Iterator;

class MapIterator<K, V, V2, C> extends Iterator<K, V2, C> {
  constructor(
    private iterator: Iterator<K, V, C>,
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

class FilterIterator<K, V, C> extends Iterator<K, V, C> {
  constructor(
    private iterator: Iterator<K, V, C>,
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
    var numericKeys: boolean;
    var iterations = 0;
    return this.iterator.iterate(function (v, k, c) {
      if (predicate.call(predicateThisArg, v, k, c)) {
        if (numericKeys == null) {
          numericKeys = typeof k === 'number';
        }
        fn.call(thisArg, v, numericKeys ? iterations++ : k, c);
      }
    });
  }
}

class TakeIterator<K, V, C> extends Iterator<K, V, C> {
  constructor(
    private iterator: Iterator<K, V, C>,
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
      } else {
        return false;
      }
    });
  }
}

class SkipIterator<K, V, C> extends Iterator<K, V, C> {
  constructor(
    private iterator: Iterator<K, V, C>,
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
    var numericKeys: boolean;
    var iterations = 0;
    var isSkipping = true;
    return this.iterator.iterate(function (v, k, c) {
      isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c);
      if (!isSkipping) {
        if (numericKeys == null) {
          numericKeys = typeof k === 'number';
        }
        fn.call(thisArg, v, numericKeys ? iterations++ : k, c);
      }
    });
  }
}
