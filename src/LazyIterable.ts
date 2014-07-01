///<reference path='./node.d.ts'/>
import Vector = require('./Vector'); // for Type info
import Map = require('./Map'); // for Type info
import Set = require('./Set'); // for Type info

class LazyIterable<K, V, C> {
  iterate(
    fn: (value?: V, key?: K, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    throw new Error('Abstract method');
  }

  toArray(): Array<V> {
    var array: Array<V> = [];
    this.iterate(function (v) {
      array.push(v);
    });
    return array;
  }

  toObject(): Object {
    var object: any /*{[key: string or number]: V}*/ = {};
    this.iterate(function (v, k) {
      object[k] = v;
    });
    return object;
  }

  toVector(): Vector<V> {
    // Use Late Binding here to solve the circular dependency.
    var vect: Vector<V> = require('./Vector').empty().asTransient();
    this.iterate(function (v) {
      vect.push(v);
    });
    return vect.asPersistent();
  }

  toMap(): Map<K, V> {
    // Use Late Binding here to solve the circular dependency.
    return require('./Map').empty().merge(this);
  }

  toSet(): Set<V> {
    // Use Late Binding here to solve the circular dependency.
    return require('./Set').empty().merge(this);
  }

  keys(): LazyIterable<number, K, C> {
    return this.map<K>((v, k) => k).values();
  }

  values(): LazyIterable<number, V, C> {
    return new ValueIterator(this);
  }

  entries(): LazyIterable<number, Array<any>, C> { // LazyIterable<number, <K,V>, C>
    return this.map<Array<any>>((v, k) => [k,v]).values();
  }

  forEach(
    fn: (value?: V, key?: K, collection?: C) => any,
    thisArg?: any
  ): void {
    this.iterate(function(v, k, c) {
      fn.call(thisArg, v, k, c);
    });
  }

  find(
    fn: (value?: V, key?: K, collection?: C) => boolean,
    thisArg?: any
  ): V {
    var foundValue: V;
    this.iterate(function (v, k, c) {
      if (fn.call(thisArg, v, k, c) === true) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  }

  findKey(
    fn: (value?: V, key?: K, collection?: C) => boolean,
    thisArg?: any
  ): K {
    var foundKey: K;
    this.iterate(function (v, k, c) {
      if (fn.call(thisArg, v, k, c) === true) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  }

  reduce<R>(
    fn: (prevReduction?: R, value?: V, key?: K, collection?: C) => R,
    initialReduction?: R,
    thisArg?: any
  ): R {
    var reduction = initialReduction;
    this.iterate(function (v, k, c) {
      reduction = fn.call(thisArg, reduction, v, k, c);
    });
    return reduction;
  }

  flip(): LazyIterable<V, K, C> {
    return new FlipIterator(this);
  }

  map<V2>(
    fn: (value?: V, key?: K, collection?: C) => V2,
    thisArg?: any
  ): LazyIterable<K, V2, C> {
    return new MapIterator(this, fn, thisArg);
  }

  filter(
    fn: (value?: V, key?: K, collection?: C) => boolean,
    thisArg?: any
  ): LazyIterable<K, V, C> {
    return new FilterIterator(this, fn, thisArg);
  }

  every(
    fn: (value?: V, key?: K, collection?: C) => boolean,
    thisArg?: any
  ): boolean {
    var every = true;
    this.iterate(function (v, k, c) {
      if (!fn.call(thisArg, v, k, c)) {
        every = false;
        return false;
      }
    });
    return every;
  }

  some(
    fn: (value?: V, key?: K, collection?: C) => boolean,
    thisArg?: any
  ): boolean {
    var some = false;
    this.iterate(function (v, k, c) {
      if (fn.call(thisArg, v, k, c)) {
        some = true;
        return false;
      }
    });
    return some;
  }
}

class FlipIterator<K, V, C> extends LazyIterable<V, K, C> {
  constructor(private iterator: LazyIterable<K, V, C>) {super();}

  iterate(
    fn: (value?: K, key?: V, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    return this.iterator.iterate(function (v, k, c) {
      if (fn.call(thisArg, k, v, c) === false) {
        return false;
      }
    });
  }
}

class ValueIterator<V, C> extends LazyIterable<number, V, C> {
  constructor(
    private iterator: LazyIterable<any, V, C>
  ) {super();}

  iterate(
    fn: (value?: V, index?: number, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var iterations = 0;
    return this.iterator.iterate(function (v, k, c) {
      if (fn.call(thisArg, v, iterations++, c) === false) {
        return false;
      }
    });
  }
}

class MapIterator<K, V, V2, C> extends LazyIterable<K, V2, C> {
  constructor(
    private iterator: LazyIterable<K, V, C>,
    private mapper: (value?: V, key?: K, collection?: C) => V2,
    private mapThisArg: any
  ) {super();}

  iterate(
    fn: (value?: V2, key?: K, collection?: C) => any, // false or undefined
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

class FilterIterator<K, V, C> extends LazyIterable<K, V, C> {
  constructor(
    private iterator: LazyIterable<K, V, C>,
    private predicate: (value?: V, key?: K, collection?: C) => boolean,
    private predicateThisArg: any
  ) {super();}

  iterate(
    fn: (value?: V, key?: K, collection?: C) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.iterate(function (v, k, c) {
      if (predicate.call(predicateThisArg, v, k, c) &&
          fn.call(thisArg, v, k, c) === false) {
        return false;
      }
    });
  }
}

export = LazyIterable;
