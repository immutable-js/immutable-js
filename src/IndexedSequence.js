var Sequence = require('./Sequence');

class IndexedSequence extends Sequence {

  toString() {
    return this.__toString('Seq [', ']', v =>
      typeof v === 'string' ? JSON.stringify(v) : v
    );
  }

  __toStringMapper(v) {
    return typeof v === 'string' ? JSON.stringify(v) : v;
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
    return new ReverseIterator(this, maintainIndices);
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

  lastIndexOf(searchValue) {
    return this.reverse(true).indexOf(searchValue);
  }

  findIndex(predicate, context) {
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
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

  // __iterate(fn, reverseIndices)

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

class ReverseIterator extends IndexedSequence {
  constructor(iterator, maintainIndices) {
    this.iterator = iterator;
    this.maintainIndices = maintainIndices;
  }

  reverse(maintainIndices) {
    if (maintainIndices === this.maintainIndices) {
      return this.iterator;
    }
    return super.reverse(maintainIndices);
  }

  __iterate(fn, reverseIndices) {
    return this.iterator.__reverseIterate(fn, reverseIndices !== this.maintainIndices);
  }

  __reverseIterate(fn, maintainIndices) {
    return this.iterator.__iterate(fn, maintainIndices !== this.maintainIndices);
  }
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

module.exports = IndexedSequence;
