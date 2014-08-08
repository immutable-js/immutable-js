/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */
function universalModule() {
  var $Object = Object;

function createClass(ctor, methods, staticMethods, superClass) {
  var proto;
  if (superClass) {
    var superProto = superClass.prototype;
    proto = $Object.create(superProto);
  } else {
    proto = ctor.prototype;
  }
  $Object.keys(methods).forEach(function (key) {
    proto[key] = methods[key];
  });
  $Object.keys(staticMethods).forEach(function (key) {
    ctor[key] = staticMethods[key];
  });
  proto.constructor = ctor;
  ctor.prototype = proto;
  return ctor;
}

function superCall(self, proto, name, args) {
  return $Object.getPrototypeOf(proto)[name].apply(self, args);
}

function defaultSuperCall(self, proto, args) {
  superCall(self, proto, 'constructor', args);
}

$traceurRuntime = {};
$traceurRuntime.createClass = createClass;
$traceurRuntime.superCall = superCall;
$traceurRuntime.defaultSuperCall = defaultSuperCall;
"use strict";
var Sequence = function Sequence(value) {
  return $Sequence.from(arguments.length === 1 ? value : Array.prototype.slice.call(arguments));
};
var $Sequence = Sequence;
($traceurRuntime.createClass)(Sequence, {
  toString: function() {
    return this.__toString('Seq {', '}');
  },
  __toString: function(head, tail) {
    if (this.length === 0) {
      return head + tail;
    }
    return head + ' ' + this.map(this.__toStringMapper).join(', ') + ' ' + tail;
  },
  __toStringMapper: function(v, k) {
    return k + ': ' + quoteString(v);
  },
  toJS: function() {
    return this.map((function(value) {
      return value instanceof $Sequence ? value.toJS() : value;
    })).__toJS();
  },
  toArray: function() {
    assertNotInfinite(this.length);
    var array = new Array(this.length || 0);
    this.values().forEach((function(v, i) {
      array[i] = v;
    }));
    return array;
  },
  toObject: function() {
    assertNotInfinite(this.length);
    var object = {};
    this.forEach((function(v, k) {
      object[k] = v;
    }));
    return object;
  },
  toVector: function() {
    assertNotInfinite(this.length);
    return Vector.from(this);
  },
  toMap: function() {
    assertNotInfinite(this.length);
    return Map.from(this);
  },
  toOrderedMap: function() {
    assertNotInfinite(this.length);
    return OrderedMap.from(this);
  },
  toSet: function() {
    assertNotInfinite(this.length);
    return Set.from(this);
  },
  equals: function(other) {
    if (this === other) {
      return true;
    }
    if (!(other instanceof $Sequence)) {
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
  },
  __deepEquals: function(other) {
    var entries = this.cacheResult().entries().toArray();
    var iterations = 0;
    return other.every((function(v, k) {
      var entry = entries[iterations++];
      return is(k, entry[0]) && is(v, entry[1]);
    }));
  },
  join: function(separator) {
    separator = separator || ',';
    var string = '';
    var isFirst = true;
    this.forEach((function(v, k) {
      if (isFirst) {
        isFirst = false;
        string += v;
      } else {
        string += separator + v;
      }
    }));
    return string;
  },
  count: function(predicate, thisArg) {
    if (!predicate) {
      if (this.length == null) {
        this.length = this.forEach(returnTrue);
      }
      return this.length;
    }
    return this.filter(predicate, thisArg).count();
  },
  countBy: function(mapper, context) {
    var seq = this;
    return OrderedMap.empty().withMutations((function(map) {
      seq.forEach((function(value, key, collection) {
        map.update(mapper(value, key, collection), increment);
      }));
    }));
  },
  concat: function() {
    for (var values = [],
        $__1 = 0; $__1 < arguments.length; $__1++)
      values[$__1] = arguments[$__1];
    var sequences = [this].concat(values.map((function(value) {
      return $Sequence(value);
    })));
    var concatSequence = this.__makeSequence();
    concatSequence.length = sequences.reduce((function(sum, seq) {
      return sum != null && seq.length != null ? sum + seq.length : undefined;
    }), 0);
    concatSequence.__iterateUncached = (function(fn, reverse) {
      var iterations = 0;
      var stoppedIteration;
      var lastIndex = sequences.length - 1;
      for (var ii = 0; ii <= lastIndex && !stoppedIteration; ii++) {
        var seq = sequences[reverse ? lastIndex - ii : ii];
        iterations += seq.__iterate((function(v, k, c) {
          if (fn(v, k, c) === false) {
            stoppedIteration = true;
            return false;
          }
        }), reverse);
      }
      return iterations;
    });
    return concatSequence;
  },
  reverse: function() {
    var sequence = this;
    var reversedSequence = sequence.__makeSequence();
    reversedSequence.length = sequence.length;
    reversedSequence.__iterateUncached = (function(fn, reverse) {
      return sequence.__iterate(fn, !reverse);
    });
    reversedSequence.reverse = (function() {
      return sequence;
    });
    return reversedSequence;
  },
  keys: function() {
    return this.flip().values();
  },
  values: function() {
    var sequence = this;
    var valuesSequence = makeIndexedSequence(sequence);
    valuesSequence.length = sequence.length;
    valuesSequence.values = returnThis;
    valuesSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (flipIndices && this.length == null) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      var predicate;
      if (flipIndices) {
        iterations = this.length - 1;
        predicate = (function(v, k, c) {
          return fn(v, iterations--, c) !== false;
        });
      } else {
        predicate = (function(v, k, c) {
          return fn(v, iterations++, c) !== false;
        });
      }
      sequence.__iterate(predicate, reverse);
      return flipIndices ? this.length : iterations;
    };
    return valuesSequence;
  },
  entries: function() {
    var sequence = this;
    if (sequence._cache) {
      return $Sequence(sequence._cache);
    }
    var entriesSequence = sequence.map(entryMapper).values();
    entriesSequence.fromEntries = (function() {
      return sequence;
    });
    return entriesSequence;
  },
  forEach: function(sideEffect, thisArg) {
    return this.__iterate(thisArg ? sideEffect.bind(thisArg) : sideEffect);
  },
  reduce: function(reducer, initialReduction, thisArg) {
    var reduction = initialReduction;
    this.forEach((function(v, k, c) {
      reduction = reducer.call(thisArg, reduction, v, k, c);
    }));
    return reduction;
  },
  reduceRight: function(reducer, initialReduction, thisArg) {
    return this.reverse(true).reduce(reducer, initialReduction, thisArg);
  },
  every: function(predicate, thisArg) {
    var returnValue = true;
    this.forEach((function(v, k, c) {
      if (!predicate.call(thisArg, v, k, c)) {
        returnValue = false;
        return false;
      }
    }));
    return returnValue;
  },
  some: function(predicate, thisArg) {
    return !this.every(not(predicate), thisArg);
  },
  first: function() {
    return this.find(returnTrue);
  },
  last: function() {
    return this.findLast(returnTrue);
  },
  has: function(searchKey) {
    return this.get(searchKey, __SENTINEL) !== __SENTINEL;
  },
  get: function(searchKey, notFoundValue) {
    return this.find((function(_, key) {
      return is(key, searchKey);
    }), null, notFoundValue);
  },
  getIn: function(searchKeyPath, notFoundValue) {
    return getInDeepSequence(this, searchKeyPath, notFoundValue, 0);
  },
  contains: function(searchValue) {
    return this.find((function(value) {
      return is(value, searchValue);
    }), null, __SENTINEL) !== __SENTINEL;
  },
  find: function(predicate, thisArg, notFoundValue) {
    var foundValue = notFoundValue;
    this.forEach((function(v, k, c) {
      if (predicate.call(thisArg, v, k, c)) {
        foundValue = v;
        return false;
      }
    }));
    return foundValue;
  },
  findKey: function(predicate, thisArg) {
    var foundKey;
    this.forEach((function(v, k, c) {
      if (predicate.call(thisArg, v, k, c)) {
        foundKey = k;
        return false;
      }
    }));
    return foundKey;
  },
  findLast: function(predicate, thisArg, notFoundValue) {
    return this.reverse(true).find(predicate, thisArg, notFoundValue);
  },
  findLastKey: function(predicate, thisArg) {
    return this.reverse(true).findKey(predicate, thisArg);
  },
  flip: function() {
    var sequence = this;
    var flipSequence = makeSequence();
    flipSequence.length = sequence.length;
    flipSequence.flip = (function() {
      return sequence;
    });
    flipSequence.__iterateUncached = (function(fn, reverse) {
      return sequence.__iterate((function(v, k, c) {
        return fn(k, v, c) !== false;
      }), reverse);
    });
    return flipSequence;
  },
  map: function(mapper, thisArg) {
    var sequence = this;
    var mappedSequence = sequence.__makeSequence();
    mappedSequence.length = sequence.length;
    mappedSequence.__iterateUncached = (function(fn, reverse) {
      return sequence.__iterate((function(v, k, c) {
        return fn(mapper.call(thisArg, v, k, c), k, c) !== false;
      }), reverse);
    });
    return mappedSequence;
  },
  filter: function(predicate, thisArg) {
    return filterFactory(this, predicate, thisArg, true, false);
  },
  slice: function(begin, end) {
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.length);
    var resolvedEnd = resolveEnd(end, this.length);
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return this.entries().slice(begin, end).fromEntries();
    }
    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
    return resolvedEnd == null || resolvedEnd === this.length ? skipped : skipped.take(resolvedEnd - resolvedBegin);
  },
  take: function(amount) {
    var iterations = 0;
    var sequence = this.takeWhile((function() {
      return iterations++ < amount;
    }));
    sequence.length = this.length && Math.min(this.length, amount);
    return sequence;
  },
  takeLast: function(amount, maintainIndices) {
    return this.reverse(maintainIndices).take(amount).reverse(maintainIndices);
  },
  takeWhile: function(predicate, thisArg) {
    var sequence = this;
    var takeSequence = sequence.__makeSequence();
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      sequence.__iterate((function(v, k, c) {
        if (predicate.call(thisArg, v, k, c) && fn(v, k, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }), reverse, flipIndices);
      return iterations;
    };
    return takeSequence;
  },
  takeUntil: function(predicate, thisArg, maintainIndices) {
    return this.takeWhile(not(predicate), thisArg, maintainIndices);
  },
  skip: function(amount, maintainIndices) {
    if (amount === 0) {
      return this;
    }
    var iterations = 0;
    var sequence = this.skipWhile((function() {
      return iterations++ < amount;
    }), null, maintainIndices);
    sequence.length = this.length && Math.max(0, this.length - amount);
    return sequence;
  },
  skipLast: function(amount, maintainIndices) {
    return this.reverse(maintainIndices).skip(amount).reverse(maintainIndices);
  },
  skipWhile: function(predicate, thisArg, maintainIndices) {
    var sequence = this;
    var skipSequence = sequence.__makeSequence();
    skipSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var isSkipping = true;
      var iterations = 0;
      sequence.__iterate((function(v, k, c) {
        if (!(isSkipping && (isSkipping = predicate.call(thisArg, v, k, c)))) {
          if (fn(v, k, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      }), reverse, flipIndices);
      return iterations;
    };
    return skipSequence;
  },
  skipUntil: function(predicate, thisArg, maintainIndices) {
    return this.skipWhile(not(predicate), thisArg, maintainIndices);
  },
  groupBy: function(mapper, context) {
    var seq = this;
    var groups = OrderedMap.empty().withMutations((function(map) {
      seq.forEach((function(value, key, collection) {
        var groupKey = mapper(value, key, collection);
        var group = map.get(groupKey, __SENTINEL);
        if (group === __SENTINEL) {
          group = [];
          map.set(groupKey, group);
        }
        group.push([key, value]);
      }));
    }));
    return groups.map((function(group) {
      return $Sequence(group).fromEntries();
    }));
  },
  sort: function(comparator, maintainIndices) {
    return this.sortBy(valueMapper, comparator, maintainIndices);
  },
  sortBy: function(mapper, comparator, maintainIndices) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return $Sequence(this.entries().entries().toArray().sort((function(indexedEntryA, indexedEntryB) {
      return comparator(mapper(indexedEntryA[1][1], indexedEntryA[1][0], seq), mapper(indexedEntryB[1][1], indexedEntryB[1][0], seq)) || indexedEntryA[0] - indexedEntryB[0];
    }))).fromEntries().values().fromEntries();
  },
  cacheResult: function() {
    if (!this._cache && this.__iterateUncached) {
      assertNotInfinite(this.length);
      this._cache = this.entries().toArray();
      if (this.length == null) {
        this.length = this._cache.length;
      }
    }
    return this;
  },
  __iterate: function(fn, reverse, flipIndices) {
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
      cache.every(flipIndices ? (function(entry) {
        return fn(entry[1], maxIndex - entry[0], c) !== false;
      }) : (function(entry) {
        return fn(entry[1], entry[0], c) !== false;
      }));
    }
    return this.length;
  },
  __makeSequence: function() {
    return makeSequence();
  }
}, {from: function(value) {
    if (value instanceof $Sequence) {
      return value;
    }
    if (!Array.isArray(value)) {
      if (value && value.constructor === Object) {
        return new ObjectSequence(value);
      }
      value = [value];
    }
    return new ArraySequence(value);
  }});
Sequence.prototype.toJSON = Sequence.prototype.toJS;
Sequence.prototype.inspect = Sequence.prototype.toSource = function() {
  return this.toString();
};
Sequence.prototype.__toJS = Sequence.prototype.toObject;
var IndexedSequence = function IndexedSequence() {
  $traceurRuntime.defaultSuperCall(this, $IndexedSequence.prototype, arguments);
};
var $IndexedSequence = IndexedSequence;
($traceurRuntime.createClass)(IndexedSequence, {
  toString: function() {
    return this.__toString('Seq [', ']');
  },
  toArray: function() {
    assertNotInfinite(this.length);
    var array = new Array(this.length || 0);
    array.length = this.forEach((function(v, i) {
      array[i] = v;
    }));
    return array;
  },
  fromEntries: function() {
    var sequence = this;
    var fromEntriesSequence = makeSequence();
    fromEntriesSequence.length = sequence.length;
    fromEntriesSequence.entries = (function() {
      return sequence;
    });
    fromEntriesSequence.__iterateUncached = (function(fn, reverse, flipIndices) {
      return sequence.__iterate((function(entry, _, c) {
        return fn(entry[1], entry[0], c);
      }), reverse, flipIndices);
    });
    return fromEntriesSequence;
  },
  join: function(separator) {
    separator = separator || ',';
    var string = '';
    var prevIndex = 0;
    this.forEach((function(v, i) {
      var numSeparators = i - prevIndex;
      prevIndex = i;
      string += (numSeparators === 1 ? separator : repeatString(separator, numSeparators)) + v;
    }));
    if (this.length && prevIndex < this.length - 1) {
      string += repeatString(separator, this.length - 1 - prevIndex);
    }
    return string;
  },
  concat: function() {
    for (var values = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      values[$__2] = arguments[$__2];
    var sequences = [this].concat(values).map((function(value) {
      return Sequence(value);
    }));
    var concatSequence = this.__makeSequence();
    concatSequence.length = sequences.reduce((function(sum, seq) {
      return sum != null && seq.length != null ? sum + seq.length : undefined;
    }), 0);
    concatSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (flipIndices && !this.length) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      var stoppedIteration;
      var maxIndex = flipIndices && this.length - 1;
      var maxSequencesIndex = sequences.length - 1;
      for (var ii = 0; ii <= maxSequencesIndex && !stoppedIteration; ii++) {
        var sequence = sequences[reverse ? maxSequencesIndex - ii : ii];
        if (!(sequence instanceof $IndexedSequence)) {
          sequence = sequence.values();
        }
        iterations += sequence.__iterate((function(v, index, c) {
          index += iterations;
          if (fn(v, flipIndices ? maxIndex - index : index, c) === false) {
            stoppedIteration = true;
            return false;
          }
        }), reverse);
      }
      return iterations;
    };
    return concatSequence;
  },
  reverse: function(maintainIndices) {
    var sequence = this;
    var reversedSequence = sequence.__makeSequence();
    reversedSequence.length = sequence.length;
    reversedSequence.__reversedIndices = !!(maintainIndices ^ sequence.__reversedIndices);
    reversedSequence.__iterateUncached = (function(fn, reverse, flipIndices) {
      return sequence.__iterate(fn, !reverse, flipIndices ^ maintainIndices);
    });
    reversedSequence.reverse = function(_maintainIndices) {
      return maintainIndices === _maintainIndices ? sequence : $IndexedSequence.prototype.reverse.call(this, _maintainIndices);
    };
    return reversedSequence;
  },
  values: function() {
    var valuesSequence = $traceurRuntime.superCall(this, $IndexedSequence.prototype, "values", []);
    valuesSequence.length = undefined;
    return valuesSequence;
  },
  filter: function(predicate, thisArg, maintainIndices) {
    var filterSequence = filterFactory(this, predicate, thisArg, maintainIndices, maintainIndices);
    if (maintainIndices) {
      filterSequence.length = this.length;
    }
    return filterSequence;
  },
  indexOf: function(searchValue) {
    return this.findIndex((function(value) {
      return is(value, searchValue);
    }));
  },
  lastIndexOf: function(searchValue) {
    return this.reverse(true).indexOf(searchValue);
  },
  findIndex: function(predicate, thisArg) {
    var key = this.findKey(predicate, thisArg);
    return key == null ? -1 : key;
  },
  findLastIndex: function(predicate, thisArg) {
    return this.reverse(true).findIndex(predicate, thisArg);
  },
  slice: function(begin, end, maintainIndices) {
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
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var reversedIndices = this.__reversedIndices ^ flipIndices;
      if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd || (reversedIndices && sequence.length == null)) {
        var exactLength = sequence.count();
        resolvedBegin = resolveBegin(begin, exactLength);
        resolvedEnd = resolveEnd(end, exactLength);
      }
      var iiBegin = reversedIndices ? sequence.length - resolvedEnd : resolvedBegin;
      var iiEnd = reversedIndices ? sequence.length - resolvedBegin : resolvedEnd;
      var lengthIterated = sequence.__iterate((function(v, ii, c) {
        return reversedIndices ? (iiEnd != null && ii >= iiEnd) || (ii >= iiBegin) && fn(v, maintainIndices ? ii : ii - iiBegin, c) !== false : (ii < iiBegin) || (iiEnd == null || ii < iiEnd) && fn(v, maintainIndices ? ii : ii - iiBegin, c) !== false;
      }), reverse, flipIndices);
      return this.length != null ? this.length : maintainIndices ? lengthIterated : Math.max(0, lengthIterated - iiBegin);
    };
    return sliceSequence;
  },
  splice: function(index, removeNum) {
    for (var values = [],
        $__3 = 2; $__3 < arguments.length; $__3++)
      values[$__3 - 2] = arguments[$__3];
    if (removeNum === 0 && values.length === 0) {
      return this;
    }
    return this.slice(0, index).concat(values, this.slice(index + removeNum));
  },
  takeWhile: function(predicate, thisArg, maintainIndices) {
    var sequence = this;
    var takeSequence = sequence.__makeSequence();
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      var didFinish = true;
      var length = sequence.__iterate((function(v, ii, c) {
        if (predicate.call(thisArg, v, ii, c) && fn(v, ii, c) !== false) {
          iterations = ii;
        } else {
          didFinish = false;
          return false;
        }
      }), reverse, flipIndices);
      return maintainIndices ? takeSequence.length : didFinish ? length : iterations + 1;
    };
    if (maintainIndices) {
      takeSequence.length = this.length;
    }
    return takeSequence;
  },
  skipWhile: function(predicate, thisArg, maintainIndices) {
    var sequence = this;
    var skipWhileSequence = sequence.__makeSequence();
    if (maintainIndices) {
      skipWhileSequence.length = this.length;
    }
    skipWhileSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var reversedIndices = sequence.__reversedIndices ^ flipIndices;
      var isSkipping = true;
      var indexOffset = 0;
      var length = sequence.__iterate((function(v, ii, c) {
        if (isSkipping) {
          isSkipping = predicate.call(thisArg, v, ii, c);
          if (!isSkipping) {
            indexOffset = ii;
          }
        }
        return isSkipping || fn(v, flipIndices || maintainIndices ? ii : ii - indexOffset, c) !== false;
      }), reverse, flipIndices);
      return maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - indexOffset;
    };
    return skipWhileSequence;
  },
  groupBy: function(mapper, context, maintainIndices) {
    var seq = this;
    var groups = OrderedMap.empty().withMutations((function(map) {
      seq.forEach((function(value, index, collection) {
        var groupKey = mapper(value, index, collection);
        var group = map.get(groupKey, __SENTINEL);
        if (group === __SENTINEL) {
          group = new Array(maintainIndices ? seq.length : 0);
          map.set(groupKey, group);
        }
        maintainIndices ? (group[index] = value) : group.push(value);
      }));
    }));
    return groups.map((function(group) {
      return Sequence(group);
    }));
  },
  sortBy: function(mapper, comparator, maintainIndices) {
    var sortedSeq = $traceurRuntime.superCall(this, $IndexedSequence.prototype, "sortBy", [mapper, comparator]);
    if (!maintainIndices) {
      sortedSeq = sortedSeq.values();
    }
    sortedSeq.length = this.length;
    return sortedSeq;
  },
  __makeSequence: function() {
    return makeIndexedSequence(this);
  }
}, {}, Sequence);
IndexedSequence.prototype.__toJS = IndexedSequence.prototype.toArray;
IndexedSequence.prototype.__toStringMapper = quoteString;
var ObjectSequence = function ObjectSequence(object) {
  var keys = Object.keys(object);
  this._object = object;
  this._keys = keys;
  this.length = keys.length;
};
($traceurRuntime.createClass)(ObjectSequence, {
  toObject: function() {
    return this._object;
  },
  get: function(key, undefinedValue) {
    if (undefinedValue !== undefined && !this.has(key)) {
      return undefinedValue;
    }
    return this._object[key];
  },
  has: function(key) {
    return this._object.hasOwnProperty(key);
  },
  __iterate: function(fn, reverse) {
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
}, {}, Sequence);
var ArraySequence = function ArraySequence(array) {
  this._array = array;
  this.length = array.length;
};
($traceurRuntime.createClass)(ArraySequence, {
  toArray: function() {
    return this._array;
  },
  __iterate: function(fn, reverse, flipIndices) {
    var array = this._array;
    var maxIndex = array.length - 1;
    var lastIndex = -1;
    if (reverse) {
      for (var ii = maxIndex; ii >= 0; ii--) {
        if (array.hasOwnProperty(ii) && fn(array[ii], flipIndices ? ii : maxIndex - ii, array) === false) {
          return lastIndex + 1;
        }
        lastIndex = ii;
      }
      return array.length;
    } else {
      var didFinish = array.every((function(value, index) {
        if (fn(value, flipIndices ? maxIndex - index : index, array) === false) {
          return false;
        } else {
          lastIndex = index;
          return true;
        }
      }));
      return didFinish ? array.length : lastIndex + 1;
    }
  }
}, {}, IndexedSequence);
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
  return (begin === 0 || (length != null && begin <= -length)) && (end == null || (length != null && end >= length));
}
function resolveBegin(begin, length) {
  return begin < 0 ? Math.max(0, length + begin) : length ? Math.min(length, begin) : begin;
}
function resolveEnd(end, length) {
  return end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end;
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
function filterFactory(sequence, predicate, thisArg, useKeys, maintainIndices) {
  var filterSequence = sequence.__makeSequence();
  filterSequence.__iterateUncached = (function(fn, reverse, flipIndices) {
    var iterations = 0;
    var length = sequence.__iterate((function(v, k, c) {
      if (predicate.call(thisArg, v, k, c)) {
        if (fn(v, useKeys ? k : iterations, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }
    }), reverse, flipIndices);
    return maintainIndices ? length : iterations;
  });
  return filterSequence;
}
function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
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
  if (length === Infinity) {
    throw new Error('Cannot perform this action with an infinite sequence.');
  }
}
var __SENTINEL = {};
function is(first, second) {
  if (first === second) {
    return first !== 0 || second !== 0 || 1 / first === 1 / second;
  }
  if (first !== first) {
    return second !== second;
  }
  if (first instanceof Sequence) {
    return first.equals(second);
  }
  return false;
}
var Map = function Map(sequence) {
  if (sequence && sequence.constructor === $Map) {
    return sequence;
  }
  if (!sequence || sequence.length === 0) {
    return $Map.empty();
  }
  return $Map.empty().merge(sequence);
};
var $Map = Map;
($traceurRuntime.createClass)(Map, {
  toString: function() {
    return this.__toString('Map {', '}');
  },
  get: function(k, undefinedValue) {
    if (k == null || this._root == null) {
      return undefinedValue;
    }
    return this._root.get(0, hashValue(k), k, undefinedValue);
  },
  set: function(k, v) {
    if (k == null) {
      return this;
    }
    var newLength = this.length;
    var newRoot;
    if (this._root) {
      var didAddLeaf = BoolRef();
      newRoot = this._root.set(this.__ownerID, 0, hashValue(k), k, v, didAddLeaf);
      didAddLeaf.value && newLength++;
    } else {
      newLength++;
      newRoot = makeNode(this.__ownerID, 0, hashValue(k), k, v);
    }
    if (this.__ownerID) {
      this.length = newLength;
      this._root = newRoot;
      return this;
    }
    return newRoot === this._root ? this : $Map._make(newLength, newRoot);
  },
  delete: function(k) {
    if (k == null || this._root == null) {
      return this;
    }
    if (this.__ownerID) {
      var didRemoveLeaf = BoolRef();
      this._root = this._root.delete(this.__ownerID, 0, hashValue(k), k, didRemoveLeaf);
      didRemoveLeaf.value && this.length--;
      return this;
    }
    var newRoot = this._root.delete(this.__ownerID, 0, hashValue(k), k);
    return !newRoot ? $Map.empty() : newRoot === this._root ? this : $Map._make(this.length - 1, newRoot);
  },
  update: function(k, updater) {
    return this.set(k, updater(this.get(k)));
  },
  clear: function() {
    if (this.__ownerID) {
      this.length = 0;
      this._root = null;
      return this;
    }
    return $Map.empty();
  },
  merge: function() {
    return mergeIntoMapWith(this, null, arguments);
  },
  mergeWith: function(merger) {
    for (var seqs = [],
        $__4 = 1; $__4 < arguments.length; $__4++)
      seqs[$__4 - 1] = arguments[$__4];
    return mergeIntoMapWith(this, merger, seqs);
  },
  mergeDeep: function() {
    return mergeIntoMapWith(this, deepMerger(null), arguments);
  },
  mergeDeepWith: function(merger) {
    for (var seqs = [],
        $__5 = 1; $__5 < arguments.length; $__5++)
      seqs[$__5 - 1] = arguments[$__5];
    return mergeIntoMapWith(this, deepMerger(merger), seqs);
  },
  updateIn: function(keyPath, updater) {
    return updateInDeepMap(this, keyPath, updater, 0);
  },
  withMutations: function(fn) {
    var mutable = this.asMutable();
    fn(mutable);
    return mutable.__ensureOwner(this.__ownerID);
  },
  asMutable: function() {
    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
  },
  asImmutable: function() {
    return this.__ensureOwner();
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return $Map._make(this.length, this._root, ownerID);
  },
  __deepEqual: function(other) {
    var self = this;
    return other.every((function(v, k) {
      return is(self.get(k, __SENTINEL), v);
    }));
  },
  __iterate: function(fn, reverse) {
    return this._root ? this._root.iterate(this, fn, reverse) : 0;
  }
}, {
  empty: function() {
    return __EMPTY_MAP || (__EMPTY_MAP = $Map._make(0));
  },
  _make: function(length, root, ownerID) {
    var map = Object.create($Map.prototype);
    map.length = length;
    map._root = root;
    map.__ownerID = ownerID;
    return map;
  }
}, Sequence);
Map.from = Map;
var OwnerID = function OwnerID() {};
($traceurRuntime.createClass)(OwnerID, {}, {});
var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, keys, values) {
  this.ownerID = ownerID;
  this.bitmap = bitmap;
  this.keys = keys;
  this.values = values;
};
var $BitmapIndexedNode = BitmapIndexedNode;
($traceurRuntime.createClass)(BitmapIndexedNode, {
  get: function(shift, hash, key, notFound) {
    var idx = (hash >>> shift) & MASK;
    if ((this.bitmap & (1 << idx)) === 0) {
      return notFound;
    }
    var keyOrNull = this.keys[idx];
    var valueOrNode = this.values[idx];
    if (keyOrNull == null) {
      return valueOrNode.get(shift + SHIFT, hash, key, notFound);
    }
    return key === keyOrNull ? valueOrNode : notFound;
  },
  set: function(ownerID, shift, hash, key, value, didAddLeaf) {
    var editable;
    var idx = (hash >>> shift) & MASK;
    var bit = 1 << idx;
    if ((this.bitmap & bit) === 0) {
      didAddLeaf && (didAddLeaf.value = true);
      editable = this.ensureOwner(ownerID);
      editable.keys[idx] = key;
      editable.values[idx] = value;
      editable.bitmap |= bit;
      return editable;
    }
    var keyOrNull = this.keys[idx];
    var valueOrNode = this.values[idx];
    var newNode;
    if (keyOrNull == null) {
      newNode = valueOrNode.set(ownerID, shift + SHIFT, hash, key, value, didAddLeaf);
      if (newNode === valueOrNode) {
        return this;
      }
      editable = this.ensureOwner(ownerID);
      editable.values[idx] = newNode;
      return editable;
    }
    if (key === keyOrNull) {
      if (value === valueOrNode) {
        return this;
      }
      editable = this.ensureOwner(ownerID);
      editable.values[idx] = value;
      return editable;
    }
    var originalHash = hashValue(keyOrNull);
    if (hash === originalHash) {
      newNode = new HashCollisionNode(ownerID, hash, [keyOrNull, key], [valueOrNode, value]);
    } else {
      newNode = makeNode(ownerID, shift + SHIFT, originalHash, keyOrNull, valueOrNode).set(ownerID, shift + SHIFT, hash, key, value);
    }
    didAddLeaf && (didAddLeaf.value = true);
    editable = this.ensureOwner(ownerID);
    delete editable.keys[idx];
    editable.values[idx] = newNode;
    return editable;
  },
  delete: function(ownerID, shift, hash, key, didRemoveLeaf) {
    var editable;
    var idx = (hash >>> shift) & MASK;
    var bit = 1 << idx;
    var keyOrNull = this.keys[idx];
    if ((this.bitmap & bit) === 0 || (keyOrNull != null && key !== keyOrNull)) {
      return this;
    }
    if (keyOrNull == null) {
      var node = this.values[idx];
      var newNode = node.delete(ownerID, shift + SHIFT, hash, key, didRemoveLeaf);
      if (newNode === node) {
        return this;
      }
      if (newNode) {
        editable = this.ensureOwner(ownerID);
        editable.values[idx] = newNode;
        return editable;
      }
    } else {
      didRemoveLeaf && (didRemoveLeaf.value = true);
    }
    if (this.bitmap === bit) {
      return null;
    }
    editable = this.ensureOwner(ownerID);
    delete editable.keys[idx];
    delete editable.values[idx];
    editable.bitmap ^= bit;
    return editable;
  },
  ensureOwner: function(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new $BitmapIndexedNode(ownerID, this.bitmap, this.keys.slice(), this.values.slice());
  },
  iterate: function(map, fn, reverse) {
    var values = this.values;
    var keys = this.keys;
    var maxIndex = values.length;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var index = reverse ? maxIndex - ii : ii;
      var key = keys[index];
      var valueOrNode = values[index];
      if (key != null) {
        if (fn(valueOrNode, key, map) === false) {
          return false;
        }
      } else if (valueOrNode && !valueOrNode.iterate(map, fn, reverse)) {
        return false;
      }
    }
    return true;
  }
}, {});
var HashCollisionNode = function HashCollisionNode(ownerID, collisionHash, keys, values) {
  this.ownerID = ownerID;
  this.collisionHash = collisionHash;
  this.keys = keys;
  this.values = values;
};
var $HashCollisionNode = HashCollisionNode;
($traceurRuntime.createClass)(HashCollisionNode, {
  get: function(shift, hash, key, notFound) {
    var idx = Sequence(this.keys).indexOf(key);
    return idx === -1 ? notFound : this.values[idx];
  },
  set: function(ownerID, shift, hash, key, value, didAddLeaf) {
    if (hash !== this.collisionHash) {
      didAddLeaf && (didAddLeaf.value = true);
      return makeNode(ownerID, shift, hash, null, this).set(ownerID, shift, hash, key, value);
    }
    var idx = Sequence(this.keys).indexOf(key);
    if (idx >= 0 && this.values[idx] === value) {
      return this;
    }
    var editable = this.ensureOwner(ownerID);
    if (idx === -1) {
      editable.keys.push(key);
      editable.values.push(value);
      didAddLeaf && (didAddLeaf.value = true);
    } else {
      editable.values[idx] = value;
    }
    return editable;
  },
  delete: function(ownerID, shift, hash, key, didRemoveLeaf) {
    var idx = this.keys.indexOf(key);
    if (idx === -1) {
      return this;
    }
    didRemoveLeaf && (didRemoveLeaf.value = true);
    if (this.values.length > 1) {
      var editable = this.ensureOwner(ownerID);
      editable.keys[idx] = editable.keys.pop();
      editable.values[idx] = editable.values.pop();
      return editable;
    }
  },
  ensureOwner: function(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new $HashCollisionNode(ownerID, this.collisionHash, this.keys.slice(), this.values.slice());
  },
  iterate: function(map, fn, reverse) {
    var values = this.values;
    var keys = this.keys;
    var maxIndex = values.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var index = reverse ? maxIndex - ii : ii;
      if (fn(values[index], keys[index], map) === false) {
        return false;
      }
    }
    return true;
  }
}, {});
function makeNode(ownerID, shift, hash, key, valOrNode) {
  var idx = (hash >>> shift) & MASK;
  var keys = [];
  var values = [];
  values[idx] = valOrNode;
  key != null && (keys[idx] = key);
  return new BitmapIndexedNode(ownerID, 1 << idx, keys, values);
}
function deepMerger(merger) {
  return (function(existing, value) {
    return existing && existing.mergeDeepWith ? existing.mergeDeepWith(merger, value) : merger ? merger(existing, value) : value;
  });
}
function mergeIntoMapWith(map, merger, seqs) {
  if (seqs.length === 0) {
    return map;
  }
  return map.withMutations((function(map) {
    for (var ii = 0; ii < seqs.length; ii++) {
      var seq = seqs[ii];
      if (seq) {
        seq = seq.forEach ? seq : Sequence(seq);
        seq.forEach(merger ? (function(value, key) {
          var existing = map.get(key, __SENTINEL);
          map.set(key, existing === __SENTINEL ? value : merger(existing, value));
        }) : (function(value, key) {
          map.set(key, value);
        }));
      }
    }
  }));
}
function updateInDeepMap(collection, keyPath, updater, pathOffset) {
  var key = keyPath[pathOffset];
  var nested = collection.get ? collection.get(key, __SENTINEL) : __SENTINEL;
  if (nested === __SENTINEL) {
    return collection;
  }
  return collection.set ? collection.set(key, pathOffset === keyPath.length - 1 ? updater(nested) : updateInDeepMap(nested, keyPath, updater, pathOffset + 1)) : collection;
}
var __BOOL_REF = {value: false};
function BoolRef(value) {
  __BOOL_REF.value = value;
  return __BOOL_REF;
}
function hashValue(o) {
  if (!o) {
    return 0;
  }
  if (o === true) {
    return 1;
  }
  if (typeof o.hashCode === 'function') {
    return o.hashCode();
  }
  var type = typeof o;
  if (type === 'number') {
    return Math.floor(o) % 2147483647;
  }
  if (type === 'string') {
    return hashString(o);
  }
  throw new Error('Unable to hash');
}
function hashString(string) {
  var hash = STRING_HASH_CACHE[string];
  if (hash == null) {
    hash = 0;
    for (var ii = 0; ii < string.length; ii++) {
      hash = (31 * hash + string.charCodeAt(ii)) % STRING_HASH_MAX_VAL;
    }
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      STRING_HASH_CACHE = {};
    }
    STRING_HASH_CACHE_SIZE++;
    STRING_HASH_CACHE[string] = hash;
  }
  return hash;
}
var STRING_HASH_MAX_VAL = 0x100000000;
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var STRING_HASH_CACHE = {};
var SHIFT = 5;
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_MAP;
var Vector = function Vector() {
  for (var values = [],
      $__6 = 0; $__6 < arguments.length; $__6++)
    values[$__6] = arguments[$__6];
  return $Vector.from(values);
};
var $Vector = Vector;
($traceurRuntime.createClass)(Vector, {
  toString: function() {
    return this.__toString('Vector [', ']');
  },
  get: function(index, undefinedValue) {
    index = rawIndex(index, this._origin);
    if (index >= this._size) {
      return undefinedValue;
    }
    var node = this._nodeFor(index);
    var maskedIndex = index & MASK;
    return node && (undefinedValue === undefined || node.array.hasOwnProperty(maskedIndex)) ? node.array[maskedIndex] : undefinedValue;
  },
  first: function() {
    return this.get(0);
  },
  last: function() {
    return this.get(this.length ? this.length - 1 : 0);
  },
  set: function(index, value) {
    var tailOffset = getTailOffset(this._size);
    if (index >= this.length) {
      return this.withMutations((function(vect) {
        return vect._setBounds(0, index + 1).set(index, value);
      }));
    }
    if (this.get(index, __SENTINEL) === value) {
      return this;
    }
    index = rawIndex(index, this._origin);
    if (index >= tailOffset) {
      var newTail = this._tail.ensureOwner(this.__ownerID);
      newTail.array[index & MASK] = value;
      var newSize = index >= this._size ? index + 1 : this._size;
      if (this.__ownerID) {
        this.length = newSize - this._origin;
        this._size = newSize;
        this._tail = newTail;
        return this;
      }
      return $Vector._make(this._origin, newSize, this._level, this._root, newTail);
    }
    var newRoot = this._root.ensureOwner(this.__ownerID);
    var node = newRoot;
    for (var level = this._level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this.__ownerID) : new VNode([], this.__ownerID);
    }
    node.array[index & MASK] = value;
    if (this.__ownerID) {
      this._root = newRoot;
      return this;
    }
    return $Vector._make(this._origin, this._size, this._level, newRoot, this._tail);
  },
  delete: function(index) {
    if (!this.has(index)) {
      return this;
    }
    var tailOffset = getTailOffset(this._size);
    index = rawIndex(index, this._origin);
    if (index >= tailOffset) {
      var newTail = this._tail.ensureOwner(this.__ownerID);
      delete newTail.array[index & MASK];
      if (this.__ownerID) {
        this._tail = newTail;
        return this;
      }
      return $Vector._make(this._origin, this._size, this._level, this._root, newTail);
    }
    var newRoot = this._root.ensureOwner(this.__ownerID);
    var node = newRoot;
    for (var level = this._level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx].ensureOwner(this.__ownerID);
    }
    delete node.array[index & MASK];
    if (this.__ownerID) {
      this._root = newRoot;
      return this;
    }
    return $Vector._make(this._origin, this._size, this._level, newRoot, this._tail);
  },
  clear: function() {
    if (this.__ownerID) {
      this.length = this._origin = this._size = 0;
      this._level = SHIFT;
      this._root = this._tail = __EMPTY_VNODE;
      return this;
    }
    return $Vector.empty();
  },
  push: function() {
    var values = arguments;
    var oldLength = this.length;
    return this.withMutations((function(vect) {
      vect._setBounds(0, oldLength + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(oldLength + ii, values[ii]);
      }
    }));
  },
  pop: function() {
    return this._setBounds(0, -1);
  },
  unshift: function() {
    var values = arguments;
    return this.withMutations((function(vect) {
      vect._setBounds(-values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(ii, values[ii]);
      }
    }));
  },
  shift: function() {
    return this._setBounds(1);
  },
  merge: function() {
    for (var seqs = [],
        $__7 = 0; $__7 < arguments.length; $__7++)
      seqs[$__7] = arguments[$__7];
    return Map.prototype.merge.apply(vectorWithLengthOfLongestSeq(this, seqs), arguments);
  },
  mergeWith: function(fn) {
    for (var seqs = [],
        $__8 = 1; $__8 < arguments.length; $__8++)
      seqs[$__8 - 1] = arguments[$__8];
    return Map.prototype.mergeWith.apply(vectorWithLengthOfLongestSeq(this, seqs), arguments);
  },
  mergeDeep: function() {
    for (var seqs = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      seqs[$__9] = arguments[$__9];
    return Map.prototype.mergeDeep.apply(vectorWithLengthOfLongestSeq(this, seqs), arguments);
  },
  mergeDeepWith: function(fn) {
    for (var seqs = [],
        $__10 = 1; $__10 < arguments.length; $__10++)
      seqs[$__10 - 1] = arguments[$__10];
    return Map.prototype.mergeDeepWith.apply(vectorWithLengthOfLongestSeq(this, seqs), arguments);
  },
  setLength: function(length) {
    return this._setBounds(0, length);
  },
  _setBounds: function(begin, end) {
    var owner = this.__ownerID || new OwnerID();
    var oldOrigin = this._origin;
    var oldSize = this._size;
    var newOrigin = oldOrigin + begin;
    var newSize = end == null ? oldSize : end < 0 ? oldSize + end : oldOrigin + end;
    if (newOrigin === oldOrigin && newSize === oldSize) {
      return this;
    }
    if (newOrigin >= newSize) {
      return this.clear();
    }
    var newLevel = this._level;
    var newRoot = this._root;
    var offsetShift = 0;
    while (newOrigin + offsetShift < 0) {
      newRoot = new VNode(newRoot.array.length ? [, newRoot] : [], owner);
      offsetShift += 1 << newLevel;
      newLevel += SHIFT;
    }
    if (offsetShift) {
      newOrigin += offsetShift;
      oldOrigin += offsetShift;
      newSize += offsetShift;
      oldSize += offsetShift;
    }
    var oldTailOffset = getTailOffset(oldSize);
    var newTailOffset = getTailOffset(newSize);
    while (newTailOffset >= 1 << (newLevel + SHIFT)) {
      newRoot = new VNode(newRoot.array.length ? [newRoot] : [], owner);
      newLevel += SHIFT;
    }
    var oldTail = this._tail;
    var newTail = newTailOffset < oldTailOffset ? this._nodeFor(newSize) : newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;
    if (newTailOffset > oldTailOffset && newOrigin < oldSize && oldTail.array.length) {
      newRoot = newRoot.ensureOwner(owner);
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(owner) : new VNode([], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
    }
    if (newSize < oldSize) {
      newTail = newTail.removeAfter(owner, 0, newSize);
    }
    if (newOrigin >= newTailOffset) {
      newOrigin -= newTailOffset;
      newSize -= newTailOffset;
      newLevel = SHIFT;
      newRoot = __EMPTY_VNODE;
      newTail = newTail.removeBefore(owner, 0, newOrigin);
    } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
      var beginIndex,
          endIndex;
      offsetShift = 0;
      do {
        beginIndex = ((newOrigin) >>> newLevel) & MASK;
        endIndex = ((newTailOffset - 1) >>> newLevel) & MASK;
        if (beginIndex === endIndex) {
          if (beginIndex) {
            offsetShift += (1 << newLevel) * beginIndex;
          }
          newLevel -= SHIFT;
          newRoot = newRoot && newRoot.array[beginIndex];
        }
      } while (newRoot && beginIndex === endIndex);
      if (newRoot && newOrigin > oldOrigin) {
        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
      }
      if (newRoot && newTailOffset < oldTailOffset) {
        newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
      }
      if (offsetShift) {
        newOrigin -= offsetShift;
        newSize -= offsetShift;
      }
      newRoot = newRoot || __EMPTY_VNODE;
    }
    if (this.__ownerID) {
      this.length = newSize - newOrigin;
      this._origin = newOrigin;
      this._size = newSize;
      this._level = newLevel;
      this._root = newRoot;
      this._tail = newTail;
      return this;
    }
    return $Vector._make(newOrigin, newSize, newLevel, newRoot, newTail);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return $Vector._make(this._origin, this._size, this._level, this._root, this._tail, ownerID);
  },
  slice: function(begin, end, maintainIndices) {
    var sliceSequence = $traceurRuntime.superCall(this, $Vector.prototype, "slice", [begin, end, maintainIndices]);
    if (!maintainIndices && sliceSequence !== this) {
      var vector = this;
      var length = vector.length;
      sliceSequence.toVector = (function() {
        return vector._setBounds(begin < 0 ? Math.max(0, length + begin) : length ? Math.min(length, begin) : begin, end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end);
      });
    }
    return sliceSequence;
  },
  __deepEquals: function(other) {
    var iterator = this.__iterator__();
    return other.every((function(v, k) {
      var entry = iterator.next();
      return k === entry[0] && is(v, entry[1]);
    }));
  },
  __iterator__: function() {
    return new VectorIterator(this, this._origin, this._size, this._level, this._root, this._tail);
  },
  __iterate: function(fn, reverse, flipIndices) {
    var vector = this;
    var lastIndex = 0;
    var maxIndex = vector.length - 1;
    flipIndices ^= reverse;
    var eachFn = (function(value, ii) {
      if (fn(value, flipIndices ? maxIndex - ii : ii, vector) === false) {
        return false;
      } else {
        lastIndex = ii;
        return true;
      }
    });
    var didComplete;
    var tailOffset = getTailOffset(this._size);
    if (reverse) {
      didComplete = this._tail.iterate(0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse) && this._root.iterate(this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
    } else {
      didComplete = this._root.iterate(this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) && this._tail.iterate(0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse);
    }
    return (didComplete ? maxIndex : reverse ? maxIndex - lastIndex : lastIndex) + 1;
  },
  _nodeFor: function(rawIndex) {
    if (rawIndex >= getTailOffset(this._size)) {
      return this._tail;
    }
    if (rawIndex < 1 << (this._level + SHIFT)) {
      var node = this._root;
      var level = this._level;
      while (node && level > 0) {
        node = node.array[(rawIndex >>> level) & MASK];
        level -= SHIFT;
      }
      return node;
    }
  }
}, {
  empty: function() {
    return __EMPTY_VECT || (__EMPTY_VECT = $Vector._make(0, 0, SHIFT, __EMPTY_VNODE, __EMPTY_VNODE));
  },
  from: function(sequence) {
    if (sequence && sequence.constructor === $Vector) {
      return sequence;
    }
    if (!sequence || sequence.length === 0) {
      return $Vector.empty();
    }
    var isArray = Array.isArray(sequence);
    if (sequence.length > 0 && sequence.length < SIZE) {
      return $Vector._make(0, sequence.length, SHIFT, __EMPTY_VNODE, new VNode(isArray ? sequence.slice() : Sequence(sequence).toArray()));
    }
    if (!isArray) {
      sequence = Sequence(sequence);
      if (!(sequence instanceof IndexedSequence)) {
        sequence = sequence.values();
      }
    }
    return $Vector.empty().merge(sequence);
  },
  _make: function(origin, size, level, root, tail, ownerID) {
    var vect = Object.create($Vector.prototype);
    vect.length = size - origin;
    vect._origin = origin;
    vect._size = size;
    vect._level = level;
    vect._root = root;
    vect._tail = tail;
    vect.__ownerID = ownerID;
    return vect;
  }
}, IndexedSequence);
Vector.prototype.update = Map.prototype.update;
Vector.prototype.updateIn = Map.prototype.updateIn;
Vector.prototype.withMutations = Map.prototype.withMutations;
Vector.prototype.asMutable = Map.prototype.asMutable;
Vector.prototype.asImmutable = Map.prototype.asImmutable;
var OwnerID = function OwnerID() {};
($traceurRuntime.createClass)(OwnerID, {}, {});
var VNode = function VNode(array, ownerID) {
  this.array = array;
  this.ownerID = ownerID;
};
var $VNode = VNode;
($traceurRuntime.createClass)(VNode, {
  ensureOwner: function(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new $VNode(this.array.slice(), ownerID);
  },
  removeBefore: function(ownerID, level, index) {
    if (index === 1 << level || this.array.length === 0) {
      return this;
    }
    var originIndex = (index >>> level) & MASK;
    if (originIndex >= this.array.length) {
      return new $VNode([], ownerID);
    }
    var removingFirst = originIndex === 0;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[originIndex];
      newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
      if (newChild === oldChild && removingFirst) {
        return this;
      }
    }
    if (removingFirst && !newChild) {
      return this;
    }
    var editable = this.ensureOwner();
    if (!removingFirst) {
      for (var ii = 0; ii < originIndex; ii++) {
        delete editable.array[ii];
      }
    }
    if (newChild) {
      editable.array[originIndex] = newChild;
    }
    return editable;
  },
  removeAfter: function(ownerID, level, index) {
    if (index === 1 << level || this.array.length === 0) {
      return this;
    }
    var sizeIndex = ((index - 1) >>> level) & MASK;
    if (sizeIndex >= this.array.length) {
      return this;
    }
    var removingLast = sizeIndex === this.array.length - 1;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[sizeIndex];
      newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
      if (newChild === oldChild && removingLast) {
        return this;
      }
    }
    if (removingLast && !newChild) {
      return this;
    }
    var editable = this.ensureOwner();
    if (!removingLast) {
      editable.array.length = sizeIndex + 1;
    }
    if (newChild) {
      editable.array[sizeIndex] = newChild;
    }
    return editable;
  },
  iterate: function(level, offset, max, fn, reverse) {
    if (level === 0) {
      if (reverse) {
        for (var revRawIndex = this.array.length - 1; revRawIndex >= 0; revRawIndex--) {
          if (this.array.hasOwnProperty(revRawIndex)) {
            var index = revRawIndex + offset;
            if (index >= 0 && index < max && fn(this.array[revRawIndex], index) === false) {
              return false;
            }
          }
        }
        return true;
      } else {
        return this.array.every((function(value, rawIndex) {
          var index = rawIndex + offset;
          return index < 0 || index >= max || fn(value, index) !== false;
        }));
      }
    }
    var step = 1 << level;
    var newLevel = level - SHIFT;
    if (reverse) {
      for (var revLevelIndex = this.array.length - 1; revLevelIndex >= 0; revLevelIndex--) {
        var newOffset = offset + revLevelIndex * step;
        if (newOffset < max && newOffset + step > 0 && this.array.hasOwnProperty(revLevelIndex) && !this.array[revLevelIndex].iterate(newLevel, newOffset, max, fn, reverse)) {
          return false;
        }
      }
      return true;
    } else {
      return this.array.every((function(newNode, levelIndex) {
        var newOffset = offset + levelIndex * step;
        return newOffset >= max || newOffset + step <= 0 || newNode.iterate(newLevel, newOffset, max, fn, reverse);
      }));
    }
  }
}, {});
var VectorIterator = function VectorIterator(vector, origin, size, level, root, tail) {
  var tailOffset = getTailOffset(size);
  this._stack = {
    node: root.array,
    level: level,
    offset: -origin,
    max: tailOffset - origin,
    __prev: {
      node: tail.array,
      level: 0,
      offset: tailOffset - origin,
      max: size - origin
    }
  };
};
($traceurRuntime.createClass)(VectorIterator, {next: function() {
    var stack = this._stack;
    iteration: while (stack) {
      if (stack.level === 0) {
        stack.rawIndex || (stack.rawIndex = 0);
        while (stack.rawIndex < stack.node.length) {
          var index = stack.rawIndex + stack.offset;
          if (index >= 0 && index < stack.max && stack.node.hasOwnProperty(stack.rawIndex)) {
            var value = stack.node[stack.rawIndex];
            stack.rawIndex++;
            return [index, value];
          } else {
            stack.rawIndex++;
          }
        }
      } else {
        var step = 1 << stack.level;
        stack.levelIndex || (stack.levelIndex = 0);
        while (stack.levelIndex < stack.node.length) {
          var newOffset = stack.offset + stack.levelIndex * step;
          if (newOffset + step > 0 && newOffset < stack.max && stack.node.hasOwnProperty(stack.levelIndex)) {
            var newNode = stack.node[stack.levelIndex].array;
            stack.levelIndex++;
            stack = this._stack = {
              node: newNode,
              level: stack.level - SHIFT,
              offset: newOffset,
              max: stack.max,
              __prev: stack
            };
            continue iteration;
          } else {
            stack.levelIndex++;
          }
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    if (global.StopIteration) {
      throw global.StopIteration;
    }
  }}, {});
function vectorWithLengthOfLongestSeq(vector, seqs) {
  var maxLength = Math.max.apply(null, seqs.map((function(seq) {
    return seq.length || 0;
  })));
  return maxLength > vector.length ? vector.setLength(maxLength) : vector;
}
function rawIndex(index, origin) {
  if (index < 0)
    throw new Error('Index out of bounds');
  return index + origin;
}
function getTailOffset(size) {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}
var SHIFT = 5;
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_VECT;
var __EMPTY_VNODE = new VNode([]);
var Set = function Set() {
  for (var values = [],
      $__11 = 0; $__11 < arguments.length; $__11++)
    values[$__11] = arguments[$__11];
  return $Set.from(values);
};
var $Set = Set;
($traceurRuntime.createClass)(Set, {
  toString: function() {
    return this.__toString('Set {', '}');
  },
  has: function(value) {
    return this._map ? this._map.has(value) : false;
  },
  get: function(value, notFoundValue) {
    return this.has(value) ? value : notFoundValue;
  },
  add: function(value) {
    if (value == null) {
      return this;
    }
    var newMap = this._map;
    if (!newMap) {
      newMap = Map.empty().__ensureOwner(this.__ownerID);
    }
    newMap = newMap.set(value, null);
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : $Set._make(newMap);
  },
  delete: function(value) {
    if (value == null || this._map == null) {
      return this;
    }
    var newMap = this._map.delete(value);
    if (newMap.length === 0) {
      return this.clear();
    }
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : $Set._make(newMap);
  },
  clear: function() {
    if (this.__ownerID) {
      this.length = 0;
      this._map = null;
      return this;
    }
    return $Set.empty();
  },
  union: function() {
    var seqs = arguments;
    if (seqs.length === 0) {
      return this;
    }
    return this.withMutations((function(set) {
      for (var ii = 0; ii < seqs.length; ii++) {
        var seq = seqs[ii];
        seq = seq.forEach ? seq : Sequence(seq);
        seq.forEach((function(value) {
          return set.add(value);
        }));
      }
    }));
  },
  intersect: function() {
    for (var seqs = [],
        $__12 = 0; $__12 < arguments.length; $__12++)
      seqs[$__12] = arguments[$__12];
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map((function(seq) {
      return Sequence(seq);
    }));
    var originalSet = this;
    return this.withMutations((function(set) {
      originalSet.forEach((function(value) {
        if (!seqs.every((function(seq) {
          return seq.contains(value);
        }))) {
          set.delete(value);
        }
      }));
    }));
  },
  subtract: function() {
    for (var seqs = [],
        $__13 = 0; $__13 < arguments.length; $__13++)
      seqs[$__13] = arguments[$__13];
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map((function(seq) {
      return Sequence(seq);
    }));
    var originalSet = this;
    return this.withMutations((function(set) {
      originalSet.forEach((function(value) {
        if (seqs.some((function(seq) {
          return seq.contains(value);
        }))) {
          set.delete(value);
        }
      }));
    }));
  },
  isSubset: function(seq) {
    seq = Sequence(seq);
    return this.every((function(value) {
      return seq.contains(value);
    }));
  },
  isSuperset: function(seq) {
    var set = this;
    seq = Sequence(seq);
    return seq.every((function(value) {
      return set.contains(value);
    }));
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return $Set._make(newMap, ownerID);
  },
  __deepEquals: function(other) {
    return !(this._map || other._map) || this._map.equals(other._map);
  },
  __iterate: function(fn, reverse) {
    var collection = this;
    return this._map ? this._map.__iterate((function(_, k) {
      return fn(k, k, collection);
    }), reverse) : 0;
  }
}, {
  empty: function() {
    return __EMPTY_SET || (__EMPTY_SET = $Set._make());
  },
  from: function(sequence) {
    if (sequence && sequence.constructor === $Set) {
      return sequence;
    }
    if (!sequence || sequence.length === 0) {
      return $Set.empty();
    }
    return $Set.empty().union(sequence);
  },
  fromKeys: function(sequence) {
    return $Set.from(Sequence(sequence).flip());
  },
  _make: function(map, ownerID) {
    var set = Object.create($Set.prototype);
    set.length = map ? map.length : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }
}, Sequence);
Set.prototype.contains = Set.prototype.has;
Set.prototype.withMutations = Map.prototype.withMutations;
Set.prototype.asMutable = Map.prototype.asMutable;
Set.prototype.asImmutable = Map.prototype.asImmutable;
Set.prototype.__toJS = IndexedSequence.prototype.__toJS;
Set.prototype.__toStringMapper = IndexedSequence.prototype.__toStringMapper;
var __EMPTY_SET;
var OrderedMap = function OrderedMap(sequence) {
  if (sequence && sequence.constructor === $OrderedMap) {
    return sequence;
  }
  if (!sequence || sequence.length === 0) {
    return $OrderedMap.empty();
  }
  return $OrderedMap.empty().merge(sequence);
};
var $OrderedMap = OrderedMap;
($traceurRuntime.createClass)(OrderedMap, {
  toString: function() {
    return this.__toString('OrderedMap {', '}');
  },
  get: function(k, undefinedValue) {
    if (k != null && this._map) {
      var index = this._map.get(k);
      if (index != null) {
        return this._vector.get(index)[1];
      }
    }
    return undefinedValue;
  },
  clear: function() {
    if (this.__ownerID) {
      this.length = 0;
      this._map = this._vector = null;
      return this;
    }
    return $OrderedMap.empty();
  },
  set: function(k, v) {
    if (k == null) {
      return this;
    }
    var newMap = this._map;
    var newVector = this._vector;
    if (newMap) {
      var index = newMap.get(k);
      if (index == null) {
        newMap = newMap.set(k, newVector.length);
        newVector = newVector.push([k, v]);
      } else if (newVector.get(index)[1] !== v) {
        newVector = newVector.set(index, [k, v]);
      }
    } else {
      newVector = Vector.empty().__ensureOwner(this.__ownerID).set(0, [k, v]);
      newMap = Map.empty().__ensureOwner(this.__ownerID).set(k, 0);
    }
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return newVector === this._vector ? this : $OrderedMap._make(newMap, newVector);
  },
  delete: function(k) {
    if (k == null || this._map == null) {
      return this;
    }
    var index = this._map.get(k);
    if (index == null) {
      return this;
    }
    var newMap = this._map.delete(k);
    var newVector = this._vector.delete(index);
    if (newMap.length === 0) {
      return this.clear();
    }
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return newMap === this._map ? this : $OrderedMap._make(newMap, newVector);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    var newVector = this._vector && this._vector.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return $OrderedMap._make(newMap, newVector, ownerID);
  },
  __deepEqual: function(other) {
    var iterator = this._vector.__iterator__();
    return other.every((function(v, k) {
      var entry = iterator.next();
      entry && (entry = entry[1]);
      return entry && is(k, entry[0]) && is(v, entry[1]);
    }));
  },
  __iterate: function(fn, reverse) {
    return this._vector ? this._vector.fromEntries().__iterate(fn, reverse) : 0;
  }
}, {
  empty: function() {
    return __EMPTY_ORDERED_MAP || (__EMPTY_ORDERED_MAP = $OrderedMap._make());
  },
  _make: function(map, vector, ownerID) {
    var omap = Object.create($OrderedMap.prototype);
    omap.length = map ? map.length : 0;
    omap._map = map;
    omap._vector = vector;
    omap.__ownerID = ownerID;
    return omap;
  }
}, Map);
OrderedMap.from = OrderedMap;
var __EMPTY_ORDERED_MAP;
var Record = function Record(defaultValues, name) {
  var RecordType = function(values) {
    this._map = Map(values);
  };
  defaultValues = Sequence(defaultValues);
  RecordType.prototype = Object.create($Record.prototype);
  RecordType.prototype.constructor = RecordType;
  RecordType.prototype._name = name;
  RecordType.prototype._defaultValues = defaultValues;
  var keys = Object.keys(defaultValues);
  RecordType.prototype.length = keys.length;
  if (Object.defineProperty) {
    defaultValues.forEach((function(_, key) {
      Object.defineProperty(RecordType.prototype, key, {
        get: function() {
          return this.get(key);
        },
        set: function(value) {
          if (!this.__ownerID) {
            throw new Error('Cannot set on an immutable record.');
          }
          this.set(key, value);
        }
      });
    }));
  }
  return RecordType;
};
var $Record = Record;
($traceurRuntime.createClass)(Record, {
  toString: function() {
    return this.__toString((this._name || 'Record') + ' {', '}');
  },
  has: function(k) {
    return this._defaultValues.has(k);
  },
  get: function(k, undefinedValue) {
    if (undefinedValue !== undefined && !this.has(k)) {
      return undefinedValue;
    }
    return this._map.get(k, this._defaultValues.get(k));
  },
  clear: function() {
    if (this.__ownerID) {
      this._map.clear();
      return this;
    }
    return this._empty();
  },
  set: function(k, v) {
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this._map.set(k, v);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return this._make(newMap);
  },
  delete: function(k) {
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this._map.delete(k);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return this._make(newMap);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return this._make(newMap, ownerID);
  },
  __iterate: function(fn, reverse) {
    var record = this;
    return this._defaultValues.map((function(_, k) {
      return record.get(k);
    })).__iterate(fn, reverse);
  },
  _empty: function() {
    var Record = Object.getPrototypeOf(this).constructor;
    return $Record._empty || ($Record._empty = this._make(Map.empty()));
  },
  _make: function(map, ownerID) {
    var record = Object.create(Object.getPrototypeOf(this));
    record._map = map;
    record.__ownerID = ownerID;
    return record;
  }
}, {}, Sequence);
Record.prototype.__deepEqual = Map.prototype.__deepEqual;
Record.prototype.merge = Map.prototype.merge;
Record.prototype.mergeWith = Map.prototype.mergeWith;
Record.prototype.mergeDeep = Map.prototype.mergeDeep;
Record.prototype.mergeDeepWith = Map.prototype.mergeDeepWith;
Record.prototype.update = Map.prototype.update;
Record.prototype.updateIn = Map.prototype.updateIn;
Record.prototype.withMutations = Map.prototype.withMutations;
Record.prototype.asMutable = Map.prototype.asMutable;
Record.prototype.asImmutable = Map.prototype.asImmutable;
var Range = function Range(start, end, step) {
  if (!(this instanceof $Range)) {
    return new $Range(start, end, step);
  }
  invariant(step !== 0, 'Cannot step a Range by 0');
  start = start || 0;
  if (end == null) {
    end = Infinity;
  }
  step = step == null ? 1 : Math.abs(step);
  if (end < start) {
    step = -step;
  }
  this._start = start;
  this._end = end;
  this._step = step;
  this.length = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
};
var $Range = Range;
($traceurRuntime.createClass)(Range, {
  toString: function() {
    if (this.length === 0) {
      return 'Range []';
    }
    return 'Range [ ' + this._start + '...' + this._end + (this._step > 1 ? ' by ' + this._step : '') + ' ]';
  },
  has: function(index) {
    invariant(index >= 0, 'Index out of bounds');
    return index < this.length;
  },
  get: function(index, undefinedValue) {
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ? this._start + index * this._step : undefinedValue;
  },
  contains: function(searchValue) {
    var possibleIndex = (searchValue - this._start) / this._step;
    return possibleIndex >= 0 && possibleIndex < this.length && possibleIndex === Math.floor(possibleIndex);
  },
  slice: function(begin, end, maintainIndices) {
    if (maintainIndices) {
      return $traceurRuntime.superCall(this, $Range.prototype, "slice", [begin, end, maintainIndices]);
    }
    begin = begin < 0 ? Math.max(0, this.length + begin) : Math.min(this.length, begin);
    end = end == null ? this.length : end > 0 ? Math.min(this.length, end) : Math.max(0, this.length + end);
    return new $Range(this.get(begin), end === this.length ? this._end : this.get(end), this._step);
  },
  __deepEquals: function(other) {
    return this._start === other._start && this._end === other._end && this._step === other._step;
  },
  indexOf: function(searchValue) {
    var offsetValue = searchValue - this._start;
    if (offsetValue % this._step === 0) {
      var index = offsetValue / this._step;
      if (index >= 0 && index < this.length) {
        return index;
      }
    }
    return -1;
  },
  lastIndexOf: function(searchValue) {
    return this.indexOf(searchValue);
  },
  take: function(amount) {
    return this.slice(0, amount);
  },
  skip: function(amount, maintainIndices) {
    return maintainIndices ? $traceurRuntime.superCall(this, $Range.prototype, "skip", [amount]) : this.slice(amount);
  },
  __iterate: function(fn, reverse, flipIndices) {
    var reversedIndices = reverse ^ flipIndices;
    var maxIndex = this.length - 1;
    var step = this._step;
    var value = reverse ? this._start + maxIndex * step : this._start;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(value, reversedIndices ? maxIndex - ii : ii, this) === false) {
        break;
      }
      value += reverse ? -step : step;
    }
    return reversedIndices ? this.length : ii;
  }
}, {}, IndexedSequence);
Range.prototype.__toJS = Range.prototype.toArray;
Range.prototype.first = Vector.prototype.first;
Range.prototype.last = Vector.prototype.last;
function invariant(condition, error) {
  if (!condition)
    throw new Error(error);
}
var Repeat = function Repeat(value, times) {
  if (times === 0 && __EMPTY_REPEAT) {
    return __EMPTY_REPEAT;
  }
  if (!(this instanceof $Repeat)) {
    return new $Repeat(value, times);
  }
  this._value = value;
  this.length = times == null ? Infinity : Math.max(0, times);
};
var $Repeat = Repeat;
($traceurRuntime.createClass)(Repeat, {
  toString: function() {
    if (this.length === 0) {
      return 'Repeat []';
    }
    return 'Repeat [ ' + this._value + ' ' + this.length + ' times ]';
  },
  get: function(index, undefinedValue) {
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ? this._value : undefinedValue;
  },
  first: function() {
    return this._value;
  },
  contains: function(searchValue) {
    return is(this._value, searchValue);
  },
  __deepEquals: function(other) {
    return is(this._value, other._value);
  },
  slice: function(begin, end, maintainIndices) {
    if (maintainIndices) {
      return $traceurRuntime.superCall(this, $Repeat.prototype, "slice", [begin, end, maintainIndices]);
    }
    var length = this.length;
    begin = begin < 0 ? Math.max(0, length + begin) : Math.min(length, begin);
    end = end == null ? length : end > 0 ? Math.min(length, end) : Math.max(0, length + end);
    return end > begin ? new $Repeat(this._value, end - begin) : __EMPTY_REPEAT;
  },
  reverse: function(maintainIndices) {
    return maintainIndices ? $traceurRuntime.superCall(this, $Repeat.prototype, "reverse", [maintainIndices]) : this;
  },
  indexOf: function(searchValue) {
    if (is(this._value, searchValue)) {
      return 0;
    }
    return -1;
  },
  lastIndexOf: function(searchValue) {
    if (is(this._value, searchValue)) {
      return this.length;
    }
    return -1;
  },
  __iterate: function(fn, reverse, flipIndices) {
    var reversedIndices = reverse ^ flipIndices;
    invariant(!reversedIndices || this.length < Infinity, 'Cannot access end of infinite range.');
    var maxIndex = this.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(this._value, reversedIndices ? maxIndex - ii : ii, this) === false) {
        break;
      }
    }
    return reversedIndices ? this.length : ii;
  }
}, {}, IndexedSequence);
Repeat.prototype.last = Repeat.prototype.first;
Repeat.prototype.has = Range.prototype.has;
Repeat.prototype.take = Range.prototype.take;
Repeat.prototype.skip = Range.prototype.skip;
Repeat.prototype.__toJS = Range.prototype.__toJS;
function invariant(condition, error) {
  if (!condition)
    throw new Error(error);
}
var __EMPTY_REPEAT = new Repeat(undefined, 0);
function fromJS(json, converter) {
  if (converter) {
    return _fromJSWith(converter, json, '', {'': json});
  }
  return _fromJSDefault(json);
}
function _fromJSWith(converter, json, key, parentJSON) {
  if (json && (Array.isArray(json) || json.constructor === Object)) {
    return converter.call(parentJSON, key, Sequence(json).map((function(v, k) {
      return _fromJSWith(converter, v, k, json);
    })));
  }
  return json;
}
function _fromJSDefault(json) {
  if (json) {
    if (Array.isArray(json)) {
      return Sequence(json).map(_fromJSDefault).toVector();
    }
    if (json.constructor === Object) {
      return Sequence(json).map(_fromJSDefault).toMap();
    }
  }
  return json;
}
var Immutable = {
  Sequence: Sequence,
  Map: Map,
  Vector: Vector,
  Set: Set,
  OrderedMap: OrderedMap,
  Record: Record,
  Range: Range,
  Repeat: Repeat,
  is: is,
  fromJS: fromJS
};

  return Immutable;
}
typeof exports === 'object' ? module.exports = universalModule() :
  typeof define === 'function' && define.amd ? define(universalModule) :
    Immutable = universalModule();
