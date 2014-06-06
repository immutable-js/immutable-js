class Iterator<K, V, C> {
  iterate(
    fn: (value: V, key: K, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    throw new Error('Abstract method');
  }

  forEach(
    fn: (value: V, key: K, collection: C) => any,
    thisArg?: any
  ): void {
    this.iterate(function(v, k, c) {
      fn.call(thisArg, v, k, c)
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
}

export = Iterator;

class MapIterator<K, V, V2, C> extends Iterator<K, V2, C> {
  constructor(
    private iterator: Iterator<K, V, C>,
    private mapper: (value: V, key: K, collection: C) => V2,
    private mapThisArg: any
  ) {
    super();
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
    super();
  }

  iterate(
    fn: (value: V, key: K, collection: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var test = this.predicate;
    var testThisArg = this.predicateThisArg;
    return this.iterator.iterate(function (v, k, c) {
      if (test.call(testThisArg, v, k, c)) {
        fn.call(thisArg, v, k, c);
      }
    });
  }
}
