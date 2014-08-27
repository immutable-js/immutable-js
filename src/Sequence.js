/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/* Sequence has implicit lazy dependencies */
import "TrieUtils"
import "invariant"
import "Symbol"
import "Hash"
/* global is, Map, OrderedMap, Vector, Set, arrCopy, NOT_SET, invariant,
          ITERATOR, hash, HASH_MAX_VAL */
/* exported Sequence, IndexedSequence, SequenceIterator, iteratorMapper */


class Sequence {

  constructor(value) {
    return Sequence.from(
      arguments.length === 1 ? value : Array.prototype.slice.call(arguments)
    );
  }

  static from(value) {
    if (value instanceof Sequence) {
      return value;
    }
    if (!Array.isArray(value)) {
      if (value && value.constructor === Object) {
        return new ObjectSequence(value);
      }
      value = [value];
    }
    return new ArraySequence(value);
  }

  toString() {
    return this.__toString('Seq {', '}');
  }

  __toString(head, tail) {
    if (this.length === 0) {
      return head + tail;
    }
    return head + ' ' + this.map(this.__toStringMapper).join(', ') + ' ' + tail;
  }

  __toStringMapper(v, k) {
    return k + ': ' + quoteString(v);
  }

  toJS() {
    return this.map(value => value instanceof Sequence ? value.toJS() : value).__toJS();
  }

  toArray() {
    assertNotInfinite(this.length);
    var array = new Array(this.length || 0);
    this.valueSeq().forEach((v, i) => { array[i] = v; });
    return array;
  }

  toObject() {
    assertNotInfinite(this.length);
    var object = {};
    this.forEach((v, k) => { object[k] = v; });
    return object;
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return Vector.from(this);
  }

  toMap() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return Map.from(this);
  }

  toOrderedMap() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return OrderedMap.from(this);
  }

  toSet() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return Set.from(this);
  }

  hashCode() {
    return this.__hash || (this.__hash =
      this.length === Infinity ? 0 : this.reduce(
        (h, v, k) => (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL, 0
    ));
  }

  equals(other) {
    if (this === other) {
      return true;
    }
    if (!(other instanceof Sequence)) {
      return false;
    }
    if (this.length != null && other.length != null) {
      if (this.length !== other.length) {
        return false;
      }
      if (this.length === 0 && other.length === 0) {
        return true;
      }
    }
    if (this.__hash != null && other.__hash != null &&
        this.__hash !== other.__hash) {
      return false;
    }
    return this.__deepEquals(other);
  }

  __deepEquals(other) {
    var entries = this.cacheResult().entrySeq().toArray();
    var iterations = 0;
    return other.every((v, k) => {
      var entry = entries[iterations++];
      return is(k, entry[0]) && is(v, entry[1]);
    });
  }

  join(separator) {
    separator = separator || ',';
    var string = '';
    var isFirst = true;
    this.forEach((v, k) => {
      if (isFirst) {
        isFirst = false;
        string += v;
      } else {
        string += separator + v;
      }
    });
    return string;
  }

  count(predicate, thisArg) {
    if (!predicate) {
      if (this.length == null) {
        this.length = this.forEach(returnTrue);
      }
      return this.length;
    }
    return this.filter(predicate, thisArg).count();
  }

  countBy(mapper, context) {
    var seq = this;
    return OrderedMap.empty().withMutations(map => {
      seq.forEach((value, key, collection) => {
        map.update(mapper(value, key, collection), increment);
      });
    });
  }

  concat(...values) {
    var sequences = [this].concat(values.map(value => Sequence(value)));
    var concatSequence = this.__makeSequence();
    concatSequence.length = sequences.reduce(
      (sum, seq) => sum != null && seq.length != null ? sum + seq.length : undefined, 0
    );
    concatSequence.__iterateUncached = (fn, reverse) => {
      var iterations = 0;
      var stoppedIteration;
      var lastIndex = sequences.length - 1;
      for (var ii = 0; ii <= lastIndex && !stoppedIteration; ii++) {
        var seq = sequences[reverse ? lastIndex - ii : ii];
        iterations += seq.__iterate((v, k, c) => {
          if (fn(v, k, c) === false) {
            stoppedIteration = true;
            return false;
          }
        }, reverse);
      }
      return iterations;
    };
    return concatSequence;
  }

  reverse() {
    var sequence = this;
    var reversedSequence = sequence.__makeSequence();
    reversedSequence.length = sequence.length;
    reversedSequence.__iterateUncached = (fn, reverse) => sequence.__iterate(fn, !reverse);
    reversedSequence.reverse = () => sequence;
    return reversedSequence;
  }

  keySeq() {
    return this.flip().valueSeq();
  }

  valueSeq() {
    // valueSeq() always returns an IndexedSequence.
    var sequence = this;
    var valuesSequence = makeIndexedSequence(sequence);
    valuesSequence.length = sequence.length;
    valuesSequence.valueSeq = returnThis;
    valuesSequence.__iterateUncached = function (fn, reverse, flipIndices) {
      if (flipIndices && this.length == null) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      var predicate;
      if (flipIndices) {
        iterations = this.length - 1;
        predicate = (v, k, c) => fn(v, iterations--, c) !== false;
      } else {
        predicate = (v, k, c) => fn(v, iterations++, c) !== false;
      }
      sequence.__iterate(predicate, reverse); // intentionally do not pass flipIndices
      return flipIndices ? this.length : iterations;
    }
    return valuesSequence;
  }

  entrySeq() {
    var sequence = this;
    if (sequence._cache) {
      // We cache as an entries array, so we can just return the cache!
      return Sequence(sequence._cache);
    }
    var entriesSequence = sequence.map(entryMapper).valueSeq();
    entriesSequence.fromEntries = () => sequence;
    return entriesSequence;
  }

  forEach(sideEffect, thisArg) {
    return this.__iterate(thisArg ? sideEffect.bind(thisArg) : sideEffect);
  }

  reduce(reducer, initialReduction, thisArg) {
    var reduction = initialReduction;
    this.forEach((v, k, c) => {
      reduction = reducer.call(thisArg, reduction, v, k, c);
    });
    return reduction;
  }

  reduceRight(reducer, initialReduction, thisArg) {
    return this.reverse(true).reduce(reducer, initialReduction, thisArg);
  }

  every(predicate, thisArg) {
    var returnValue = true;
    this.forEach((v, k, c) => {
      if (!predicate.call(thisArg, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  }

  some(predicate, thisArg) {
    return !this.every(not(predicate), thisArg);
  }

  first() {
    return this.find(returnTrue);
  }

  last() {
    return this.findLast(returnTrue);
  }

  rest() {
    return this.slice(1);
  }

  butLast() {
    return this.slice(0, -1);
  }

  has(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  }

  get(searchKey, notSetValue) {
    return this.find((_, key) => is(key, searchKey), null, notSetValue);
  }

  getIn(searchKeyPath, notSetValue) {
    if (!searchKeyPath || searchKeyPath.length === 0) {
      return this;
    }
    return getInDeepSequence(this, searchKeyPath, notSetValue, 0);
  }

  contains(searchValue) {
    return this.find(value => is(value, searchValue), null, NOT_SET) !== NOT_SET;
  }

  find(predicate, thisArg, notSetValue) {
    var foundValue = notSetValue;
    this.forEach((v, k, c) => {
      if (predicate.call(thisArg, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  }

  findKey(predicate, thisArg) {
    var foundKey;
    this.forEach((v, k, c) => {
      if (predicate.call(thisArg, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  }

  findLast(predicate, thisArg, notSetValue) {
    return this.reverse(true).find(predicate, thisArg, notSetValue);
  }

  findLastKey(predicate, thisArg) {
    return this.reverse(true).findKey(predicate, thisArg);
  }

  flip() {
    // flip() always returns a non-indexed Sequence.
    var sequence = this;
    var flipSequence = makeSequence();
    flipSequence.length = sequence.length;
    flipSequence.flip = () => sequence;
    flipSequence.__iterateUncached = (fn, reverse) =>
      sequence.__iterate((v, k, c) => fn(k, v, c) !== false, reverse);
    return flipSequence;
  }

  map(mapper, thisArg) {
    var sequence = this;
    var mappedSequence = sequence.__makeSequence();
    mappedSequence.length = sequence.length;
    mappedSequence.__iterateUncached = (fn, reverse) =>
      sequence.__iterate((v, k, c) => fn(mapper.call(thisArg, v, k, c), k, c) !== false, reverse);
    return mappedSequence;
  }

  mapKeys(mapper, thisArg) {
    var sequence = this;
    var mappedSequence = sequence.__makeSequence();
    mappedSequence.length = sequence.length;
    mappedSequence.__iterateUncached = (fn, reverse) =>
      sequence.__iterate((v, k, c) => fn(v, mapper.call(thisArg, k, v, c), c) !== false, reverse);
    return mappedSequence;
  }

  filter(predicate, thisArg) {
    return filterFactory(this, predicate, thisArg, true, false);
  }

  slice(begin, end) {
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.length);
    var resolvedEnd = resolveEnd(end, this.length);
    // begin or end will be NaN if they were provided as negative numbers and
    // this sequence's length is unknown. In that case, convert it to an
    // IndexedSequence by getting entrySeq() and convert back to a sequence with
    // fromEntrySeq(). IndexedSequence.slice will appropriately handle this case.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return this.entrySeq().slice(begin, end).fromEntrySeq();
    }
    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
    return resolvedEnd == null || resolvedEnd === this.length ?
      skipped : skipped.take(resolvedEnd - resolvedBegin);
  }

  take(amount) {
    var iterations = 0;
    var sequence = this.takeWhile(() => iterations++ < amount);
    sequence.length = this.length && Math.min(this.length, amount);
    return sequence;
  }

  takeLast(amount, maintainIndices) {
    return this.reverse(maintainIndices).take(amount).reverse(maintainIndices);
  }

  takeWhile(predicate, thisArg) {
    var sequence = this;
    var takeSequence = sequence.__makeSequence();
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      sequence.__iterate((v, k, c) => {
        if (predicate.call(thisArg, v, k, c) && fn(v, k, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }, reverse, flipIndices);
      return iterations;
    };
    return takeSequence;
  }

  takeUntil(predicate, thisArg, maintainIndices) {
    return this.takeWhile(not(predicate), thisArg, maintainIndices);
  }

  skip(amount, maintainIndices) {
    if (amount === 0) {
      return this;
    }
    var iterations = 0;
    var sequence = this.skipWhile(() => iterations++ < amount, null, maintainIndices);
    sequence.length = this.length && Math.max(0, this.length - amount);
    return sequence;
  }

  skipLast(amount, maintainIndices) {
    return this.reverse(maintainIndices).skip(amount).reverse(maintainIndices);
  }

  skipWhile(predicate, thisArg, maintainIndices) {
    var sequence = this;
    var skipSequence = sequence.__makeSequence();
    skipSequence.__iterateUncached = function (fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var isSkipping = true;
      var iterations = 0;
      sequence.__iterate((v, k, c) => {
        if (!(isSkipping && (isSkipping = predicate.call(thisArg, v, k, c)))) {
          if (fn(v, k, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      }, reverse, flipIndices);
      return iterations;
    };
    return skipSequence;
  }

  skipUntil(predicate, thisArg, maintainIndices) {
    return this.skipWhile(not(predicate), thisArg, maintainIndices);
  }

  groupBy(mapper, context) {
    var seq = this;
    var groups = OrderedMap.empty().withMutations(map => {
      seq.forEach((value, key, collection) => {
        var groupKey = mapper(value, key, collection);
        var group = map.get(groupKey, NOT_SET);
        if (group === NOT_SET) {
          group = [];
          map.set(groupKey, group);
        }
        group.push([key, value]);
      });
    })
    return groups.map(group => Sequence(group).fromEntrySeq());
  }

  sort(comparator, maintainIndices) {
    return this.sortBy(valueMapper, comparator, maintainIndices);
  }

  sortBy(mapper, comparator, maintainIndices) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return Sequence(this.entrySeq().entrySeq().toArray().sort(
      (indexedEntryA, indexedEntryB) =>
        comparator(
          mapper(indexedEntryA[1][1], indexedEntryA[1][0], seq),
          mapper(indexedEntryB[1][1], indexedEntryB[1][0], seq)
        ) || indexedEntryA[0] - indexedEntryB[0]
    )).fromEntrySeq().valueSeq().fromEntrySeq();
  }

  cacheResult() {
    if (!this._cache && this.__iterateUncached) {
      assertNotInfinite(this.length);
      this._cache = this.entrySeq().toArray();
      if (this.length == null) {
        this.length = this._cache.length;
      }
    }
    return this;
  }

  // abstract __iterateUncached(fn, reverse)

  __iterate(fn, reverse, flipIndices) {
    if (!this._cache) {
      return this.__iterateUncached(fn, reverse, flipIndices);
    }
    var maxIndex = this.length - 1;
    var cache = this._cache;
    var c = this;
    if (reverse) {
      for (var ii = cache.length - 1; ii >= 0; ii--) {
        var revEntry = cache[ii];
        if (fn(revEntry[1], flipIndices ? revEntry[0] : maxIndex - revEntry[0], c) === false) {
          break;
        }
      }
    } else {
      cache.every(flipIndices ?
        entry => fn(entry[1], maxIndex - entry[0], c) !== false :
        entry => fn(entry[1], entry[0], c) !== false
      );
    }
    return this.length;
  }

  __makeSequence() {
    return makeSequence();
  }
}

var SequencePrototype = Sequence.prototype
SequencePrototype.toJSON = SequencePrototype.toJS;
SequencePrototype.__toJS = SequencePrototype.toObject;
SequencePrototype.inspect =
SequencePrototype.toSource = function() { return this.toString(); };


class IndexedSequence extends Sequence {

  toString() {
    return this.__toString('Seq [', ']');
  }

  toArray() {
    assertNotInfinite(this.length);
    var array = new Array(this.length || 0);
    array.length = this.forEach((v, i) => { array[i] = v; });
    return array;
  }

  fromEntrySeq() {
    var sequence = this;
    var fromEntriesSequence = makeSequence();
    fromEntriesSequence.length = sequence.length;
    fromEntriesSequence.entrySeq = () => sequence;
    fromEntriesSequence.__iterateUncached = (fn, reverse, flipIndices) =>
      sequence.__iterate((entry, _, c) => fn(entry[1], entry[0], c), reverse, flipIndices);
    return fromEntriesSequence;
  }

  join(separator) {
    separator = separator || ',';
    var string = '';
    var prevIndex = 0;
    this.forEach((v, i) => {
      var numSeparators = i - prevIndex;
      prevIndex = i;
      string += (numSeparators === 1 ? separator : repeatString(separator, numSeparators)) + v;
    });
    if (this.length && prevIndex < this.length - 1) {
      string += repeatString(separator, this.length - 1 - prevIndex);
    }
    return string;
  }

  concat(...values) {
    var sequences = [this].concat(values).map(value => Sequence(value));
    var concatSequence = this.__makeSequence();
    concatSequence.length = sequences.reduce(
      (sum, seq) => sum != null && seq.length != null ? sum + seq.length : undefined, 0
    );
    concatSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (flipIndices && !this.length) {
        // In order to reverse indices, first we must create a cached
        // representation. This ensures we will have the correct total length
        // so index reversal works as expected.
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      var stoppedIteration;
      var maxIndex = flipIndices && this.length - 1;
      var maxSequencesIndex = sequences.length - 1;
      for (var ii = 0; ii <= maxSequencesIndex && !stoppedIteration; ii++) {
        var sequence = sequences[reverse ? maxSequencesIndex - ii : ii];
        if (!(sequence instanceof IndexedSequence)) {
          sequence = sequence.valueSeq();
        }
        iterations += sequence.__iterate((v, index, c) => {
          index += iterations;
          if (fn(v, flipIndices ? maxIndex - index : index, c) === false) {
            stoppedIteration = true;
            return false;
          }
        }, reverse); // intentionally do not pass flipIndices
      }
      return iterations;
    }
    return concatSequence;
  }

  reverse(maintainIndices) {
    var sequence = this;
    var reversedSequence = sequence.__makeSequence();
    reversedSequence.length = sequence.length;
    reversedSequence.__reversedIndices = !!(maintainIndices ^ sequence.__reversedIndices);
    reversedSequence.__iterateUncached = (fn, reverse, flipIndices) =>
      sequence.__iterate(fn, !reverse, flipIndices ^ maintainIndices);
    reversedSequence.reverse = function (_maintainIndices) {
      return maintainIndices === _maintainIndices ? sequence :
        IndexedSequencePrototype.reverse.call(this, _maintainIndices);
    }
    return reversedSequence;
  }

  // Overridden to supply undefined length because it's entirely
  // possible this is sparse.
  valueSeq() {
    var valuesSequence = super.valueSeq();
    valuesSequence.length = undefined;
    return valuesSequence;
  }

  filter(predicate, thisArg, maintainIndices) {
    var filterSequence = filterFactory(this, predicate, thisArg, maintainIndices, maintainIndices);
    if (maintainIndices) {
      filterSequence.length = this.length;
    }
    return filterSequence;
  }

  indexOf(searchValue) {
    return this.findIndex(value => is(value, searchValue));
  }

  lastIndexOf(searchValue) {
    return this.reverse(true).indexOf(searchValue);
  }

  findIndex(predicate, thisArg) {
    var key = this.findKey(predicate, thisArg);
    return key == null ? -1 : key;
  }

  findLastIndex(predicate, thisArg) {
    return this.reverse(true).findIndex(predicate, thisArg);
  }

  slice(begin, end, maintainIndices) {
    var sequence = this;
    if (wholeSlice(begin, end, sequence.length)) {
      return sequence;
    }
    var sliceSequence = sequence.__makeSequence();
    var resolvedBegin = resolveBegin(begin, sequence.length);
    var resolvedEnd = resolveEnd(end, sequence.length);
    sliceSequence.length = sequence.length && (maintainIndices ? sequence.length : resolvedEnd - resolvedBegin);
    sliceSequence.__reversedIndices = sequence.__reversedIndices;
    sliceSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: reverse should be possible here.
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var reversedIndices = this.__reversedIndices ^ flipIndices;
      if (resolvedBegin !== resolvedBegin ||
          resolvedEnd !== resolvedEnd ||
          (reversedIndices && sequence.length == null)) {
        var exactLength = sequence.count();
        resolvedBegin = resolveBegin(begin, exactLength);
        resolvedEnd = resolveEnd(end, exactLength);
      }
      var iiBegin = reversedIndices ? sequence.length - resolvedEnd : resolvedBegin;
      var iiEnd = reversedIndices ? sequence.length - resolvedBegin : resolvedEnd;
      var lengthIterated = sequence.__iterate((v, ii, c) =>
        reversedIndices ?
          (iiEnd != null && ii >= iiEnd) || (ii >= iiBegin) && fn(v, maintainIndices ? ii : ii - iiBegin, c) !== false :
          (ii < iiBegin) || (iiEnd == null || ii < iiEnd) && fn(v, maintainIndices ? ii : ii - iiBegin, c) !== false,
        reverse, flipIndices
      );
      return this.length != null ? this.length :
        maintainIndices ? lengthIterated : Math.max(0, lengthIterated - iiBegin);
    };
    return sliceSequence;
  }

  splice(index, removeNum /*, ...values*/) {
    var numArgs = arguments.length;
    removeNum = Math.max(removeNum | 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    index = resolveBegin(index, this.length);
    var spliced = this.slice(0, index);
    return numArgs === 1 ?
      spliced :
      spliced.concat(
        arrCopy(arguments, 2),
        this.slice(index + removeNum)
      );
  }

  // Overrides to get length correct.
  takeWhile(predicate, thisArg, maintainIndices) {
    var sequence = this;
    var takeSequence = sequence.__makeSequence();
    takeSequence.__iterateUncached = function (fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      // TODO: ensure didFinish is necessary here
      var didFinish = true;
      var length = sequence.__iterate((v, ii, c) => {
        if (predicate.call(thisArg, v, ii, c) && fn(v, ii, c) !== false) {
          iterations = ii;
        } else {
          didFinish = false;
          return false;
        }
      }, reverse, flipIndices);
      return maintainIndices ? takeSequence.length : didFinish ? length : iterations + 1;
    };
    if (maintainIndices) {
      takeSequence.length = this.length;
    }
    return takeSequence;
  }

  skipWhile(predicate, thisArg, maintainIndices) {
    var sequence = this;
    var skipWhileSequence = sequence.__makeSequence();
    if (maintainIndices) {
      skipWhileSequence.length = this.length;
    }
    skipWhileSequence.__iterateUncached = function (fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices)
      }
      var reversedIndices = sequence.__reversedIndices ^ flipIndices;
      var isSkipping = true;
      var indexOffset = 0;
      var length = sequence.__iterate((v, ii, c) => {
        if (isSkipping) {
          isSkipping = predicate.call(thisArg, v, ii, c);
          if (!isSkipping) {
            indexOffset = ii;
          }
        }
        return isSkipping || fn(v, flipIndices || maintainIndices ? ii : ii - indexOffset, c) !== false;
      }, reverse, flipIndices);
      return maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - indexOffset;
    };
    return skipWhileSequence;
  }

  groupBy(mapper, context, maintainIndices) {
    var seq = this;
    var groups = OrderedMap.empty().withMutations(map => {
      seq.forEach((value, index, collection) => {
        var groupKey = mapper(value, index, collection);
        var group = map.get(groupKey, NOT_SET);
        if (group === NOT_SET) {
          group = new Array(maintainIndices ? seq.length : 0);
          map.set(groupKey, group);
        }
        maintainIndices ? (group[index] = value) : group.push(value);
      });
    });
    return groups.map(group => Sequence(group));
  }

  sortBy(mapper, comparator, maintainIndices) {
    var sortedSeq = super.sortBy(mapper, comparator);
    if (!maintainIndices) {
      sortedSeq = sortedSeq.valueSeq();
    }
    sortedSeq.length = this.length;
    return sortedSeq;
  }

  // abstract __iterateUncached(fn, reverse, flipIndices)

  __makeSequence() {
    return makeIndexedSequence(this);
  }
}

var IndexedSequencePrototype = IndexedSequence.prototype;
IndexedSequencePrototype.__toJS = IndexedSequencePrototype.toArray;
IndexedSequencePrototype.__toStringMapper = quoteString;


class ObjectSequence extends Sequence {
  constructor(object) {
    var keys = Object.keys(object);
    this._object = object;
    this._keys = keys;
    this.length = keys.length;
  }

  toObject() {
    return this._object;
  }

  get(key, notSetValue) {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  }

  has(key) {
    return this._object.hasOwnProperty(key);
  }

  __iterate(fn, reverse) {
    var object = this._object;
    var keys = this._keys;
    var maxIndex = keys.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var iteration = reverse ? maxIndex - ii : ii;
      if (fn(object[keys[iteration]], keys[iteration], object) === false) {
        break;
      }
    }
    return ii;
  }
}


class ArraySequence extends IndexedSequence {
  constructor(array) {
    this._array = array;
    this.length = array.length;
  }

  toArray() {
    return this._array;
  }

  __iterate(fn, reverse, flipIndices) {
    var array = this._array;
    var maxIndex = array.length - 1;
    var lastIndex = -1;
    if (reverse) {
      for (var ii = maxIndex; ii >= 0; ii--) {
        if (array.hasOwnProperty(ii) &&
            fn(array[ii], flipIndices ? ii : maxIndex - ii, array) === false) {
          return lastIndex + 1;
        }
        lastIndex = ii;
      }
      return array.length;
    } else {
      var didFinish = array.every((value, index) => {
        if (fn(value, flipIndices ? maxIndex - index : index, array) === false) {
          return false;
        } else {
          lastIndex = index;
          return true;
        }
      });
      return didFinish ? array.length : lastIndex + 1;
    }
  }
}

ArraySequence.prototype.get = ObjectSequence.prototype.get;
ArraySequence.prototype.has = ObjectSequence.prototype.has;


class SequenceIterator {
  toString() {
    return '[Iterator]';
  }
}

var SequenceIteratorPrototype = SequenceIterator.prototype;
SequenceIteratorPrototype[ITERATOR] = returnThis;
SequenceIteratorPrototype.inspect =
SequenceIteratorPrototype.toSource = function () { return this.toString(); }


function makeSequence() {
  return Object.create(SequencePrototype);
}

function makeIndexedSequence(parent) {
  var newSequence = Object.create(IndexedSequencePrototype);
  newSequence.__reversedIndices = parent ? parent.__reversedIndices : false;
  return newSequence;
}

function getInDeepSequence(seq, keyPath, notSetValue, pathOffset) {
  var nested = seq.get ? seq.get(keyPath[pathOffset], NOT_SET) : NOT_SET;
  if (nested === NOT_SET) {
    return notSetValue;
  }
  if (++pathOffset === keyPath.length) {
    return nested;
  }
  return getInDeepSequence(nested, keyPath, notSetValue, pathOffset);
}

function wholeSlice(begin, end, length) {
  return (begin === 0 || (length != null && begin <= -length)) &&
    (end == null || (length != null && end >= length));
}

function resolveBegin(begin, length) {
  return resolveIndex(begin, length, 0);
}

function resolveEnd(end, length) {
  return resolveIndex(end, length, length);
}

function resolveIndex(index, length, defaultIndex) {
  return index == null ?
    defaultIndex :
    index < 0 ?
      Math.max(0, length + index) :
      length ?
        Math.min(length, index) :
        index;
}

function valueMapper(v) {
  return v;
}

function entryMapper(v, k) {
  return [k, v];
}

function returnTrue() {
  return true;
}

function returnThis() {
  return this;
}

function increment(value) {
  return (value || 0) + 1;
}

/**
 * Sequence.prototype.filter and IndexedSequence.prototype.filter are so close
 * in behavior that it makes sense to build a factory with the few differences
 * encoded as booleans.
 */
function filterFactory(sequence, predicate, thisArg, useKeys, maintainIndices) {
  var filterSequence = sequence.__makeSequence();
  filterSequence.__iterateUncached = (fn, reverse, flipIndices) => {
    var iterations = 0;
    var length = sequence.__iterate((v, k, c) => {
      if (predicate.call(thisArg, v, k, c)) {
        if (fn(v, useKeys ? k : iterations, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }
    }, reverse, flipIndices);
    return maintainIndices ? length : iterations;
  };
  return filterSequence;
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

function defaultComparator(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

function assertNotInfinite(length) {
  invariant(
    length !== Infinity,
    'Cannot perform this action with an infinite sequence.'
  );
}

function iteratorMapper(iter, fn) {
  var newIter = new SequenceIterator();
  newIter.next = () => {
    var step = iter.next();
    if (step.done) return step;
    step.value = fn(step.value);
    return step;
  };
  return newIter;
}
