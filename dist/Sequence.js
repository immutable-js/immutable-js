/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

var Immutable = require('./Immutable');



  function Sequence(value) {"use strict";
    return Sequence.from(
      arguments.length === 1 ? value : Array.prototype.slice.call(arguments)
    );
  }

  Sequence.from=function(value) {"use strict";
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
  };

  Sequence.prototype.toString=function() {"use strict";
    return this.__toString('Seq {', '}');
  };

  Sequence.prototype.__toString=function(head, tail) {"use strict";
    if (this.length === 0) {
      return head + tail;
    }
    return head + ' ' + this.map(this.__toStringMapper).join(', ') + ' ' + tail;
  };

  Sequence.prototype.__toStringMapper=function(v, k) {"use strict";
    return k + ': ' + quoteString(v);
  };

  Sequence.prototype.toJSON=function() {"use strict";
    return this.map(function(value)  {return value.toJSON ? value.toJSON() : value;}).__toJS();
  };

  Sequence.prototype.toArray=function() {"use strict";
    assertNotInfinite(this.length);
    var array = new Array(this.length || 0);
    this.values().forEach(function(v, i)  { array[i] = v; });
    return array;
  };

  Sequence.prototype.toObject=function() {"use strict";
    assertNotInfinite(this.length);
    var object = {};
    this.forEach(function(v, k)  { object[k] = v; });
    return object;
  };

  Sequence.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return require('./Vector').from(this);
  };

  Sequence.prototype.toMap=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return require('./Map').from(this);
  };

  Sequence.prototype.toOrderedMap=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return require('./OrderedMap').from(this);
  };

  Sequence.prototype.toSet=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return require('./Set').from(this);
  };

  Sequence.prototype.equals=function(other) {"use strict";
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
    return this.__deepEquals(other);
  };

  Sequence.prototype.__deepEquals=function(other) {"use strict";
    var entries = this.cacheResult().entries().toArray();
    var iterations = 0;
    return other.every(function(v, k)  {
      var entry = entries[iterations++];
      return Immutable.is(k, entry[0]) && Immutable.is(v, entry[1]);
    });
  };

  Sequence.prototype.join=function(separator) {"use strict";
    separator = separator || ',';
    var string = '';
    var isFirst = true;
    this.forEach(function(v, k)  {
      if (isFirst) {
        isFirst = false;
        string += v;
      } else {
        string += separator + v;
      }
    });
    return string;
  };

  Sequence.prototype.concat=function() {"use strict";var values=Array.prototype.slice.call(arguments,0);
    var sequences = [this].concat(values.map(function(value)  {return Sequence(value);}));
    var concatSequence = this.__makeSequence();
    concatSequence.length = sequences.reduce(
      function(sum, seq)  {return sum != null && seq.length != null ? sum + seq.length : undefined;}, 0
    );
    concatSequence.__iterateUncached = function(fn, reverse)  {
      var iterations = 0;
      var stoppedIteration;
      var lastIndex = sequences.length - 1;
      for (var ii = 0; ii <= lastIndex && !stoppedIteration; ii++) {
        var seq = sequences[reverse ? lastIndex - ii : ii];
        iterations += seq.__iterate(function(v, k, c)  {
          if (fn(v, k, c) === false) {
            stoppedIteration = true;
            return false;
          }
        }, reverse);
      }
      return iterations;
    };
    return concatSequence;
  };

  Sequence.prototype.reverse=function(maintainIndices) {"use strict";
    var sequence = this;
    var reversedSequence = sequence.__makeSequence();
    reversedSequence.length = sequence.length;
    reversedSequence.__iterateUncached = function(fn, reverse)  {return sequence.__iterate(fn, !reverse);};
    reversedSequence.reverse = function()  {return sequence;};
    return reversedSequence;
  };

  Sequence.prototype.keys=function() {"use strict";
    return this.flip().values();
  };

  Sequence.prototype.values=function() {"use strict";
    // values() always returns an IndexedSequence.
    var sequence = this;
    var valuesSequence = makeIndexedSequence(sequence);
    valuesSequence.length = sequence.length;
    valuesSequence.values = returnThis;
    valuesSequence.__iterateUncached = function (fn, reverse, flipIndices) {
      if (flipIndices && this.length == null) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      var predicate;
      if (flipIndices) {
        iterations = this.length - 1;
        predicate = function(v, k, c)  {return fn(v, iterations--, c) !== false;};
      } else {
        predicate = function(v, k, c)  {return fn(v, iterations++, c) !== false;};
      }
      sequence.__iterate(predicate, reverse); // intentionally do not pass flipIndices
      return flipIndices ? this.length : iterations;
    }
    return valuesSequence;
  };

  Sequence.prototype.entries=function() {"use strict";
    var sequence = this;
    if (sequence.$Sequence_cache) {
      // We cache as an entries array, so we can just return the cache!
      return Sequence(sequence.$Sequence_cache);
    }
    var entriesSequence = sequence.map(entryMapper).values();
    entriesSequence.fromEntries = function()  {return sequence;};
    return entriesSequence;
  };

  Sequence.prototype.forEach=function(sideEffect, thisArg) {"use strict";
    return this.__iterate(thisArg ? sideEffect.bind(thisArg) : sideEffect);
  };

  Sequence.prototype.reduce=function(reducer, initialReduction, thisArg) {"use strict";
    var reduction = initialReduction;
    this.forEach(function(v, k, c)  {
      reduction = reducer.call(thisArg, reduction, v, k, c);
    });
    return reduction;
  };

  Sequence.prototype.reduceRight=function(reducer, initialReduction, thisArg) {"use strict";
    return this.reverse(true).reduce(reducer, initialReduction, thisArg);
  };

  Sequence.prototype.every=function(predicate, thisArg) {"use strict";
    var returnValue = true;
    this.forEach(function(v, k, c)  {
      if (!predicate.call(thisArg, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  };

  Sequence.prototype.some=function(predicate, thisArg) {"use strict";
    return !this.every(not(predicate), thisArg);
  };

  Sequence.prototype.first=function() {"use strict";
    return this.find(returnTrue);
  };

  Sequence.prototype.last=function() {"use strict";
    return this.findLast(returnTrue);
  };

  Sequence.prototype.has=function(searchKey) {"use strict";
    return this.get(searchKey, __SENTINEL) !== __SENTINEL;
  };

  Sequence.prototype.get=function(searchKey, notFoundValue) {"use strict";
    return this.find(function(_, key)  {return Immutable.is(key, searchKey);}, null, notFoundValue);
  };

  Sequence.prototype.getIn=function(searchKeyPath, notFoundValue) {"use strict";
    return getInDeepSequence(this, searchKeyPath, notFoundValue, 0);
  };

  Sequence.prototype.contains=function(searchValue) {"use strict";
    return this.find(function(value)  {return Immutable.is(value, searchValue);}, null, __SENTINEL) !== __SENTINEL;
  };

  Sequence.prototype.find=function(predicate, thisArg, notFoundValue) {"use strict";
    var foundValue = notFoundValue;
    this.forEach(function(v, k, c)  {
      if (predicate.call(thisArg, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  };

  Sequence.prototype.findKey=function(predicate, thisArg) {"use strict";
    var foundKey;
    this.forEach(function(v, k, c)  {
      if (predicate.call(thisArg, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  };

  Sequence.prototype.findLast=function(predicate, thisArg, notFoundValue) {"use strict";
    return this.reverse(true).find(predicate, thisArg, notFoundValue);
  };

  Sequence.prototype.findLastKey=function(predicate, thisArg) {"use strict";
    return this.reverse(true).findKey(predicate, thisArg);
  };

  Sequence.prototype.flip=function() {"use strict";
    // flip() always returns a non-indexed Sequence.
    var sequence = this;
    var flipSequence = makeSequence();
    flipSequence.length = sequence.length;
    flipSequence.flip = function()  {return sequence;};
    flipSequence.__iterateUncached = function(fn, reverse) 
      {return sequence.__iterate(function(v, k, c)  {return fn(k, v, c) !== false;}, reverse);};
    return flipSequence;
  };

  Sequence.prototype.map=function(mapper, thisArg) {"use strict";
    var sequence = this;
    var mappedSequence = sequence.__makeSequence();
    mappedSequence.length = sequence.length;
    mappedSequence.__iterateUncached = function(fn, reverse) 
      {return sequence.__iterate(function(v, k, c)  {return fn(mapper.call(thisArg, v, k, c), k, c) !== false;}, reverse);};
    return mappedSequence;
  };

  Sequence.prototype.filter=function(predicate, thisArg) {"use strict";
    return filterFactory(this, predicate, thisArg, true, false);
  };

  Sequence.prototype.slice=function(begin, end) {"use strict";
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.length);
    var resolvedEnd = resolveEnd(end, this.length);
    // begin or end will be NaN if they were provided as negative numbers and
    // this sequence's length is unknown. In that case, convert it to an
    // IndexedSequence by getting entries() and convert back to a sequence with
    // fromEntries(). IndexedSequence.prototype.slice will appropriately handle
    // this case.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return this.entries().slice(begin, end).fromEntries();
    }
    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
    return resolvedEnd == null || resolvedEnd === this.length ?
      skipped : skipped.take(resolvedEnd - resolvedBegin);
  };

  Sequence.prototype.take=function(amount) {"use strict";
    var iterations = 0;
    var sequence = this.takeWhile(function()  {return iterations++ < amount;});
    sequence.length = this.length && Math.min(this.length, amount);
    return sequence;
  };

  Sequence.prototype.takeLast=function(amount, maintainIndices) {"use strict";
    return this.reverse(maintainIndices).take(amount).reverse(maintainIndices);
  };

  Sequence.prototype.takeWhile=function(predicate, thisArg, maintainIndices) {"use strict";
    var sequence = this;
    var takeSequence = sequence.__makeSequence();
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      sequence.__iterate(function(v, k, c)  {
        if (predicate.call(thisArg, v, k, c) && fn(v, k, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }, reverse, flipIndices);
      return iterations;
    };
    return takeSequence;
  };

  Sequence.prototype.takeUntil=function(predicate, thisArg, maintainIndices) {"use strict";
    return this.takeWhile(not(predicate), thisArg, maintainIndices);
  };

  Sequence.prototype.skip=function(amount, maintainIndices) {"use strict";
    if (amount === 0) {
      return this;
    }
    var iterations = 0;
    var sequence = this.skipWhile(function()  {return iterations++ < amount;}, null, maintainIndices);
    sequence.length = this.length && Math.max(0, this.length - amount);
    return sequence;
  };

  Sequence.prototype.skipLast=function(amount, maintainIndices) {"use strict";
    return this.reverse(maintainIndices).skip(amount).reverse(maintainIndices);
  };

  Sequence.prototype.skipWhile=function(predicate, thisArg, maintainIndices) {"use strict";
    var sequence = this;
    var skipSequence = sequence.__makeSequence();
    skipSequence.__iterateUncached = function (fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var isSkipping = true;
      var iterations = 0;
      sequence.__iterate(function(v, k, c)  {
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
  };

  Sequence.prototype.skipUntil=function(predicate, thisArg, maintainIndices) {"use strict";
    return this.skipWhile(not(predicate), thisArg, maintainIndices);
  };

  Sequence.prototype.groupBy=function(mapper, context) {"use strict";
    var seq = this;
    var groups = require('./OrderedMap').empty().withMutations(function(map)  {
      seq.forEach(function(value, key, collection)  {
        var groupKey = mapper(value, key, collection);
        var group = map.get(groupKey, __SENTINEL);
        if (group === __SENTINEL) {
          group = [];
          map.set(groupKey, group);
        }
        group.push([key, value]);
      });
    })
    return groups.map(function(group)  {return Sequence(group).fromEntries();});
  };

  Sequence.prototype.cacheResult=function() {"use strict";
    if (!this.$Sequence_cache && this.__iterateUncached) {
      assertNotInfinite(this.length);
      this.$Sequence_cache = this.entries().toArray();
      if (this.length == null) {
        this.length = this.$Sequence_cache.length;
      }
    }
    return this;
  };

  // abstract __iterateUncached(fn, reverse)

  Sequence.prototype.__iterate=function(fn, reverse, flipIndices) {"use strict";
    if (!this.$Sequence_cache) {
      return this.__iterateUncached(fn, reverse, flipIndices);
    }
    var maxIndex = this.length - 1;
    var cache = this.$Sequence_cache;
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
        function(entry)  {return fn(entry[1], maxIndex - entry[0], c) !== false;} :
        function(entry)  {return fn(entry[1], entry[0], c) !== false;}
      );
    }
    return this.length;
  };

  Sequence.prototype.__makeSequence=function() {"use strict";
    return makeSequence();
  };


Sequence.prototype.inspect = Sequence.prototype.toSource = function() { return this.toString(); };
Sequence.prototype.__toJS = Sequence.prototype.toObject;


for(var Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){IndexedSequence[Sequence____Key]=Sequence[Sequence____Key];}}var ____SuperProtoOfSequence=Sequence===null?null:Sequence.prototype;IndexedSequence.prototype=Object.create(____SuperProtoOfSequence);IndexedSequence.prototype.constructor=IndexedSequence;IndexedSequence.__superConstructor__=Sequence;function IndexedSequence(){"use strict";if(Sequence!==null){Sequence.apply(this,arguments);}}

  IndexedSequence.prototype.toString=function() {"use strict";
    return this.__toString('Seq [', ']');
  };

  IndexedSequence.prototype.toArray=function() {"use strict";
    assertNotInfinite(this.length);
    var array = new Array(this.length || 0);
    array.length = this.forEach(function(v, i)  { array[i] = v; });
    return array;
  };

  IndexedSequence.prototype.fromEntries=function() {"use strict";
    var sequence = this;
    var fromEntriesSequence = sequence.__makeSequence();
    fromEntriesSequence.length = sequence.length;
    fromEntriesSequence.entries = function()  {return sequence;};
    fromEntriesSequence.__iterateUncached = function(fn, reverse, flipIndices) 
      {return sequence.__iterate(function(entry, _, c)  {return fn(entry[1], entry[0], c);}, reverse, flipIndices);};
    return fromEntriesSequence;
  };

  IndexedSequence.prototype.join=function(separator) {"use strict";
    separator = separator || ',';
    var string = '';
    var prevIndex = 0;
    this.forEach(function(v, i)  {
      var numSeparators = i - prevIndex;
      prevIndex = i;
      string += (numSeparators === 1 ? separator : repeatString(separator, numSeparators)) + v;
    });
    if (this.length && prevIndex < this.length - 1) {
      string += repeatString(separator, this.length - 1 - prevIndex);
    }
    return string;
  };

  IndexedSequence.prototype.concat=function() {"use strict";var values=Array.prototype.slice.call(arguments,0);
    var sequences = [this].concat(values).map(function(value)  {return Sequence(value);});
    var concatSequence = this.__makeSequence();
    concatSequence.length = sequences.reduce(
      function(sum, seq)  {return sum != null && seq.length != null ? sum + seq.length : undefined;}, 0
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
          sequence = sequence.values();
        }
        iterations += sequence.__iterate(function(v, index, c)  {
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
  };

  IndexedSequence.prototype.reverse=function(maintainIndices) {"use strict";
    var sequence = this;
    var reversedSequence = sequence.__makeSequence();
    reversedSequence.length = sequence.length;
    reversedSequence.__reversedIndices = !!(maintainIndices ^ sequence.__reversedIndices);
    reversedSequence.__iterateUncached = function(fn, reverse, flipIndices) 
      {return sequence.__iterate(fn, !reverse, flipIndices ^ maintainIndices);};
    reversedSequence.reverse = function ($IndexedSequence_maintainIndices) {
      return maintainIndices === $IndexedSequence_maintainIndices ? sequence :
        IndexedSequence.prototype.reverse.call(this, $IndexedSequence_maintainIndices);
    }
    return reversedSequence;
  };

  // Overridden to supply undefined length because it's entirely
  // possible this is sparse.
  IndexedSequence.prototype.values=function() {"use strict";
    var valuesSequence = ____SuperProtoOfSequence.values.call(this);
    valuesSequence.length = undefined;
    return valuesSequence;
  };

  IndexedSequence.prototype.filter=function(predicate, thisArg, maintainIndices) {"use strict";
    var filterSequence = filterFactory(this, predicate, thisArg, maintainIndices, maintainIndices);
    if (maintainIndices) {
      filterSequence.length = this.length;
    }
    return filterSequence;
  };

  IndexedSequence.prototype.indexOf=function(searchValue) {"use strict";
    return this.findIndex(function(value)  {return Immutable.is(value, searchValue);});
  };

  IndexedSequence.prototype.lastIndexOf=function(searchValue) {"use strict";
    return this.reverse(true).indexOf(searchValue);
  };

  IndexedSequence.prototype.findIndex=function(predicate, thisArg) {"use strict";
    var key = this.findKey(predicate, thisArg);
    return key == null ? -1 : key;
  };

  IndexedSequence.prototype.findLastIndex=function(predicate, thisArg) {"use strict";
    return this.reverse(true).findIndex(predicate, thisArg);
  };

  IndexedSequence.prototype.slice=function(begin, end, maintainIndices) {"use strict";
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
        sequence.cacheResult();
        resolvedBegin = resolveBegin(begin, sequence.length);
        resolvedEnd = resolveEnd(end, sequence.length);
      }
      var iiBegin = reversedIndices ? sequence.length - resolvedEnd : resolvedBegin;
      var iiEnd = reversedIndices ? sequence.length - resolvedBegin : resolvedEnd;
      var length = sequence.__iterate(function(v, ii, c) 
        {return !(ii >= iiBegin && (iiEnd == null || ii < iiEnd)) || fn(v, maintainIndices ? ii : ii - iiBegin, c) !== false;},
        reverse, flipIndices
      );
      return this.length || (maintainIndices ? length : Math.max(0, length - iiBegin));
    };
    return sliceSequence;
  };

  IndexedSequence.prototype.splice=function(index, removeNum)  {"use strict";var values=Array.prototype.slice.call(arguments,2);
    if (removeNum === 0 && values.length === 0) {
      return this;
    }
    return this.slice(0, index).concat(values, this.slice(index + removeNum));
  };

  // Overrides to get length correct.
  IndexedSequence.prototype.takeWhile=function(predicate, thisArg, maintainIndices) {"use strict";
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
      var length = sequence.__iterate(function(v, ii, c)  {
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
  };

  IndexedSequence.prototype.skipWhile=function(predicate, thisArg, maintainIndices) {"use strict";
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
      var length = sequence.__iterate(function(v, ii, c)  {
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
  };

  IndexedSequence.prototype.groupBy=function(mapper, context, maintainIndices) {"use strict";
    var seq = this;
    var groups = require('./OrderedMap').empty().withMutations(function(map)  {
      seq.forEach(function(value, index, collection)  {
        var groupKey = mapper(value, index, collection);
        var group = map.get(groupKey, __SENTINEL);
        if (group === __SENTINEL) {
          group = new Array(maintainIndices ? seq.length : 0);
          map.set(groupKey, group);
        }
        maintainIndices ? (group[index] = value) : group.push(value);
      });
    });
    return groups.map(function(group)  {return Sequence(group);});
  };

  // abstract __iterateUncached(fn, reverse, flipIndices)

  IndexedSequence.prototype.__makeSequence=function() {"use strict";
    return makeIndexedSequence(this);
  };


IndexedSequence.prototype.__toJS = IndexedSequence.prototype.toArray;
IndexedSequence.prototype.__toStringMapper = quoteString;


for(Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){ObjectSequence[Sequence____Key]=Sequence[Sequence____Key];}}ObjectSequence.prototype=Object.create(____SuperProtoOfSequence);ObjectSequence.prototype.constructor=ObjectSequence;ObjectSequence.__superConstructor__=Sequence;
  function ObjectSequence(object) {"use strict";
    var keys = Object.keys(object);
    this.$ObjectSequence_object = object;
    this.$ObjectSequence_keys = keys;
    this.length = keys.length;
  }

  ObjectSequence.prototype.toObject=function() {"use strict";
    return this.$ObjectSequence_object;
  };

  ObjectSequence.prototype.get=function(key, undefinedValue) {"use strict";
    if (undefinedValue !== undefined && !this.has(key)) {
      return undefinedValue;
    }
    return this.$ObjectSequence_object[key];
  };

  ObjectSequence.prototype.has=function(key) {"use strict";
    return this.$ObjectSequence_object.hasOwnProperty(key);
  };

  ObjectSequence.prototype.__iterate=function(fn, reverse) {"use strict";
    var object = this.$ObjectSequence_object;
    var keys = this.$ObjectSequence_keys;
    var maxIndex = keys.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var iteration = reverse ? maxIndex - ii : ii;
      if (fn(object[keys[iteration]], keys[iteration], object) === false) {
        break;
      }
    }
    return ii;
  };



for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ArraySequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;ArraySequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ArraySequence.prototype.constructor=ArraySequence;ArraySequence.__superConstructor__=IndexedSequence;
  function ArraySequence(array) {"use strict";
    this.$ArraySequence_array = array;
    this.length = array.length;
  }

  ArraySequence.prototype.toArray=function() {"use strict";
    return this.$ArraySequence_array;
  };

  ArraySequence.prototype.__iterate=function(fn, reverse, flipIndices) {"use strict";
    var array = this.$ArraySequence_array;
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
      var didFinish = array.every(function(value, index)  {
        if (fn(value, flipIndices ? maxIndex - index : index, array) === false) {
          return false;
        } else {
          lastIndex = index;
          return true;
        }
      });
      return didFinish ? array.length : lastIndex + 1;
    }
  };


ArraySequence.prototype.get = ObjectSequence.prototype.get;
ArraySequence.prototype.has = ObjectSequence.prototype.has;


function makeSequence() {
  return Object.create(Sequence.prototype);
}

function makeIndexedSequence(parent) {
  var newSequence = Object.create(IndexedSequence.prototype);
  newSequence.__reversedIndices = parent ? parent.__reversedIndices : false;
  return newSequence;
}

function getInDeepSequence(seq, keyPath, notFoundValue, pathOffset) {
  var nested = seq.get ? seq.get(keyPath[pathOffset], __SENTINEL) : __SENTINEL;
  if (nested === __SENTINEL) {
    return notFoundValue;
  }
  if (pathOffset === keyPath.length - 1) {
    return nested;
  }
  return getInDeepSequence(nested, keyPath, notFoundValue, pathOffset + 1);
}

function wholeSlice(begin, end, length) {
  return (begin === 0 || (length != null && begin <= -length)) &&
    (end == null || (length != null && end >= length));
}

function resolveBegin(begin, length) {
  return begin < 0 ? Math.max(0, length + begin) : length ? Math.min(length, begin) : begin;
}

function resolveEnd(end, length) {
  return end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end;
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

/**
 * Sequence.prototype.filter and IndexedSequence.prototype.filter are so close
 * in behavior that it makes sense to build a factory with the few differences
 * encoded as booleans.
 */
function filterFactory(sequence, predicate, thisArg, useKeys, maintainIndices) {
  var filterSequence = sequence.__makeSequence();
  filterSequence.__iterateUncached = function(fn, reverse, flipIndices)  {
    var iterations = 0;
    var length = sequence.__iterate(function(v, k, c)  {
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

function assertNotInfinite(length) {
  if (length === Infinity) {
    throw new Error('Cannot perform this action with an infinite sequence.');
  }
}

var __SENTINEL = {};

exports.Sequence = Sequence;
exports.IndexedSequence = IndexedSequence;
