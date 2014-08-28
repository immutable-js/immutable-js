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

var $traceurRuntime = {};
$traceurRuntime.createClass = createClass;
$traceurRuntime.superCall = superCall;
$traceurRuntime.defaultSuperCall = defaultSuperCall;
"use strict";
var SHIFT = 5;
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var NOT_SET = {};
var CHANGE_LENGTH = {value: false};
var DID_ALTER = {value: false};
function MakeRef(ref) {
  ref.value = false;
  return ref;
}
function SetRef(ref) {
  ref && (ref.value = true);
}
function OwnerID() {}
function arrCopy(arr, offset) {
  offset = offset || 0;
  var len = Math.max(0, arr.length - offset);
  var newArr = new Array(len);
  for (var ii = 0; ii < len; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}
var ITER_RESULT = {
  value: undefined,
  done: false
};
function iteratorValue(value) {
  ITER_RESULT.value = value;
  ITER_RESULT.done = false;
  return ITER_RESULT;
}
function iteratorDone() {
  ITER_RESULT.value = undefined;
  ITER_RESULT.done = true;
  return ITER_RESULT;
}
function invariant(condition, error) {
  if (!condition)
    throw new Error(error);
}
var DELETE = 'delete';
var ITERATOR = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
function hash(o) {
  if (!o) {
    return 0;
  }
  if (o === true) {
    return 1;
  }
  var type = typeof o;
  if (type === 'number') {
    if ((o | 0) === o) {
      return o & HASH_MAX_VAL;
    }
    o = '' + o;
    type = 'string';
  }
  if (type === 'string') {
    return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
  }
  if (o.hashCode) {
    return hash(typeof o.hashCode === 'function' ? o.hashCode() : o.hashCode);
  }
  return hashJSObj(o);
}
function cachedHashString(string) {
  var hash = STRING_HASH_CACHE[string];
  if (hash == null) {
    hash = hashString(string);
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      STRING_HASH_CACHE = {};
    }
    STRING_HASH_CACHE_SIZE++;
    STRING_HASH_CACHE[string] = hash;
  }
  return hash;
}
function hashString(string) {
  var hash = 0;
  for (var ii = 0; ii < string.length; ii++) {
    hash = (31 * hash + string.charCodeAt(ii)) & HASH_MAX_VAL;
  }
  return hash;
}
function hashJSObj(obj) {
  if (obj[UID_HASH_KEY]) {
    return obj[UID_HASH_KEY];
  }
  var uid = ++UID_HASH_COUNT & HASH_MAX_VAL;
  if (!isIE8) {
    try {
      Object.defineProperty(obj, UID_HASH_KEY, {
        'enumerable': false,
        'configurable': false,
        'writable': false,
        'value': uid
      });
      return uid;
    } catch (e) {
      isIE8 = true;
    }
  }
  obj[UID_HASH_KEY] = uid;
  return uid;
}
var HASH_MAX_VAL = 0x7FFFFFFF;
var UID_HASH_COUNT = 0;
var UID_HASH_KEY = '__immutablehash__';
if (typeof Symbol !== 'undefined') {
  UID_HASH_KEY = Symbol(UID_HASH_KEY);
}
var isIE8 = false;
var STRING_HASH_CACHE_MIN_STRLEN = 16;
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var STRING_HASH_CACHE = {};
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
    this.valueSeq().forEach((function(v, i) {
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
  hashCode: function() {
    return this.__hash || (this.__hash = this.length === Infinity ? 0 : this.reduce((function(h, v, k) {
      return (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL;
    }), 0));
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
    if (this.__hash != null && other.__hash != null && this.__hash !== other.__hash) {
      return false;
    }
    return this.__deepEquals(other);
  },
  __deepEquals: function(other) {
    var entries = this.cacheResult().entrySeq().toArray();
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
  keySeq: function() {
    return this.flip().valueSeq();
  },
  valueSeq: function() {
    var sequence = this;
    var valuesSequence = makeIndexedSequence(sequence);
    valuesSequence.length = sequence.length;
    valuesSequence.valueSeq = returnThis;
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
  entrySeq: function() {
    var sequence = this;
    if (sequence._cache) {
      return $Sequence(sequence._cache);
    }
    var entriesSequence = sequence.map(entryMapper).valueSeq();
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
  rest: function() {
    return this.slice(1);
  },
  butLast: function() {
    return this.slice(0, -1);
  },
  has: function(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  },
  get: function(searchKey, notSetValue) {
    return this.find((function(_, key) {
      return is(key, searchKey);
    }), null, notSetValue);
  },
  getIn: function(searchKeyPath, notSetValue) {
    if (!searchKeyPath || searchKeyPath.length === 0) {
      return this;
    }
    return getInDeepSequence(this, searchKeyPath, notSetValue, 0);
  },
  contains: function(searchValue) {
    return this.find((function(value) {
      return is(value, searchValue);
    }), null, NOT_SET) !== NOT_SET;
  },
  find: function(predicate, thisArg, notSetValue) {
    var foundValue = notSetValue;
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
  findLast: function(predicate, thisArg, notSetValue) {
    return this.reverse(true).find(predicate, thisArg, notSetValue);
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
  mapKeys: function(mapper, thisArg) {
    var sequence = this;
    var mappedSequence = sequence.__makeSequence();
    mappedSequence.length = sequence.length;
    mappedSequence.__iterateUncached = (function(fn, reverse) {
      return sequence.__iterate((function(v, k, c) {
        return fn(v, mapper.call(thisArg, k, v, c), c) !== false;
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
      return this.entrySeq().slice(begin, end).fromEntrySeq();
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
        var group = map.get(groupKey, NOT_SET);
        if (group === NOT_SET) {
          group = [];
          map.set(groupKey, group);
        }
        group.push([key, value]);
      }));
    }));
    return groups.map((function(group) {
      return $Sequence(group).fromEntrySeq();
    }));
  },
  sort: function(comparator, maintainIndices) {
    return this.sortBy(valueMapper, comparator, maintainIndices);
  },
  sortBy: function(mapper, comparator, maintainIndices) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return $Sequence(this.entrySeq().entrySeq().toArray().sort((function(indexedEntryA, indexedEntryB) {
      return comparator(mapper(indexedEntryA[1][1], indexedEntryA[1][0], seq), mapper(indexedEntryB[1][1], indexedEntryB[1][0], seq)) || indexedEntryA[0] - indexedEntryB[0];
    }))).fromEntrySeq().valueSeq().fromEntrySeq();
  },
  cacheResult: function() {
    if (!this._cache && this.__iterateUncached) {
      assertNotInfinite(this.length);
      this._cache = this.entrySeq().toArray();
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
var SequencePrototype = Sequence.prototype;
SequencePrototype.toJSON = SequencePrototype.toJS;
SequencePrototype.__toJS = SequencePrototype.toObject;
SequencePrototype.inspect = SequencePrototype.toSource = function() {
  return this.toString();
};
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
  fromEntrySeq: function() {
    var sequence = this;
    var fromEntriesSequence = makeSequence();
    fromEntriesSequence.length = sequence.length;
    fromEntriesSequence.entrySeq = (function() {
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
          sequence = sequence.valueSeq();
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
      return maintainIndices === _maintainIndices ? sequence : IndexedSequencePrototype.reverse.call(this, _maintainIndices);
    };
    return reversedSequence;
  },
  valueSeq: function() {
    var valuesSequence = $traceurRuntime.superCall(this, $IndexedSequence.prototype, "valueSeq", []);
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
    var numArgs = arguments.length;
    removeNum = Math.max(removeNum | 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    index = resolveBegin(index, this.length);
    var spliced = this.slice(0, index);
    return numArgs === 1 ? spliced : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum));
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
        var group = map.get(groupKey, NOT_SET);
        if (group === NOT_SET) {
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
      sortedSeq = sortedSeq.valueSeq();
    }
    sortedSeq.length = this.length;
    return sortedSeq;
  },
  __makeSequence: function() {
    return makeIndexedSequence(this);
  }
}, {}, Sequence);
var IndexedSequencePrototype = IndexedSequence.prototype;
IndexedSequencePrototype.__toJS = IndexedSequencePrototype.toArray;
IndexedSequencePrototype.__toStringMapper = quoteString;
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
  get: function(key, notSetValue) {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
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
var SequenceIterator = function SequenceIterator() {};
($traceurRuntime.createClass)(SequenceIterator, {toString: function() {
    return '[Iterator]';
  }}, {});
var SequenceIteratorPrototype = SequenceIterator.prototype;
SequenceIteratorPrototype[ITERATOR] = returnThis;
SequenceIteratorPrototype.inspect = SequenceIteratorPrototype.toSource = function() {
  return this.toString();
};
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
  return (begin === 0 || (length != null && begin <= -length)) && (end == null || (length != null && end >= length));
}
function resolveBegin(begin, length) {
  return resolveIndex(begin, length, 0);
}
function resolveEnd(end, length) {
  return resolveIndex(end, length, length);
}
function resolveIndex(index, length, defaultIndex) {
  return index == null ? defaultIndex : index < 0 ? Math.max(0, length + index) : length ? Math.min(length, index) : index;
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
  invariant(length !== Infinity, 'Cannot perform this action with an infinite sequence.');
}
function iteratorMapper(iter, fn) {
  var newIter = new SequenceIterator();
  newIter.next = (function() {
    var step = iter.next();
    if (step.done)
      return step;
    step.value = fn(step.value);
    return step;
  });
  return newIter;
}
var Cursor = function Cursor(rootData, keyPath, onChange, value) {
  value = value ? value : rootData.getIn(keyPath);
  this.length = value instanceof Sequence ? value.length : null;
  this._rootData = rootData;
  this._keyPath = keyPath;
  this._onChange = onChange;
};
($traceurRuntime.createClass)(Cursor, {
  deref: function(notSetValue) {
    return this._rootData.getIn(this._keyPath, notSetValue);
  },
  get: function(key, notSetValue) {
    if (Array.isArray(key) && key.length === 0) {
      return this;
    }
    var value = this._rootData.getIn(this._keyPath.concat(key), NOT_SET);
    return value === NOT_SET ? notSetValue : wrappedValue(this, key, value);
  },
  set: function(key, value) {
    return updateCursor(this, (function(m) {
      return m.set(key, value);
    }), key);
  },
  remove: function(key) {
    return updateCursor(this, (function(m) {
      return m.remove(key);
    }), key);
  },
  clear: function() {
    return updateCursor(this, (function(m) {
      return m.clear();
    }));
  },
  update: function(keyOrFn, notSetValue, updater) {
    return arguments.length === 1 ? updateCursor(this, keyOrFn) : updateCursor(this, (function(map) {
      return map.update(keyOrFn, notSetValue, updater);
    }), keyOrFn);
  },
  withMutations: function(fn) {
    return updateCursor(this, (function(m) {
      return (m || Map.empty()).withMutations(fn);
    }));
  },
  cursor: function(subKey) {
    return Array.isArray(subKey) && subKey.length === 0 ? this : subCursor(this, subKey);
  },
  __iterate: function(fn, reverse, flipIndices) {
    var cursor = this;
    var deref = cursor.deref();
    return deref && deref.__iterate ? deref.__iterate((function(value, key, collection) {
      return fn(wrappedValue(cursor, key, value), key, collection);
    }), reverse, flipIndices) : 0;
  }
}, {}, Sequence);
Cursor.prototype[DELETE] = Cursor.prototype.remove;
Cursor.prototype.getIn = Cursor.prototype.get;
function wrappedValue(cursor, key, value) {
  return value instanceof Sequence ? subCursor(cursor, key, value) : value;
}
function subCursor(cursor, key, value) {
  return new Cursor(cursor._rootData, cursor._keyPath.concat(key), cursor._onChange, value);
}
function updateCursor(cursor, changeFn, changeKey) {
  var newRootData = cursor._rootData.updateIn(cursor._keyPath, changeKey ? Map.empty() : undefined, changeFn);
  var keyPath = cursor._keyPath || [];
  cursor._onChange && cursor._onChange.call(undefined, newRootData, cursor._rootData, changeKey ? keyPath.concat(changeKey) : keyPath);
  return new Cursor(newRootData, cursor._keyPath, cursor._onChange);
}
function is(first, second) {
  if (first instanceof Cursor) {
    first = first.deref();
  }
  if (second instanceof Cursor) {
    second = second.deref();
  }
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
  var map = $Map.empty();
  return sequence ? sequence.constructor === $Map ? sequence : map.merge(sequence) : map;
};
var $Map = Map;
($traceurRuntime.createClass)(Map, {
  toString: function() {
    return this.__toString('Map {', '}');
  },
  get: function(k, notSetValue) {
    return this._root ? this._root.get(0, hash(k), k, notSetValue) : notSetValue;
  },
  set: function(k, v) {
    return updateMap(this, k, v);
  },
  remove: function(k) {
    return updateMap(this, k, NOT_SET);
  },
  update: function(k, notSetValue, updater) {
    return arguments.length === 1 ? this.updateIn([], null, k) : this.updateIn([k], notSetValue, updater);
  },
  updateIn: function(keyPath, notSetValue, updater) {
    var $__12;
    if (!updater) {
      ($__12 = [notSetValue, updater], updater = $__12[0], notSetValue = $__12[1], $__12);
    }
    return updateInDeepMap(this, keyPath, notSetValue, updater, 0);
  },
  clear: function() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
      this._root = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return $Map.empty();
  },
  merge: function() {
    return mergeIntoMapWith(this, null, arguments);
  },
  mergeWith: function(merger) {
    for (var seqs = [],
        $__3 = 1; $__3 < arguments.length; $__3++)
      seqs[$__3 - 1] = arguments[$__3];
    return mergeIntoMapWith(this, merger, seqs);
  },
  mergeDeep: function() {
    return mergeIntoMapWith(this, deepMerger(null), arguments);
  },
  mergeDeepWith: function(merger) {
    for (var seqs = [],
        $__4 = 1; $__4 < arguments.length; $__4++)
      seqs[$__4 - 1] = arguments[$__4];
    return mergeIntoMapWith(this, deepMerger(merger), seqs);
  },
  cursor: function(keyPath, onChange) {
    if (!onChange && typeof keyPath === 'function') {
      onChange = keyPath;
      keyPath = [];
    } else if (arguments.length === 0) {
      keyPath = [];
    } else if (!Array.isArray(keyPath)) {
      keyPath = [keyPath];
    }
    return new Cursor(this, keyPath, onChange);
  },
  withMutations: function(fn) {
    var mutable = this.asMutable();
    fn(mutable);
    return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
  },
  asMutable: function() {
    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
  },
  asImmutable: function() {
    return this.__ensureOwner();
  },
  wasAltered: function() {
    return this.__altered;
  },
  keys: function() {
    return new MapIterator(this, 0);
  },
  values: function() {
    return new MapIterator(this, 1);
  },
  entries: function() {
    return new MapIterator(this, 2);
  },
  __iterator: function(reverse) {
    return new MapIterator(this, 2, reverse);
  },
  __iterate: function(fn, reverse) {
    var map = this;
    if (!map._root) {
      return 0;
    }
    var iterations = 0;
    this._root.iterate((function(entry) {
      if (fn(entry[1], entry[0], map) === false) {
        return false;
      }
      iterations++;
    }), reverse);
    return iterations;
  },
  __deepEqual: function(other) {
    var self = this;
    return other.every((function(v, k) {
      return is(self.get(k, NOT_SET), v);
    }));
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeMap(this.length, this._root, ownerID, this.__hash);
  }
}, {empty: function() {
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }}, Sequence);
var MapPrototype = Map.prototype;
MapPrototype[DELETE] = MapPrototype.remove;
MapPrototype[ITERATOR] = function() {
  return this.entries();
};
Map.from = Map;
var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
  this.ownerID = ownerID;
  this.bitmap = bitmap;
  this.nodes = nodes;
};
var $BitmapIndexedNode = BitmapIndexedNode;
($traceurRuntime.createClass)(BitmapIndexedNode, {
  get: function(shift, hash, key, notSetValue) {
    var bit = (1 << ((hash >>> shift) & MASK));
    var bitmap = this.bitmap;
    return (bitmap & bit) === 0 ? notSetValue : this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, hash, key, notSetValue);
  },
  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
    var hashFrag = (hash >>> shift) & MASK;
    var bit = 1 << hashFrag;
    var bitmap = this.bitmap;
    var exists = (bitmap & bit) !== 0;
    if (!exists && value === NOT_SET) {
      return this;
    }
    var idx = popCount(bitmap & (bit - 1));
    var nodes = this.nodes;
    var node = exists ? nodes[idx] : null;
    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeLength, didAlter);
    if (newNode === node) {
      return this;
    }
    if (!exists && newNode && nodes.length >= MAX_BITMAP_SIZE) {
      return expandNodes(ownerID, nodes, bitmap, hashFrag, newNode);
    }
    if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
      return nodes[idx ^ 1];
    }
    if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
      return newNode;
    }
    var isEditable = ownerID && ownerID === this.ownerID;
    var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
    var newNodes = exists ? newNode ? setIn(nodes, idx, newNode, isEditable) : spliceOut(nodes, idx, isEditable) : spliceIn(nodes, idx, newNode, isEditable);
    if (isEditable) {
      this.bitmap = newBitmap;
      this.nodes = newNodes;
      return this;
    }
    return new $BitmapIndexedNode(ownerID, newBitmap, newNodes);
  },
  iterate: function(fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0,
        maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      if (nodes[reverse ? maxIndex - ii : ii].iterate(fn, reverse) === false) {
        return false;
      }
    }
  }
}, {});
var ArrayNode = function ArrayNode(ownerID, count, nodes) {
  this.ownerID = ownerID;
  this.count = count;
  this.nodes = nodes;
};
var $ArrayNode = ArrayNode;
($traceurRuntime.createClass)(ArrayNode, {
  get: function(shift, hash, key, notSetValue) {
    var idx = (hash >>> shift) & MASK;
    var node = this.nodes[idx];
    return node ? node.get(shift + SHIFT, hash, key, notSetValue) : notSetValue;
  },
  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
    var idx = (hash >>> shift) & MASK;
    var removed = value === NOT_SET;
    var nodes = this.nodes;
    var node = nodes[idx];
    if (removed && !node) {
      return this;
    }
    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeLength, didAlter);
    if (newNode === node) {
      return this;
    }
    var newCount = this.count;
    if (!node) {
      newCount++;
    } else if (!newNode) {
      newCount--;
      if (newCount < MIN_ARRAY_SIZE) {
        return packNodes(ownerID, nodes, newCount, idx);
      }
    }
    var isEditable = ownerID && ownerID === this.ownerID;
    var newNodes = setIn(nodes, idx, newNode, isEditable);
    if (isEditable) {
      this.count = newCount;
      this.nodes = newNodes;
      return this;
    }
    return new $ArrayNode(ownerID, newCount, newNodes);
  },
  iterate: function(fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0,
        maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  }
}, {});
var HashCollisionNode = function HashCollisionNode(ownerID, hash, entries) {
  this.ownerID = ownerID;
  this.hash = hash;
  this.entries = entries;
};
var $HashCollisionNode = HashCollisionNode;
($traceurRuntime.createClass)(HashCollisionNode, {
  get: function(shift, hash, key, notSetValue) {
    var entries = this.entries;
    for (var ii = 0,
        len = entries.length; ii < len; ii++) {
      if (is(key, entries[ii][0])) {
        return entries[ii][1];
      }
    }
    return notSetValue;
  },
  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
    var removed = value === NOT_SET;
    if (hash !== this.hash) {
      if (removed) {
        return this;
      }
      SetRef(didAlter);
      SetRef(didChangeLength);
      return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
    }
    var entries = this.entries;
    var idx = 0;
    for (var len = entries.length; idx < len; idx++) {
      if (is(key, entries[idx][0])) {
        break;
      }
    }
    var exists = idx < len;
    if (removed && !exists) {
      return this;
    }
    SetRef(didAlter);
    (removed || !exists) && SetRef(didChangeLength);
    if (removed && len === 2) {
      return new ValueNode(ownerID, this.hash, entries[idx ^ 1]);
    }
    var isEditable = ownerID && ownerID === this.ownerID;
    var newEntries = isEditable ? entries : arrCopy(entries);
    if (exists) {
      if (removed) {
        idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
      } else {
        newEntries[idx] = [key, value];
      }
    } else {
      newEntries.push([key, value]);
    }
    if (isEditable) {
      this.entries = newEntries;
      return this;
    }
    return new $HashCollisionNode(ownerID, this.hash, newEntries);
  },
  iterate: function(fn, reverse) {
    var entries = this.entries;
    for (var ii = 0,
        maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  }
}, {});
var ValueNode = function ValueNode(ownerID, hash, entry) {
  this.ownerID = ownerID;
  this.hash = hash;
  this.entry = entry;
};
var $ValueNode = ValueNode;
($traceurRuntime.createClass)(ValueNode, {
  get: function(shift, hash, key, notSetValue) {
    return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
  },
  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
    var removed = value === NOT_SET;
    var keyMatch = is(key, this.entry[0]);
    if (keyMatch ? value === this.entry[1] : removed) {
      return this;
    }
    SetRef(didAlter);
    if (removed) {
      SetRef(didChangeLength);
      return null;
    }
    if (keyMatch) {
      if (ownerID && ownerID === this.ownerID) {
        this.entry[1] = value;
        return this;
      }
      return new $ValueNode(ownerID, hash, [key, value]);
    }
    SetRef(didChangeLength);
    return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
  },
  iterate: function(fn) {
    return fn(this.entry);
  }
}, {});
var MapIterator = function MapIterator(map, type, reverse) {
  this._type = type;
  this._reverse = reverse;
  this._stack = map._root && mapIteratorFrame(map._root);
};
($traceurRuntime.createClass)(MapIterator, {next: function() {
    var type = this._type;
    var stack = this._stack;
    while (stack) {
      var node = stack.node;
      var index = stack.index++;
      var maxIndex;
      if (node.entry) {
        if (index === 0) {
          return mapIteratorValue(type, node.entry);
        }
      } else if (node.entries) {
        maxIndex = node.entries.length - 1;
        if (index <= maxIndex) {
          return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
        }
      } else {
        maxIndex = node.nodes.length - 1;
        if (index <= maxIndex) {
          var subNode = node.nodes[this._reverse ? maxIndex - index : index];
          if (subNode) {
            if (subNode.entry) {
              return mapIteratorValue(type, subNode.entry);
            }
            stack = this._stack = mapIteratorFrame(subNode, stack);
          }
          continue;
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }}, {}, SequenceIterator);
function mapIteratorValue(type, entry) {
  return iteratorValue(type === 0 || type === 1 ? entry[type] : [entry[0], entry[1]]);
}
function mapIteratorFrame(node, prev) {
  return {
    node: node,
    index: 0,
    __prev: prev
  };
}
function makeMap(length, root, ownerID, hash) {
  var map = Object.create(MapPrototype);
  map.length = length;
  map._root = root;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}
function updateMap(map, k, v) {
  var didChangeLength = MakeRef(CHANGE_LENGTH);
  var didAlter = MakeRef(DID_ALTER);
  var newRoot = updateNode(map._root, map.__ownerID, 0, hash(k), k, v, didChangeLength, didAlter);
  if (!didAlter.value) {
    return map;
  }
  var newLength = map.length + (didChangeLength.value ? v === NOT_SET ? -1 : 1 : 0);
  if (map.__ownerID) {
    map.length = newLength;
    map._root = newRoot;
    map.__hash = undefined;
    map.__altered = true;
    return map;
  }
  return newRoot ? makeMap(newLength, newRoot) : Map.empty();
}
function updateNode(node, ownerID, shift, hash, key, value, didChangeLength, didAlter) {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    SetRef(didAlter);
    SetRef(didChangeLength);
    return new ValueNode(ownerID, hash, [key, value]);
  }
  return node.update(ownerID, shift, hash, key, value, didChangeLength, didAlter);
}
function isLeafNode(node) {
  return node.constructor === ValueNode || node.constructor === HashCollisionNode;
}
function mergeIntoNode(node, ownerID, shift, hash, entry) {
  if (node.hash === hash) {
    return new HashCollisionNode(ownerID, hash, [node.entry, entry]);
  }
  var idx1 = (node.hash >>> shift) & MASK;
  var idx2 = (hash >>> shift) & MASK;
  var newNode;
  var nodes = idx1 === idx2 ? [mergeIntoNode(node, ownerID, shift + SHIFT, hash, entry)] : ((newNode = new ValueNode(ownerID, hash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);
  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
}
function packNodes(ownerID, nodes, count, excluding) {
  var bitmap = 0;
  var packedII = 0;
  var packedNodes = new Array(count);
  for (var ii = 0,
      bit = 1,
      len = nodes.length; ii < len; ii++, bit <<= 1) {
    var node = nodes[ii];
    if (node != null && ii !== excluding) {
      bitmap |= bit;
      packedNodes[packedII++] = node;
    }
  }
  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
}
function expandNodes(ownerID, nodes, bitmap, including, node) {
  var count = 0;
  var expandedNodes = new Array(SIZE);
  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : null;
  }
  expandedNodes[including] = node;
  return new ArrayNode(ownerID, count + 1, expandedNodes);
}
function mergeIntoMapWith(map, merger, iterables) {
  var seqs = [];
  for (var ii = 0; ii < iterables.length; ii++) {
    var seq = iterables[ii];
    seq && seqs.push(Array.isArray(seq) ? Sequence(seq).fromEntrySeq() : Sequence(seq));
  }
  return mergeIntoCollectionWith(map, merger, seqs);
}
function deepMerger(merger) {
  return (function(existing, value) {
    return existing && existing.mergeDeepWith ? existing.mergeDeepWith(merger, value) : merger ? merger(existing, value) : value;
  });
}
function mergeIntoCollectionWith(collection, merger, seqs) {
  if (seqs.length === 0) {
    return collection;
  }
  return collection.withMutations((function(collection) {
    var mergeIntoMap = merger ? (function(value, key) {
      var existing = collection.get(key, NOT_SET);
      collection.set(key, existing === NOT_SET ? value : merger(existing, value));
    }) : (function(value, key) {
      collection.set(key, value);
    });
    for (var ii = 0; ii < seqs.length; ii++) {
      seqs[ii].forEach(mergeIntoMap);
    }
  }));
}
function updateInDeepMap(collection, keyPath, notSetValue, updater, pathOffset) {
  var pathLen = keyPath.length;
  if (pathOffset === pathLen) {
    return updater(collection);
  }
  invariant(collection.set, 'updateIn with invalid keyPath');
  var notSet = pathOffset === pathLen - 1 ? notSetValue : Map.empty();
  var key = keyPath[pathOffset];
  var existing = collection.get(key, notSet);
  var value = updateInDeepMap(existing, keyPath, notSetValue, updater, pathOffset + 1);
  return value === existing ? collection : collection.set(key, value);
}
function popCount(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x = x + (x >> 8);
  x = x + (x >> 16);
  return x & 0x7f;
}
function setIn(array, idx, val, canEdit) {
  var newArray = canEdit ? array : arrCopy(array);
  newArray[idx] = val;
  return newArray;
}
function spliceIn(array, idx, val, canEdit) {
  var newLen = array.length + 1;
  if (canEdit && idx + 1 === newLen) {
    array[idx] = val;
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      newArray[ii] = val;
      after = -1;
    } else {
      newArray[ii] = array[ii + after];
    }
  }
  return newArray;
}
function spliceOut(array, idx, canEdit) {
  var newLen = array.length - 1;
  if (canEdit && idx === newLen) {
    array.pop();
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      after = 1;
    }
    newArray[ii] = array[ii + after];
  }
  return newArray;
}
var MAX_BITMAP_SIZE = SIZE / 2;
var MIN_ARRAY_SIZE = SIZE / 4;
var EMPTY_MAP;
var Vector = function Vector() {
  for (var values = [],
      $__5 = 0; $__5 < arguments.length; $__5++)
    values[$__5] = arguments[$__5];
  return $Vector.from(values);
};
var $Vector = Vector;
($traceurRuntime.createClass)(Vector, {
  toString: function() {
    return this.__toString('Vector [', ']');
  },
  get: function(index, notSetValue) {
    index = rawIndex(index, this._origin);
    if (index >= this._size) {
      return notSetValue;
    }
    var node = vectorNodeFor(this, index);
    var maskedIndex = index & MASK;
    return node && (notSetValue === undefined || node.array.hasOwnProperty(maskedIndex)) ? node.array[maskedIndex] : notSetValue;
  },
  first: function() {
    return this.get(0);
  },
  last: function() {
    return this.get(this.length ? this.length - 1 : 0);
  },
  set: function(index, value) {
    return updateVector(this, index, value);
  },
  remove: function(index) {
    return updateVector(this, index, NOT_SET);
  },
  clear: function() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = this._origin = this._size = 0;
      this._level = SHIFT;
      this._root = this._tail = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return $Vector.empty();
  },
  push: function() {
    var values = arguments;
    var oldLength = this.length;
    return this.withMutations((function(vect) {
      setVectorBounds(vect, 0, oldLength + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(oldLength + ii, values[ii]);
      }
    }));
  },
  pop: function() {
    return setVectorBounds(this, 0, -1);
  },
  unshift: function() {
    var values = arguments;
    return this.withMutations((function(vect) {
      setVectorBounds(vect, -values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(ii, values[ii]);
      }
    }));
  },
  shift: function() {
    return setVectorBounds(this, 1);
  },
  merge: function() {
    return mergeIntoVectorWith(this, null, arguments);
  },
  mergeWith: function(merger) {
    for (var seqs = [],
        $__6 = 1; $__6 < arguments.length; $__6++)
      seqs[$__6 - 1] = arguments[$__6];
    return mergeIntoVectorWith(this, merger, seqs);
  },
  mergeDeep: function() {
    return mergeIntoVectorWith(this, deepMerger(null), arguments);
  },
  mergeDeepWith: function(merger) {
    for (var seqs = [],
        $__7 = 1; $__7 < arguments.length; $__7++)
      seqs[$__7 - 1] = arguments[$__7];
    return mergeIntoVectorWith(this, deepMerger(merger), seqs);
  },
  setLength: function(length) {
    return setVectorBounds(this, 0, length);
  },
  slice: function(begin, end, maintainIndices) {
    var sliceSequence = $traceurRuntime.superCall(this, $Vector.prototype, "slice", [begin, end, maintainIndices]);
    if (!maintainIndices && sliceSequence !== this) {
      var vector = this;
      var length = vector.length;
      sliceSequence.toVector = (function() {
        return setVectorBounds(vector, begin < 0 ? Math.max(0, length + begin) : length ? Math.min(length, begin) : begin, end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end);
      });
    }
    return sliceSequence;
  },
  keys: function(sparse) {
    return new VectorIterator(this, 0, sparse);
  },
  values: function(sparse) {
    return new VectorIterator(this, 1, sparse);
  },
  entries: function(sparse) {
    return new VectorIterator(this, 2, sparse);
  },
  __iterator: function(reverse, flipIndices, sparse) {
    return new VectorIterator(this, 2, sparse, reverse, flipIndices);
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
      didComplete = iterateVNode(this._tail, 0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse) && iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
    } else {
      didComplete = iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) && iterateVNode(this._tail, 0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse);
    }
    return (didComplete ? maxIndex : reverse ? maxIndex - lastIndex : lastIndex) + 1;
  },
  __deepEquals: function(other) {
    var iterator = this.entries(true);
    return other.every((function(v, i) {
      var entry = iterator.next().value;
      return entry && entry[0] === i && is(entry[1], v);
    }));
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return makeVector(this._origin, this._size, this._level, this._root, this._tail, ownerID, this.__hash);
  }
}, {
  empty: function() {
    return EMPTY_VECT || (EMPTY_VECT = makeVector(0, 0, SHIFT));
  },
  from: function(sequence) {
    if (!sequence || sequence.length === 0) {
      return $Vector.empty();
    }
    if (sequence.constructor === $Vector) {
      return sequence;
    }
    var isArray = Array.isArray(sequence);
    if (sequence.length > 0 && sequence.length < SIZE) {
      return makeVector(0, sequence.length, SHIFT, null, new VNode(isArray ? arrCopy(sequence) : Sequence(sequence).toArray()));
    }
    if (!isArray) {
      sequence = Sequence(sequence);
      if (!(sequence instanceof IndexedSequence)) {
        sequence = sequence.valueSeq();
      }
    }
    return $Vector.empty().merge(sequence);
  }
}, IndexedSequence);
var VectorPrototype = Vector.prototype;
VectorPrototype[DELETE] = VectorPrototype.remove;
VectorPrototype[ITERATOR] = VectorPrototype.values;
VectorPrototype.update = MapPrototype.update;
VectorPrototype.updateIn = MapPrototype.updateIn;
VectorPrototype.cursor = MapPrototype.cursor;
VectorPrototype.withMutations = MapPrototype.withMutations;
VectorPrototype.asMutable = MapPrototype.asMutable;
VectorPrototype.asImmutable = MapPrototype.asImmutable;
VectorPrototype.wasAltered = MapPrototype.wasAltered;
var VNode = function VNode(array, ownerID) {
  this.array = array;
  this.ownerID = ownerID;
};
var $VNode = VNode;
($traceurRuntime.createClass)(VNode, {
  removeBefore: function(ownerID, level, index) {
    if (index === level ? 1 << level : 0 || this.array.length === 0) {
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
    var editable = editableVNode(this, ownerID);
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
    if (index === level ? 1 << level : 0 || this.array.length === 0) {
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
    var editable = editableVNode(this, ownerID);
    if (!removingLast) {
      editable.array.length = sizeIndex + 1;
    }
    if (newChild) {
      editable.array[sizeIndex] = newChild;
    }
    return editable;
  }
}, {});
function iterateVNode(node, level, offset, max, fn, reverse) {
  if (node) {
    var ii;
    var array = node.array;
    var maxII = array.length - 1;
    if (level === 0) {
      for (ii = 0; ii <= maxII; ii++) {
        var rawIndex = reverse ? maxII - ii : ii;
        if (array.hasOwnProperty(rawIndex)) {
          var index = rawIndex + offset;
          if (index >= 0 && index < max && fn(array[rawIndex], index) === false) {
            return false;
          }
        }
      }
    } else {
      var step = 1 << level;
      var newLevel = level - SHIFT;
      for (ii = 0; ii <= maxII; ii++) {
        var levelIndex = reverse ? maxII - ii : ii;
        var newOffset = offset + levelIndex * step;
        if (newOffset < max && newOffset + step > 0) {
          var nextNode = array[levelIndex];
          if (nextNode && !iterateVNode(nextNode, newLevel, newOffset, max, fn, reverse)) {
            return false;
          }
        }
      }
    }
  }
  return true;
}
var VectorIterator = function VectorIterator(vector, type, sparse, reverse, flipIndices) {
  this._type = type;
  this._sparse = !!sparse;
  this._reverse = !!reverse;
  this._flipIndices = !!(flipIndices ^ reverse);
  this._maxIndex = vector.length - 1;
  var tailOffset = getTailOffset(vector._size);
  var rootStack = vectIteratorFrame(vector._root && vector._root.array, vector._level, -vector._origin, tailOffset - vector._origin - 1);
  var tailStack = vectIteratorFrame(vector._tail && vector._tail.array, 0, tailOffset - vector._origin, vector._size - vector._origin - 1);
  this._stack = reverse ? tailStack : rootStack;
  this._stack.__prev = reverse ? rootStack : tailStack;
};
($traceurRuntime.createClass)(VectorIterator, {next: function() {
    var sparse = this._sparse;
    var stack = this._stack;
    while (stack) {
      var array = stack.array;
      var rawIndex = stack.index++;
      if (this._reverse) {
        rawIndex = MASK - rawIndex;
        if (rawIndex > stack.rawMax) {
          rawIndex = stack.rawMax;
          stack.index = SIZE - rawIndex;
        }
      }
      if (rawIndex >= 0 && rawIndex < SIZE && rawIndex <= stack.rawMax) {
        var value = array && array[rawIndex];
        if (stack.level === 0) {
          if (!sparse || value != null || (array && rawIndex < array.length && array.hasOwnProperty(rawIndex))) {
            var type = this._type;
            var index;
            if (type !== 1) {
              index = stack.offset + (rawIndex << stack.level);
              if (this._flipIndices) {
                index = this._maxIndex - index;
              }
            }
            return iteratorValue(type === 0 ? index : type === 1 ? value : [index, value]);
          }
        } else if (!sparse || value != null) {
          this._stack = stack = vectIteratorFrame(value && value.array, stack.level - SHIFT, stack.offset + (rawIndex << stack.level), stack.max, stack);
        }
        continue;
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }}, {}, SequenceIterator);
function vectIteratorFrame(array, level, offset, max, prevFrame) {
  return {
    array: array,
    level: level,
    offset: offset,
    max: max,
    rawMax: ((max - offset) >> level),
    index: 0,
    __prev: prevFrame
  };
}
function makeVector(origin, size, level, root, tail, ownerID, hash) {
  var vect = Object.create(VectorPrototype);
  vect.length = size - origin;
  vect._origin = origin;
  vect._size = size;
  vect._level = level;
  vect._root = root;
  vect._tail = tail;
  vect.__ownerID = ownerID;
  vect.__hash = hash;
  vect.__altered = false;
  return vect;
}
function updateVector(vector, index, value) {
  if (index >= vector.length) {
    return value === NOT_SET ? vector : vector.withMutations((function(vect) {
      setVectorBounds(vect, 0, index + 1).set(index, value);
    }));
  }
  index = rawIndex(index, vector._origin);
  var newTail = vector._tail;
  var newRoot = vector._root;
  var didAlter = MakeRef(DID_ALTER);
  if (index >= getTailOffset(vector._size)) {
    newTail = updateVNode(newTail, vector.__ownerID, 0, index, value, didAlter);
  } else {
    newRoot = updateVNode(newRoot, vector.__ownerID, vector._level, index, value, didAlter);
  }
  if (!didAlter.value) {
    return vector;
  }
  if (vector.__ownerID) {
    vector._root = newRoot;
    vector._tail = newTail;
    vector.__hash = undefined;
    vector.__altered = true;
    return vector;
  }
  return makeVector(vector._origin, vector._size, vector._level, newRoot, newTail);
}
function updateVNode(node, ownerID, level, index, value, didAlter) {
  var removed = value === NOT_SET;
  var newNode;
  var idx = (index >>> level) & MASK;
  var nodeHas = node && idx < node.array.length && node.array.hasOwnProperty(idx);
  if (removed && !nodeHas) {
    return node;
  }
  if (level > 0) {
    var lowerNode = node && node.array[idx];
    var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
    if (newLowerNode === lowerNode) {
      return node;
    }
    newNode = editableVNode(node, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }
  if (!removed && nodeHas && node.array[idx] === value) {
    return node;
  }
  SetRef(didAlter);
  newNode = editableVNode(node, ownerID);
  removed ? (delete newNode.array[idx]) : (newNode.array[idx] = value);
  return newNode;
}
function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
}
function vectorNodeFor(vector, rawIndex) {
  if (rawIndex >= getTailOffset(vector._size)) {
    return vector._tail;
  }
  if (rawIndex < 1 << (vector._level + SHIFT)) {
    var node = vector._root;
    var level = vector._level;
    while (node && level > 0) {
      node = node.array[(rawIndex >>> level) & MASK];
      level -= SHIFT;
    }
    return node;
  }
}
function setVectorBounds(vector, begin, end) {
  var owner = vector.__ownerID || new OwnerID();
  var oldOrigin = vector._origin;
  var oldSize = vector._size;
  var newOrigin = oldOrigin + begin;
  var newSize = end == null ? oldSize : end < 0 ? oldSize + end : oldOrigin + end;
  if (newOrigin === oldOrigin && newSize === oldSize) {
    return vector;
  }
  if (newOrigin >= newSize) {
    return vector.clear();
  }
  var newLevel = vector._level;
  var newRoot = vector._root;
  var offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    newRoot = new VNode(newRoot && newRoot.array.length ? [null, newRoot] : [], owner);
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
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
    newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
    newLevel += SHIFT;
  }
  var oldTail = vector._tail;
  var newTail = newTailOffset < oldTailOffset ? vectorNodeFor(vector, newSize - 1) : newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;
  if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldSize && oldTail.array.length) {
    newRoot = editableVNode(newRoot, owner);
    var node = newRoot;
    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
      var idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }
  if (newSize < oldSize) {
    newTail = newTail && newTail.removeAfter(owner, 0, newSize);
  }
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newSize -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);
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
      newRoot = newRoot && newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot && newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newSize -= offsetShift;
    }
  }
  if (vector.__ownerID) {
    vector.length = newSize - newOrigin;
    vector._origin = newOrigin;
    vector._size = newSize;
    vector._level = newLevel;
    vector._root = newRoot;
    vector._tail = newTail;
    vector.__hash = undefined;
    vector.__altered = true;
    return vector;
  }
  return makeVector(newOrigin, newSize, newLevel, newRoot, newTail);
}
function mergeIntoVectorWith(vector, merger, iterables) {
  var seqs = [];
  for (var ii = 0; ii < iterables.length; ii++) {
    var seq = iterables[ii];
    seq && seqs.push(Sequence(seq));
  }
  var maxLength = Math.max.apply(null, seqs.map((function(s) {
    return s.length || 0;
  })));
  if (maxLength > vector.length) {
    vector = vector.setLength(maxLength);
  }
  return mergeIntoCollectionWith(vector, merger, seqs);
}
function rawIndex(index, origin) {
  invariant(index >= 0, 'Index out of bounds');
  return index + origin;
}
function getTailOffset(size) {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}
var EMPTY_VECT;
var Set = function Set() {
  for (var values = [],
      $__8 = 0; $__8 < arguments.length; $__8++)
    values[$__8] = arguments[$__8];
  return $Set.from(values);
};
var $Set = Set;
($traceurRuntime.createClass)(Set, {
  toString: function() {
    return this.__toString('Set {', '}');
  },
  has: function(value) {
    return this._map.has(value);
  },
  get: function(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  },
  add: function(value) {
    var newMap = this._map.set(value, null);
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : makeSet(newMap);
  },
  remove: function(value) {
    var newMap = this._map.remove(value);
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : newMap.length === 0 ? $Set.empty() : makeSet(newMap);
  },
  clear: function() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
      this._map.clear();
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
        Sequence(seqs[ii]).forEach((function(value) {
          return set.add(value);
        }));
      }
    }));
  },
  intersect: function() {
    for (var seqs = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      seqs[$__9] = arguments[$__9];
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
          set.remove(value);
        }
      }));
    }));
  },
  subtract: function() {
    for (var seqs = [],
        $__10 = 0; $__10 < arguments.length; $__10++)
      seqs[$__10] = arguments[$__10];
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
          set.remove(value);
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
  wasAltered: function() {
    return this._map.wasAltered();
  },
  values: function() {
    return this._map.keys();
  },
  entries: function() {
    return iteratorMapper(this.values(), (function(key) {
      return [key, key];
    }));
  },
  hashCode: function() {
    return this._map.hashCode();
  },
  equals: function(other) {
    return this._map.equals(other._map);
  },
  __iterate: function(fn, reverse) {
    var collection = this;
    return this._map.__iterate((function(_, k) {
      return fn(k, k, collection);
    }), reverse);
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return makeSet(newMap, ownerID);
  }
}, {
  empty: function() {
    return EMPTY_SET || (EMPTY_SET = makeSet(Map.empty()));
  },
  from: function(sequence) {
    var set = $Set.empty();
    return sequence ? sequence.constructor === $Set ? sequence : set.union(sequence) : set;
  },
  fromKeys: function(sequence) {
    return $Set.from(Sequence(sequence).flip());
  }
}, Sequence);
var SetPrototype = Set.prototype;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype[ITERATOR] = SetPrototype.keys = SetPrototype.values;
SetPrototype.contains = SetPrototype.has;
SetPrototype.mergeDeep = SetPrototype.merge = SetPrototype.union;
SetPrototype.mergeDeepWith = SetPrototype.mergeWith = function(merger) {
  for (var seqs = [],
      $__11 = 1; $__11 < arguments.length; $__11++)
    seqs[$__11 - 1] = arguments[$__11];
  return this.merge.apply(this, seqs);
};
SetPrototype.withMutations = MapPrototype.withMutations;
SetPrototype.asMutable = MapPrototype.asMutable;
SetPrototype.asImmutable = MapPrototype.asImmutable;
SetPrototype.__toJS = IndexedSequencePrototype.__toJS;
SetPrototype.__toStringMapper = IndexedSequencePrototype.__toStringMapper;
function makeSet(map, ownerID) {
  var set = Object.create(SetPrototype);
  set.length = map ? map.length : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}
var EMPTY_SET;
var OrderedMap = function OrderedMap(sequence) {
  var map = $OrderedMap.empty();
  return sequence ? sequence.constructor === $OrderedMap ? sequence : map.merge(sequence) : map;
};
var $OrderedMap = OrderedMap;
($traceurRuntime.createClass)(OrderedMap, {
  toString: function() {
    return this.__toString('OrderedMap {', '}');
  },
  get: function(k, notSetValue) {
    var index = this._map.get(k);
    return index != null ? this._vector.get(index)[1] : notSetValue;
  },
  clear: function() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
      this._map.clear();
      this._vector.clear();
      return this;
    }
    return $OrderedMap.empty();
  },
  set: function(k, v) {
    return updateOrderedMap(this, k, v);
  },
  remove: function(k) {
    return updateOrderedMap(this, k, NOT_SET);
  },
  wasAltered: function() {
    return this._map.wasAltered() || this._vector.wasAltered();
  },
  keys: function() {
    return iteratorMapper(this.entries(), (function(entry) {
      return entry[0];
    }));
  },
  values: function() {
    return iteratorMapper(this.entries(), (function(entry) {
      return entry[1];
    }));
  },
  entries: function() {
    return this._vector.values(true);
  },
  __iterate: function(fn, reverse) {
    return this._vector.fromEntrySeq().__iterate(fn, reverse);
  },
  __deepEqual: function(other) {
    var iterator = this.entries();
    return other.every((function(v, k) {
      var entry = iterator.next().value;
      return entry && is(entry[0], k) && is(entry[1], v);
    }));
  },
  __ensureOwner: function(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    var newVector = this._vector.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return makeOrderedMap(newMap, newVector, ownerID, this.__hash);
  }
}, {empty: function() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(Map.empty(), Vector.empty()));
  }}, Map);
OrderedMap.from = OrderedMap;
OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;
function makeOrderedMap(map, vector, ownerID, hash) {
  var omap = Object.create(OrderedMap.prototype);
  omap.length = map ? map.length : 0;
  omap._map = map;
  omap._vector = vector;
  omap.__ownerID = ownerID;
  omap.__hash = hash;
  return omap;
}
function updateOrderedMap(omap, k, v) {
  var map = omap._map;
  var vector = omap._vector;
  var i = map.get(k);
  var has = i !== undefined;
  var removed = v === NOT_SET;
  if ((!has && removed) || (has && v === vector.get(i)[1])) {
    return omap;
  }
  if (!has) {
    i = vector.length;
  }
  var newMap = removed ? map.remove(k) : has ? map : map.set(k, i);
  var newVector = removed ? vector.remove(i) : vector.set(i, [k, v]);
  if (omap.__ownerID) {
    omap.length = newMap.length;
    omap._map = newMap;
    omap._vector = newVector;
    omap.__hash = undefined;
    return omap;
  }
  return makeOrderedMap(newMap, newVector);
}
var EMPTY_ORDERED_MAP;
var Record = function Record(defaultValues, name) {
  var RecordType = function(values) {
    if (!(this instanceof RecordType)) {
      return new RecordType(values);
    }
    this._map = Map(values);
  };
  defaultValues = Sequence(defaultValues);
  var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
  RecordTypePrototype.constructor = RecordType;
  RecordTypePrototype._name = name;
  RecordTypePrototype._defaultValues = defaultValues;
  var keys = Object.keys(defaultValues);
  RecordType.prototype.length = keys.length;
  if (Object.defineProperty) {
    defaultValues.forEach((function(_, key) {
      Object.defineProperty(RecordType.prototype, key, {
        get: function() {
          return this.get(key);
        },
        set: function(value) {
          invariant(this.__ownerID, 'Cannot set on an immutable record.');
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
  get: function(k, notSetValue) {
    if (notSetValue !== undefined && !this.has(k)) {
      return notSetValue;
    }
    return this._map.get(k, this._defaultValues.get(k));
  },
  clear: function() {
    if (this.__ownerID) {
      this._map.clear();
      return this;
    }
    var Record = Object.getPrototypeOf(this).constructor;
    return $Record._empty || ($Record._empty = makeRecord(this, Map.empty()));
  },
  set: function(k, v) {
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this._map.set(k, v);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  },
  remove: function(k) {
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this._map.remove(k);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  },
  keys: function() {
    return this._map.keys();
  },
  values: function() {
    return this._map.values();
  },
  entries: function() {
    return this._map.entries();
  },
  wasAltered: function() {
    return this._map.wasAltered();
  },
  __iterate: function(fn, reverse) {
    var record = this;
    return this._defaultValues.map((function(_, k) {
      return record.get(k);
    })).__iterate(fn, reverse);
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
    return makeRecord(this, newMap, ownerID);
  }
}, {}, Sequence);
var RecordPrototype = Record.prototype;
RecordPrototype[DELETE] = RecordPrototype.remove;
RecordPrototype[ITERATOR] = MapPrototype[ITERATOR];
RecordPrototype.merge = MapPrototype.merge;
RecordPrototype.mergeWith = MapPrototype.mergeWith;
RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
RecordPrototype.update = MapPrototype.update;
RecordPrototype.updateIn = MapPrototype.updateIn;
RecordPrototype.cursor = MapPrototype.cursor;
RecordPrototype.withMutations = MapPrototype.withMutations;
RecordPrototype.asMutable = MapPrototype.asMutable;
RecordPrototype.asImmutable = MapPrototype.asImmutable;
RecordPrototype.__deepEqual = MapPrototype.__deepEqual;
function makeRecord(likeRecord, map, ownerID) {
  var record = Object.create(Object.getPrototypeOf(likeRecord));
  record._map = map;
  record.__ownerID = ownerID;
  return record;
}
var Range = function Range(start, end, step) {
  if (!(this instanceof $Range)) {
    return new $Range(start, end, step);
  }
  invariant(step !== 0, 'Cannot step a Range by 0');
  start = start || 0;
  if (end == null) {
    end = Infinity;
  }
  if (start === end && __EMPTY_RANGE) {
    return __EMPTY_RANGE;
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
  get: function(index, notSetValue) {
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ? this._start + index * this._step : notSetValue;
  },
  contains: function(searchValue) {
    var possibleIndex = (searchValue - this._start) / this._step;
    return possibleIndex >= 0 && possibleIndex < this.length && possibleIndex === Math.floor(possibleIndex);
  },
  slice: function(begin, end, maintainIndices) {
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    if (maintainIndices) {
      return $traceurRuntime.superCall(this, $Range.prototype, "slice", [begin, end, maintainIndices]);
    }
    begin = resolveBegin(begin, this.length);
    end = resolveEnd(end, this.length);
    if (end <= begin) {
      return __EMPTY_RANGE;
    }
    return new $Range(this.get(begin, this._end), this.get(end, this._end), this._step);
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
  },
  __deepEquals: function(other) {
    return this._start === other._start && this._end === other._end && this._step === other._step;
  }
}, {}, IndexedSequence);
var RangePrototype = Range.prototype;
RangePrototype.__toJS = RangePrototype.toArray;
RangePrototype.first = VectorPrototype.first;
RangePrototype.last = VectorPrototype.last;
var __EMPTY_RANGE = Range(0, 0);
var Repeat = function Repeat(value, times) {
  if (times === 0 && EMPTY_REPEAT) {
    return EMPTY_REPEAT;
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
  get: function(index, notSetValue) {
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ? this._value : notSetValue;
  },
  first: function() {
    return this._value;
  },
  contains: function(searchValue) {
    return is(this._value, searchValue);
  },
  slice: function(begin, end, maintainIndices) {
    if (maintainIndices) {
      return $traceurRuntime.superCall(this, $Repeat.prototype, "slice", [begin, end, maintainIndices]);
    }
    var length = this.length;
    begin = begin < 0 ? Math.max(0, length + begin) : Math.min(length, begin);
    end = end == null ? length : end > 0 ? Math.min(length, end) : Math.max(0, length + end);
    return end > begin ? new $Repeat(this._value, end - begin) : EMPTY_REPEAT;
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
  },
  __deepEquals: function(other) {
    return is(this._value, other._value);
  }
}, {}, IndexedSequence);
var RepeatPrototype = Repeat.prototype;
RepeatPrototype.last = RepeatPrototype.first;
RepeatPrototype.has = RangePrototype.has;
RepeatPrototype.take = RangePrototype.take;
RepeatPrototype.skip = RangePrototype.skip;
RepeatPrototype.__toJS = RangePrototype.__toJS;
var EMPTY_REPEAT = new Repeat(undefined, 0);
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
