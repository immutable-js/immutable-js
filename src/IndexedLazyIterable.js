var OrderedLazyIterable = require('./OrderedLazyIterable');

class IndexedLazyIterable extends OrderedLazyIterable {
  // adds reverseIndices
  // abstract iterate(fn, reverseIndices)

  // This adds maintainIndicies
  reverseIterate(fn, maintainIndices) {
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.iterate((v, i, c) => {
      collection || (collection = c);
      // TODO: note that this is why we're overriding (do we even need this?!)
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

  // This is an override.
  toArray() {
    var array = [];
    this.iterate((v, k) => { array[k] = v; });
    return array;
  }

  // This is an override.
  toVector() {
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  }

  // Overridden to add maintainIndices
  reverse(maintainIndices) {
    return new ReverseIterator(this, maintainIndices);
  }

  // This is an override that adds maintainIndicies to get similar behavior to Array.prototype.filter
  // TODO (and for the skips) how to ensure the return value is instanceof IndexedLazyIterable?
  filter(predicate, context, maintainIndices) {
    var seq = super.filter(predicate, context);
    return maintainIndices ? seq : seq.values();
  }

  // new method
  indexOf(searchValue) {
    return this.findIndex(value => value === searchValue);
  }

  // new method
  lastIndexOf(searchValue) {
    return this.reverse(true).indexOf(searchValue);
  }

  // new method
  findIndex(predicate, context) {
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
  }

  // new method
  findLastIndex(predicate, context) {
    return this.reverse(true).findIndex(predicate, context);
  }

  // This override adds maintainIndicies
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

  // Override ensures created sequences are Indexed.
  __makeIterator(iterate, reverseIterate) {
    var iterator = Object.create(IndexedLazyIterable.prototype);
    // TODO: this is a dupe of the superclass's implementation. Reduce.
    iterator.iterate = iterate;
    reverseIterate && (iterator.reverseIterate = reverseIterate);
    return iterator;
  }
}

class ReverseIterator extends IndexedLazyIterable {
  constructor(iterator, maintainIndices) {
    this.iterator = iterator;
    this.maintainIndices = maintainIndices;
  }

  iterate(fn, reverseIndices) {
    return this.iterator.reverseIterate(fn, reverseIndices !== this.maintainIndices);
  }

  reverseIterate(fn, maintainIndices) {
    return this.iterator.iterate(fn, maintainIndices !== this.maintainIndices);
  }

  reverse(maintainIndices) {
    if (maintainIndices === this.maintainIndices) {
      return this.iterator;
    }
    return super.reverse(maintainIndices);
  }
}

module.exports = IndexedLazyIterable;
