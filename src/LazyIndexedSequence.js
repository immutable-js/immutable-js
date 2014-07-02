var LazySequence = require('./LazySequence');

class LazyIndexedSequence extends LazySequence {
  toArray() {
    var array = [];
    this.__iterate((v, k) => { array[k] = v; });
    return array;
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  }

  reverse(maintainIndices) {
    return new ReverseIterator(this, maintainIndices);
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
    var seq = super.skip(amount);
    return maintainIndices ? seq : seq.values();
  }

  skipWhile(predicate, context, maintainIndices) {
    // TODO: I think we actually want to provide something new here where we just subtract from indicies for skip.
    var seq = super.skipWhile(predicate, context);
    return maintainIndices ? seq : seq.values();
  }

  skipUntil(predicate, context, maintainIndices) {
    var seq = super.skipUntil(predicate, context);
    return maintainIndices ? seq : seq.values();
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
    var newSequence = Object.create(LazyIndexedSequence.prototype);
    newSequence.__iterate = (fn, reverseIndices) =>
      sequence.__iterate(factory(fn), reverseIndices);
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = (fn, maintainIndices) =>
        sequence.__reverseIterate(factory(fn), maintainIndices);
    }
    return newSequence;
  }
}

class ReverseIterator extends LazyIndexedSequence {
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

module.exports = LazyIndexedSequence;
