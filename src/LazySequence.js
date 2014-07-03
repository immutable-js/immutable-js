class LazySequence {
  constructor(value) {
    if (value instanceof LazySequence) {
      return value;
    }
    if (Array.isArray(value)) {
      // Use Late Binding here to solve the circular dependency.
      var LazyArraySequence = require('./LazyArraySequence');
      return new LazyArraySequence(value);
    }
    if (typeof value === 'object') {
      // Use Late Binding here to solve the circular dependency.
      var LazyObjectSequence = require('./LazyObjectSequence');
      return new LazyObjectSequence(value);
    }
    return null;
  }

  toString() {
    return this.__toString('Seq {', '}');
  }

  inspect() {
    return '' + this;
  }

  __toString(head, tail) {
    if (this.length === 0) {
      return head + tail;
    }
    return head + ' ' + this.map(this.__toStringMapper).join(', ') + ' ' + tail;
  }

  __toStringMapper(v, k) {
    return (typeof k === 'string' ? JSON.stringify(k) : k) + ': ' +
      (typeof v === 'string' ? JSON.stringify(v) : v);
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

  join(separator) {
    separator = separator || ',';
    var string = '';
    var isFirst = true;
    this.__iterate((v, k) => {
      if (isFirst) {
        isFirst = false;
        string += v;
      } else {
        string += separator + v;
      }
    });
    return string;
  }

  reverse() {
    return new ReverseIterator(this);
  }

  keys() {
    return this.map(keyMapper).values();
  }

  values() {
    // values() always returns an Indexed sequence.
    // Late static binding, to avoid circular dependency issues.
    return require('./LazyIndexedSequence').prototype.__makeSequence.call(this, true, valuesFactory);
  }

  entries() {
    return this.map(entryMapper).values();
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
    return !this.every(not(predicate), context);
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
    return this.__makeSequence(true, flipFactory);
  }

  map(mapper, context) {
    return this.__makeSequence(true, fn => (v, k, c) =>
      fn(mapper.call(context, v, k, c), k, c) !== false
    );
  }

  filter(predicate, context) {
    return this.__makeSequence(true, fn => (v, k, c) =>
      !predicate.call(context, v, k, c) || fn(v, k, c) !== false
    );
  }

  take(amount) {
    var iterations = 0;
    return this.takeWhile(() => iterations++ < amount);
  }

  takeWhile(predicate, context) {
    return this.__makeSequence(false, fn => (v, k, c) =>
      predicate.call(context, v, k, c) && fn(v, k, c) !== false
    );
  }

  takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  }

  skip(amount) {
    var iterations = 0;
    return this.skipWhile(() => iterations++ < amount);
  }

  skipWhile(predicate, context) {
    return this.__makeSequence(false, fn => {
      var isSkipping = true;
      return (v, k, c) =>
        (isSkipping = isSkipping && predicate.call(context, v, k, c)) ||
        fn(v, k, c) !== false
    });
  }

  skipUntil(predicate, context) {
    return this.skipWhile(not(predicate), context);
  }

  // __iterate(fn)

  /**
   * Note: the default implementation of this needs to make an intermediate
   * representation which may be inefficent or at worse infinite.
   * Subclasses should do better if possible.
   */
  __reverseIterate(fn) {
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

  __makeSequence(withCommutativeReverse, factory) {
    var sequence = this;
    var newSequence = Object.create(LazySequence.prototype);
    newSequence.__iterate = (fn) => sequence.__iterate(factory(fn));
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = (fn) => sequence.__reverseIterate(factory(fn));
    }
    return newSequence;
  }
}

class ReverseIterator extends LazySequence {
  constructor(iterator) {
    this.iterator = iterator;
  }

  reverse() {
    return this.iterator;
  }

  __iterate(fn) {
    return this.iterator.__reverseIterate(fn);
  }

  __reverseIterate(fn) {
    return this.iterator.__iterate(fn);
  }
}

function id(fn) {
  return fn;
}

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
}

function valuesFactory(fn) {
  var iterations = 0;
  return (v, k, c) => fn(v, iterations++, c) !== false;
}

function flipFactory(fn) {
  return (v, k, c) => fn(k, v, c) !== false;
}

function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  }
}

module.exports = LazySequence;
