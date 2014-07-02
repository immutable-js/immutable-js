class LazySequence {
  // abstract __iterate(fn)

  constructor(obj) {
    require('./Persistent').lazy(obj);
  }

  __reverseIterate(fn) {
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.__iterate((v, k, c) => {
      collection || (collection = c);
      temp.push([k, v]);
    });
    for (var ii = temp.length - 1; ii >= 0; ii--) {
      var entry = temp[ii];
      if (fn(entry[1], entry[0], collection) === false) {
        return false;
      }
    }
    return true;
  }

  toArray() {
    var array = [];
    this.__iterate(v => { array.push(v); });
    return array;
  }

  toObject() {
    var object = {};
    this.__iterate((v, k) => { object[k] = v; });
    return object;
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    var vect = require('./Vector').empty().asTransient();
    this.__iterate(v => { vect.push(v); });
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

  reverse() {
    return new ReverseIterator(this);
  }

  keys() {
    return this.map((v, k) => k).values();
  }

  values() {
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    var valuesIterator = (fn, alterIndices) => {
      var iterations = 0;
      return iterator.__iterate(
        (v, k, c) => fn(v, iterations++, c) !== false,
        alterIndices
      );
    }
    // Late static binding, to avoid circular dependency issues.
    // values() always returns an Indexed sequence.
    var LazyIndexedSequence = require('./LazyIndexedSequence');
    return LazyIndexedSequence.prototype.__makeIterator.call(this, valuesIterator, valuesIterator);
  }

  entries() {
    return this.map((v, k) => [k, v]).values();
  }

  forEach(fn, context) {
    this.__iterate((v, k, c) => { fn.call(context, v, k, c); });
  }

  first(predicate, context) {
    var firstValue;
    (predicate ? this.filter(predicate, context) : this).take(1).forEach(v => { firstValue = v; });
    return firstValue;
  }

  last(predicate, context) {
    return this.reverse(true).first(predicate, context);
  }

  reduce(reducer, initialReduction, context) {
    var reduction = initialReduction;
    this.__iterate((v, k, c) => {
      reduction = reducer.call(context, reduction, v, k, c);
    });
    return reduction;
  }

  reduceRight(reducer, initialReduction, context) {
    return this.reverse(true).reduce(reducer, initialReduction, context);
  }

  every(predicate, context) {
    var every = true;
    this.__iterate((v, k, c) => {
      if (!predicate.call(context, v, k, c)) {
        every = false;
        return false;
      }
    });
    return every;
  }

  some(predicate, context) {
    // TODO: write a test
    return !this.every(not(predicate), context);
    // var some = false;
    // this.iterate((v, k, c) => {
    //   if (predicate.call(context, v, k, c)) {
    //     some = true;
    //     return false;
    //   }
    // });
    // return some;
  }

  find(predicate, context) {
    var foundValue;
    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  }

  findKey(predicate, context) {
    var foundKey;
    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  }

  findLast(predicate, context) {
    return this.reverse(true).find(predicate, context);
  }

  findLastKey(predicate, context) {
    return this.reverse(true).findKey(predicate, context);
  }

  flip() {
    var iterator = this;
    var flipIterator = (fn, alterIndices) => iterator.__iterate(
      (v, k, c) => fn(k, v, c) !== false,
      alterIndices
    );
    // TODO: can __makeIterator reduce boilerplate?
    return this.__makeIterator(flipIterator, flipIterator);
  }

  map(mapper, context) {
    var iterator = this;
    var mapIterator = (fn, alterIndices) => iterator.__iterate(
      (v, k, c) => fn(mapper.call(context, v, k, c), k, c) !== false,
      alterIndices
    );
    // TODO: can __makeIterator reduce boilerplate?
    return this.__makeIterator(mapIterator, mapIterator);
  }

  // remove "maintainIndicies"
  filter(predicate, context) {
    var iterator = this;
    var filterIterator = (fn, alterIndices) => iterator.__iterate(
      (v, k, c) => !predicate.call(context, v, k, c) || fn(v, k, c) !== false,
      alterIndices
    );
    return this.__makeIterator(filterIterator, filterIterator);
  }

  take(amount) {
    var iterations = 0;
    return this.takeWhile(() => iterations++ < amount);
  }

  takeWhile(predicate, context) {
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(
      (fn, reverseIndices) => iterator.__iterate(
        (v, k, c) => predicate.call(context, v, k, c) && fn(v, k, c) !== false,
        reverseIndices
      )
      // reverse(take(x)) and take(reverse(x)) are not commutative.
    );
  }

  takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  }

  skip(amount) {
    var iterations = 0;
    return this.skipWhile(() => iterations++ < amount, null);
  }

  skipWhile(predicate, context) {
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(
      (fn, reverseIndices) => {
        var isSkipping = true;
        return iterator.__iterate(
          (v, k, c) =>
            (isSkipping = isSkipping && predicate.call(context, v, k, c)) ||
            fn(v, k, c) !== false,
          reverseIndices
        );
      }
      // reverse(skip(x)) and skip(reverse(x)) are not commutative.
    );
  }

  skipUntil(predicate, context) {
    return this.skipWhile(not(predicate), context);
  }

  __makeIterator(iterate, reverseIterate) {
    var iterator = Object.create(LazySequence.prototype);
    iterator.__iterate = iterate;
    reverseIterate && (iterator.__reverseIterate = reverseIterate);
    return iterator;
  }
}

function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  }
}

class ReverseIterator extends LazySequence {
  constructor(iterator) {
    this.iterator = iterator;
  }

  __iterate(fn) {
    return this.iterator.__reverseIterate(fn);
  }

  __reverseIterate(fn) {
    return this.iterator.__iterate(fn);
  }

  reverse() {
    return this.iterator;
  }
}

module.exports = LazySequence;
