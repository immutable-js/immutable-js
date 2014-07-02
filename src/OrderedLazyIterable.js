var LazyIterable = require('./LazyIterable');

class OrderedLazyIterable extends LazyIterable {
  // abstract iterate(fn, thisArg, reverseIndices)

  reverseIterate(fn, thisArg, maintainIndices) {
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.iterate((v, i, c) => {
      collection || (collection = c);
      temp[i] = v;
    });
    for (var ii = temp.length - 1; ii >= 0; ii--) {
      if (temp.hasOwnProperty(ii) &&
          fn.call(thisArg, temp[ii], maintainIndices ? ii : temp.length - 1 - ii, collection) === false) {
        return false;
      }
    }
    return true;
  }

  toArray() {
    var array = [];
    this.iterate((v, k) => { array[k] = v; });
    return array;
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  }

  reverse(maintainIndices) {
    return new ReverseIterator(this, maintainIndices);
  }

  keys() {
    return this.map((v, k) => k).values();
  }

  values() {
    return new ValueIterator(this);
  }

  entries() {
    return this.map((v, k) => [k, v]).values();
  }

  first(fn, thisArg) {
    var firstValue;
    (fn ? this.filter(fn, thisArg) : this).take(1).forEach(v => { firstValue = v; });
    return firstValue;
  }

  last(fn, thisArg) {
    return this.reverse(true).first(fn, thisArg);
  }

  reduceRight(fn, initialReduction, thisArg) {
    return this.reverse(true).reduce(fn, initialReduction, thisArg);
  }

  map(fn, thisArg) {
    return new MapIterator(this, fn, thisArg);
  }

  filter(fn, thisArg, maintainIndices) {
    return new FilterIterator(this, fn, thisArg, maintainIndices);
  }

  indexOf(searchValue) {
    return this.findIndex(value => value === searchValue);
  }

  lastIndexOf(searchValue) {
    return this.findLastIndex(value => value === searchValue);
  }

  findIndex(fn, thisArg) {
    var key = this.findKey(fn, thisArg);
    return key == null ? -1 : key;
  }

  findLast(fn, thisArg) {
    return this.reverse(true).find(fn, thisArg);
  }

  findLastIndex(fn, thisArg) {
    return this.reverse(true).findIndex(fn, thisArg);
  }

  take(amount) {
    var iterations = 0;
    return this.takeWhile(() => iterations++ < amount);
  }

  takeWhile(fn, thisArg) {
    return new TakeIterator(this, fn, thisArg);
  }

  takeUntil(fn, thisArg) {
    return this.takeWhile(not(fn), thisArg);
  }

  skip(amount, maintainIndices) {
    var iterations = 0;
    return this.skipWhile(() => iterations++ < amount, null, maintainIndices);
  }

  skipWhile(fn, thisArg, maintainIndices) {
    return new SkipIterator(this, fn, thisArg, maintainIndices);
  }

  skipUntil(fn, thisArg, maintainIndices) {
    return this.skipWhile(not(fn), thisArg, maintainIndices);
  }
}

function not(fn) {
  return function() {
    return !fn.apply(this, arguments);
  }
}

class ReverseIterator extends OrderedLazyIterable {
  constructor(iterator, maintainIndices) {
    this.iterator = iterator;
    this.maintainIndices = maintainIndices;
  }

  iterate(fn, thisArg, reverseIndices) {
    return this.iterator.reverseIterate(fn, thisArg, reverseIndices !== this.maintainIndices);
  }

  reverseIterate(fn, thisArg, maintainIndices) {
    return this.iterator.iterate(fn, thisArg, maintainIndices !== this.maintainIndices);
  }

  reverse(maintainIndices) {
    if (maintainIndices === this.maintainIndices) {
      return this.iterator;
    }
    return super.reverse(maintainIndices);
  }
}

class ValueIterator extends OrderedLazyIterable {
  constructor(iterator) {
    this.iterator = iterator;
  }

  iterate(fn, thisArg, reverseIndices) {
    var iterations = 0;
    return this.iterator.iterate(
      (v, k, c) => fn.call(thisArg, v, iterations++, c) !== false,
      null,
      reverseIndices
    );
  }

  // This is equivalent to values(reverse(x)) and takes advantage of the fact that
  // these two functions are commutative.
  reverseIterate(fn, thisArg, maintainIndices) {
    var iterations = 0;
    return this.iterator.reverseIterate(
      (v, k, c) => fn.call(thisArg, v, iterations++, c) !== false,
      null,
      maintainIndices
    );
  }
}

class MapIterator extends OrderedLazyIterable {
  constructor(iterator, mapper, mapThisArg) {
    this.iterator = iterator;
    this.mapper = mapper;
    this.mapThisArg = mapThisArg;
  }

  iterate(fn, thisArg, reverseIndices) {
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.iterate(
      (v, k, c) => fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) !== false,
      null,
      reverseIndices
    );
  }

  // This is equivalent to map(reverse(x)) and takes advantage of the fact that
  // these two functions are commutative.
  reverseIterate(fn, thisArg, maintainIndices) {
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.reverseIterate(
      (v, k, c) => fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) !== false,
      null,
      maintainIndices
    );
  }
}

class FilterIterator extends OrderedLazyIterable {
  constructor(iterator, predicate, predicateThisArg, maintainIndices) {
    this.iterator = iterator;
    this.predicate = predicate;
    this.predicateThisArg = predicateThisArg;
    this.maintainIndices = maintainIndices;
  }

  iterate(fn, thisArg, reverseIndices) {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var filterMaintainIndices = this.maintainIndices;
    var iterations = 0;
    return this.iterator.iterate(
      (v, k, c) =>
        !predicate.call(predicateThisArg, v, k, c) ||
        fn.call(thisArg, v, filterMaintainIndices ? k : iterations++, c) !== false,
      null,
      reverseIndices
    );
  }

  // This is equivalent to filter(reverse(x)) and takes advantage of the fact that
  // these two functions are commutative.
  reverseIterate(fn, thisArg, maintainIndices) {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var filterMaintainIndices = this.maintainIndices;
    var iterations = 0;
    return this.iterator.reverseIterate(
      (v, k, c) =>
        !predicate.call(predicateThisArg, v, k, c) ||
        fn.call(thisArg, v, filterMaintainIndices ? k : iterations++, c) !== false,
      null,
      maintainIndices
    );
  }
}

class TakeIterator extends OrderedLazyIterable {
  constructor(iterator, predicate, predicateThisArg) {
    this.iterator = iterator;
    this.predicate = predicate;
    this.predicateThisArg = predicateThisArg;
  }

  iterate(fn, thisArg, reverseIndices) {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.iterate(
      (v, k, c) =>
        predicate.call(predicateThisArg, v, k, c) &&
        fn.call(thisArg, v, k, c) !== false,
      null,
      reverseIndices
    );
  }

  // Use default impl for reverseIterate because reverse(take(x)) and
  // take(reverse(x)) are not commutative.
}

class SkipIterator extends OrderedLazyIterable {
  constructor(iterator, predicate, predicateThisArg, maintainIndices) {
    this.iterator = iterator;
    this.predicate = predicate;
    this.predicateThisArg = predicateThisArg;
    this.maintainIndices = maintainIndices;
  }

  iterate(fn, thisArg, reverseIndices) {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var skipMaintainIndices = this.maintainIndices;
    var iterations = 0;
    var isSkipping = true;
    return this.iterator.iterate(
      (v, k, c) =>
        (isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c)) ||
        fn.call(thisArg, v, skipMaintainIndices ? k : iterations++, c) !== false,
      null,
      reverseIndices
    );
  }

  // Use default impl for reverseIterate because reverse(skip(x)) and
  // skip(reverse(x)) are not commutative.
}

module.exports = OrderedLazyIterable;
