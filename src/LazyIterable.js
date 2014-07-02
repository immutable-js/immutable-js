class LazyIterable {
  // abstract iterate(fn)

  toArray() {
    var array = [];
    this.iterate(v => { array.push(v); });
    return array;
  }

  toObject() {
    var object = {};
    this.iterate((v, k) => { object[k] = v; });
    return object;
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    var vect = require('./Vector').empty().asTransient();
    this.iterate(v => { vect.push(v); });
    return vect.asPersistent();
  }

  toMap() {
    // Use Late Binding here to solve the circular dependency.
    return require('./Map').empty().merge(this);
  }

  toSet() {
    // Use Late Binding here to solve the circular dependency.
    return require('./Set').empty().merge(this);
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

  forEach(fn, thisArg) {
    this.iterate((v, k, c) => { fn.call(thisArg, v, k, c); });
  }

  find(fn, thisArg) {
    var foundValue;
    this.iterate((v, k, c) => {
      if (fn.call(thisArg, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  }

  findKey(fn, thisArg) {
    var foundKey;
    this.iterate((v, k, c) => {
      if (fn.call(thisArg, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  }

  reduce(fn, initialReduction, thisArg) {
    var reduction = initialReduction;
    this.iterate((v, k, c) => {
      reduction = fn.call(thisArg, reduction, v, k, c);
    });
    return reduction;
  }

  flip() {
    return new FlipIterator(this);
  }

  map(fn, thisArg) {
    return new MapIterator(this, fn, thisArg);
  }

  filter(fn, thisArg) {
    return new FilterIterator(this, fn, thisArg);
  }

  every(fn, thisArg) {
    var every = true;
    this.iterate((v, k, c) => {
      if (!fn.call(thisArg, v, k, c)) {
        every = false;
        return false;
      }
    });
    return every;
  }

  some(fn, thisArg) {
    var some = false;
    this.iterate((v, k, c) => {
      if (fn.call(thisArg, v, k, c)) {
        some = true;
        return false;
      }
    });
    return some;
  }
}

class FlipIterator extends LazyIterable {
  constructor(iterator) {
    this.iterator = iterator;
  }

  iterate(fn) {
    return this.iterator.iterate((v, k, c) => fn(k, v, c) !== false);
  }
}

class ValueIterator extends LazyIterable {
  constructor(iterator) {
    this.iterator = iterator;
  }

  iterate(fn) {
    var iterations = 0;
    return this.iterator.iterate((v, k, c) => fn(v, iterations++, c) !== false);
  }
}

class MapIterator extends LazyIterable {
  constructor(iterator, mapper, mapThisArg) {
    this.iterator = iterator;
    this.mapper = mapper;
    this.mapThisArg = mapThisArg;
  }

  iterate(fn) {
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.iterate((v, k, c) =>
      fn(map.call(mapThisArg, v, k, c), k, c) !== false
    );
  }
}

class FilterIterator extends LazyIterable {
  constructor(iterator, predicate, predicateThisArg) {
    this.iterator = iterator;
    this.predicate = predicate;
    this.predicateThisArg = predicateThisArg;
  }

  iterate(fn) {
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.iterate((v, k, c) =>
      !predicate.call(predicateThisArg, v, k, c) ||
      fn(v, k, c) !== false
    );
  }
}

module.exports = LazyIterable;
