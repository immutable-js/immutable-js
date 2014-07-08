class Sequence {
  constructor(value) {
    if (arguments.length === 1) {
      if (value instanceof Sequence) {
        return value;
      }
      if (Array.isArray(value)) {
        return new ArraySequence(value);
      }
      if (typeof value === 'object') {
        return new ObjectSequence(value);
      }
    }
    return new ArraySequence(Array.prototype.slice.call(arguments), true);
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

  isTransient() {
    return this.__parentSequence.isTransient();
  }

  asPersistent() {
    // This works because asPersistent() is mutative.
    this.__parentSequence.asPersistent();
    return this;
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
    if (this.length != null && other.length != null && this.length !== other.length) {
      return false;
    }
    // if either side is transient, and they are not from the same parent
    // sequence, then they must not be equal.
    if (((!this.isTransient || this.isTransient()) ||
         (!other.isTransient || other.isTransient())) &&
        (this.__parentSequence || this) !== (other.__parentSequence || other)) {
      return false;
    }
    return this.__deepEquals(other);
  }

  __deepEquals(other) {
    var is = require('./Persistent').is;
    var entries = this.entries().toArray();
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

  concat(...values) {
    var sequences = [this].concat(values).map(value => Sequence(value));
    var concatSequence = this.__makeUberSequence((sequence, fn, reverse) => {
      var shouldBreak;
      var iterations = 0;
      var lastIndex = sequences.length - 1;
      for (var ii = 0; ii <= lastIndex; ii++) {
        var seq = sequences[reverse ? lastIndex - ii : ii];
        iterations += seq.__iterate((v, k, c) => {
          if (fn(v, k, c) === false) {
            shouldBreak = true;
            return false;
          }
        }, reverse);
        if (shouldBreak) {
          break;
        }
      }
      return iterations;
    });
    concatSequence.length = sequences.reduce(
      (sum, seq) => sum != null && seq.length != null ? sum + seq.length : undefined, 0
    );
    return concatSequence;
  }

  reverse(maintainIndices) {
    var reversedSequence = this.__makeUberSequence(
      (sequence, fn, reverse) => sequence.__iterate(fn, !reverse)
    );
    reversedSequence.length = this.length;
    reversedSequence.reverse = () => this;
    return reversedSequence;
  }

  keys() {
    return this.map(keyMapper).values();
  }

  values() {
    return new ValuesSequence(this, this.length);
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

  get(searchKey, notFoundValue) {
    return this.findKey((_, key) => key === searchKey, null, notFoundValue);
  }

  find(predicate, context, notFoundValue) {
    var foundValue = notFoundValue;
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

  findLast(predicate, context, notFoundValue) {
    return this.reverse(true).find(predicate, context, notFoundValue);
  }

  findLastKey(predicate, context) {
    return this.reverse(true).findKey(predicate, context);
  }

  flip() {
    // flip() always returns a regular Sequence, even in subclasses.
    var flippedSequence = Sequence.prototype.__makeSequence.call(this, flipFactory);
    flippedSequence.length = this.length;
    flippedSequence.flip = () => this;
    return flippedSequence;
  }

  map(mapper, context) {
    var mappedSequence = this.__makeSequence(
      fn => (v, k, c) => fn(mapper.call(context, v, k, c), k, c) !== false
    );
    mappedSequence.length = this.length;
    return mappedSequence;
  }

  filter(predicate, context) {
    return this.__makeUberSequence((sequence, fn, reverse) => {
      var iterations = 0;
      sequence.__iterate((v, k, c) => {
        if (predicate.call(context, v, k, c)) {
          if (fn(v, k, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      }, reverse);
      return iterations;
    });
  }

  slice(start, end) {
    start = resolveStart(start, this.length);
    end = resolveEnd(end, this.length);
    // start or end will be NaN if they were provided as negative numbers and
    // this sequence's length is unknown. In that case, convert it to an
    // IndexedSequence by getting entries() and convert back to a sequence with
    // fromEntries(). IndexedSequence.prototype.slice will appropriately handle
    // this case.
    if (isNaN(start) || isNaN(end)) {
      return this.entries().slice(start, end).fromEntries();
    }
    return this.skip(start).take(end - start);
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

  takeWhile(predicate, context, maintainIndices) {
    var sequence = this;
    var takeSequence = this.__makeRawSequence('takeWhile');
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      sequence.__iterate((v, k, c) => {
        if (predicate.call(context, v, k, c) && fn(v, k, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }, reverse, flipIndices);
      return iterations;
    };
    return takeSequence;
  }

  takeUntil(predicate, context, maintainIndices) {
    return this.takeWhile(not(predicate), context, maintainIndices);
  }

  skip(amount, maintainIndices) {
    var iterations = 0;
    var sequence = this.skipWhile(() => iterations++ < amount, null, maintainIndices);
    sequence.length = this.length && Math.max(0, this.length - amount);
    return sequence;
  }

  skipLast(amount, maintainIndices) {
    return this.reverse(maintainIndices).skip(amount).reverse(maintainIndices);
  }

  skipWhile(predicate, context, maintainIndices) {
    var sequence = this;
    var skipSequence = this.__makeRawSequence('skipWhile');
    skipSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var isSkipping = true;
      var iterations = 0;
      sequence.__iterate((v, k, c) => {
        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
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

  skipUntil(predicate, context, maintainIndices) {
    return this.skipWhile(not(predicate), context, maintainIndices);
  }

  cacheResult() {
    if (!this._cache) {
      var cache = [];
      var collection;
      var length = this.__iterate((v, k, c) => {
        collection || (collection = c);
        cache.push([k, v]);
      });
      if (this.length == null) {
        this.length = length;
      }
      this._collection = collection;
      this._cache = cache;
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
    var c = this._collection;
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

  __makeRawSequence() {
    var newSequence = Object.create(Sequence.prototype);
    newSequence.__parentSequence = this._parentSequence || this;
    return newSequence;
  }

  __makeUberSequence(factory) {
    var sequence = this;
    var newSequence = this.__makeRawSequence();
    newSequence.__iterateUncached = (fn, reverse) => factory(sequence, fn, reverse);
    return newSequence;
  }

  __makeSequence(factory) {
    var sequence = this;
    var newSequence = this.__makeRawSequence();
    newSequence.__iterateUncached = (fn, reverse) => sequence.__iterate(factory(fn), reverse);
    return newSequence;
  }
}

Sequence.prototype.toJS = Sequence.prototype.toObject;


// class ConcatSequence extends Sequence {
//   constructor(sequence, values) {
//     this.__parentSequence = sequence._parentSequence || sequence;
//     this._sequences = [sequence].concat(values);
//   }

//   __iterate(fn) {
//     var shouldBreak;
//     var iterations = 0;
//     for (var ii = 0; ii < this._sequences.length; ii++) {
//       iterations += Sequence(this._sequences[ii]).__iterate((v, k, c) => {
//         if (fn(v, k, c) === false) {
//           shouldBreak = true;
//           return false;
//         }
//       });
//       if (shouldBreak) {
//         break;
//       }
//     }
//     return iterations;
//   }

//   __reverseIterate(fn) {
//     var shouldBreak;
//     var iterations = 0;
//     for (var ii = this._sequences.length - 1; ii >= 0; ii--) {
//       iterations += Sequence(this._sequences[ii]).__reverseIterate((v, k, c) => {
//         if (fn(v, k, c) === false) {
//           shouldBreak = true;
//           return false;
//         }
//       });
//       if (shouldBreak) {
//         break;
//       }
//     }
//     return iterations;
//   }
// }


// class ReversedSequence extends Sequence {
//   constructor(sequence) {
//     this.__parentSequence = sequence._parentSequence || sequence;
//     this._sequence = sequence;
//   }

//   reverse() {
//     return this._sequence;
//   }

//   __iterate(fn) {
//     return this._sequence.__reverseIterate(fn);
//   }

//   __reverseIterate(fn) {
//     return this._sequence.__iterate(fn);
//   }
// }


class IndexedSequence extends Sequence {

  toString() {
    return this.__toString('Seq [', ']');
  }

  toArray() {
    var array = [];
    array.length = this.__iterate((v, i) => { array[i] = v; });
    return array;
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    var vect = require('./Vector').empty().asTransient();
    var length = this.__iterate((v, i) => { vect = vect.set(i, v); });
    return vect.setLength(length).asPersistent();
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

  concat(...values) {
    return new ConcatIndexedSequence(this, values);
  }

  reverse(maintainIndices) {
    // This should work right? It doesnt...
    // var reversedSequence = this.__makeUberSequence(true, (sequence, fn, reverse, alterIndices) => {
    //   var iterate = reverse ? sequence.__iterate : sequence.__reverseIterate;
    //   return iterate.call(sequence, fn, alterIndices !== maintainIndices);
    // });
    // reversedSequence.length = this.length;
    // var sequence = this;
    // reversedSequence.reverse = (maintainReversedIndices) => {
    //   if (maintainReversedIndices === maintainIndices) {
    //     return sequence;
    //   }
    //   return IndexedSequence.prototype.reverse.call(this, maintainReversedIndices);
    // };
    // return reversedSequence;

    return new ReversedIndexedSequence(this, maintainIndices);
  }

  fromEntries() {
    var sequence = this.__makeSequence(
      fn => (e, _, c) => fn(e[1], e[0], c) !== false
    );
    sequence.length = this.length;
    return sequence;
  }

  // Overridden to supply undefined length
  values() {
    return new ValuesSequence(this);
  }

  filter(predicate, context, maintainIndices) {
    //var seq = super.filter(predicate, context);
    // TODO: override to get correct length.
    //return maintainIndices ? seq : seq.values();


    var seq = this.__makeUberSequence((sequence, fn, reverse, flipIndices) => {
      var iterations = 0;
      var length = sequence.__iterate((v, ii, c) => {
        if (predicate.call(context, v, ii, c)) {
          if (fn(v, maintainIndices ? ii : iterations, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      }, reverse, flipIndices);
      return maintainIndices ? length : iterations;
    });
    if (maintainIndices) {
      seq.length = this.length;
    }
    return seq;
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

  slice(start, end, maintainIndices) {
    return new SliceIndexedSequence(this, start, end, maintainIndices);
  }

  //take(amount) {
  //  var seq = this.takeWhile((v, ii) => ii < amount);
  //  seq.length = this.length && Math.max(this.length, amount);
  //  return seq;
  //}

  // Overrides to get length correct.
  takeWhile(predicate, context, maintainIndices) {
    var sequence = this;
    var takeSequence = this.__makeRawSequence('takeWhile');
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      // TODO: ensure didFinish is necessary here
      var didFinish = true;
      var length = sequence.__iterate((v, ii, c) => {
        if (predicate.call(context, v, ii, c) && fn(v, ii, c) !== false) {
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

    // return this.__makeUberSequence(false, (sequence, fn, reverse, alterIndices) => {
    //   var iterations = 0;
    //   var didFinish = true;
    //   var iterate = (reverse ? sequence.__reverseIterate : sequence.__iterate);
    //   var length = iterate.call(sequence, (v, ii, c) => {
    //     if (predicate.call(context, v, ii, c) && fn(v, ii, c) !== false) {
    //       iterations = ii;
    //     } else {
    //       didFinish = false;
    //       return false;
    //     }
    //   }, alterIndices);
    //   return didFinish ? length : iterations + 1;
    // });
  }

  //skipLast(amount, maintainIndices) {
  //  return this.reverse().skip(amount, maintainIndices).reverse();
  //}

  //skip(amount, maintainIndices) {
  //  var iterations = 0;
  //  return this.skipWhile(() => iterations++ < amount, maintainIndices);
  //  /*
//
  //  TODO: when both reverseIndices and sequence.__reverseIndices are true, then
  //  this is actually a "skipLast" which we haven't implementated yet and
  //  therefore does the wrong thing. We might emulate it with a takeUntil.
//
  //  We can probably do something similar with a "filter" based implementation. But
  //  I'm not sure if this will work or not if maintainIndices is false.
//
  //  */
  //  //var maxLength = this.length;
  //  //var newSequence = this.__makeRawSequence('skip');
  //  //var sequence = this;
  //  //newSequence.__iterate = (fn, reverseIndices) => {
  //  //  var reversedIndices = newSequence.__reversedIndices ^ reverseIndices;
  //  //  var predicate;
  //  //  if (reversedIndices) {
  //  //    if (maxLength == null) {
  //  //      var iterations = amount;
  //  //      predicate = (v, ii) => iterations-- > 0;
  //  //    } else {
  //  //      predicate = (v, ii) => ii >= maxLength - amount;
  //  //    }
  //  //  } else {
  //  //    predicate = (v, ii) => ii < amount;
  //  //  }
  //  //  var isSkipping = true;
  //  //  var indexOffset = 0;
  //  //  var length = sequence.__iterate((v, ii, c) => {
  //  //    if (isSkipping) {
  //  //      isSkipping = predicate(v, ii, c);
  //  //      if (isSkipping && !(isSkipping = predicate(v, ii, c))) {
  //  //       indexOffset = ii;
  //  //      }
  //  //    }
  //  //    return isSkipping || fn(v, reverseIndices || maintainIndices ? ii : ii - amount, c) !== false;
  //  //  }, reverseIndices);
  //  //  return newSequence.length || (maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - amount);
  //  //};
  //  //newSequence.length = maintainIndices ? maxLength : maxLength && maxLength - amount;
  //  //return newSequence;
  //}

  skipWhile(predicate, context, maintainIndices) {
    var newSequence = this.__makeRawSequence('skipWhile');
    var sequence = this;
    newSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices)
      }
      var reversedIndices = sequence.__reversedIndices ^ flipIndices;
      var isSkipping = true;
      var indexOffset = 0;
      var length = sequence.__iterate((v, ii, c) => {
        if (isSkipping) {
          isSkipping = predicate.call(context, v, ii, c);
          if (!isSkipping) {
            indexOffset = ii;
          }
        }
        return isSkipping || fn(v, flipIndices || maintainIndices ? ii : ii - indexOffset, c) !== false;
      }, reverse, flipIndices);
      return maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - indexOffset;
    };
    if (maintainIndices) {
      newSequence.length = this.length;
    }
    return newSequence;
  }

  //skipUntil(predicate, context, maintainIndices) {
  //  return this.skipWhile(not(predicate), context, maintainIndices);
  //}

  // abstract __iterate(fn, reverse, flipIndices)

  __makeRawSequence() {
    var newSequence = Object.create(IndexedSequence.prototype);
    newSequence.__reversedIndices = !!this.__reversedIndices;
    newSequence.__parentSequence = this._parentSequence || this;
    return newSequence;
  }

  __makeUberSequence(factory) {
    var sequence = this;
    var newSequence = this.__makeRawSequence();
    newSequence.__iterateUncached = (fn, reverse, flipIndices) => factory(sequence, fn, reverse, flipIndices);
    return newSequence;
  }

  __makeSequence(factory) {
    var sequence = this;
    var newSequence = this.__makeRawSequence();
    newSequence.__iterateUncached = (fn, reverse, flipIndices) => sequence.__iterate(factory(fn), reverse, flipIndices);
    return newSequence;
  }
}

IndexedSequence.prototype.toJS = IndexedSequence.prototype.toArray;

IndexedSequence.prototype.__toStringMapper = quoteString;


/**
 * ValuesSequence re-indexes a sequence based on the iteration of values.
 */
class ValuesSequence extends IndexedSequence {
  constructor(sequence, length) {
    this.__parentSequence = sequence._parentSequence || sequence;
    this._sequence = sequence;
    this.length = length;
  }

  __iterateUncached(fn, reverse, flipIndices) {
    if (flipIndices && this.length == null) {
      this.cacheResult();
    }
    var iterations = 0;
    var predicate;
    if (flipIndices) {
      var maxIndex = this.length - 1;
      predicate = (v, k, c) => fn(v, maxIndex - iterations++, c) !== false;
    } else {
      predicate = (v, k, c) => fn(v, iterations++, c) !== false;
    }
    this._sequence.__iterate(predicate, reverse); // intentionally do not pass flipIndices
    return iterations;
  }
}



class SliceIndexedSequence extends IndexedSequence {
  constructor(sequence, start, end, maintainIndices) {
    this.__parentSequence = sequence._parentSequence || sequence;
    this.__reversedIndices = sequence.__reversedIndices;
    this._sequence = sequence;
    this._start = start;
    this._end = end;
    this._maintainIndices = maintainIndices;
    this.length = sequence.length && (maintainIndices ? sequence.length : resolveEnd(end, sequence.length) - resolveStart(start, sequence.length));
  }

  __iterateUncached(fn, reverse, flipIndices) {
    if (reverse) {
      // TODO: reverse should be possible here.
      return this.cacheResult().__iterate(fn, reverse, flipIndices);
    }
    var reversedIndices = this.__reversedIndices ^ flipIndices;
    var sequence = this._sequence;
    if ((start < 0 || end < 0 || reversedIndices) && sequence.length == null) {
      sequence.cacheResult();
    }
    var start = resolveStart(this._start, sequence.length);
    var end = resolveEnd(this._end, sequence.length);
    var maintainIndices = this._maintainIndices;
    if (reversedIndices) {
      var newStart = sequence.length - end;
      end = sequence.length - start;
      start = newStart;
    }
    var length = sequence.__iterate((v, ii, c) =>
      !(ii >= start && ii < end) || fn(v, maintainIndices ? ii : ii - start, c) !== false,
      reverse, flipIndices
    );
    return this.length || (maintainIndices ? length : Math.max(0, length - start));
  }
}


class ConcatIndexedSequence extends IndexedSequence {
  constructor(sequence, values) {
    this._sequences = [sequence].concat(values).map(value => Sequence(value));
    this.length = this._sequences.reduce(
      (sum, seq) => sum != null && seq.length != null ? sum + seq.length : undefined, 0
    );
    this._immutable = this._sequences.every(seq => !seq.isTransient());
  }

  isTransient() {
    return !this._immutable;
  }

  asPersistent() {
    this._sequences.map(seq => seq.asPersistent());
    return this;
  }

  __iterateUncached(fn, reverse, flipIndices) {
    if (flipIndices && !this.length) {
      // In order to reverse indices, first we must create a cached
      // representation. This ensures we will have the correct total length
      // so index reversal works as expected.
      this.cacheResult();
    }
    var shouldBreak;
    var iterations = 0;
    var maxIndex = flipIndices && this.length - 1;
    var maxSequencesIndex = this._sequences.length - 1;
    for (var ii = 0; ii <= maxSequencesIndex; ii++) {
      var sequence = this._sequences[reverse ? maxSequencesIndex - ii : ii];
      if (!(sequence instanceof IndexedSequence)) {
        sequence = sequence.values();
      }
      iterations += sequence.__iterate((v, index, c) => {
        index += iterations;
        if (fn(v, flipIndices ? maxIndex - index : index, c) === false) {
          shouldBreak = true;
          return false;
        }
      }, reverse); // intentionally do not pass flipIndices
      if (shouldBreak) {
        break;
      }
    }
    return iterations;
  }
}


class ReversedIndexedSequence extends IndexedSequence {
  constructor(sequence, maintainIndices) {
    if (sequence.length) {
      this.length = sequence.length;
    }
    this.__reversedIndices = !!(maintainIndices ^ sequence.__reversedIndices);
    this._sequence = sequence;
    this._maintainIndices = maintainIndices;
  }

  reverse(maintainIndices) {
    if (maintainIndices === this._maintainIndices) {
      return this._sequence;
    }
    return super.reverse(maintainIndices);
  }

  __iterateUncached(fn, reverse, flipIndices) {
    return this._sequence.__iterate(fn, !reverse, flipIndices ^ this._maintainIndices);
  }
}


class ArraySequence extends IndexedSequence {
  constructor(array, isImmutable) {
    this.length = array.length;
    this._array = array;
    this._immutable = !!isImmutable;
  }

  isTransient() {
    return !this._immutable;
  }

  asPersistent() {
    this._array = this._array.slice();
    this._immutable = true;
    return this;
  }

  cacheResult() {
    return this;
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
      var didFinish = this._array.every((value, index) => {
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


class ObjectSequence extends Sequence {
  constructor(object, isImmutable) {
    this._object = object;
    this._immutable = !!isImmutable;
  }

  isTransient() {
    return !this._immutable;
  }

  asPersistent() {
    var prevObject = this._object;
    this._object = {};
    this.length = 0;
    this._immutable = true;
    for (var key in prevObject) if (prevObject.hasOwnProperty(key)) {
      this._object[key] = prevObject[key];
      this.length++;
    }
    return this;
  }

  cacheResult() {
    this.length = Object.keys(this._object).length;
    return this;
  }

  __iterate(fn, reverse) {
    var object = this._object;
    if (reverse) {
      var keys = Object.keys(object);
      for (var ii = keys.length - 1; ii >= 0; ii--) {
        if (fn(object[keys[ii]], keys[ii], object) === false) {
          return keys.length - ii + 1;
        }
      }
      return keys.length;
    } else {
      var iterations = 0;
      for (var key in object) if (object.hasOwnProperty(key)) {
        if (fn(object[key], key, object) === false) {
          break;
        }
        iterations++;
      }
      return iterations;
    }
  }
}

function resolveStart(start, length) {
  return start < 0 ? Math.max(0, length + start) : length ? Math.min(length, start) : start;
}

function resolveEnd(end, length) {
  return end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end;
}

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
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
