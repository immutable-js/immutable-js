class Sequence {
  constructor(value) {
    if (value instanceof Sequence) {
      return value;
    }
    if (Array.isArray(value)) {
      return new ArraySequence(value);
    }
    if (typeof value === 'object') {
      return new ObjectSequence(value);
    }
    return new ArraySequence([value]);
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
    return quoteString(k) + ': ' + quoteString(v);
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
    this.__iterate(v => {
      vect = vect.push(v);
    });
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

  equals(other) {
    if (this === other) {
      return true;
    }
    if (!(other instanceof Object.getPrototypeOf(this).constructor) ||
        (this.length && other.length && this.length !== other.length)) {
      return false;
    }
    return this.__deepEquals(other);
  }

  __deepEquals(other) {
    var is = require('./Persistent').is;
    var otherEntries = other.entries().toArray();
    var iterations = 0;
    return this.every((v, k) => {
      var otherEntry = otherEntries[iterations++];
      return is(k, otherEntry[0]) && is(v, otherEntry[1]);
    });
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
    return new ReversedSequence(this);
  }

  keys() {
    return this.map(keyMapper).values();
  }

  values() {
    // values() always returns an Indexed sequence.
    return IndexedSequence.prototype.__makeSequence.call(this, true, valuesFactory);
  }

  entries() {
    return this.map(entryMapper).values();
  }

  forEach(sideEffect, context) {
    this.__iterate((v, k, c) => { sideEffect.call(context, v, k, c); });
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
    var returnValue = true;
    this.__iterate((v, k, c) => {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
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

  // __iterate(fn) is abstract

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
    var newSequence = Object.create(Sequence.prototype);
    newSequence.__iterate = (fn) => sequence.__iterate(factory(fn));
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = (fn) => sequence.__reverseIterate(factory(fn));
    }
    return newSequence;
  }
}


class ReversedSequence extends Sequence {
  constructor(iterator) {
    this._iterator = iterator;
  }

  reverse() {
    return this._iterator;
  }

  __iterate(fn) {
    return this._iterator.__reverseIterate(fn);
  }

  __reverseIterate(fn) {
    return this._iterator.__iterate(fn);
  }
}


class IndexedSequence extends Sequence {

  toString() {
    return this.__toString('Seq [', ']');
  }

  toArray() {
    var array = [];
    this.__iterate((v, k) => { array[k] = v; });
    if (this.length) {
      array.length = this.length;
    }
    return array;
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').transientWithSize(this.length).merge(this).asPersistent();
  }

  join(separator) {
    separator = separator || ',';
    var string = '';
    var prevIndex = 0;
    this.__iterate((v, i) => {
      var numSeparators = i - prevIndex;
      prevIndex = i;
      string += (numSeparators === 1 ? separator : repeatString(separator, numSeparators)) + v;
    });
    if (this.length && prevIndex < this.length - 1) {
      string += repeatString(separator, this.length - 1 - prevIndex);
    }
    return string;
  }

  reverse(maintainIndices) {
    return new ReversedIndexedSequence(this, maintainIndices);
  }

  map(mapper, context) {
    var seq = super.map(mapper, context);
    // Length is preserved when mapping.
    if (this.length) {
      seq.length = this.length;
    }
    return seq;
  }

  filter(predicate, context, maintainIndices) {
    var seq = super.filter(predicate, context);
    return maintainIndices ? seq : seq.values();
  }

  indexOf(searchValue) {
    return this.findIndex(value => value === searchValue);
  }

  findIndex(predicate, context) {
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
  }

  lastIndexOf(searchValue) {
    return this.reverse(true).indexOf(searchValue);
  }

  findLastIndex(predicate, context) {
    return this.reverse(true).findIndex(predicate, context);
  }

  skip(amount, maintainIndices) {
    var iterations = 0;
    return this.skipWhile(() => iterations++ < amount, null, maintainIndices);
  }

  skipWhile(predicate, context, maintainIndices) {
    return this.__makeSequence(false, fn => {
      var isSkipping = true;
      var indexOffset = 0;
      return (v, i, c) => {
        if (isSkipping) {
          isSkipping = predicate.call(context, v, i, c);
          if (!maintainIndices && !isSkipping) {
            indexOffset = i;
          }
        }
        return isSkipping || fn(v, i - indexOffset, c) !== false;
      };
    });
  }

  skipUntil(predicate, context, maintainIndices) {
    return this.skipWhile(not(predicate), context, maintainIndices);
  }

  // __iterate(fn, reverseIndices) is abstract

  /**
   * Note: the default implementation of this needs to make an intermediate
   * representation which may be inefficent or at worse infinite.
   * Subclasses should do better if possible.
   */
  __reverseIterate(fn, maintainIndices) {
    var temp = [];
    var collection;
    this.__iterate((v, i, c) => {
      collection || (collection = c);
      temp[i] = v;
    });
    var maxIndex = temp.length - 1;
    for (var ii = maxIndex; ii >= 0; ii--) {
      if (temp.hasOwnProperty(ii) &&
          fn(temp[ii], maintainIndices ? ii : maxIndex - ii, collection) === false) {
        return false;
      }
    }
    return true;
  }

  __makeSequence(withCommutativeReverse, factory) {
    var sequence = this;
    var newSequence = Object.create(IndexedSequence.prototype);
    newSequence.__iterate = (fn, reverseIndices) =>
      sequence.__iterate(factory(fn), reverseIndices);
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = (fn, maintainIndices) =>
        sequence.__reverseIterate(factory(fn), maintainIndices);
    }
    return newSequence;
  }
}

IndexedSequence.prototype.__toStringMapper = quoteString;


class ReversedIndexedSequence extends IndexedSequence {
  constructor(iterator, maintainIndices) {
    if (iterator.length) {
      this.length = iterator.length;
    }
    this._iterator = iterator;
    this._maintainIndices = maintainIndices;
  }

  reverse(maintainIndices) {
    if (maintainIndices === this._maintainIndices) {
      return this._iterator;
    }
    return super.reverse(maintainIndices);
  }

  __iterate(fn, reverseIndices) {
    return this._iterator.__reverseIterate(fn, reverseIndices !== this._maintainIndices);
  }

  __reverseIterate(fn, maintainIndices) {
    return this._iterator.__iterate(fn, maintainIndices !== this._maintainIndices);
  }
}


class ArraySequence extends IndexedSequence {
  constructor(array) {
    this.length = array.length;
    this._array = array;
  }

  __iterate(fn, reverseIndices) {
    var array = this._array;
    var maxIndex = array.length - 1;
    return this._array.every((value, index) =>
      fn(value, reverseIndices ? maxIndex - index : index, array) !== false
    );
  }

  __reverseIterate(fn, maintainIndices) {
    var array = this._array;
    var maxIndex = array.length - 1;
    for (var ii = maxIndex; ii >= 0; ii--) {
      if (array.hasOwnProperty(ii) &&
          fn(array[ii], maintainIndices ? ii : maxIndex - ii, array) === false) {
        return false;
      }
    }
    return true;
  }
}


class ObjectSequence extends Sequence {
  constructor(object) {
    this._object = object;
  }

  __iterate(fn) {
    var object = this._object;
    for (var key in object) {
      if (object.hasOwnProperty(key) && fn(object[key], key, object) === false) {
        return false;
      }
    }
    return true;
  }

  __reverseIterate(fn) {
    var object = this._object;
    var keys = Object.keys(object);
    for (var ii = keys.length - 1; ii >= 0; ii--) {
      if (fn(object[keys[ii]], keys[ii], object) === false) {
        return false;
      }
    }
    return true;
  }
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

function quoteString(value) {
  return typeof value === 'string' ? JSON.stringify(value) : value;
}

function repeatString(string, times) {
  var repeated = '';
  while (times) {
    if (times & 1) {
      repeated += string;
    }
    if ((times >>= 1)) {
      string += string;
    }
  }
  return repeated;
}


exports.Sequence = Sequence;
exports.IndexedSequence = IndexedSequence;
