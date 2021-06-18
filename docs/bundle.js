require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * MIT License
 * 
 * Copyright (c) 2014-present, Lee Byron and other contributors.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Immutable = {}));
}(this, (function (exports) { 'use strict';

  var DELETE = 'delete';

  // Constants describing the size of trie nodes.
  var SHIFT = 5; // Resulted in best performance after ______?
  var SIZE = 1 << SHIFT;
  var MASK = SIZE - 1;

  // A consistent shared value representing "not set" which equals nothing other
  // than itself, and nothing that could be provided externally.
  var NOT_SET = {};

  // Boolean references, Rough equivalent of `bool &`.
  function MakeRef() {
    return { value: false };
  }

  function SetRef(ref) {
    if (ref) {
      ref.value = true;
    }
  }

  // A function which returns a value representing an "owner" for transient writes
  // to tries. The return value will only ever equal itself, and will not equal
  // the return of any subsequent call of this function.
  function OwnerID() {}

  function ensureSize(iter) {
    if (iter.size === undefined) {
      iter.size = iter.__iterate(returnTrue);
    }
    return iter.size;
  }

  function wrapIndex(iter, index) {
    // This implements "is array index" which the ECMAString spec defines as:
    //
    //     A String property name P is an array index if and only if
    //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
    //     to 2^32−1.
    //
    // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
    if (typeof index !== 'number') {
      var uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
      if ('' + uint32Index !== index || uint32Index === 4294967295) {
        return NaN;
      }
      index = uint32Index;
    }
    return index < 0 ? ensureSize(iter) + index : index;
  }

  function returnTrue() {
    return true;
  }

  function wholeSlice(begin, end, size) {
    return (
      ((begin === 0 && !isNeg(begin)) ||
        (size !== undefined && begin <= -size)) &&
      (end === undefined || (size !== undefined && end >= size))
    );
  }

  function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
  }

  function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
  }

  function resolveIndex(index, size, defaultIndex) {
    // Sanitize indices using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    return index === undefined
      ? defaultIndex
      : isNeg(index)
      ? size === Infinity
        ? size
        : Math.max(0, size + index) | 0
      : size === undefined || size === index
      ? index
      : Math.min(size, index) | 0;
  }

  function isNeg(value) {
    // Account for -0 which is negative, but not less than 0.
    return value < 0 || (value === 0 && 1 / value === -Infinity);
  }

  var IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';

  function isCollection(maybeCollection) {
    return Boolean(maybeCollection && maybeCollection[IS_COLLECTION_SYMBOL]);
  }

  var IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';

  function isKeyed(maybeKeyed) {
    return Boolean(maybeKeyed && maybeKeyed[IS_KEYED_SYMBOL]);
  }

  var IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';

  function isIndexed(maybeIndexed) {
    return Boolean(maybeIndexed && maybeIndexed[IS_INDEXED_SYMBOL]);
  }

  function isAssociative(maybeAssociative) {
    return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
  }

  var Collection = function Collection(value) {
    return isCollection(value) ? value : Seq(value);
  };

  var KeyedCollection = /*@__PURE__*/(function (Collection) {
    function KeyedCollection(value) {
      return isKeyed(value) ? value : KeyedSeq(value);
    }

    if ( Collection ) KeyedCollection.__proto__ = Collection;
    KeyedCollection.prototype = Object.create( Collection && Collection.prototype );
    KeyedCollection.prototype.constructor = KeyedCollection;

    return KeyedCollection;
  }(Collection));

  var IndexedCollection = /*@__PURE__*/(function (Collection) {
    function IndexedCollection(value) {
      return isIndexed(value) ? value : IndexedSeq(value);
    }

    if ( Collection ) IndexedCollection.__proto__ = Collection;
    IndexedCollection.prototype = Object.create( Collection && Collection.prototype );
    IndexedCollection.prototype.constructor = IndexedCollection;

    return IndexedCollection;
  }(Collection));

  var SetCollection = /*@__PURE__*/(function (Collection) {
    function SetCollection(value) {
      return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
    }

    if ( Collection ) SetCollection.__proto__ = Collection;
    SetCollection.prototype = Object.create( Collection && Collection.prototype );
    SetCollection.prototype.constructor = SetCollection;

    return SetCollection;
  }(Collection));

  Collection.Keyed = KeyedCollection;
  Collection.Indexed = IndexedCollection;
  Collection.Set = SetCollection;

  var IS_SEQ_SYMBOL = '@@__IMMUTABLE_SEQ__@@';

  function isSeq(maybeSeq) {
    return Boolean(maybeSeq && maybeSeq[IS_SEQ_SYMBOL]);
  }

  var IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';

  function isRecord(maybeRecord) {
    return Boolean(maybeRecord && maybeRecord[IS_RECORD_SYMBOL]);
  }

  function isImmutable(maybeImmutable) {
    return isCollection(maybeImmutable) || isRecord(maybeImmutable);
  }

  var IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

  function isOrdered(maybeOrdered) {
    return Boolean(maybeOrdered && maybeOrdered[IS_ORDERED_SYMBOL]);
  }

  var ITERATE_KEYS = 0;
  var ITERATE_VALUES = 1;
  var ITERATE_ENTRIES = 2;

  var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';

  var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;

  var Iterator = function Iterator(next) {
    this.next = next;
  };

  Iterator.prototype.toString = function toString () {
    return '[Iterator]';
  };

  Iterator.KEYS = ITERATE_KEYS;
  Iterator.VALUES = ITERATE_VALUES;
  Iterator.ENTRIES = ITERATE_ENTRIES;

  Iterator.prototype.inspect = Iterator.prototype.toSource = function () {
    return this.toString();
  };
  Iterator.prototype[ITERATOR_SYMBOL] = function () {
    return this;
  };

  function iteratorValue(type, k, v, iteratorResult) {
    var value = type === 0 ? k : type === 1 ? v : [k, v];
    iteratorResult
      ? (iteratorResult.value = value)
      : (iteratorResult = {
          value: value,
          done: false,
        });
    return iteratorResult;
  }

  function iteratorDone() {
    return { value: undefined, done: true };
  }

  function hasIterator(maybeIterable) {
    return !!getIteratorFn(maybeIterable);
  }

  function isIterator(maybeIterator) {
    return maybeIterator && typeof maybeIterator.next === 'function';
  }

  function getIterator(iterable) {
    var iteratorFn = getIteratorFn(iterable);
    return iteratorFn && iteratorFn.call(iterable);
  }

  function getIteratorFn(iterable) {
    var iteratorFn =
      iterable &&
      ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
        iterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  function isArrayLike(value) {
    if (Array.isArray(value) || typeof value === 'string') {
      return true;
    }

    return (
      value &&
      typeof value === 'object' &&
      Number.isInteger(value.length) &&
      value.length >= 0 &&
      (value.length === 0
        ? // Only {length: 0} is considered Array-like.
          Object.keys(value).length === 1
        : // An object is only Array-like if it has a property where the last value
          // in the array-like may be found (which could be undefined).
          value.hasOwnProperty(value.length - 1))
    );
  }

  var Seq = /*@__PURE__*/(function (Collection) {
    function Seq(value) {
      return value === null || value === undefined
        ? emptySequence()
        : isImmutable(value)
        ? value.toSeq()
        : seqFromValue(value);
    }

    if ( Collection ) Seq.__proto__ = Collection;
    Seq.prototype = Object.create( Collection && Collection.prototype );
    Seq.prototype.constructor = Seq;

    Seq.prototype.toSeq = function toSeq () {
      return this;
    };

    Seq.prototype.toString = function toString () {
      return this.__toString('Seq {', '}');
    };

    Seq.prototype.cacheResult = function cacheResult () {
      if (!this._cache && this.__iterateUncached) {
        this._cache = this.entrySeq().toArray();
        this.size = this._cache.length;
      }
      return this;
    };

    // abstract __iterateUncached(fn, reverse)

    Seq.prototype.__iterate = function __iterate (fn, reverse) {
      var cache = this._cache;
      if (cache) {
        var size = cache.length;
        var i = 0;
        while (i !== size) {
          var entry = cache[reverse ? size - ++i : i++];
          if (fn(entry[1], entry[0], this) === false) {
            break;
          }
        }
        return i;
      }
      return this.__iterateUncached(fn, reverse);
    };

    // abstract __iteratorUncached(type, reverse)

    Seq.prototype.__iterator = function __iterator (type, reverse) {
      var cache = this._cache;
      if (cache) {
        var size = cache.length;
        var i = 0;
        return new Iterator(function () {
          if (i === size) {
            return iteratorDone();
          }
          var entry = cache[reverse ? size - ++i : i++];
          return iteratorValue(type, entry[0], entry[1]);
        });
      }
      return this.__iteratorUncached(type, reverse);
    };

    return Seq;
  }(Collection));

  var KeyedSeq = /*@__PURE__*/(function (Seq) {
    function KeyedSeq(value) {
      return value === null || value === undefined
        ? emptySequence().toKeyedSeq()
        : isCollection(value)
        ? isKeyed(value)
          ? value.toSeq()
          : value.fromEntrySeq()
        : isRecord(value)
        ? value.toSeq()
        : keyedSeqFromValue(value);
    }

    if ( Seq ) KeyedSeq.__proto__ = Seq;
    KeyedSeq.prototype = Object.create( Seq && Seq.prototype );
    KeyedSeq.prototype.constructor = KeyedSeq;

    KeyedSeq.prototype.toKeyedSeq = function toKeyedSeq () {
      return this;
    };

    return KeyedSeq;
  }(Seq));

  var IndexedSeq = /*@__PURE__*/(function (Seq) {
    function IndexedSeq(value) {
      return value === null || value === undefined
        ? emptySequence()
        : isCollection(value)
        ? isKeyed(value)
          ? value.entrySeq()
          : value.toIndexedSeq()
        : isRecord(value)
        ? value.toSeq().entrySeq()
        : indexedSeqFromValue(value);
    }

    if ( Seq ) IndexedSeq.__proto__ = Seq;
    IndexedSeq.prototype = Object.create( Seq && Seq.prototype );
    IndexedSeq.prototype.constructor = IndexedSeq;

    IndexedSeq.of = function of (/*...values*/) {
      return IndexedSeq(arguments);
    };

    IndexedSeq.prototype.toIndexedSeq = function toIndexedSeq () {
      return this;
    };

    IndexedSeq.prototype.toString = function toString () {
      return this.__toString('Seq [', ']');
    };

    return IndexedSeq;
  }(Seq));

  var SetSeq = /*@__PURE__*/(function (Seq) {
    function SetSeq(value) {
      return (
        isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)
      ).toSetSeq();
    }

    if ( Seq ) SetSeq.__proto__ = Seq;
    SetSeq.prototype = Object.create( Seq && Seq.prototype );
    SetSeq.prototype.constructor = SetSeq;

    SetSeq.of = function of (/*...values*/) {
      return SetSeq(arguments);
    };

    SetSeq.prototype.toSetSeq = function toSetSeq () {
      return this;
    };

    return SetSeq;
  }(Seq));

  Seq.isSeq = isSeq;
  Seq.Keyed = KeyedSeq;
  Seq.Set = SetSeq;
  Seq.Indexed = IndexedSeq;

  Seq.prototype[IS_SEQ_SYMBOL] = true;

  // #pragma Root Sequences

  var ArraySeq = /*@__PURE__*/(function (IndexedSeq) {
    function ArraySeq(array) {
      this._array = array;
      this.size = array.length;
    }

    if ( IndexedSeq ) ArraySeq.__proto__ = IndexedSeq;
    ArraySeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
    ArraySeq.prototype.constructor = ArraySeq;

    ArraySeq.prototype.get = function get (index, notSetValue) {
      return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
    };

    ArraySeq.prototype.__iterate = function __iterate (fn, reverse) {
      var array = this._array;
      var size = array.length;
      var i = 0;
      while (i !== size) {
        var ii = reverse ? size - ++i : i++;
        if (fn(array[ii], ii, this) === false) {
          break;
        }
      }
      return i;
    };

    ArraySeq.prototype.__iterator = function __iterator (type, reverse) {
      var array = this._array;
      var size = array.length;
      var i = 0;
      return new Iterator(function () {
        if (i === size) {
          return iteratorDone();
        }
        var ii = reverse ? size - ++i : i++;
        return iteratorValue(type, ii, array[ii]);
      });
    };

    return ArraySeq;
  }(IndexedSeq));

  var ObjectSeq = /*@__PURE__*/(function (KeyedSeq) {
    function ObjectSeq(object) {
      var keys = Object.keys(object);
      this._object = object;
      this._keys = keys;
      this.size = keys.length;
    }

    if ( KeyedSeq ) ObjectSeq.__proto__ = KeyedSeq;
    ObjectSeq.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
    ObjectSeq.prototype.constructor = ObjectSeq;

    ObjectSeq.prototype.get = function get (key, notSetValue) {
      if (notSetValue !== undefined && !this.has(key)) {
        return notSetValue;
      }
      return this._object[key];
    };

    ObjectSeq.prototype.has = function has (key) {
      return hasOwnProperty.call(this._object, key);
    };

    ObjectSeq.prototype.__iterate = function __iterate (fn, reverse) {
      var object = this._object;
      var keys = this._keys;
      var size = keys.length;
      var i = 0;
      while (i !== size) {
        var key = keys[reverse ? size - ++i : i++];
        if (fn(object[key], key, this) === false) {
          break;
        }
      }
      return i;
    };

    ObjectSeq.prototype.__iterator = function __iterator (type, reverse) {
      var object = this._object;
      var keys = this._keys;
      var size = keys.length;
      var i = 0;
      return new Iterator(function () {
        if (i === size) {
          return iteratorDone();
        }
        var key = keys[reverse ? size - ++i : i++];
        return iteratorValue(type, key, object[key]);
      });
    };

    return ObjectSeq;
  }(KeyedSeq));
  ObjectSeq.prototype[IS_ORDERED_SYMBOL] = true;

  var CollectionSeq = /*@__PURE__*/(function (IndexedSeq) {
    function CollectionSeq(collection) {
      this._collection = collection;
      this.size = collection.length || collection.size;
    }

    if ( IndexedSeq ) CollectionSeq.__proto__ = IndexedSeq;
    CollectionSeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
    CollectionSeq.prototype.constructor = CollectionSeq;

    CollectionSeq.prototype.__iterateUncached = function __iterateUncached (fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var collection = this._collection;
      var iterator = getIterator(collection);
      var iterations = 0;
      if (isIterator(iterator)) {
        var step;
        while (!(step = iterator.next()).done) {
          if (fn(step.value, iterations++, this) === false) {
            break;
          }
        }
      }
      return iterations;
    };

    CollectionSeq.prototype.__iteratorUncached = function __iteratorUncached (type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var collection = this._collection;
      var iterator = getIterator(collection);
      if (!isIterator(iterator)) {
        return new Iterator(iteratorDone);
      }
      var iterations = 0;
      return new Iterator(function () {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, iterations++, step.value);
      });
    };

    return CollectionSeq;
  }(IndexedSeq));

  // # pragma Helper functions

  var EMPTY_SEQ;

  function emptySequence() {
    return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
  }

  function keyedSeqFromValue(value) {
    var seq = Array.isArray(value)
      ? new ArraySeq(value)
      : hasIterator(value)
      ? new CollectionSeq(value)
      : undefined;
    if (seq) {
      return seq.fromEntrySeq();
    }
    if (typeof value === 'object') {
      return new ObjectSeq(value);
    }
    throw new TypeError(
      'Expected Array or collection object of [k, v] entries, or keyed object: ' +
        value
    );
  }

  function indexedSeqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value);
    if (seq) {
      return seq;
    }
    throw new TypeError(
      'Expected Array or collection object of values: ' + value
    );
  }

  function seqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value);
    if (seq) {
      return seq;
    }
    if (typeof value === 'object') {
      return new ObjectSeq(value);
    }
    throw new TypeError(
      'Expected Array or collection object of values, or keyed object: ' + value
    );
  }

  function maybeIndexedSeqFromValue(value) {
    return isArrayLike(value)
      ? new ArraySeq(value)
      : hasIterator(value)
      ? new CollectionSeq(value)
      : undefined;
  }

  var IS_MAP_SYMBOL = '@@__IMMUTABLE_MAP__@@';

  function isMap(maybeMap) {
    return Boolean(maybeMap && maybeMap[IS_MAP_SYMBOL]);
  }

  function isOrderedMap(maybeOrderedMap) {
    return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
  }

  function isValueObject(maybeValue) {
    return Boolean(
      maybeValue &&
        typeof maybeValue.equals === 'function' &&
        typeof maybeValue.hashCode === 'function'
    );
  }

  /**
   * An extension of the "same-value" algorithm as [described for use by ES6 Map
   * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
   *
   * NaN is considered the same as NaN, however -0 and 0 are considered the same
   * value, which is different from the algorithm described by
   * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
   *
   * This is extended further to allow Objects to describe the values they
   * represent, by way of `valueOf` or `equals` (and `hashCode`).
   *
   * Note: because of this extension, the key equality of Immutable.Map and the
   * value equality of Immutable.Set will differ from ES6 Map and Set.
   *
   * ### Defining custom values
   *
   * The easiest way to describe the value an object represents is by implementing
   * `valueOf`. For example, `Date` represents a value by returning a unix
   * timestamp for `valueOf`:
   *
   *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
   *     var date2 = new Date(1234567890000);
   *     date1.valueOf(); // 1234567890000
   *     assert( date1 !== date2 );
   *     assert( Immutable.is( date1, date2 ) );
   *
   * Note: overriding `valueOf` may have other implications if you use this object
   * where JavaScript expects a primitive, such as implicit string coercion.
   *
   * For more complex types, especially collections, implementing `valueOf` may
   * not be performant. An alternative is to implement `equals` and `hashCode`.
   *
   * `equals` takes another object, presumably of similar type, and returns true
   * if it is equal. Equality is symmetrical, so the same result should be
   * returned if this and the argument are flipped.
   *
   *     assert( a.equals(b) === b.equals(a) );
   *
   * `hashCode` returns a 32bit integer number representing the object which will
   * be used to determine how to store the value object in a Map or Set. You must
   * provide both or neither methods, one must not exist without the other.
   *
   * Also, an important relationship between these methods must be upheld: if two
   * values are equal, they *must* return the same hashCode. If the values are not
   * equal, they might have the same hashCode; this is called a hash collision,
   * and while undesirable for performance reasons, it is acceptable.
   *
   *     if (a.equals(b)) {
   *       assert( a.hashCode() === b.hashCode() );
   *     }
   *
   * All Immutable collections are Value Objects: they implement `equals()`
   * and `hashCode()`.
   */
  function is(valueA, valueB) {
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
    if (
      typeof valueA.valueOf === 'function' &&
      typeof valueB.valueOf === 'function'
    ) {
      valueA = valueA.valueOf();
      valueB = valueB.valueOf();
      if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
        return true;
      }
      if (!valueA || !valueB) {
        return false;
      }
    }
    return !!(
      isValueObject(valueA) &&
      isValueObject(valueB) &&
      valueA.equals(valueB)
    );
  }

  var imul =
    typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2
      ? Math.imul
      : function imul(a, b) {
          a |= 0; // int
          b |= 0; // int
          var c = a & 0xffff;
          var d = b & 0xffff;
          // Shift by 0 fixes the sign on the high part.
          return (c * d + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0)) | 0; // int
        };

  // v8 has an optimization for storing 31-bit signed numbers.
  // Values which have either 00 or 11 as the high order bits qualify.
  // This function drops the highest order bit in a signed number, maintaining
  // the sign bit.
  function smi(i32) {
    return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
  }

  var defaultValueOf = Object.prototype.valueOf;

  function hash(o) {
    switch (typeof o) {
      case 'boolean':
        // The hash values for built-in constants are a 1 value for each 5-byte
        // shift region expect for the first, which encodes the value. This
        // reduces the odds of a hash collision for these common values.
        return o ? 0x42108421 : 0x42108420;
      case 'number':
        return hashNumber(o);
      case 'string':
        return o.length > STRING_HASH_CACHE_MIN_STRLEN
          ? cachedHashString(o)
          : hashString(o);
      case 'object':
      case 'function':
        if (o === null) {
          return 0x42108422;
        }
        if (typeof o.hashCode === 'function') {
          // Drop any high bits from accidentally long hash codes.
          return smi(o.hashCode(o));
        }
        if (o.valueOf !== defaultValueOf && typeof o.valueOf === 'function') {
          o = o.valueOf(o);
        }
        return hashJSObj(o);
      case 'undefined':
        return 0x42108423;
      default:
        if (typeof o.toString === 'function') {
          return hashString(o.toString());
        }
        throw new Error('Value type ' + typeof o + ' cannot be hashed.');
    }
  }

  // Compress arbitrarily large numbers into smi hashes.
  function hashNumber(n) {
    if (n !== n || n === Infinity) {
      return 0;
    }
    var hash = n | 0;
    if (hash !== n) {
      hash ^= n * 0xffffffff;
    }
    while (n > 0xffffffff) {
      n /= 0xffffffff;
      hash ^= n;
    }
    return smi(hash);
  }

  function cachedHashString(string) {
    var hashed = stringHashCache[string];
    if (hashed === undefined) {
      hashed = hashString(string);
      if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
        STRING_HASH_CACHE_SIZE = 0;
        stringHashCache = {};
      }
      STRING_HASH_CACHE_SIZE++;
      stringHashCache[string] = hashed;
    }
    return hashed;
  }

  // http://jsperf.com/hashing-strings
  function hashString(string) {
    // This is the hash from JVM
    // The hash code for a string is computed as
    // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
    // where s[i] is the ith character of the string and n is the length of
    // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
    // (exclusive) by dropping high bits.
    var hashed = 0;
    for (var ii = 0; ii < string.length; ii++) {
      hashed = (31 * hashed + string.charCodeAt(ii)) | 0;
    }
    return smi(hashed);
  }

  function hashJSObj(obj) {
    var hashed;
    if (usingWeakMap) {
      hashed = weakMap.get(obj);
      if (hashed !== undefined) {
        return hashed;
      }
    }

    hashed = obj[UID_HASH_KEY];
    if (hashed !== undefined) {
      return hashed;
    }

    if (!canDefineProperty) {
      hashed = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
      if (hashed !== undefined) {
        return hashed;
      }

      hashed = getIENodeHash(obj);
      if (hashed !== undefined) {
        return hashed;
      }
    }

    hashed = ++objHashUID;
    if (objHashUID & 0x40000000) {
      objHashUID = 0;
    }

    if (usingWeakMap) {
      weakMap.set(obj, hashed);
    } else if (isExtensible !== undefined && isExtensible(obj) === false) {
      throw new Error('Non-extensible objects are not allowed as keys.');
    } else if (canDefineProperty) {
      Object.defineProperty(obj, UID_HASH_KEY, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: hashed,
      });
    } else if (
      obj.propertyIsEnumerable !== undefined &&
      obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable
    ) {
      // Since we can't define a non-enumerable property on the object
      // we'll hijack one of the less-used non-enumerable properties to
      // save our hash on it. Since this is a function it will not show up in
      // `JSON.stringify` which is what we want.
      obj.propertyIsEnumerable = function () {
        return this.constructor.prototype.propertyIsEnumerable.apply(
          this,
          arguments
        );
      };
      obj.propertyIsEnumerable[UID_HASH_KEY] = hashed;
    } else if (obj.nodeType !== undefined) {
      // At this point we couldn't get the IE `uniqueID` to use as a hash
      // and we couldn't use a non-enumerable property to exploit the
      // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
      // itself.
      obj[UID_HASH_KEY] = hashed;
    } else {
      throw new Error('Unable to set a non-enumerable property on object.');
    }

    return hashed;
  }

  // Get references to ES5 object methods.
  var isExtensible = Object.isExtensible;

  // True if Object.defineProperty works as expected. IE8 fails this test.
  var canDefineProperty = (function () {
    try {
      Object.defineProperty({}, '@', {});
      return true;
    } catch (e) {
      return false;
    }
  })();

  // IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
  // and avoid memory leaks from the IE cloneNode bug.
  function getIENodeHash(node) {
    if (node && node.nodeType > 0) {
      switch (node.nodeType) {
        case 1: // Element
          return node.uniqueID;
        case 9: // Document
          return node.documentElement && node.documentElement.uniqueID;
      }
    }
  }

  // If possible, use a WeakMap.
  var usingWeakMap = typeof WeakMap === 'function';
  var weakMap;
  if (usingWeakMap) {
    weakMap = new WeakMap();
  }

  var objHashUID = 0;

  var UID_HASH_KEY = '__immutablehash__';
  if (typeof Symbol === 'function') {
    UID_HASH_KEY = Symbol(UID_HASH_KEY);
  }

  var STRING_HASH_CACHE_MIN_STRLEN = 16;
  var STRING_HASH_CACHE_MAX_SIZE = 255;
  var STRING_HASH_CACHE_SIZE = 0;
  var stringHashCache = {};

  var ToKeyedSequence = /*@__PURE__*/(function (KeyedSeq) {
    function ToKeyedSequence(indexed, useKeys) {
      this._iter = indexed;
      this._useKeys = useKeys;
      this.size = indexed.size;
    }

    if ( KeyedSeq ) ToKeyedSequence.__proto__ = KeyedSeq;
    ToKeyedSequence.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
    ToKeyedSequence.prototype.constructor = ToKeyedSequence;

    ToKeyedSequence.prototype.get = function get (key, notSetValue) {
      return this._iter.get(key, notSetValue);
    };

    ToKeyedSequence.prototype.has = function has (key) {
      return this._iter.has(key);
    };

    ToKeyedSequence.prototype.valueSeq = function valueSeq () {
      return this._iter.valueSeq();
    };

    ToKeyedSequence.prototype.reverse = function reverse () {
      var this$1 = this;

      var reversedSequence = reverseFactory(this, true);
      if (!this._useKeys) {
        reversedSequence.valueSeq = function () { return this$1._iter.toSeq().reverse(); };
      }
      return reversedSequence;
    };

    ToKeyedSequence.prototype.map = function map (mapper, context) {
      var this$1 = this;

      var mappedSequence = mapFactory(this, mapper, context);
      if (!this._useKeys) {
        mappedSequence.valueSeq = function () { return this$1._iter.toSeq().map(mapper, context); };
      }
      return mappedSequence;
    };

    ToKeyedSequence.prototype.__iterate = function __iterate (fn, reverse) {
      var this$1 = this;

      return this._iter.__iterate(function (v, k) { return fn(v, k, this$1); }, reverse);
    };

    ToKeyedSequence.prototype.__iterator = function __iterator (type, reverse) {
      return this._iter.__iterator(type, reverse);
    };

    return ToKeyedSequence;
  }(KeyedSeq));
  ToKeyedSequence.prototype[IS_ORDERED_SYMBOL] = true;

  var ToIndexedSequence = /*@__PURE__*/(function (IndexedSeq) {
    function ToIndexedSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    if ( IndexedSeq ) ToIndexedSequence.__proto__ = IndexedSeq;
    ToIndexedSequence.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
    ToIndexedSequence.prototype.constructor = ToIndexedSequence;

    ToIndexedSequence.prototype.includes = function includes (value) {
      return this._iter.includes(value);
    };

    ToIndexedSequence.prototype.__iterate = function __iterate (fn, reverse) {
      var this$1 = this;

      var i = 0;
      reverse && ensureSize(this);
      return this._iter.__iterate(
        function (v) { return fn(v, reverse ? this$1.size - ++i : i++, this$1); },
        reverse
      );
    };

    ToIndexedSequence.prototype.__iterator = function __iterator (type, reverse) {
      var this$1 = this;

      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var i = 0;
      reverse && ensureSize(this);
      return new Iterator(function () {
        var step = iterator.next();
        return step.done
          ? step
          : iteratorValue(
              type,
              reverse ? this$1.size - ++i : i++,
              step.value,
              step
            );
      });
    };

    return ToIndexedSequence;
  }(IndexedSeq));

  var ToSetSequence = /*@__PURE__*/(function (SetSeq) {
    function ToSetSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    if ( SetSeq ) ToSetSequence.__proto__ = SetSeq;
    ToSetSequence.prototype = Object.create( SetSeq && SetSeq.prototype );
    ToSetSequence.prototype.constructor = ToSetSequence;

    ToSetSequence.prototype.has = function has (key) {
      return this._iter.includes(key);
    };

    ToSetSequence.prototype.__iterate = function __iterate (fn, reverse) {
      var this$1 = this;

      return this._iter.__iterate(function (v) { return fn(v, v, this$1); }, reverse);
    };

    ToSetSequence.prototype.__iterator = function __iterator (type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function () {
        var step = iterator.next();
        return step.done
          ? step
          : iteratorValue(type, step.value, step.value, step);
      });
    };

    return ToSetSequence;
  }(SetSeq));

  var FromEntriesSequence = /*@__PURE__*/(function (KeyedSeq) {
    function FromEntriesSequence(entries) {
      this._iter = entries;
      this.size = entries.size;
    }

    if ( KeyedSeq ) FromEntriesSequence.__proto__ = KeyedSeq;
    FromEntriesSequence.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
    FromEntriesSequence.prototype.constructor = FromEntriesSequence;

    FromEntriesSequence.prototype.entrySeq = function entrySeq () {
      return this._iter.toSeq();
    };

    FromEntriesSequence.prototype.__iterate = function __iterate (fn, reverse) {
      var this$1 = this;

      return this._iter.__iterate(function (entry) {
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          var indexedCollection = isCollection(entry);
          return fn(
            indexedCollection ? entry.get(1) : entry[1],
            indexedCollection ? entry.get(0) : entry[0],
            this$1
          );
        }
      }, reverse);
    };

    FromEntriesSequence.prototype.__iterator = function __iterator (type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function () {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          // Check if entry exists first so array access doesn't throw for holes
          // in the parent iteration.
          if (entry) {
            validateEntry(entry);
            var indexedCollection = isCollection(entry);
            return iteratorValue(
              type,
              indexedCollection ? entry.get(0) : entry[0],
              indexedCollection ? entry.get(1) : entry[1],
              step
            );
          }
        }
      });
    };

    return FromEntriesSequence;
  }(KeyedSeq));

  ToIndexedSequence.prototype.cacheResult =
    ToKeyedSequence.prototype.cacheResult =
    ToSetSequence.prototype.cacheResult =
    FromEntriesSequence.prototype.cacheResult =
      cacheResultThrough;

  function flipFactory(collection) {
    var flipSequence = makeSequence(collection);
    flipSequence._iter = collection;
    flipSequence.size = collection.size;
    flipSequence.flip = function () { return collection; };
    flipSequence.reverse = function () {
      var reversedSequence = collection.reverse.apply(this); // super.reverse()
      reversedSequence.flip = function () { return collection.reverse(); };
      return reversedSequence;
    };
    flipSequence.has = function (key) { return collection.includes(key); };
    flipSequence.includes = function (key) { return collection.has(key); };
    flipSequence.cacheResult = cacheResultThrough;
    flipSequence.__iterateUncached = function (fn, reverse) {
      var this$1 = this;

      return collection.__iterate(function (v, k) { return fn(k, v, this$1) !== false; }, reverse);
    };
    flipSequence.__iteratorUncached = function (type, reverse) {
      if (type === ITERATE_ENTRIES) {
        var iterator = collection.__iterator(type, reverse);
        return new Iterator(function () {
          var step = iterator.next();
          if (!step.done) {
            var k = step.value[0];
            step.value[0] = step.value[1];
            step.value[1] = k;
          }
          return step;
        });
      }
      return collection.__iterator(
        type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
        reverse
      );
    };
    return flipSequence;
  }

  function mapFactory(collection, mapper, context) {
    var mappedSequence = makeSequence(collection);
    mappedSequence.size = collection.size;
    mappedSequence.has = function (key) { return collection.has(key); };
    mappedSequence.get = function (key, notSetValue) {
      var v = collection.get(key, NOT_SET);
      return v === NOT_SET
        ? notSetValue
        : mapper.call(context, v, key, collection);
    };
    mappedSequence.__iterateUncached = function (fn, reverse) {
      var this$1 = this;

      return collection.__iterate(
        function (v, k, c) { return fn(mapper.call(context, v, k, c), k, this$1) !== false; },
        reverse
      );
    };
    mappedSequence.__iteratorUncached = function (type, reverse) {
      var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
      return new Iterator(function () {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        return iteratorValue(
          type,
          key,
          mapper.call(context, entry[1], key, collection),
          step
        );
      });
    };
    return mappedSequence;
  }

  function reverseFactory(collection, useKeys) {
    var this$1 = this;

    var reversedSequence = makeSequence(collection);
    reversedSequence._iter = collection;
    reversedSequence.size = collection.size;
    reversedSequence.reverse = function () { return collection; };
    if (collection.flip) {
      reversedSequence.flip = function () {
        var flipSequence = flipFactory(collection);
        flipSequence.reverse = function () { return collection.flip(); };
        return flipSequence;
      };
    }
    reversedSequence.get = function (key, notSetValue) { return collection.get(useKeys ? key : -1 - key, notSetValue); };
    reversedSequence.has = function (key) { return collection.has(useKeys ? key : -1 - key); };
    reversedSequence.includes = function (value) { return collection.includes(value); };
    reversedSequence.cacheResult = cacheResultThrough;
    reversedSequence.__iterate = function (fn, reverse) {
      var this$1 = this;

      var i = 0;
      reverse && ensureSize(collection);
      return collection.__iterate(
        function (v, k) { return fn(v, useKeys ? k : reverse ? this$1.size - ++i : i++, this$1); },
        !reverse
      );
    };
    reversedSequence.__iterator = function (type, reverse) {
      var i = 0;
      reverse && ensureSize(collection);
      var iterator = collection.__iterator(ITERATE_ENTRIES, !reverse);
      return new Iterator(function () {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        return iteratorValue(
          type,
          useKeys ? entry[0] : reverse ? this$1.size - ++i : i++,
          entry[1],
          step
        );
      });
    };
    return reversedSequence;
  }

  function filterFactory(collection, predicate, context, useKeys) {
    var filterSequence = makeSequence(collection);
    if (useKeys) {
      filterSequence.has = function (key) {
        var v = collection.get(key, NOT_SET);
        return v !== NOT_SET && !!predicate.call(context, v, key, collection);
      };
      filterSequence.get = function (key, notSetValue) {
        var v = collection.get(key, NOT_SET);
        return v !== NOT_SET && predicate.call(context, v, key, collection)
          ? v
          : notSetValue;
      };
    }
    filterSequence.__iterateUncached = function (fn, reverse) {
      var this$1 = this;

      var iterations = 0;
      collection.__iterate(function (v, k, c) {
        if (predicate.call(context, v, k, c)) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$1);
        }
      }, reverse);
      return iterations;
    };
    filterSequence.__iteratorUncached = function (type, reverse) {
      var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
      var iterations = 0;
      return new Iterator(function () {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          var key = entry[0];
          var value = entry[1];
          if (predicate.call(context, value, key, collection)) {
            return iteratorValue(type, useKeys ? key : iterations++, value, step);
          }
        }
      });
    };
    return filterSequence;
  }

  function countByFactory(collection, grouper, context) {
    var groups = Map().asMutable();
    collection.__iterate(function (v, k) {
      groups.update(grouper.call(context, v, k, collection), 0, function (a) { return a + 1; });
    });
    return groups.asImmutable();
  }

  function groupByFactory(collection, grouper, context) {
    var isKeyedIter = isKeyed(collection);
    var groups = (isOrdered(collection) ? OrderedMap() : Map()).asMutable();
    collection.__iterate(function (v, k) {
      groups.update(
        grouper.call(context, v, k, collection),
        function (a) { return ((a = a || []), a.push(isKeyedIter ? [k, v] : v), a); }
      );
    });
    var coerce = collectionClass(collection);
    return groups.map(function (arr) { return reify(collection, coerce(arr)); }).asImmutable();
  }

  function sliceFactory(collection, begin, end, useKeys) {
    var originalSize = collection.size;

    if (wholeSlice(begin, end, originalSize)) {
      return collection;
    }

    var resolvedBegin = resolveBegin(begin, originalSize);
    var resolvedEnd = resolveEnd(end, originalSize);

    // begin or end will be NaN if they were provided as negative numbers and
    // this collection's size is unknown. In that case, cache first so there is
    // a known size and these do not resolve to NaN.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return sliceFactory(collection.toSeq().cacheResult(), begin, end, useKeys);
    }

    // Note: resolvedEnd is undefined when the original sequence's length is
    // unknown and this slice did not supply an end and should contain all
    // elements after resolvedBegin.
    // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
    var resolvedSize = resolvedEnd - resolvedBegin;
    var sliceSize;
    if (resolvedSize === resolvedSize) {
      sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
    }

    var sliceSeq = makeSequence(collection);

    // If collection.size is undefined, the size of the realized sliceSeq is
    // unknown at this point unless the number of items to slice is 0
    sliceSeq.size =
      sliceSize === 0 ? sliceSize : (collection.size && sliceSize) || undefined;

    if (!useKeys && isSeq(collection) && sliceSize >= 0) {
      sliceSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < sliceSize
          ? collection.get(index + resolvedBegin, notSetValue)
          : notSetValue;
      };
    }

    sliceSeq.__iterateUncached = function (fn, reverse) {
      var this$1 = this;

      if (sliceSize === 0) {
        return 0;
      }
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var skipped = 0;
      var isSkipping = true;
      var iterations = 0;
      collection.__iterate(function (v, k) {
        if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
          iterations++;
          return (
            fn(v, useKeys ? k : iterations - 1, this$1) !== false &&
            iterations !== sliceSize
          );
        }
      });
      return iterations;
    };

    sliceSeq.__iteratorUncached = function (type, reverse) {
      if (sliceSize !== 0 && reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      // Don't bother instantiating parent iterator if taking 0.
      if (sliceSize === 0) {
        return new Iterator(iteratorDone);
      }
      var iterator = collection.__iterator(type, reverse);
      var skipped = 0;
      var iterations = 0;
      return new Iterator(function () {
        while (skipped++ < resolvedBegin) {
          iterator.next();
        }
        if (++iterations > sliceSize) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (useKeys || type === ITERATE_VALUES || step.done) {
          return step;
        }
        if (type === ITERATE_KEYS) {
          return iteratorValue(type, iterations - 1, undefined, step);
        }
        return iteratorValue(type, iterations - 1, step.value[1], step);
      });
    };

    return sliceSeq;
  }

  function takeWhileFactory(collection, predicate, context) {
    var takeSequence = makeSequence(collection);
    takeSequence.__iterateUncached = function (fn, reverse) {
      var this$1 = this;

      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterations = 0;
      collection.__iterate(
        function (v, k, c) { return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$1); }
      );
      return iterations;
    };
    takeSequence.__iteratorUncached = function (type, reverse) {
      var this$1 = this;

      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
      var iterating = true;
      return new Iterator(function () {
        if (!iterating) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var k = entry[0];
        var v = entry[1];
        if (!predicate.call(context, v, k, this$1)) {
          iterating = false;
          return iteratorDone();
        }
        return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
      });
    };
    return takeSequence;
  }

  function skipWhileFactory(collection, predicate, context, useKeys) {
    var skipSequence = makeSequence(collection);
    skipSequence.__iterateUncached = function (fn, reverse) {
      var this$1 = this;

      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var isSkipping = true;
      var iterations = 0;
      collection.__iterate(function (v, k, c) {
        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$1);
        }
      });
      return iterations;
    };
    skipSequence.__iteratorUncached = function (type, reverse) {
      var this$1 = this;

      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
      var skipping = true;
      var iterations = 0;
      return new Iterator(function () {
        var step;
        var k;
        var v;
        do {
          step = iterator.next();
          if (step.done) {
            if (useKeys || type === ITERATE_VALUES) {
              return step;
            }
            if (type === ITERATE_KEYS) {
              return iteratorValue(type, iterations++, undefined, step);
            }
            return iteratorValue(type, iterations++, step.value[1], step);
          }
          var entry = step.value;
          k = entry[0];
          v = entry[1];
          skipping && (skipping = predicate.call(context, v, k, this$1));
        } while (skipping);
        return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
      });
    };
    return skipSequence;
  }

  function concatFactory(collection, values) {
    var isKeyedCollection = isKeyed(collection);
    var iters = [collection]
      .concat(values)
      .map(function (v) {
        if (!isCollection(v)) {
          v = isKeyedCollection
            ? keyedSeqFromValue(v)
            : indexedSeqFromValue(Array.isArray(v) ? v : [v]);
        } else if (isKeyedCollection) {
          v = KeyedCollection(v);
        }
        return v;
      })
      .filter(function (v) { return v.size !== 0; });

    if (iters.length === 0) {
      return collection;
    }

    if (iters.length === 1) {
      var singleton = iters[0];
      if (
        singleton === collection ||
        (isKeyedCollection && isKeyed(singleton)) ||
        (isIndexed(collection) && isIndexed(singleton))
      ) {
        return singleton;
      }
    }

    var concatSeq = new ArraySeq(iters);
    if (isKeyedCollection) {
      concatSeq = concatSeq.toKeyedSeq();
    } else if (!isIndexed(collection)) {
      concatSeq = concatSeq.toSetSeq();
    }
    concatSeq = concatSeq.flatten(true);
    concatSeq.size = iters.reduce(function (sum, seq) {
      if (sum !== undefined) {
        var size = seq.size;
        if (size !== undefined) {
          return sum + size;
        }
      }
    }, 0);
    return concatSeq;
  }

  function flattenFactory(collection, depth, useKeys) {
    var flatSequence = makeSequence(collection);
    flatSequence.__iterateUncached = function (fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterations = 0;
      var stopped = false;
      function flatDeep(iter, currentDepth) {
        iter.__iterate(function (v, k) {
          if ((!depth || currentDepth < depth) && isCollection(v)) {
            flatDeep(v, currentDepth + 1);
          } else {
            iterations++;
            if (fn(v, useKeys ? k : iterations - 1, flatSequence) === false) {
              stopped = true;
            }
          }
          return !stopped;
        }, reverse);
      }
      flatDeep(collection, 0);
      return iterations;
    };
    flatSequence.__iteratorUncached = function (type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = collection.__iterator(type, reverse);
      var stack = [];
      var iterations = 0;
      return new Iterator(function () {
        while (iterator) {
          var step = iterator.next();
          if (step.done !== false) {
            iterator = stack.pop();
            continue;
          }
          var v = step.value;
          if (type === ITERATE_ENTRIES) {
            v = v[1];
          }
          if ((!depth || stack.length < depth) && isCollection(v)) {
            stack.push(iterator);
            iterator = v.__iterator(type, reverse);
          } else {
            return useKeys ? step : iteratorValue(type, iterations++, v, step);
          }
        }
        return iteratorDone();
      });
    };
    return flatSequence;
  }

  function flatMapFactory(collection, mapper, context) {
    var coerce = collectionClass(collection);
    return collection
      .toSeq()
      .map(function (v, k) { return coerce(mapper.call(context, v, k, collection)); })
      .flatten(true);
  }

  function interposeFactory(collection, separator) {
    var interposedSequence = makeSequence(collection);
    interposedSequence.size = collection.size && collection.size * 2 - 1;
    interposedSequence.__iterateUncached = function (fn, reverse) {
      var this$1 = this;

      var iterations = 0;
      collection.__iterate(
        function (v) { return (!iterations || fn(separator, iterations++, this$1) !== false) &&
          fn(v, iterations++, this$1) !== false; },
        reverse
      );
      return iterations;
    };
    interposedSequence.__iteratorUncached = function (type, reverse) {
      var iterator = collection.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      var step;
      return new Iterator(function () {
        if (!step || iterations % 2) {
          step = iterator.next();
          if (step.done) {
            return step;
          }
        }
        return iterations % 2
          ? iteratorValue(type, iterations++, separator)
          : iteratorValue(type, iterations++, step.value, step);
      });
    };
    return interposedSequence;
  }

  function sortFactory(collection, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    var isKeyedCollection = isKeyed(collection);
    var index = 0;
    var entries = collection
      .toSeq()
      .map(function (v, k) { return [k, v, index++, mapper ? mapper(v, k, collection) : v]; })
      .valueSeq()
      .toArray();
    entries
      .sort(function (a, b) { return comparator(a[3], b[3]) || a[2] - b[2]; })
      .forEach(
        isKeyedCollection
          ? function (v, i) {
              entries[i].length = 2;
            }
          : function (v, i) {
              entries[i] = v[1];
            }
      );
    return isKeyedCollection
      ? KeyedSeq(entries)
      : isIndexed(collection)
      ? IndexedSeq(entries)
      : SetSeq(entries);
  }

  function maxFactory(collection, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    if (mapper) {
      var entry = collection
        .toSeq()
        .map(function (v, k) { return [v, mapper(v, k, collection)]; })
        .reduce(function (a, b) { return (maxCompare(comparator, a[1], b[1]) ? b : a); });
      return entry && entry[0];
    }
    return collection.reduce(function (a, b) { return (maxCompare(comparator, a, b) ? b : a); });
  }

  function maxCompare(comparator, a, b) {
    var comp = comparator(b, a);
    // b is considered the new max if the comparator declares them equal, but
    // they are not equal and b is in fact a nullish value.
    return (
      (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) ||
      comp > 0
    );
  }

  function zipWithFactory(keyIter, zipper, iters, zipAll) {
    var zipSequence = makeSequence(keyIter);
    var sizes = new ArraySeq(iters).map(function (i) { return i.size; });
    zipSequence.size = zipAll ? sizes.max() : sizes.min();
    // Note: this a generic base implementation of __iterate in terms of
    // __iterator which may be more generically useful in the future.
    zipSequence.__iterate = function (fn, reverse) {
      /* generic:
      var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        iterations++;
        if (fn(step.value[1], step.value[0], this) === false) {
          break;
        }
      }
      return iterations;
      */
      // indexed:
      var iterator = this.__iterator(ITERATE_VALUES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };
    zipSequence.__iteratorUncached = function (type, reverse) {
      var iterators = iters.map(
        function (i) { return ((i = Collection(i)), getIterator(reverse ? i.reverse() : i)); }
      );
      var iterations = 0;
      var isDone = false;
      return new Iterator(function () {
        var steps;
        if (!isDone) {
          steps = iterators.map(function (i) { return i.next(); });
          isDone = zipAll ? steps.every(function (s) { return s.done; }) : steps.some(function (s) { return s.done; });
        }
        if (isDone) {
          return iteratorDone();
        }
        return iteratorValue(
          type,
          iterations++,
          zipper.apply(
            null,
            steps.map(function (s) { return s.value; })
          )
        );
      });
    };
    return zipSequence;
  }

  // #pragma Helper Functions

  function reify(iter, seq) {
    return iter === seq ? iter : isSeq(iter) ? seq : iter.constructor(seq);
  }

  function validateEntry(entry) {
    if (entry !== Object(entry)) {
      throw new TypeError('Expected [K, V] tuple: ' + entry);
    }
  }

  function collectionClass(collection) {
    return isKeyed(collection)
      ? KeyedCollection
      : isIndexed(collection)
      ? IndexedCollection
      : SetCollection;
  }

  function makeSequence(collection) {
    return Object.create(
      (isKeyed(collection)
        ? KeyedSeq
        : isIndexed(collection)
        ? IndexedSeq
        : SetSeq
      ).prototype
    );
  }

  function cacheResultThrough() {
    if (this._iter.cacheResult) {
      this._iter.cacheResult();
      this.size = this._iter.size;
      return this;
    }
    return Seq.prototype.cacheResult.call(this);
  }

  function defaultComparator(a, b) {
    if (a === undefined && b === undefined) {
      return 0;
    }

    if (a === undefined) {
      return 1;
    }

    if (b === undefined) {
      return -1;
    }

    return a > b ? 1 : a < b ? -1 : 0;
  }

  function arrCopy(arr, offset) {
    offset = offset || 0;
    var len = Math.max(0, arr.length - offset);
    var newArr = new Array(len);
    for (var ii = 0; ii < len; ii++) {
      newArr[ii] = arr[ii + offset];
    }
    return newArr;
  }

  function invariant(condition, error) {
    if (!condition) { throw new Error(error); }
  }

  function assertNotInfinite(size) {
    invariant(
      size !== Infinity,
      'Cannot perform this action with an infinite size.'
    );
  }

  function coerceKeyPath(keyPath) {
    if (isArrayLike(keyPath) && typeof keyPath !== 'string') {
      return keyPath;
    }
    if (isOrdered(keyPath)) {
      return keyPath.toArray();
    }
    throw new TypeError(
      'Invalid keyPath: expected Ordered Collection or Array: ' + keyPath
    );
  }

  function isPlainObj(value) {
    return (
      value &&
      (typeof value.constructor !== 'function' ||
        value.constructor.name === 'Object')
    );
  }

  /**
   * Returns true if the value is a potentially-persistent data structure, either
   * provided by Immutable.js or a plain Array or Object.
   */
  function isDataStructure(value) {
    return (
      typeof value === 'object' &&
      (isImmutable(value) || Array.isArray(value) || isPlainObj(value))
    );
  }

  function quoteString(value) {
    try {
      return typeof value === 'string' ? JSON.stringify(value) : String(value);
    } catch (_ignoreError) {
      return JSON.stringify(value);
    }
  }

  function has(collection, key) {
    return isImmutable(collection)
      ? collection.has(key)
      : isDataStructure(collection) && hasOwnProperty.call(collection, key);
  }

  function get(collection, key, notSetValue) {
    return isImmutable(collection)
      ? collection.get(key, notSetValue)
      : !has(collection, key)
      ? notSetValue
      : typeof collection.get === 'function'
      ? collection.get(key)
      : collection[key];
  }

  function shallowCopy(from) {
    if (Array.isArray(from)) {
      return arrCopy(from);
    }
    var to = {};
    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
    return to;
  }

  function remove(collection, key) {
    if (!isDataStructure(collection)) {
      throw new TypeError(
        'Cannot update non-data-structure value: ' + collection
      );
    }
    if (isImmutable(collection)) {
      if (!collection.remove) {
        throw new TypeError(
          'Cannot update immutable value without .remove() method: ' + collection
        );
      }
      return collection.remove(key);
    }
    if (!hasOwnProperty.call(collection, key)) {
      return collection;
    }
    var collectionCopy = shallowCopy(collection);
    if (Array.isArray(collectionCopy)) {
      collectionCopy.splice(key, 1);
    } else {
      delete collectionCopy[key];
    }
    return collectionCopy;
  }

  function set(collection, key, value) {
    if (!isDataStructure(collection)) {
      throw new TypeError(
        'Cannot update non-data-structure value: ' + collection
      );
    }
    if (isImmutable(collection)) {
      if (!collection.set) {
        throw new TypeError(
          'Cannot update immutable value without .set() method: ' + collection
        );
      }
      return collection.set(key, value);
    }
    if (hasOwnProperty.call(collection, key) && value === collection[key]) {
      return collection;
    }
    var collectionCopy = shallowCopy(collection);
    collectionCopy[key] = value;
    return collectionCopy;
  }

  function updateIn(collection, keyPath, notSetValue, updater) {
    if (!updater) {
      updater = notSetValue;
      notSetValue = undefined;
    }
    var updatedValue = updateInDeeply(
      isImmutable(collection),
      collection,
      coerceKeyPath(keyPath),
      0,
      notSetValue,
      updater
    );
    return updatedValue === NOT_SET ? notSetValue : updatedValue;
  }

  function updateInDeeply(
    inImmutable,
    existing,
    keyPath,
    i,
    notSetValue,
    updater
  ) {
    var wasNotSet = existing === NOT_SET;
    if (i === keyPath.length) {
      var existingValue = wasNotSet ? notSetValue : existing;
      var newValue = updater(existingValue);
      return newValue === existingValue ? existing : newValue;
    }
    if (!wasNotSet && !isDataStructure(existing)) {
      throw new TypeError(
        'Cannot update within non-data-structure value in path [' +
          keyPath.slice(0, i).map(quoteString) +
          ']: ' +
          existing
      );
    }
    var key = keyPath[i];
    var nextExisting = wasNotSet ? NOT_SET : get(existing, key, NOT_SET);
    var nextUpdated = updateInDeeply(
      nextExisting === NOT_SET ? inImmutable : isImmutable(nextExisting),
      nextExisting,
      keyPath,
      i + 1,
      notSetValue,
      updater
    );
    return nextUpdated === nextExisting
      ? existing
      : nextUpdated === NOT_SET
      ? remove(existing, key)
      : set(
          wasNotSet ? (inImmutable ? emptyMap() : {}) : existing,
          key,
          nextUpdated
        );
  }

  function setIn(collection, keyPath, value) {
    return updateIn(collection, keyPath, NOT_SET, function () { return value; });
  }

  function setIn$1(keyPath, v) {
    return setIn(this, keyPath, v);
  }

  function removeIn(collection, keyPath) {
    return updateIn(collection, keyPath, function () { return NOT_SET; });
  }

  function deleteIn(keyPath) {
    return removeIn(this, keyPath);
  }

  function update(collection, key, notSetValue, updater) {
    return updateIn(collection, [key], notSetValue, updater);
  }

  function update$1(key, notSetValue, updater) {
    return arguments.length === 1
      ? key(this)
      : update(this, key, notSetValue, updater);
  }

  function updateIn$1(keyPath, notSetValue, updater) {
    return updateIn(this, keyPath, notSetValue, updater);
  }

  function merge() {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    return mergeIntoKeyedWith(this, iters);
  }

  function mergeWith(merger) {
    var iters = [], len = arguments.length - 1;
    while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

    if (typeof merger !== 'function') {
      throw new TypeError('Invalid merger function: ' + merger);
    }
    return mergeIntoKeyedWith(this, iters, merger);
  }

  function mergeIntoKeyedWith(collection, collections, merger) {
    var iters = [];
    for (var ii = 0; ii < collections.length; ii++) {
      var collection$1 = KeyedCollection(collections[ii]);
      if (collection$1.size !== 0) {
        iters.push(collection$1);
      }
    }
    if (iters.length === 0) {
      return collection;
    }
    if (
      collection.toSeq().size === 0 &&
      !collection.__ownerID &&
      iters.length === 1
    ) {
      return collection.constructor(iters[0]);
    }
    return collection.withMutations(function (collection) {
      var mergeIntoCollection = merger
        ? function (value, key) {
            update(collection, key, NOT_SET, function (oldVal) { return oldVal === NOT_SET ? value : merger(oldVal, value, key); }
            );
          }
        : function (value, key) {
            collection.set(key, value);
          };
      for (var ii = 0; ii < iters.length; ii++) {
        iters[ii].forEach(mergeIntoCollection);
      }
    });
  }

  function merge$1(collection) {
    var sources = [], len = arguments.length - 1;
    while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

    return mergeWithSources(collection, sources);
  }

  function mergeWith$1(merger, collection) {
    var sources = [], len = arguments.length - 2;
    while ( len-- > 0 ) sources[ len ] = arguments[ len + 2 ];

    return mergeWithSources(collection, sources, merger);
  }

  function mergeDeep(collection) {
    var sources = [], len = arguments.length - 1;
    while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

    return mergeDeepWithSources(collection, sources);
  }

  function mergeDeepWith(merger, collection) {
    var sources = [], len = arguments.length - 2;
    while ( len-- > 0 ) sources[ len ] = arguments[ len + 2 ];

    return mergeDeepWithSources(collection, sources, merger);
  }

  function mergeDeepWithSources(collection, sources, merger) {
    return mergeWithSources(collection, sources, deepMergerWith(merger));
  }

  function mergeWithSources(collection, sources, merger) {
    if (!isDataStructure(collection)) {
      throw new TypeError(
        'Cannot merge into non-data-structure value: ' + collection
      );
    }
    if (isImmutable(collection)) {
      return typeof merger === 'function' && collection.mergeWith
        ? collection.mergeWith.apply(collection, [ merger ].concat( sources ))
        : collection.merge
        ? collection.merge.apply(collection, sources)
        : collection.concat.apply(collection, sources);
    }
    var isArray = Array.isArray(collection);
    var merged = collection;
    var Collection = isArray ? IndexedCollection : KeyedCollection;
    var mergeItem = isArray
      ? function (value) {
          // Copy on write
          if (merged === collection) {
            merged = shallowCopy(merged);
          }
          merged.push(value);
        }
      : function (value, key) {
          var hasVal = hasOwnProperty.call(merged, key);
          var nextVal =
            hasVal && merger ? merger(merged[key], value, key) : value;
          if (!hasVal || nextVal !== merged[key]) {
            // Copy on write
            if (merged === collection) {
              merged = shallowCopy(merged);
            }
            merged[key] = nextVal;
          }
        };
    for (var i = 0; i < sources.length; i++) {
      Collection(sources[i]).forEach(mergeItem);
    }
    return merged;
  }

  function deepMergerWith(merger) {
    function deepMerger(oldValue, newValue, key) {
      return isDataStructure(oldValue) && isDataStructure(newValue)
        ? mergeWithSources(oldValue, [newValue], deepMerger)
        : merger
        ? merger(oldValue, newValue, key)
        : newValue;
    }
    return deepMerger;
  }

  function mergeDeep$1() {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    return mergeDeepWithSources(this, iters);
  }

  function mergeDeepWith$1(merger) {
    var iters = [], len = arguments.length - 1;
    while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

    return mergeDeepWithSources(this, iters, merger);
  }

  function mergeIn(keyPath) {
    var iters = [], len = arguments.length - 1;
    while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

    return updateIn(this, keyPath, emptyMap(), function (m) { return mergeWithSources(m, iters); });
  }

  function mergeDeepIn(keyPath) {
    var iters = [], len = arguments.length - 1;
    while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

    return updateIn(this, keyPath, emptyMap(), function (m) { return mergeDeepWithSources(m, iters); }
    );
  }

  function withMutations(fn) {
    var mutable = this.asMutable();
    fn(mutable);
    return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
  }

  function asMutable() {
    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
  }

  function asImmutable() {
    return this.__ensureOwner();
  }

  function wasAltered() {
    return this.__altered;
  }

  var Map = /*@__PURE__*/(function (KeyedCollection) {
    function Map(value) {
      return value === null || value === undefined
        ? emptyMap()
        : isMap(value) && !isOrdered(value)
        ? value
        : emptyMap().withMutations(function (map) {
            var iter = KeyedCollection(value);
            assertNotInfinite(iter.size);
            iter.forEach(function (v, k) { return map.set(k, v); });
          });
    }

    if ( KeyedCollection ) Map.__proto__ = KeyedCollection;
    Map.prototype = Object.create( KeyedCollection && KeyedCollection.prototype );
    Map.prototype.constructor = Map;

    Map.of = function of () {
      var keyValues = [], len = arguments.length;
      while ( len-- ) keyValues[ len ] = arguments[ len ];

      return emptyMap().withMutations(function (map) {
        for (var i = 0; i < keyValues.length; i += 2) {
          if (i + 1 >= keyValues.length) {
            throw new Error('Missing value for key: ' + keyValues[i]);
          }
          map.set(keyValues[i], keyValues[i + 1]);
        }
      });
    };

    Map.prototype.toString = function toString () {
      return this.__toString('Map {', '}');
    };

    // @pragma Access

    Map.prototype.get = function get (k, notSetValue) {
      return this._root
        ? this._root.get(0, undefined, k, notSetValue)
        : notSetValue;
    };

    // @pragma Modification

    Map.prototype.set = function set (k, v) {
      return updateMap(this, k, v);
    };

    Map.prototype.remove = function remove (k) {
      return updateMap(this, k, NOT_SET);
    };

    Map.prototype.deleteAll = function deleteAll (keys) {
      var collection = Collection(keys);

      if (collection.size === 0) {
        return this;
      }

      return this.withMutations(function (map) {
        collection.forEach(function (key) { return map.remove(key); });
      });
    };

    Map.prototype.clear = function clear () {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._root = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyMap();
    };

    // @pragma Composition

    Map.prototype.sort = function sort (comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator));
    };

    Map.prototype.sortBy = function sortBy (mapper, comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator, mapper));
    };

    Map.prototype.map = function map (mapper, context) {
      return this.withMutations(function (map) {
        map.forEach(function (value, key) {
          map.set(key, mapper.call(context, value, key, map));
        });
      });
    };

    // @pragma Mutability

    Map.prototype.__iterator = function __iterator (type, reverse) {
      return new MapIterator(this, type, reverse);
    };

    Map.prototype.__iterate = function __iterate (fn, reverse) {
      var this$1 = this;

      var iterations = 0;
      this._root &&
        this._root.iterate(function (entry) {
          iterations++;
          return fn(entry[1], entry[0], this$1);
        }, reverse);
      return iterations;
    };

    Map.prototype.__ensureOwner = function __ensureOwner (ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        if (this.size === 0) {
          return emptyMap();
        }
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeMap(this.size, this._root, ownerID, this.__hash);
    };

    return Map;
  }(KeyedCollection));

  Map.isMap = isMap;

  var MapPrototype = Map.prototype;
  MapPrototype[IS_MAP_SYMBOL] = true;
  MapPrototype[DELETE] = MapPrototype.remove;
  MapPrototype.removeAll = MapPrototype.deleteAll;
  MapPrototype.setIn = setIn$1;
  MapPrototype.removeIn = MapPrototype.deleteIn = deleteIn;
  MapPrototype.update = update$1;
  MapPrototype.updateIn = updateIn$1;
  MapPrototype.merge = MapPrototype.concat = merge;
  MapPrototype.mergeWith = mergeWith;
  MapPrototype.mergeDeep = mergeDeep$1;
  MapPrototype.mergeDeepWith = mergeDeepWith$1;
  MapPrototype.mergeIn = mergeIn;
  MapPrototype.mergeDeepIn = mergeDeepIn;
  MapPrototype.withMutations = withMutations;
  MapPrototype.wasAltered = wasAltered;
  MapPrototype.asImmutable = asImmutable;
  MapPrototype['@@transducer/init'] = MapPrototype.asMutable = asMutable;
  MapPrototype['@@transducer/step'] = function (result, arr) {
    return result.set(arr[0], arr[1]);
  };
  MapPrototype['@@transducer/result'] = function (obj) {
    return obj.asImmutable();
  };

  // #pragma Trie Nodes

  var ArrayMapNode = function ArrayMapNode(ownerID, entries) {
    this.ownerID = ownerID;
    this.entries = entries;
  };

  ArrayMapNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
    var entries = this.entries;
    for (var ii = 0, len = entries.length; ii < len; ii++) {
      if (is(key, entries[ii][0])) {
        return entries[ii][1];
      }
    }
    return notSetValue;
  };

  ArrayMapNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    var removed = value === NOT_SET;

    var entries = this.entries;
    var idx = 0;
    var len = entries.length;
    for (; idx < len; idx++) {
      if (is(key, entries[idx][0])) {
        break;
      }
    }
    var exists = idx < len;

    if (exists ? entries[idx][1] === value : removed) {
      return this;
    }

    SetRef(didAlter);
    (removed || !exists) && SetRef(didChangeSize);

    if (removed && entries.length === 1) {
      return; // undefined
    }

    if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
      return createNodes(ownerID, entries, key, value);
    }

    var isEditable = ownerID && ownerID === this.ownerID;
    var newEntries = isEditable ? entries : arrCopy(entries);

    if (exists) {
      if (removed) {
        idx === len - 1
          ? newEntries.pop()
          : (newEntries[idx] = newEntries.pop());
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

    return new ArrayMapNode(ownerID, newEntries);
  };

  var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
    this.ownerID = ownerID;
    this.bitmap = bitmap;
    this.nodes = nodes;
  };

  BitmapIndexedNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
    if (keyHash === undefined) {
      keyHash = hash(key);
    }
    var bit = 1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK);
    var bitmap = this.bitmap;
    return (bitmap & bit) === 0
      ? notSetValue
      : this.nodes[popCount(bitmap & (bit - 1))].get(
          shift + SHIFT,
          keyHash,
          key,
          notSetValue
        );
  };

  BitmapIndexedNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (keyHash === undefined) {
      keyHash = hash(key);
    }
    var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
    var bit = 1 << keyHashFrag;
    var bitmap = this.bitmap;
    var exists = (bitmap & bit) !== 0;

    if (!exists && value === NOT_SET) {
      return this;
    }

    var idx = popCount(bitmap & (bit - 1));
    var nodes = this.nodes;
    var node = exists ? nodes[idx] : undefined;
    var newNode = updateNode(
      node,
      ownerID,
      shift + SHIFT,
      keyHash,
      key,
      value,
      didChangeSize,
      didAlter
    );

    if (newNode === node) {
      return this;
    }

    if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
      return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
    }

    if (
      exists &&
      !newNode &&
      nodes.length === 2 &&
      isLeafNode(nodes[idx ^ 1])
    ) {
      return nodes[idx ^ 1];
    }

    if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
      return newNode;
    }

    var isEditable = ownerID && ownerID === this.ownerID;
    var newBitmap = exists ? (newNode ? bitmap : bitmap ^ bit) : bitmap | bit;
    var newNodes = exists
      ? newNode
        ? setAt(nodes, idx, newNode, isEditable)
        : spliceOut(nodes, idx, isEditable)
      : spliceIn(nodes, idx, newNode, isEditable);

    if (isEditable) {
      this.bitmap = newBitmap;
      this.nodes = newNodes;
      return this;
    }

    return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
  };

  var HashArrayMapNode = function HashArrayMapNode(ownerID, count, nodes) {
    this.ownerID = ownerID;
    this.count = count;
    this.nodes = nodes;
  };

  HashArrayMapNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
    if (keyHash === undefined) {
      keyHash = hash(key);
    }
    var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
    var node = this.nodes[idx];
    return node
      ? node.get(shift + SHIFT, keyHash, key, notSetValue)
      : notSetValue;
  };

  HashArrayMapNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (keyHash === undefined) {
      keyHash = hash(key);
    }
    var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
    var removed = value === NOT_SET;
    var nodes = this.nodes;
    var node = nodes[idx];

    if (removed && !node) {
      return this;
    }

    var newNode = updateNode(
      node,
      ownerID,
      shift + SHIFT,
      keyHash,
      key,
      value,
      didChangeSize,
      didAlter
    );
    if (newNode === node) {
      return this;
    }

    var newCount = this.count;
    if (!node) {
      newCount++;
    } else if (!newNode) {
      newCount--;
      if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
        return packNodes(ownerID, nodes, newCount, idx);
      }
    }

    var isEditable = ownerID && ownerID === this.ownerID;
    var newNodes = setAt(nodes, idx, newNode, isEditable);

    if (isEditable) {
      this.count = newCount;
      this.nodes = newNodes;
      return this;
    }

    return new HashArrayMapNode(ownerID, newCount, newNodes);
  };

  var HashCollisionNode = function HashCollisionNode(ownerID, keyHash, entries) {
    this.ownerID = ownerID;
    this.keyHash = keyHash;
    this.entries = entries;
  };

  HashCollisionNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
    var entries = this.entries;
    for (var ii = 0, len = entries.length; ii < len; ii++) {
      if (is(key, entries[ii][0])) {
        return entries[ii][1];
      }
    }
    return notSetValue;
  };

  HashCollisionNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (keyHash === undefined) {
      keyHash = hash(key);
    }

    var removed = value === NOT_SET;

    if (keyHash !== this.keyHash) {
      if (removed) {
        return this;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
    }

    var entries = this.entries;
    var idx = 0;
    var len = entries.length;
    for (; idx < len; idx++) {
      if (is(key, entries[idx][0])) {
        break;
      }
    }
    var exists = idx < len;

    if (exists ? entries[idx][1] === value : removed) {
      return this;
    }

    SetRef(didAlter);
    (removed || !exists) && SetRef(didChangeSize);

    if (removed && len === 2) {
      return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
    }

    var isEditable = ownerID && ownerID === this.ownerID;
    var newEntries = isEditable ? entries : arrCopy(entries);

    if (exists) {
      if (removed) {
        idx === len - 1
          ? newEntries.pop()
          : (newEntries[idx] = newEntries.pop());
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

    return new HashCollisionNode(ownerID, this.keyHash, newEntries);
  };

  var ValueNode = function ValueNode(ownerID, keyHash, entry) {
    this.ownerID = ownerID;
    this.keyHash = keyHash;
    this.entry = entry;
  };

  ValueNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
    return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
  };

  ValueNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    var removed = value === NOT_SET;
    var keyMatch = is(key, this.entry[0]);
    if (keyMatch ? value === this.entry[1] : removed) {
      return this;
    }

    SetRef(didAlter);

    if (removed) {
      SetRef(didChangeSize);
      return; // undefined
    }

    if (keyMatch) {
      if (ownerID && ownerID === this.ownerID) {
        this.entry[1] = value;
        return this;
      }
      return new ValueNode(ownerID, this.keyHash, [key, value]);
    }

    SetRef(didChangeSize);
    return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
  };

  // #pragma Iterators

  ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate =
    function (fn, reverse) {
      var entries = this.entries;
      for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
        if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
          return false;
        }
      }
    };

  BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate =
    function (fn, reverse) {
      var nodes = this.nodes;
      for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
        var node = nodes[reverse ? maxIndex - ii : ii];
        if (node && node.iterate(fn, reverse) === false) {
          return false;
        }
      }
    };

  // eslint-disable-next-line no-unused-vars
  ValueNode.prototype.iterate = function (fn, reverse) {
    return fn(this.entry);
  };

  var MapIterator = /*@__PURE__*/(function (Iterator) {
    function MapIterator(map, type, reverse) {
      this._type = type;
      this._reverse = reverse;
      this._stack = map._root && mapIteratorFrame(map._root);
    }

    if ( Iterator ) MapIterator.__proto__ = Iterator;
    MapIterator.prototype = Object.create( Iterator && Iterator.prototype );
    MapIterator.prototype.constructor = MapIterator;

    MapIterator.prototype.next = function next () {
      var type = this._type;
      var stack = this._stack;
      while (stack) {
        var node = stack.node;
        var index = stack.index++;
        var maxIndex = (void 0);
        if (node.entry) {
          if (index === 0) {
            return mapIteratorValue(type, node.entry);
          }
        } else if (node.entries) {
          maxIndex = node.entries.length - 1;
          if (index <= maxIndex) {
            return mapIteratorValue(
              type,
              node.entries[this._reverse ? maxIndex - index : index]
            );
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
    };

    return MapIterator;
  }(Iterator));

  function mapIteratorValue(type, entry) {
    return iteratorValue(type, entry[0], entry[1]);
  }

  function mapIteratorFrame(node, prev) {
    return {
      node: node,
      index: 0,
      __prev: prev,
    };
  }

  function makeMap(size, root, ownerID, hash) {
    var map = Object.create(MapPrototype);
    map.size = size;
    map._root = root;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_MAP;
  function emptyMap() {
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }

  function updateMap(map, k, v) {
    var newRoot;
    var newSize;
    if (!map._root) {
      if (v === NOT_SET) {
        return map;
      }
      newSize = 1;
      newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
    } else {
      var didChangeSize = MakeRef();
      var didAlter = MakeRef();
      newRoot = updateNode(
        map._root,
        map.__ownerID,
        0,
        undefined,
        k,
        v,
        didChangeSize,
        didAlter
      );
      if (!didAlter.value) {
        return map;
      }
      newSize = map.size + (didChangeSize.value ? (v === NOT_SET ? -1 : 1) : 0);
    }
    if (map.__ownerID) {
      map.size = newSize;
      map._root = newRoot;
      map.__hash = undefined;
      map.__altered = true;
      return map;
    }
    return newRoot ? makeMap(newSize, newRoot) : emptyMap();
  }

  function updateNode(
    node,
    ownerID,
    shift,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  ) {
    if (!node) {
      if (value === NOT_SET) {
        return node;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      return new ValueNode(ownerID, keyHash, [key, value]);
    }
    return node.update(
      ownerID,
      shift,
      keyHash,
      key,
      value,
      didChangeSize,
      didAlter
    );
  }

  function isLeafNode(node) {
    return (
      node.constructor === ValueNode || node.constructor === HashCollisionNode
    );
  }

  function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
    if (node.keyHash === keyHash) {
      return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
    }

    var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
    var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

    var newNode;
    var nodes =
      idx1 === idx2
        ? [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)]
        : ((newNode = new ValueNode(ownerID, keyHash, entry)),
          idx1 < idx2 ? [node, newNode] : [newNode, node]);

    return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
  }

  function createNodes(ownerID, entries, key, value) {
    if (!ownerID) {
      ownerID = new OwnerID();
    }
    var node = new ValueNode(ownerID, hash(key), [key, value]);
    for (var ii = 0; ii < entries.length; ii++) {
      var entry = entries[ii];
      node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
    }
    return node;
  }

  function packNodes(ownerID, nodes, count, excluding) {
    var bitmap = 0;
    var packedII = 0;
    var packedNodes = new Array(count);
    for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
      var node = nodes[ii];
      if (node !== undefined && ii !== excluding) {
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
      expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
    }
    expandedNodes[including] = node;
    return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
  }

  function popCount(x) {
    x -= (x >> 1) & 0x55555555;
    x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
    x = (x + (x >> 4)) & 0x0f0f0f0f;
    x += x >> 8;
    x += x >> 16;
    return x & 0x7f;
  }

  function setAt(array, idx, val, canEdit) {
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

  var MAX_ARRAY_MAP_SIZE = SIZE / 4;
  var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
  var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

  var IS_LIST_SYMBOL = '@@__IMMUTABLE_LIST__@@';

  function isList(maybeList) {
    return Boolean(maybeList && maybeList[IS_LIST_SYMBOL]);
  }

  var List = /*@__PURE__*/(function (IndexedCollection) {
    function List(value) {
      var empty = emptyList();
      if (value === null || value === undefined) {
        return empty;
      }
      if (isList(value)) {
        return value;
      }
      var iter = IndexedCollection(value);
      var size = iter.size;
      if (size === 0) {
        return empty;
      }
      assertNotInfinite(size);
      if (size > 0 && size < SIZE) {
        return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
      }
      return empty.withMutations(function (list) {
        list.setSize(size);
        iter.forEach(function (v, i) { return list.set(i, v); });
      });
    }

    if ( IndexedCollection ) List.__proto__ = IndexedCollection;
    List.prototype = Object.create( IndexedCollection && IndexedCollection.prototype );
    List.prototype.constructor = List;

    List.of = function of (/*...values*/) {
      return this(arguments);
    };

    List.prototype.toString = function toString () {
      return this.__toString('List [', ']');
    };

    // @pragma Access

    List.prototype.get = function get (index, notSetValue) {
      index = wrapIndex(this, index);
      if (index >= 0 && index < this.size) {
        index += this._origin;
        var node = listNodeFor(this, index);
        return node && node.array[index & MASK];
      }
      return notSetValue;
    };

    // @pragma Modification

    List.prototype.set = function set (index, value) {
      return updateList(this, index, value);
    };

    List.prototype.remove = function remove (index) {
      return !this.has(index)
        ? this
        : index === 0
        ? this.shift()
        : index === this.size - 1
        ? this.pop()
        : this.splice(index, 1);
    };

    List.prototype.insert = function insert (index, value) {
      return this.splice(index, 0, value);
    };

    List.prototype.clear = function clear () {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = this._origin = this._capacity = 0;
        this._level = SHIFT;
        this._root = this._tail = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyList();
    };

    List.prototype.push = function push (/*...values*/) {
      var values = arguments;
      var oldSize = this.size;
      return this.withMutations(function (list) {
        setListBounds(list, 0, oldSize + values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(oldSize + ii, values[ii]);
        }
      });
    };

    List.prototype.pop = function pop () {
      return setListBounds(this, 0, -1);
    };

    List.prototype.unshift = function unshift (/*...values*/) {
      var values = arguments;
      return this.withMutations(function (list) {
        setListBounds(list, -values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(ii, values[ii]);
        }
      });
    };

    List.prototype.shift = function shift () {
      return setListBounds(this, 1);
    };

    // @pragma Composition

    List.prototype.concat = function concat (/*...collections*/) {
      var arguments$1 = arguments;

      var seqs = [];
      for (var i = 0; i < arguments.length; i++) {
        var argument = arguments$1[i];
        var seq = IndexedCollection(
          typeof argument !== 'string' && hasIterator(argument)
            ? argument
            : [argument]
        );
        if (seq.size !== 0) {
          seqs.push(seq);
        }
      }
      if (seqs.length === 0) {
        return this;
      }
      if (this.size === 0 && !this.__ownerID && seqs.length === 1) {
        return this.constructor(seqs[0]);
      }
      return this.withMutations(function (list) {
        seqs.forEach(function (seq) { return seq.forEach(function (value) { return list.push(value); }); });
      });
    };

    List.prototype.setSize = function setSize (size) {
      return setListBounds(this, 0, size);
    };

    List.prototype.map = function map (mapper, context) {
      var this$1 = this;

      return this.withMutations(function (list) {
        for (var i = 0; i < this$1.size; i++) {
          list.set(i, mapper.call(context, list.get(i), i, list));
        }
      });
    };

    // @pragma Iteration

    List.prototype.slice = function slice (begin, end) {
      var size = this.size;
      if (wholeSlice(begin, end, size)) {
        return this;
      }
      return setListBounds(
        this,
        resolveBegin(begin, size),
        resolveEnd(end, size)
      );
    };

    List.prototype.__iterator = function __iterator (type, reverse) {
      var index = reverse ? this.size : 0;
      var values = iterateList(this, reverse);
      return new Iterator(function () {
        var value = values();
        return value === DONE
          ? iteratorDone()
          : iteratorValue(type, reverse ? --index : index++, value);
      });
    };

    List.prototype.__iterate = function __iterate (fn, reverse) {
      var index = reverse ? this.size : 0;
      var values = iterateList(this, reverse);
      var value;
      while ((value = values()) !== DONE) {
        if (fn(value, reverse ? --index : index++, this) === false) {
          break;
        }
      }
      return index;
    };

    List.prototype.__ensureOwner = function __ensureOwner (ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        if (this.size === 0) {
          return emptyList();
        }
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeList(
        this._origin,
        this._capacity,
        this._level,
        this._root,
        this._tail,
        ownerID,
        this.__hash
      );
    };

    return List;
  }(IndexedCollection));

  List.isList = isList;

  var ListPrototype = List.prototype;
  ListPrototype[IS_LIST_SYMBOL] = true;
  ListPrototype[DELETE] = ListPrototype.remove;
  ListPrototype.merge = ListPrototype.concat;
  ListPrototype.setIn = setIn$1;
  ListPrototype.deleteIn = ListPrototype.removeIn = deleteIn;
  ListPrototype.update = update$1;
  ListPrototype.updateIn = updateIn$1;
  ListPrototype.mergeIn = mergeIn;
  ListPrototype.mergeDeepIn = mergeDeepIn;
  ListPrototype.withMutations = withMutations;
  ListPrototype.wasAltered = wasAltered;
  ListPrototype.asImmutable = asImmutable;
  ListPrototype['@@transducer/init'] = ListPrototype.asMutable = asMutable;
  ListPrototype['@@transducer/step'] = function (result, arr) {
    return result.push(arr);
  };
  ListPrototype['@@transducer/result'] = function (obj) {
    return obj.asImmutable();
  };

  var VNode = function VNode(array, ownerID) {
    this.array = array;
    this.ownerID = ownerID;
  };

  // TODO: seems like these methods are very similar

  VNode.prototype.removeBefore = function removeBefore (ownerID, level, index) {
    if (index === level ? 1 << level :  this.array.length === 0) {
      return this;
    }
    var originIndex = (index >>> level) & MASK;
    if (originIndex >= this.array.length) {
      return new VNode([], ownerID);
    }
    var removingFirst = originIndex === 0;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[originIndex];
      newChild =
        oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
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
        editable.array[ii] = undefined;
      }
    }
    if (newChild) {
      editable.array[originIndex] = newChild;
    }
    return editable;
  };

  VNode.prototype.removeAfter = function removeAfter (ownerID, level, index) {
    if (index === (level ? 1 << level : 0) || this.array.length === 0) {
      return this;
    }
    var sizeIndex = ((index - 1) >>> level) & MASK;
    if (sizeIndex >= this.array.length) {
      return this;
    }

    var newChild;
    if (level > 0) {
      var oldChild = this.array[sizeIndex];
      newChild =
        oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
      if (newChild === oldChild && sizeIndex === this.array.length - 1) {
        return this;
      }
    }

    var editable = editableVNode(this, ownerID);
    editable.array.splice(sizeIndex + 1);
    if (newChild) {
      editable.array[sizeIndex] = newChild;
    }
    return editable;
  };

  var DONE = {};

  function iterateList(list, reverse) {
    var left = list._origin;
    var right = list._capacity;
    var tailPos = getTailOffset(right);
    var tail = list._tail;

    return iterateNodeOrLeaf(list._root, list._level, 0);

    function iterateNodeOrLeaf(node, level, offset) {
      return level === 0
        ? iterateLeaf(node, offset)
        : iterateNode(node, level, offset);
    }

    function iterateLeaf(node, offset) {
      var array = offset === tailPos ? tail && tail.array : node && node.array;
      var from = offset > left ? 0 : left - offset;
      var to = right - offset;
      if (to > SIZE) {
        to = SIZE;
      }
      return function () {
        if (from === to) {
          return DONE;
        }
        var idx = reverse ? --to : from++;
        return array && array[idx];
      };
    }

    function iterateNode(node, level, offset) {
      var values;
      var array = node && node.array;
      var from = offset > left ? 0 : (left - offset) >> level;
      var to = ((right - offset) >> level) + 1;
      if (to > SIZE) {
        to = SIZE;
      }
      return function () {
        while (true) {
          if (values) {
            var value = values();
            if (value !== DONE) {
              return value;
            }
            values = null;
          }
          if (from === to) {
            return DONE;
          }
          var idx = reverse ? --to : from++;
          values = iterateNodeOrLeaf(
            array && array[idx],
            level - SHIFT,
            offset + (idx << level)
          );
        }
      };
    }
  }

  function makeList(origin, capacity, level, root, tail, ownerID, hash) {
    var list = Object.create(ListPrototype);
    list.size = capacity - origin;
    list._origin = origin;
    list._capacity = capacity;
    list._level = level;
    list._root = root;
    list._tail = tail;
    list.__ownerID = ownerID;
    list.__hash = hash;
    list.__altered = false;
    return list;
  }

  var EMPTY_LIST;
  function emptyList() {
    return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
  }

  function updateList(list, index, value) {
    index = wrapIndex(list, index);

    if (index !== index) {
      return list;
    }

    if (index >= list.size || index < 0) {
      return list.withMutations(function (list) {
        index < 0
          ? setListBounds(list, index).set(0, value)
          : setListBounds(list, 0, index + 1).set(index, value);
      });
    }

    index += list._origin;

    var newTail = list._tail;
    var newRoot = list._root;
    var didAlter = MakeRef();
    if (index >= getTailOffset(list._capacity)) {
      newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
    } else {
      newRoot = updateVNode(
        newRoot,
        list.__ownerID,
        list._level,
        index,
        value,
        didAlter
      );
    }

    if (!didAlter.value) {
      return list;
    }

    if (list.__ownerID) {
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
  }

  function updateVNode(node, ownerID, level, index, value, didAlter) {
    var idx = (index >>> level) & MASK;
    var nodeHas = node && idx < node.array.length;
    if (!nodeHas && value === undefined) {
      return node;
    }

    var newNode;

    if (level > 0) {
      var lowerNode = node && node.array[idx];
      var newLowerNode = updateVNode(
        lowerNode,
        ownerID,
        level - SHIFT,
        index,
        value,
        didAlter
      );
      if (newLowerNode === lowerNode) {
        return node;
      }
      newNode = editableVNode(node, ownerID);
      newNode.array[idx] = newLowerNode;
      return newNode;
    }

    if (nodeHas && node.array[idx] === value) {
      return node;
    }

    if (didAlter) {
      SetRef(didAlter);
    }

    newNode = editableVNode(node, ownerID);
    if (value === undefined && idx === newNode.array.length - 1) {
      newNode.array.pop();
    } else {
      newNode.array[idx] = value;
    }
    return newNode;
  }

  function editableVNode(node, ownerID) {
    if (ownerID && node && ownerID === node.ownerID) {
      return node;
    }
    return new VNode(node ? node.array.slice() : [], ownerID);
  }

  function listNodeFor(list, rawIndex) {
    if (rawIndex >= getTailOffset(list._capacity)) {
      return list._tail;
    }
    if (rawIndex < 1 << (list._level + SHIFT)) {
      var node = list._root;
      var level = list._level;
      while (node && level > 0) {
        node = node.array[(rawIndex >>> level) & MASK];
        level -= SHIFT;
      }
      return node;
    }
  }

  function setListBounds(list, begin, end) {
    // Sanitize begin & end using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    if (begin !== undefined) {
      begin |= 0;
    }
    if (end !== undefined) {
      end |= 0;
    }
    var owner = list.__ownerID || new OwnerID();
    var oldOrigin = list._origin;
    var oldCapacity = list._capacity;
    var newOrigin = oldOrigin + begin;
    var newCapacity =
      end === undefined
        ? oldCapacity
        : end < 0
        ? oldCapacity + end
        : oldOrigin + end;
    if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
      return list;
    }

    // If it's going to end after it starts, it's empty.
    if (newOrigin >= newCapacity) {
      return list.clear();
    }

    var newLevel = list._level;
    var newRoot = list._root;

    // New origin might need creating a higher root.
    var offsetShift = 0;
    while (newOrigin + offsetShift < 0) {
      newRoot = new VNode(
        newRoot && newRoot.array.length ? [undefined, newRoot] : [],
        owner
      );
      newLevel += SHIFT;
      offsetShift += 1 << newLevel;
    }
    if (offsetShift) {
      newOrigin += offsetShift;
      oldOrigin += offsetShift;
      newCapacity += offsetShift;
      oldCapacity += offsetShift;
    }

    var oldTailOffset = getTailOffset(oldCapacity);
    var newTailOffset = getTailOffset(newCapacity);

    // New size might need creating a higher root.
    while (newTailOffset >= 1 << (newLevel + SHIFT)) {
      newRoot = new VNode(
        newRoot && newRoot.array.length ? [newRoot] : [],
        owner
      );
      newLevel += SHIFT;
    }

    // Locate or create the new tail.
    var oldTail = list._tail;
    var newTail =
      newTailOffset < oldTailOffset
        ? listNodeFor(list, newCapacity - 1)
        : newTailOffset > oldTailOffset
        ? new VNode([], owner)
        : oldTail;

    // Merge Tail into tree.
    if (
      oldTail &&
      newTailOffset > oldTailOffset &&
      newOrigin < oldCapacity &&
      oldTail.array.length
    ) {
      newRoot = editableVNode(newRoot, owner);
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = editableVNode(node.array[idx], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
    }

    // If the size has been reduced, there's a chance the tail needs to be trimmed.
    if (newCapacity < oldCapacity) {
      newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
    }

    // If the new origin is within the tail, then we do not need a root.
    if (newOrigin >= newTailOffset) {
      newOrigin -= newTailOffset;
      newCapacity -= newTailOffset;
      newLevel = SHIFT;
      newRoot = null;
      newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

      // Otherwise, if the root has been trimmed, garbage collect.
    } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
      offsetShift = 0;

      // Identify the new top root node of the subtree of the old root.
      while (newRoot) {
        var beginIndex = (newOrigin >>> newLevel) & MASK;
        if ((beginIndex !== newTailOffset >>> newLevel) & MASK) {
          break;
        }
        if (beginIndex) {
          offsetShift += (1 << newLevel) * beginIndex;
        }
        newLevel -= SHIFT;
        newRoot = newRoot.array[beginIndex];
      }

      // Trim the new sides of the new root.
      if (newRoot && newOrigin > oldOrigin) {
        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
      }
      if (newRoot && newTailOffset < oldTailOffset) {
        newRoot = newRoot.removeAfter(
          owner,
          newLevel,
          newTailOffset - offsetShift
        );
      }
      if (offsetShift) {
        newOrigin -= offsetShift;
        newCapacity -= offsetShift;
      }
    }

    if (list.__ownerID) {
      list.size = newCapacity - newOrigin;
      list._origin = newOrigin;
      list._capacity = newCapacity;
      list._level = newLevel;
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
  }

  function getTailOffset(size) {
    return size < SIZE ? 0 : ((size - 1) >>> SHIFT) << SHIFT;
  }

  var OrderedMap = /*@__PURE__*/(function (Map) {
    function OrderedMap(value) {
      return value === null || value === undefined
        ? emptyOrderedMap()
        : isOrderedMap(value)
        ? value
        : emptyOrderedMap().withMutations(function (map) {
            var iter = KeyedCollection(value);
            assertNotInfinite(iter.size);
            iter.forEach(function (v, k) { return map.set(k, v); });
          });
    }

    if ( Map ) OrderedMap.__proto__ = Map;
    OrderedMap.prototype = Object.create( Map && Map.prototype );
    OrderedMap.prototype.constructor = OrderedMap;

    OrderedMap.of = function of (/*...values*/) {
      return this(arguments);
    };

    OrderedMap.prototype.toString = function toString () {
      return this.__toString('OrderedMap {', '}');
    };

    // @pragma Access

    OrderedMap.prototype.get = function get (k, notSetValue) {
      var index = this._map.get(k);
      return index !== undefined ? this._list.get(index)[1] : notSetValue;
    };

    // @pragma Modification

    OrderedMap.prototype.clear = function clear () {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._map.clear();
        this._list.clear();
        return this;
      }
      return emptyOrderedMap();
    };

    OrderedMap.prototype.set = function set (k, v) {
      return updateOrderedMap(this, k, v);
    };

    OrderedMap.prototype.remove = function remove (k) {
      return updateOrderedMap(this, k, NOT_SET);
    };

    OrderedMap.prototype.wasAltered = function wasAltered () {
      return this._map.wasAltered() || this._list.wasAltered();
    };

    OrderedMap.prototype.__iterate = function __iterate (fn, reverse) {
      var this$1 = this;

      return this._list.__iterate(
        function (entry) { return entry && fn(entry[1], entry[0], this$1); },
        reverse
      );
    };

    OrderedMap.prototype.__iterator = function __iterator (type, reverse) {
      return this._list.fromEntrySeq().__iterator(type, reverse);
    };

    OrderedMap.prototype.__ensureOwner = function __ensureOwner (ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      var newList = this._list.__ensureOwner(ownerID);
      if (!ownerID) {
        if (this.size === 0) {
          return emptyOrderedMap();
        }
        this.__ownerID = ownerID;
        this._map = newMap;
        this._list = newList;
        return this;
      }
      return makeOrderedMap(newMap, newList, ownerID, this.__hash);
    };

    return OrderedMap;
  }(Map));

  OrderedMap.isOrderedMap = isOrderedMap;

  OrderedMap.prototype[IS_ORDERED_SYMBOL] = true;
  OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;

  function makeOrderedMap(map, list, ownerID, hash) {
    var omap = Object.create(OrderedMap.prototype);
    omap.size = map ? map.size : 0;
    omap._map = map;
    omap._list = list;
    omap.__ownerID = ownerID;
    omap.__hash = hash;
    return omap;
  }

  var EMPTY_ORDERED_MAP;
  function emptyOrderedMap() {
    return (
      EMPTY_ORDERED_MAP ||
      (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()))
    );
  }

  function updateOrderedMap(omap, k, v) {
    var map = omap._map;
    var list = omap._list;
    var i = map.get(k);
    var has = i !== undefined;
    var newMap;
    var newList;
    if (v === NOT_SET) {
      // removed
      if (!has) {
        return omap;
      }
      if (list.size >= SIZE && list.size >= map.size * 2) {
        newList = list.filter(function (entry, idx) { return entry !== undefined && i !== idx; });
        newMap = newList
          .toKeyedSeq()
          .map(function (entry) { return entry[0]; })
          .flip()
          .toMap();
        if (omap.__ownerID) {
          newMap.__ownerID = newList.__ownerID = omap.__ownerID;
        }
      } else {
        newMap = map.remove(k);
        newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
      }
    } else if (has) {
      if (v === list.get(i)[1]) {
        return omap;
      }
      newMap = map;
      newList = list.set(i, [k, v]);
    } else {
      newMap = map.set(k, list.size);
      newList = list.set(list.size, [k, v]);
    }
    if (omap.__ownerID) {
      omap.size = newMap.size;
      omap._map = newMap;
      omap._list = newList;
      omap.__hash = undefined;
      return omap;
    }
    return makeOrderedMap(newMap, newList);
  }

  var IS_STACK_SYMBOL = '@@__IMMUTABLE_STACK__@@';

  function isStack(maybeStack) {
    return Boolean(maybeStack && maybeStack[IS_STACK_SYMBOL]);
  }

  var Stack = /*@__PURE__*/(function (IndexedCollection) {
    function Stack(value) {
      return value === null || value === undefined
        ? emptyStack()
        : isStack(value)
        ? value
        : emptyStack().pushAll(value);
    }

    if ( IndexedCollection ) Stack.__proto__ = IndexedCollection;
    Stack.prototype = Object.create( IndexedCollection && IndexedCollection.prototype );
    Stack.prototype.constructor = Stack;

    Stack.of = function of (/*...values*/) {
      return this(arguments);
    };

    Stack.prototype.toString = function toString () {
      return this.__toString('Stack [', ']');
    };

    // @pragma Access

    Stack.prototype.get = function get (index, notSetValue) {
      var head = this._head;
      index = wrapIndex(this, index);
      while (head && index--) {
        head = head.next;
      }
      return head ? head.value : notSetValue;
    };

    Stack.prototype.peek = function peek () {
      return this._head && this._head.value;
    };

    // @pragma Modification

    Stack.prototype.push = function push (/*...values*/) {
      var arguments$1 = arguments;

      if (arguments.length === 0) {
        return this;
      }
      var newSize = this.size + arguments.length;
      var head = this._head;
      for (var ii = arguments.length - 1; ii >= 0; ii--) {
        head = {
          value: arguments$1[ii],
          next: head,
        };
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pushAll = function pushAll (iter) {
      iter = IndexedCollection(iter);
      if (iter.size === 0) {
        return this;
      }
      if (this.size === 0 && isStack(iter)) {
        return iter;
      }
      assertNotInfinite(iter.size);
      var newSize = this.size;
      var head = this._head;
      iter.__iterate(function (value) {
        newSize++;
        head = {
          value: value,
          next: head,
        };
      }, /* reverse */ true);
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pop = function pop () {
      return this.slice(1);
    };

    Stack.prototype.clear = function clear () {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._head = undefined;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyStack();
    };

    Stack.prototype.slice = function slice (begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      var resolvedBegin = resolveBegin(begin, this.size);
      var resolvedEnd = resolveEnd(end, this.size);
      if (resolvedEnd !== this.size) {
        // super.slice(begin, end);
        return IndexedCollection.prototype.slice.call(this, begin, end);
      }
      var newSize = this.size - resolvedBegin;
      var head = this._head;
      while (resolvedBegin--) {
        head = head.next;
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    // @pragma Mutability

    Stack.prototype.__ensureOwner = function __ensureOwner (ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        if (this.size === 0) {
          return emptyStack();
        }
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeStack(this.size, this._head, ownerID, this.__hash);
    };

    // @pragma Iteration

    Stack.prototype.__iterate = function __iterate (fn, reverse) {
      var this$1 = this;

      if (reverse) {
        return new ArraySeq(this.toArray()).__iterate(
          function (v, k) { return fn(v, k, this$1); },
          reverse
        );
      }
      var iterations = 0;
      var node = this._head;
      while (node) {
        if (fn(node.value, iterations++, this) === false) {
          break;
        }
        node = node.next;
      }
      return iterations;
    };

    Stack.prototype.__iterator = function __iterator (type, reverse) {
      if (reverse) {
        return new ArraySeq(this.toArray()).__iterator(type, reverse);
      }
      var iterations = 0;
      var node = this._head;
      return new Iterator(function () {
        if (node) {
          var value = node.value;
          node = node.next;
          return iteratorValue(type, iterations++, value);
        }
        return iteratorDone();
      });
    };

    return Stack;
  }(IndexedCollection));

  Stack.isStack = isStack;

  var StackPrototype = Stack.prototype;
  StackPrototype[IS_STACK_SYMBOL] = true;
  StackPrototype.shift = StackPrototype.pop;
  StackPrototype.unshift = StackPrototype.push;
  StackPrototype.unshiftAll = StackPrototype.pushAll;
  StackPrototype.withMutations = withMutations;
  StackPrototype.wasAltered = wasAltered;
  StackPrototype.asImmutable = asImmutable;
  StackPrototype['@@transducer/init'] = StackPrototype.asMutable = asMutable;
  StackPrototype['@@transducer/step'] = function (result, arr) {
    return result.unshift(arr);
  };
  StackPrototype['@@transducer/result'] = function (obj) {
    return obj.asImmutable();
  };

  function makeStack(size, head, ownerID, hash) {
    var map = Object.create(StackPrototype);
    map.size = size;
    map._head = head;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_STACK;
  function emptyStack() {
    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
  }

  var IS_SET_SYMBOL = '@@__IMMUTABLE_SET__@@';

  function isSet(maybeSet) {
    return Boolean(maybeSet && maybeSet[IS_SET_SYMBOL]);
  }

  function isOrderedSet(maybeOrderedSet) {
    return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
  }

  function deepEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (
      !isCollection(b) ||
      (a.size !== undefined && b.size !== undefined && a.size !== b.size) ||
      (a.__hash !== undefined &&
        b.__hash !== undefined &&
        a.__hash !== b.__hash) ||
      isKeyed(a) !== isKeyed(b) ||
      isIndexed(a) !== isIndexed(b) ||
      isOrdered(a) !== isOrdered(b)
    ) {
      return false;
    }

    if (a.size === 0 && b.size === 0) {
      return true;
    }

    var notAssociative = !isAssociative(a);

    if (isOrdered(a)) {
      var entries = a.entries();
      return (
        b.every(function (v, k) {
          var entry = entries.next().value;
          return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
        }) && entries.next().done
      );
    }

    var flipped = false;

    if (a.size === undefined) {
      if (b.size === undefined) {
        if (typeof a.cacheResult === 'function') {
          a.cacheResult();
        }
      } else {
        flipped = true;
        var _ = a;
        a = b;
        b = _;
      }
    }

    var allEqual = true;
    var bSize = b.__iterate(function (v, k) {
      if (
        notAssociative
          ? !a.has(v)
          : flipped
          ? !is(v, a.get(k, NOT_SET))
          : !is(a.get(k, NOT_SET), v)
      ) {
        allEqual = false;
        return false;
      }
    });

    return allEqual && a.size === bSize;
  }

  function mixin(ctor, methods) {
    var keyCopier = function (key) {
      ctor.prototype[key] = methods[key];
    };
    Object.keys(methods).forEach(keyCopier);
    Object.getOwnPropertySymbols &&
      Object.getOwnPropertySymbols(methods).forEach(keyCopier);
    return ctor;
  }

  function toJS(value) {
    if (!value || typeof value !== 'object') {
      return value;
    }
    if (!isCollection(value)) {
      if (!isDataStructure(value)) {
        return value;
      }
      value = Seq(value);
    }
    if (isKeyed(value)) {
      var result$1 = {};
      value.__iterate(function (v, k) {
        result$1[k] = toJS(v);
      });
      return result$1;
    }
    var result = [];
    value.__iterate(function (v) {
      result.push(toJS(v));
    });
    return result;
  }

  var Set = /*@__PURE__*/(function (SetCollection) {
    function Set(value) {
      return value === null || value === undefined
        ? emptySet()
        : isSet(value) && !isOrdered(value)
        ? value
        : emptySet().withMutations(function (set) {
            var iter = SetCollection(value);
            assertNotInfinite(iter.size);
            iter.forEach(function (v) { return set.add(v); });
          });
    }

    if ( SetCollection ) Set.__proto__ = SetCollection;
    Set.prototype = Object.create( SetCollection && SetCollection.prototype );
    Set.prototype.constructor = Set;

    Set.of = function of (/*...values*/) {
      return this(arguments);
    };

    Set.fromKeys = function fromKeys (value) {
      return this(KeyedCollection(value).keySeq());
    };

    Set.intersect = function intersect (sets) {
      sets = Collection(sets).toArray();
      return sets.length
        ? SetPrototype.intersect.apply(Set(sets.pop()), sets)
        : emptySet();
    };

    Set.union = function union (sets) {
      sets = Collection(sets).toArray();
      return sets.length
        ? SetPrototype.union.apply(Set(sets.pop()), sets)
        : emptySet();
    };

    Set.prototype.toString = function toString () {
      return this.__toString('Set {', '}');
    };

    // @pragma Access

    Set.prototype.has = function has (value) {
      return this._map.has(value);
    };

    // @pragma Modification

    Set.prototype.add = function add (value) {
      return updateSet(this, this._map.set(value, value));
    };

    Set.prototype.remove = function remove (value) {
      return updateSet(this, this._map.remove(value));
    };

    Set.prototype.clear = function clear () {
      return updateSet(this, this._map.clear());
    };

    // @pragma Composition

    Set.prototype.map = function map (mapper, context) {
      var this$1 = this;

      var removes = [];
      var adds = [];
      this.forEach(function (value) {
        var mapped = mapper.call(context, value, value, this$1);
        if (mapped !== value) {
          removes.push(value);
          adds.push(mapped);
        }
      });
      return this.withMutations(function (set) {
        removes.forEach(function (value) { return set.remove(value); });
        adds.forEach(function (value) { return set.add(value); });
      });
    };

    Set.prototype.union = function union () {
      var iters = [], len = arguments.length;
      while ( len-- ) iters[ len ] = arguments[ len ];

      iters = iters.filter(function (x) { return x.size !== 0; });
      if (iters.length === 0) {
        return this;
      }
      if (this.size === 0 && !this.__ownerID && iters.length === 1) {
        return this.constructor(iters[0]);
      }
      return this.withMutations(function (set) {
        for (var ii = 0; ii < iters.length; ii++) {
          SetCollection(iters[ii]).forEach(function (value) { return set.add(value); });
        }
      });
    };

    Set.prototype.intersect = function intersect () {
      var iters = [], len = arguments.length;
      while ( len-- ) iters[ len ] = arguments[ len ];

      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function (iter) { return SetCollection(iter); });
      var toRemove = [];
      this.forEach(function (value) {
        if (!iters.every(function (iter) { return iter.includes(value); })) {
          toRemove.push(value);
        }
      });
      return this.withMutations(function (set) {
        toRemove.forEach(function (value) {
          set.remove(value);
        });
      });
    };

    Set.prototype.subtract = function subtract () {
      var iters = [], len = arguments.length;
      while ( len-- ) iters[ len ] = arguments[ len ];

      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function (iter) { return SetCollection(iter); });
      var toRemove = [];
      this.forEach(function (value) {
        if (iters.some(function (iter) { return iter.includes(value); })) {
          toRemove.push(value);
        }
      });
      return this.withMutations(function (set) {
        toRemove.forEach(function (value) {
          set.remove(value);
        });
      });
    };

    Set.prototype.sort = function sort (comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator));
    };

    Set.prototype.sortBy = function sortBy (mapper, comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator, mapper));
    };

    Set.prototype.wasAltered = function wasAltered () {
      return this._map.wasAltered();
    };

    Set.prototype.__iterate = function __iterate (fn, reverse) {
      var this$1 = this;

      return this._map.__iterate(function (k) { return fn(k, k, this$1); }, reverse);
    };

    Set.prototype.__iterator = function __iterator (type, reverse) {
      return this._map.__iterator(type, reverse);
    };

    Set.prototype.__ensureOwner = function __ensureOwner (ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        if (this.size === 0) {
          return this.__empty();
        }
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return this.__make(newMap, ownerID);
    };

    return Set;
  }(SetCollection));

  Set.isSet = isSet;

  var SetPrototype = Set.prototype;
  SetPrototype[IS_SET_SYMBOL] = true;
  SetPrototype[DELETE] = SetPrototype.remove;
  SetPrototype.merge = SetPrototype.concat = SetPrototype.union;
  SetPrototype.withMutations = withMutations;
  SetPrototype.asImmutable = asImmutable;
  SetPrototype['@@transducer/init'] = SetPrototype.asMutable = asMutable;
  SetPrototype['@@transducer/step'] = function (result, arr) {
    return result.add(arr);
  };
  SetPrototype['@@transducer/result'] = function (obj) {
    return obj.asImmutable();
  };

  SetPrototype.__empty = emptySet;
  SetPrototype.__make = makeSet;

  function updateSet(set, newMap) {
    if (set.__ownerID) {
      set.size = newMap.size;
      set._map = newMap;
      return set;
    }
    return newMap === set._map
      ? set
      : newMap.size === 0
      ? set.__empty()
      : set.__make(newMap);
  }

  function makeSet(map, ownerID) {
    var set = Object.create(SetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_SET;
  function emptySet() {
    return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
  }

  /**
   * Returns a lazy seq of nums from start (inclusive) to end
   * (exclusive), by step, where start defaults to 0, step to 1, and end to
   * infinity. When start is equal to end, returns empty list.
   */
  var Range = /*@__PURE__*/(function (IndexedSeq) {
    function Range(start, end, step) {
      if (!(this instanceof Range)) {
        return new Range(start, end, step);
      }
      invariant(step !== 0, 'Cannot step a Range by 0');
      start = start || 0;
      if (end === undefined) {
        end = Infinity;
      }
      step = step === undefined ? 1 : Math.abs(step);
      if (end < start) {
        step = -step;
      }
      this._start = start;
      this._end = end;
      this._step = step;
      this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
      if (this.size === 0) {
        if (EMPTY_RANGE) {
          return EMPTY_RANGE;
        }
        EMPTY_RANGE = this;
      }
    }

    if ( IndexedSeq ) Range.__proto__ = IndexedSeq;
    Range.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
    Range.prototype.constructor = Range;

    Range.prototype.toString = function toString () {
      if (this.size === 0) {
        return 'Range []';
      }
      return (
        'Range [ ' +
        this._start +
        '...' +
        this._end +
        (this._step !== 1 ? ' by ' + this._step : '') +
        ' ]'
      );
    };

    Range.prototype.get = function get (index, notSetValue) {
      return this.has(index)
        ? this._start + wrapIndex(this, index) * this._step
        : notSetValue;
    };

    Range.prototype.includes = function includes (searchValue) {
      var possibleIndex = (searchValue - this._start) / this._step;
      return (
        possibleIndex >= 0 &&
        possibleIndex < this.size &&
        possibleIndex === Math.floor(possibleIndex)
      );
    };

    Range.prototype.slice = function slice (begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      begin = resolveBegin(begin, this.size);
      end = resolveEnd(end, this.size);
      if (end <= begin) {
        return new Range(0, 0);
      }
      return new Range(
        this.get(begin, this._end),
        this.get(end, this._end),
        this._step
      );
    };

    Range.prototype.indexOf = function indexOf (searchValue) {
      var offsetValue = searchValue - this._start;
      if (offsetValue % this._step === 0) {
        var index = offsetValue / this._step;
        if (index >= 0 && index < this.size) {
          return index;
        }
      }
      return -1;
    };

    Range.prototype.lastIndexOf = function lastIndexOf (searchValue) {
      return this.indexOf(searchValue);
    };

    Range.prototype.__iterate = function __iterate (fn, reverse) {
      var size = this.size;
      var step = this._step;
      var value = reverse ? this._start + (size - 1) * step : this._start;
      var i = 0;
      while (i !== size) {
        if (fn(value, reverse ? size - ++i : i++, this) === false) {
          break;
        }
        value += reverse ? -step : step;
      }
      return i;
    };

    Range.prototype.__iterator = function __iterator (type, reverse) {
      var size = this.size;
      var step = this._step;
      var value = reverse ? this._start + (size - 1) * step : this._start;
      var i = 0;
      return new Iterator(function () {
        if (i === size) {
          return iteratorDone();
        }
        var v = value;
        value += reverse ? -step : step;
        return iteratorValue(type, reverse ? size - ++i : i++, v);
      });
    };

    Range.prototype.equals = function equals (other) {
      return other instanceof Range
        ? this._start === other._start &&
            this._end === other._end &&
            this._step === other._step
        : deepEqual(this, other);
    };

    return Range;
  }(IndexedSeq));

  var EMPTY_RANGE;

  function getIn(collection, searchKeyPath, notSetValue) {
    var keyPath = coerceKeyPath(searchKeyPath);
    var i = 0;
    while (i !== keyPath.length) {
      collection = get(collection, keyPath[i++], NOT_SET);
      if (collection === NOT_SET) {
        return notSetValue;
      }
    }
    return collection;
  }

  function getIn$1(searchKeyPath, notSetValue) {
    return getIn(this, searchKeyPath, notSetValue);
  }

  function hasIn(collection, keyPath) {
    return getIn(collection, keyPath, NOT_SET) !== NOT_SET;
  }

  function hasIn$1(searchKeyPath) {
    return hasIn(this, searchKeyPath);
  }

  function toObject() {
    assertNotInfinite(this.size);
    var object = {};
    this.__iterate(function (v, k) {
      object[k] = v;
    });
    return object;
  }

  // Note: all of these methods are deprecated.
  Collection.isIterable = isCollection;
  Collection.isKeyed = isKeyed;
  Collection.isIndexed = isIndexed;
  Collection.isAssociative = isAssociative;
  Collection.isOrdered = isOrdered;

  Collection.Iterator = Iterator;

  mixin(Collection, {
    // ### Conversion to other types

    toArray: function toArray() {
      assertNotInfinite(this.size);
      var array = new Array(this.size || 0);
      var useTuples = isKeyed(this);
      var i = 0;
      this.__iterate(function (v, k) {
        // Keyed collections produce an array of tuples.
        array[i++] = useTuples ? [k, v] : v;
      });
      return array;
    },

    toIndexedSeq: function toIndexedSeq() {
      return new ToIndexedSequence(this);
    },

    toJS: function toJS$1() {
      return toJS(this);
    },

    toKeyedSeq: function toKeyedSeq() {
      return new ToKeyedSequence(this, true);
    },

    toMap: function toMap() {
      // Use Late Binding here to solve the circular dependency.
      return Map(this.toKeyedSeq());
    },

    toObject: toObject,

    toOrderedMap: function toOrderedMap() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedMap(this.toKeyedSeq());
    },

    toOrderedSet: function toOrderedSet() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
    },

    toSet: function toSet() {
      // Use Late Binding here to solve the circular dependency.
      return Set(isKeyed(this) ? this.valueSeq() : this);
    },

    toSetSeq: function toSetSeq() {
      return new ToSetSequence(this);
    },

    toSeq: function toSeq() {
      return isIndexed(this)
        ? this.toIndexedSeq()
        : isKeyed(this)
        ? this.toKeyedSeq()
        : this.toSetSeq();
    },

    toStack: function toStack() {
      // Use Late Binding here to solve the circular dependency.
      return Stack(isKeyed(this) ? this.valueSeq() : this);
    },

    toList: function toList() {
      // Use Late Binding here to solve the circular dependency.
      return List(isKeyed(this) ? this.valueSeq() : this);
    },

    // ### Common JavaScript methods and properties

    toString: function toString() {
      return '[Collection]';
    },

    __toString: function __toString(head, tail) {
      if (this.size === 0) {
        return head + tail;
      }
      return (
        head +
        ' ' +
        this.toSeq().map(this.__toStringMapper).join(', ') +
        ' ' +
        tail
      );
    },

    // ### ES6 Collection methods (ES6 Array and Map)

    concat: function concat() {
      var values = [], len = arguments.length;
      while ( len-- ) values[ len ] = arguments[ len ];

      return reify(this, concatFactory(this, values));
    },

    includes: function includes(searchValue) {
      return this.some(function (value) { return is(value, searchValue); });
    },

    entries: function entries() {
      return this.__iterator(ITERATE_ENTRIES);
    },

    every: function every(predicate, context) {
      assertNotInfinite(this.size);
      var returnValue = true;
      this.__iterate(function (v, k, c) {
        if (!predicate.call(context, v, k, c)) {
          returnValue = false;
          return false;
        }
      });
      return returnValue;
    },

    filter: function filter(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, true));
    },

    find: function find(predicate, context, notSetValue) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[1] : notSetValue;
    },

    forEach: function forEach(sideEffect, context) {
      assertNotInfinite(this.size);
      return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
    },

    join: function join(separator) {
      assertNotInfinite(this.size);
      separator = separator !== undefined ? '' + separator : ',';
      var joined = '';
      var isFirst = true;
      this.__iterate(function (v) {
        isFirst ? (isFirst = false) : (joined += separator);
        joined += v !== null && v !== undefined ? v.toString() : '';
      });
      return joined;
    },

    keys: function keys() {
      return this.__iterator(ITERATE_KEYS);
    },

    map: function map(mapper, context) {
      return reify(this, mapFactory(this, mapper, context));
    },

    reduce: function reduce$1(reducer, initialReduction, context) {
      return reduce(
        this,
        reducer,
        initialReduction,
        context,
        arguments.length < 2,
        false
      );
    },

    reduceRight: function reduceRight(reducer, initialReduction, context) {
      return reduce(
        this,
        reducer,
        initialReduction,
        context,
        arguments.length < 2,
        true
      );
    },

    reverse: function reverse() {
      return reify(this, reverseFactory(this, true));
    },

    slice: function slice(begin, end) {
      return reify(this, sliceFactory(this, begin, end, true));
    },

    some: function some(predicate, context) {
      return !this.every(not(predicate), context);
    },

    sort: function sort(comparator) {
      return reify(this, sortFactory(this, comparator));
    },

    values: function values() {
      return this.__iterator(ITERATE_VALUES);
    },

    // ### More sequential methods

    butLast: function butLast() {
      return this.slice(0, -1);
    },

    isEmpty: function isEmpty() {
      return this.size !== undefined ? this.size === 0 : !this.some(function () { return true; });
    },

    count: function count(predicate, context) {
      return ensureSize(
        predicate ? this.toSeq().filter(predicate, context) : this
      );
    },

    countBy: function countBy(grouper, context) {
      return countByFactory(this, grouper, context);
    },

    equals: function equals(other) {
      return deepEqual(this, other);
    },

    entrySeq: function entrySeq() {
      var collection = this;
      if (collection._cache) {
        // We cache as an entries array, so we can just return the cache!
        return new ArraySeq(collection._cache);
      }
      var entriesSequence = collection.toSeq().map(entryMapper).toIndexedSeq();
      entriesSequence.fromEntrySeq = function () { return collection.toSeq(); };
      return entriesSequence;
    },

    filterNot: function filterNot(predicate, context) {
      return this.filter(not(predicate), context);
    },

    findEntry: function findEntry(predicate, context, notSetValue) {
      var found = notSetValue;
      this.__iterate(function (v, k, c) {
        if (predicate.call(context, v, k, c)) {
          found = [k, v];
          return false;
        }
      });
      return found;
    },

    findKey: function findKey(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry && entry[0];
    },

    findLast: function findLast(predicate, context, notSetValue) {
      return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
    },

    findLastEntry: function findLastEntry(predicate, context, notSetValue) {
      return this.toKeyedSeq()
        .reverse()
        .findEntry(predicate, context, notSetValue);
    },

    findLastKey: function findLastKey(predicate, context) {
      return this.toKeyedSeq().reverse().findKey(predicate, context);
    },

    first: function first(notSetValue) {
      return this.find(returnTrue, null, notSetValue);
    },

    flatMap: function flatMap(mapper, context) {
      return reify(this, flatMapFactory(this, mapper, context));
    },

    flatten: function flatten(depth) {
      return reify(this, flattenFactory(this, depth, true));
    },

    fromEntrySeq: function fromEntrySeq() {
      return new FromEntriesSequence(this);
    },

    get: function get(searchKey, notSetValue) {
      return this.find(function (_, key) { return is(key, searchKey); }, undefined, notSetValue);
    },

    getIn: getIn$1,

    groupBy: function groupBy(grouper, context) {
      return groupByFactory(this, grouper, context);
    },

    has: function has(searchKey) {
      return this.get(searchKey, NOT_SET) !== NOT_SET;
    },

    hasIn: hasIn$1,

    isSubset: function isSubset(iter) {
      iter = typeof iter.includes === 'function' ? iter : Collection(iter);
      return this.every(function (value) { return iter.includes(value); });
    },

    isSuperset: function isSuperset(iter) {
      iter = typeof iter.isSubset === 'function' ? iter : Collection(iter);
      return iter.isSubset(this);
    },

    keyOf: function keyOf(searchValue) {
      return this.findKey(function (value) { return is(value, searchValue); });
    },

    keySeq: function keySeq() {
      return this.toSeq().map(keyMapper).toIndexedSeq();
    },

    last: function last(notSetValue) {
      return this.toSeq().reverse().first(notSetValue);
    },

    lastKeyOf: function lastKeyOf(searchValue) {
      return this.toKeyedSeq().reverse().keyOf(searchValue);
    },

    max: function max(comparator) {
      return maxFactory(this, comparator);
    },

    maxBy: function maxBy(mapper, comparator) {
      return maxFactory(this, comparator, mapper);
    },

    min: function min(comparator) {
      return maxFactory(
        this,
        comparator ? neg(comparator) : defaultNegComparator
      );
    },

    minBy: function minBy(mapper, comparator) {
      return maxFactory(
        this,
        comparator ? neg(comparator) : defaultNegComparator,
        mapper
      );
    },

    rest: function rest() {
      return this.slice(1);
    },

    skip: function skip(amount) {
      return amount === 0 ? this : this.slice(Math.max(0, amount));
    },

    skipLast: function skipLast(amount) {
      return amount === 0 ? this : this.slice(0, -Math.max(0, amount));
    },

    skipWhile: function skipWhile(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, true));
    },

    skipUntil: function skipUntil(predicate, context) {
      return this.skipWhile(not(predicate), context);
    },

    sortBy: function sortBy(mapper, comparator) {
      return reify(this, sortFactory(this, comparator, mapper));
    },

    take: function take(amount) {
      return this.slice(0, Math.max(0, amount));
    },

    takeLast: function takeLast(amount) {
      return this.slice(-Math.max(0, amount));
    },

    takeWhile: function takeWhile(predicate, context) {
      return reify(this, takeWhileFactory(this, predicate, context));
    },

    takeUntil: function takeUntil(predicate, context) {
      return this.takeWhile(not(predicate), context);
    },

    update: function update(fn) {
      return fn(this);
    },

    valueSeq: function valueSeq() {
      return this.toIndexedSeq();
    },

    // ### Hashable Object

    hashCode: function hashCode() {
      return this.__hash || (this.__hash = hashCollection(this));
    },

    // ### Internal

    // abstract __iterate(fn, reverse)

    // abstract __iterator(type, reverse)
  });

  var CollectionPrototype = Collection.prototype;
  CollectionPrototype[IS_COLLECTION_SYMBOL] = true;
  CollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.values;
  CollectionPrototype.toJSON = CollectionPrototype.toArray;
  CollectionPrototype.__toStringMapper = quoteString;
  CollectionPrototype.inspect = CollectionPrototype.toSource = function () {
    return this.toString();
  };
  CollectionPrototype.chain = CollectionPrototype.flatMap;
  CollectionPrototype.contains = CollectionPrototype.includes;

  mixin(KeyedCollection, {
    // ### More sequential methods

    flip: function flip() {
      return reify(this, flipFactory(this));
    },

    mapEntries: function mapEntries(mapper, context) {
      var this$1 = this;

      var iterations = 0;
      return reify(
        this,
        this.toSeq()
          .map(function (v, k) { return mapper.call(context, [k, v], iterations++, this$1); })
          .fromEntrySeq()
      );
    },

    mapKeys: function mapKeys(mapper, context) {
      var this$1 = this;

      return reify(
        this,
        this.toSeq()
          .flip()
          .map(function (k, v) { return mapper.call(context, k, v, this$1); })
          .flip()
      );
    },
  });

  var KeyedCollectionPrototype = KeyedCollection.prototype;
  KeyedCollectionPrototype[IS_KEYED_SYMBOL] = true;
  KeyedCollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.entries;
  KeyedCollectionPrototype.toJSON = toObject;
  KeyedCollectionPrototype.__toStringMapper = function (v, k) { return quoteString(k) + ': ' + quoteString(v); };

  mixin(IndexedCollection, {
    // ### Conversion to other types

    toKeyedSeq: function toKeyedSeq() {
      return new ToKeyedSequence(this, false);
    },

    // ### ES6 Collection methods (ES6 Array and Map)

    filter: function filter(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, false));
    },

    findIndex: function findIndex(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    indexOf: function indexOf(searchValue) {
      var key = this.keyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    lastIndexOf: function lastIndexOf(searchValue) {
      var key = this.lastKeyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    reverse: function reverse() {
      return reify(this, reverseFactory(this, false));
    },

    slice: function slice(begin, end) {
      return reify(this, sliceFactory(this, begin, end, false));
    },

    splice: function splice(index, removeNum /*, ...values*/) {
      var numArgs = arguments.length;
      removeNum = Math.max(removeNum || 0, 0);
      if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
        return this;
      }
      // If index is negative, it should resolve relative to the size of the
      // collection. However size may be expensive to compute if not cached, so
      // only call count() if the number is in fact negative.
      index = resolveBegin(index, index < 0 ? this.count() : this.size);
      var spliced = this.slice(0, index);
      return reify(
        this,
        numArgs === 1
          ? spliced
          : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
      );
    },

    // ### More collection methods

    findLastIndex: function findLastIndex(predicate, context) {
      var entry = this.findLastEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    first: function first(notSetValue) {
      return this.get(0, notSetValue);
    },

    flatten: function flatten(depth) {
      return reify(this, flattenFactory(this, depth, false));
    },

    get: function get(index, notSetValue) {
      index = wrapIndex(this, index);
      return index < 0 ||
        this.size === Infinity ||
        (this.size !== undefined && index > this.size)
        ? notSetValue
        : this.find(function (_, key) { return key === index; }, undefined, notSetValue);
    },

    has: function has(index) {
      index = wrapIndex(this, index);
      return (
        index >= 0 &&
        (this.size !== undefined
          ? this.size === Infinity || index < this.size
          : this.indexOf(index) !== -1)
      );
    },

    interpose: function interpose(separator) {
      return reify(this, interposeFactory(this, separator));
    },

    interleave: function interleave(/*...collections*/) {
      var collections = [this].concat(arrCopy(arguments));
      var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, collections);
      var interleaved = zipped.flatten(true);
      if (zipped.size) {
        interleaved.size = zipped.size * collections.length;
      }
      return reify(this, interleaved);
    },

    keySeq: function keySeq() {
      return Range(0, this.size);
    },

    last: function last(notSetValue) {
      return this.get(-1, notSetValue);
    },

    skipWhile: function skipWhile(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, false));
    },

    zip: function zip(/*, ...collections */) {
      var collections = [this].concat(arrCopy(arguments));
      return reify(this, zipWithFactory(this, defaultZipper, collections));
    },

    zipAll: function zipAll(/*, ...collections */) {
      var collections = [this].concat(arrCopy(arguments));
      return reify(this, zipWithFactory(this, defaultZipper, collections, true));
    },

    zipWith: function zipWith(zipper /*, ...collections */) {
      var collections = arrCopy(arguments);
      collections[0] = this;
      return reify(this, zipWithFactory(this, zipper, collections));
    },
  });

  var IndexedCollectionPrototype = IndexedCollection.prototype;
  IndexedCollectionPrototype[IS_INDEXED_SYMBOL] = true;
  IndexedCollectionPrototype[IS_ORDERED_SYMBOL] = true;

  mixin(SetCollection, {
    // ### ES6 Collection methods (ES6 Array and Map)

    get: function get(value, notSetValue) {
      return this.has(value) ? value : notSetValue;
    },

    includes: function includes(value) {
      return this.has(value);
    },

    // ### More sequential methods

    keySeq: function keySeq() {
      return this.valueSeq();
    },
  });

  SetCollection.prototype.has = CollectionPrototype.includes;
  SetCollection.prototype.contains = SetCollection.prototype.includes;

  // Mixin subclasses

  mixin(KeyedSeq, KeyedCollection.prototype);
  mixin(IndexedSeq, IndexedCollection.prototype);
  mixin(SetSeq, SetCollection.prototype);

  // #pragma Helper functions

  function reduce(collection, reducer, reduction, context, useFirst, reverse) {
    assertNotInfinite(collection.size);
    collection.__iterate(function (v, k, c) {
      if (useFirst) {
        useFirst = false;
        reduction = v;
      } else {
        reduction = reducer.call(context, reduction, v, k, c);
      }
    }, reverse);
    return reduction;
  }

  function keyMapper(v, k) {
    return k;
  }

  function entryMapper(v, k) {
    return [k, v];
  }

  function not(predicate) {
    return function () {
      return !predicate.apply(this, arguments);
    };
  }

  function neg(predicate) {
    return function () {
      return -predicate.apply(this, arguments);
    };
  }

  function defaultZipper() {
    return arrCopy(arguments);
  }

  function defaultNegComparator(a, b) {
    return a < b ? 1 : a > b ? -1 : 0;
  }

  function hashCollection(collection) {
    if (collection.size === Infinity) {
      return 0;
    }
    var ordered = isOrdered(collection);
    var keyed = isKeyed(collection);
    var h = ordered ? 1 : 0;
    var size = collection.__iterate(
      keyed
        ? ordered
          ? function (v, k) {
              h = (31 * h + hashMerge(hash(v), hash(k))) | 0;
            }
          : function (v, k) {
              h = (h + hashMerge(hash(v), hash(k))) | 0;
            }
        : ordered
        ? function (v) {
            h = (31 * h + hash(v)) | 0;
          }
        : function (v) {
            h = (h + hash(v)) | 0;
          }
    );
    return murmurHashOfSize(size, h);
  }

  function murmurHashOfSize(size, h) {
    h = imul(h, 0xcc9e2d51);
    h = imul((h << 15) | (h >>> -15), 0x1b873593);
    h = imul((h << 13) | (h >>> -13), 5);
    h = ((h + 0xe6546b64) | 0) ^ size;
    h = imul(h ^ (h >>> 16), 0x85ebca6b);
    h = imul(h ^ (h >>> 13), 0xc2b2ae35);
    h = smi(h ^ (h >>> 16));
    return h;
  }

  function hashMerge(a, b) {
    return (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0; // int
  }

  var OrderedSet = /*@__PURE__*/(function (Set) {
    function OrderedSet(value) {
      return value === null || value === undefined
        ? emptyOrderedSet()
        : isOrderedSet(value)
        ? value
        : emptyOrderedSet().withMutations(function (set) {
            var iter = SetCollection(value);
            assertNotInfinite(iter.size);
            iter.forEach(function (v) { return set.add(v); });
          });
    }

    if ( Set ) OrderedSet.__proto__ = Set;
    OrderedSet.prototype = Object.create( Set && Set.prototype );
    OrderedSet.prototype.constructor = OrderedSet;

    OrderedSet.of = function of (/*...values*/) {
      return this(arguments);
    };

    OrderedSet.fromKeys = function fromKeys (value) {
      return this(KeyedCollection(value).keySeq());
    };

    OrderedSet.prototype.toString = function toString () {
      return this.__toString('OrderedSet {', '}');
    };

    return OrderedSet;
  }(Set));

  OrderedSet.isOrderedSet = isOrderedSet;

  var OrderedSetPrototype = OrderedSet.prototype;
  OrderedSetPrototype[IS_ORDERED_SYMBOL] = true;
  OrderedSetPrototype.zip = IndexedCollectionPrototype.zip;
  OrderedSetPrototype.zipWith = IndexedCollectionPrototype.zipWith;

  OrderedSetPrototype.__empty = emptyOrderedSet;
  OrderedSetPrototype.__make = makeOrderedSet;

  function makeOrderedSet(map, ownerID) {
    var set = Object.create(OrderedSetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_ORDERED_SET;
  function emptyOrderedSet() {
    return (
      EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()))
    );
  }

  var Record = function Record(defaultValues, name) {
    var hasInitialized;

    var RecordType = function Record(values) {
      var this$1 = this;

      if (values instanceof RecordType) {
        return values;
      }
      if (!(this instanceof RecordType)) {
        return new RecordType(values);
      }
      if (!hasInitialized) {
        hasInitialized = true;
        var keys = Object.keys(defaultValues);
        var indices = (RecordTypePrototype._indices = {});
        // Deprecated: left to attempt not to break any external code which
        // relies on a ._name property existing on record instances.
        // Use Record.getDescriptiveName() instead
        RecordTypePrototype._name = name;
        RecordTypePrototype._keys = keys;
        RecordTypePrototype._defaultValues = defaultValues;
        for (var i = 0; i < keys.length; i++) {
          var propName = keys[i];
          indices[propName] = i;
          if (RecordTypePrototype[propName]) {
            /* eslint-disable no-console */
            typeof console === 'object' &&
              console.warn &&
              console.warn(
                'Cannot define ' +
                  recordName(this) +
                  ' with property "' +
                  propName +
                  '" since that property name is part of the Record API.'
              );
            /* eslint-enable no-console */
          } else {
            setProp(RecordTypePrototype, propName);
          }
        }
      }
      this.__ownerID = undefined;
      this._values = List().withMutations(function (l) {
        l.setSize(this$1._keys.length);
        KeyedCollection(values).forEach(function (v, k) {
          l.set(this$1._indices[k], v === this$1._defaultValues[k] ? undefined : v);
        });
      });
    };

    var RecordTypePrototype = (RecordType.prototype =
      Object.create(RecordPrototype));
    RecordTypePrototype.constructor = RecordType;

    if (name) {
      RecordType.displayName = name;
    }

    return RecordType;
  };

  Record.prototype.toString = function toString () {
    var str = recordName(this) + ' { ';
    var keys = this._keys;
    var k;
    for (var i = 0, l = keys.length; i !== l; i++) {
      k = keys[i];
      str += (i ? ', ' : '') + k + ': ' + quoteString(this.get(k));
    }
    return str + ' }';
  };

  Record.prototype.equals = function equals (other) {
    return (
      this === other ||
      (other &&
        this._keys === other._keys &&
        recordSeq(this).equals(recordSeq(other)))
    );
  };

  Record.prototype.hashCode = function hashCode () {
    return recordSeq(this).hashCode();
  };

  // @pragma Access

  Record.prototype.has = function has (k) {
    return this._indices.hasOwnProperty(k);
  };

  Record.prototype.get = function get (k, notSetValue) {
    if (!this.has(k)) {
      return notSetValue;
    }
    var index = this._indices[k];
    var value = this._values.get(index);
    return value === undefined ? this._defaultValues[k] : value;
  };

  // @pragma Modification

  Record.prototype.set = function set (k, v) {
    if (this.has(k)) {
      var newValues = this._values.set(
        this._indices[k],
        v === this._defaultValues[k] ? undefined : v
      );
      if (newValues !== this._values && !this.__ownerID) {
        return makeRecord(this, newValues);
      }
    }
    return this;
  };

  Record.prototype.remove = function remove (k) {
    return this.set(k);
  };

  Record.prototype.clear = function clear () {
    var newValues = this._values.clear().setSize(this._keys.length);
    return this.__ownerID ? this : makeRecord(this, newValues);
  };

  Record.prototype.wasAltered = function wasAltered () {
    return this._values.wasAltered();
  };

  Record.prototype.toSeq = function toSeq () {
    return recordSeq(this);
  };

  Record.prototype.toJS = function toJS$1 () {
    return toJS(this);
  };

  Record.prototype.entries = function entries () {
    return this.__iterator(ITERATE_ENTRIES);
  };

  Record.prototype.__iterator = function __iterator (type, reverse) {
    return recordSeq(this).__iterator(type, reverse);
  };

  Record.prototype.__iterate = function __iterate (fn, reverse) {
    return recordSeq(this).__iterate(fn, reverse);
  };

  Record.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newValues = this._values.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._values = newValues;
      return this;
    }
    return makeRecord(this, newValues, ownerID);
  };

  Record.isRecord = isRecord;
  Record.getDescriptiveName = recordName;
  var RecordPrototype = Record.prototype;
  RecordPrototype[IS_RECORD_SYMBOL] = true;
  RecordPrototype[DELETE] = RecordPrototype.remove;
  RecordPrototype.deleteIn = RecordPrototype.removeIn = deleteIn;
  RecordPrototype.getIn = getIn$1;
  RecordPrototype.hasIn = CollectionPrototype.hasIn;
  RecordPrototype.merge = merge;
  RecordPrototype.mergeWith = mergeWith;
  RecordPrototype.mergeIn = mergeIn;
  RecordPrototype.mergeDeep = mergeDeep$1;
  RecordPrototype.mergeDeepWith = mergeDeepWith$1;
  RecordPrototype.mergeDeepIn = mergeDeepIn;
  RecordPrototype.setIn = setIn$1;
  RecordPrototype.update = update$1;
  RecordPrototype.updateIn = updateIn$1;
  RecordPrototype.withMutations = withMutations;
  RecordPrototype.asMutable = asMutable;
  RecordPrototype.asImmutable = asImmutable;
  RecordPrototype[ITERATOR_SYMBOL] = RecordPrototype.entries;
  RecordPrototype.toJSON = RecordPrototype.toObject =
    CollectionPrototype.toObject;
  RecordPrototype.inspect = RecordPrototype.toSource = function () {
    return this.toString();
  };

  function makeRecord(likeRecord, values, ownerID) {
    var record = Object.create(Object.getPrototypeOf(likeRecord));
    record._values = values;
    record.__ownerID = ownerID;
    return record;
  }

  function recordName(record) {
    return record.constructor.displayName || record.constructor.name || 'Record';
  }

  function recordSeq(record) {
    return keyedSeqFromValue(record._keys.map(function (k) { return [k, record.get(k)]; }));
  }

  function setProp(prototype, name) {
    try {
      Object.defineProperty(prototype, name, {
        get: function () {
          return this.get(name);
        },
        set: function (value) {
          invariant(this.__ownerID, 'Cannot set on an immutable record.');
          this.set(name, value);
        },
      });
    } catch (error) {
      // Object.defineProperty failed. Probably IE8.
    }
  }

  /**
   * Returns a lazy Seq of `value` repeated `times` times. When `times` is
   * undefined, returns an infinite sequence of `value`.
   */
  var Repeat = /*@__PURE__*/(function (IndexedSeq) {
    function Repeat(value, times) {
      if (!(this instanceof Repeat)) {
        return new Repeat(value, times);
      }
      this._value = value;
      this.size = times === undefined ? Infinity : Math.max(0, times);
      if (this.size === 0) {
        if (EMPTY_REPEAT) {
          return EMPTY_REPEAT;
        }
        EMPTY_REPEAT = this;
      }
    }

    if ( IndexedSeq ) Repeat.__proto__ = IndexedSeq;
    Repeat.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
    Repeat.prototype.constructor = Repeat;

    Repeat.prototype.toString = function toString () {
      if (this.size === 0) {
        return 'Repeat []';
      }
      return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
    };

    Repeat.prototype.get = function get (index, notSetValue) {
      return this.has(index) ? this._value : notSetValue;
    };

    Repeat.prototype.includes = function includes (searchValue) {
      return is(this._value, searchValue);
    };

    Repeat.prototype.slice = function slice (begin, end) {
      var size = this.size;
      return wholeSlice(begin, end, size)
        ? this
        : new Repeat(
            this._value,
            resolveEnd(end, size) - resolveBegin(begin, size)
          );
    };

    Repeat.prototype.reverse = function reverse () {
      return this;
    };

    Repeat.prototype.indexOf = function indexOf (searchValue) {
      if (is(this._value, searchValue)) {
        return 0;
      }
      return -1;
    };

    Repeat.prototype.lastIndexOf = function lastIndexOf (searchValue) {
      if (is(this._value, searchValue)) {
        return this.size;
      }
      return -1;
    };

    Repeat.prototype.__iterate = function __iterate (fn, reverse) {
      var size = this.size;
      var i = 0;
      while (i !== size) {
        if (fn(this._value, reverse ? size - ++i : i++, this) === false) {
          break;
        }
      }
      return i;
    };

    Repeat.prototype.__iterator = function __iterator (type, reverse) {
      var this$1 = this;

      var size = this.size;
      var i = 0;
      return new Iterator(function () { return i === size
          ? iteratorDone()
          : iteratorValue(type, reverse ? size - ++i : i++, this$1._value); }
      );
    };

    Repeat.prototype.equals = function equals (other) {
      return other instanceof Repeat
        ? is(this._value, other._value)
        : deepEqual(other);
    };

    return Repeat;
  }(IndexedSeq));

  var EMPTY_REPEAT;

  function fromJS(value, converter) {
    return fromJSWith(
      [],
      converter || defaultConverter,
      value,
      '',
      converter && converter.length > 2 ? [] : undefined,
      { '': value }
    );
  }

  function fromJSWith(stack, converter, value, key, keyPath, parentValue) {
    var toSeq = Array.isArray(value)
      ? IndexedSeq
      : isPlainObj(value)
      ? KeyedSeq
      : null;
    if (toSeq) {
      if (~stack.indexOf(value)) {
        throw new TypeError('Cannot convert circular structure to Immutable');
      }
      stack.push(value);
      keyPath && key !== '' && keyPath.push(key);
      var converted = converter.call(
        parentValue,
        key,
        toSeq(value).map(function (v, k) { return fromJSWith(stack, converter, v, k, keyPath, value); }
        ),
        keyPath && keyPath.slice()
      );
      stack.pop();
      keyPath && keyPath.pop();
      return converted;
    }
    return value;
  }

  function defaultConverter(k, v) {
    return isKeyed(v) ? v.toMap() : v.toList();
  }

  var version = "4.0.0-rc.12";

  var Immutable = {
    version: version,

    Collection: Collection,
    // Note: Iterable is deprecated
    Iterable: Collection,

    Seq: Seq,
    Map: Map,
    OrderedMap: OrderedMap,
    List: List,
    Stack: Stack,
    Set: Set,
    OrderedSet: OrderedSet,

    Record: Record,
    Range: Range,
    Repeat: Repeat,

    is: is,
    fromJS: fromJS,
    hash: hash,

    isImmutable: isImmutable,
    isCollection: isCollection,
    isKeyed: isKeyed,
    isIndexed: isIndexed,
    isAssociative: isAssociative,
    isOrdered: isOrdered,
    isValueObject: isValueObject,
    isSeq: isSeq,
    isList: isList,
    isMap: isMap,
    isOrderedMap: isOrderedMap,
    isStack: isStack,
    isSet: isSet,
    isOrderedSet: isOrderedSet,
    isRecord: isRecord,

    get: get,
    getIn: getIn,
    has: has,
    hasIn: hasIn,
    merge: merge$1,
    mergeDeep: mergeDeep,
    mergeWith: mergeWith$1,
    mergeDeepWith: mergeDeepWith,
    remove: remove,
    removeIn: removeIn,
    set: set,
    setIn: setIn,
    update: update,
    updateIn: updateIn,
  };

  // Note: Iterable is deprecated
  var Iterable = Collection;

  exports.Collection = Collection;
  exports.Iterable = Iterable;
  exports.List = List;
  exports.Map = Map;
  exports.OrderedMap = OrderedMap;
  exports.OrderedSet = OrderedSet;
  exports.Range = Range;
  exports.Record = Record;
  exports.Repeat = Repeat;
  exports.Seq = Seq;
  exports.Set = Set;
  exports.Stack = Stack;
  exports.default = Immutable;
  exports.fromJS = fromJS;
  exports.get = get;
  exports.getIn = getIn;
  exports.has = has;
  exports.hasIn = hasIn;
  exports.hash = hash;
  exports.is = is;
  exports.isAssociative = isAssociative;
  exports.isCollection = isCollection;
  exports.isImmutable = isImmutable;
  exports.isIndexed = isIndexed;
  exports.isKeyed = isKeyed;
  exports.isOrdered = isOrdered;
  exports.isValueObject = isValueObject;
  exports.merge = merge$1;
  exports.mergeDeep = mergeDeep;
  exports.mergeDeepWith = mergeDeepWith;
  exports.mergeWith = mergeWith$1;
  exports.remove = remove;
  exports.removeIn = removeIn;
  exports.set = set;
  exports.setIn = setIn;
  exports.update = update;
  exports.updateIn = updateIn;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],3:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)

},{"base64-js":2,"buffer":3,"ieee754":4}],4:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],5:[function(require,module,exports){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2020, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.marked = factory());
}(this, (function () { 'use strict';

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelperLoose(o, allowArrayLike) {
    var it;

    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    it = o[Symbol.iterator]();
    return it.next.bind(it);
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var defaults = createCommonjsModule(function (module) {
    function getDefaults() {
      return {
        baseUrl: null,
        breaks: false,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: null,
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        tokenizer: null,
        walkTokens: null,
        xhtml: false
      };
    }

    function changeDefaults(newDefaults) {
      module.exports.defaults = newDefaults;
    }

    module.exports = {
      defaults: getDefaults(),
      getDefaults: getDefaults,
      changeDefaults: changeDefaults
    };
  });
  var defaults_1 = defaults.defaults;
  var defaults_2 = defaults.getDefaults;
  var defaults_3 = defaults.changeDefaults;

  /**
   * Helpers
   */
  var escapeTest = /[&<>"']/;
  var escapeReplace = /[&<>"']/g;
  var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
  var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
  var escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  var getEscapeReplacement = function getEscapeReplacement(ch) {
    return escapeReplacements[ch];
  };

  function escape(html, encode) {
    if (encode) {
      if (escapeTest.test(html)) {
        return html.replace(escapeReplace, getEscapeReplacement);
      }
    } else {
      if (escapeTestNoEncode.test(html)) {
        return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
      }
    }

    return html;
  }

  var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

  function unescape(html) {
    // explicitly match decimal, hex, and named HTML entities
    return html.replace(unescapeTest, function (_, n) {
      n = n.toLowerCase();
      if (n === 'colon') return ':';

      if (n.charAt(0) === '#') {
        return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
      }

      return '';
    });
  }

  var caret = /(^|[^\[])\^/g;

  function edit(regex, opt) {
    regex = regex.source || regex;
    opt = opt || '';
    var obj = {
      replace: function replace(name, val) {
        val = val.source || val;
        val = val.replace(caret, '$1');
        regex = regex.replace(name, val);
        return obj;
      },
      getRegex: function getRegex() {
        return new RegExp(regex, opt);
      }
    };
    return obj;
  }

  var nonWordAndColonTest = /[^\w:]/g;
  var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

  function cleanUrl(sanitize, base, href) {
    if (sanitize) {
      var prot;

      try {
        prot = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, '').toLowerCase();
      } catch (e) {
        return null;
      }

      if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
        return null;
      }
    }

    if (base && !originIndependentUrl.test(href)) {
      href = resolveUrl(base, href);
    }

    try {
      href = encodeURI(href).replace(/%25/g, '%');
    } catch (e) {
      return null;
    }

    return href;
  }

  var baseUrls = {};
  var justDomain = /^[^:]+:\/*[^/]*$/;
  var protocol = /^([^:]+:)[\s\S]*$/;
  var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

  function resolveUrl(base, href) {
    if (!baseUrls[' ' + base]) {
      // we can ignore everything in base after the last slash of its path component,
      // but we might need to add _that_
      // https://tools.ietf.org/html/rfc3986#section-3
      if (justDomain.test(base)) {
        baseUrls[' ' + base] = base + '/';
      } else {
        baseUrls[' ' + base] = rtrim(base, '/', true);
      }
    }

    base = baseUrls[' ' + base];
    var relativeBase = base.indexOf(':') === -1;

    if (href.substring(0, 2) === '//') {
      if (relativeBase) {
        return href;
      }

      return base.replace(protocol, '$1') + href;
    } else if (href.charAt(0) === '/') {
      if (relativeBase) {
        return href;
      }

      return base.replace(domain, '$1') + href;
    } else {
      return base + href;
    }
  }

  var noopTest = {
    exec: function noopTest() {}
  };

  function merge(obj) {
    var i = 1,
        target,
        key;

    for (; i < arguments.length; i++) {
      target = arguments[i];

      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }

    return obj;
  }

  function splitCells(tableRow, count) {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    var row = tableRow.replace(/\|/g, function (match, offset, str) {
      var escaped = false,
          curr = offset;

      while (--curr >= 0 && str[curr] === '\\') {
        escaped = !escaped;
      }

      if (escaped) {
        // odd number of slashes means | is escaped
        // so we leave it alone
        return '|';
      } else {
        // add space before unescaped |
        return ' |';
      }
    }),
        cells = row.split(/ \|/);
    var i = 0;

    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count) {
        cells.push('');
      }
    }

    for (; i < cells.length; i++) {
      // leading or trailing whitespace is ignored per the gfm spec
      cells[i] = cells[i].trim().replace(/\\\|/g, '|');
    }

    return cells;
  } // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
  // /c*$/ is vulnerable to REDOS.
  // invert: Remove suffix of non-c chars instead. Default falsey.


  function rtrim(str, c, invert) {
    var l = str.length;

    if (l === 0) {
      return '';
    } // Length of suffix matching the invert condition.


    var suffLen = 0; // Step left until we fail to match the invert condition.

    while (suffLen < l) {
      var currChar = str.charAt(l - suffLen - 1);

      if (currChar === c && !invert) {
        suffLen++;
      } else if (currChar !== c && invert) {
        suffLen++;
      } else {
        break;
      }
    }

    return str.substr(0, l - suffLen);
  }

  function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) {
      return -1;
    }

    var l = str.length;
    var level = 0,
        i = 0;

    for (; i < l; i++) {
      if (str[i] === '\\') {
        i++;
      } else if (str[i] === b[0]) {
        level++;
      } else if (str[i] === b[1]) {
        level--;

        if (level < 0) {
          return i;
        }
      }
    }

    return -1;
  }

  function checkSanitizeDeprecation(opt) {
    if (opt && opt.sanitize && !opt.silent) {
      console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
    }
  }

  var helpers = {
    escape: escape,
    unescape: unescape,
    edit: edit,
    cleanUrl: cleanUrl,
    resolveUrl: resolveUrl,
    noopTest: noopTest,
    merge: merge,
    splitCells: splitCells,
    rtrim: rtrim,
    findClosingBracket: findClosingBracket,
    checkSanitizeDeprecation: checkSanitizeDeprecation
  };

  var defaults$1 = defaults.defaults;
  var rtrim$1 = helpers.rtrim,
      splitCells$1 = helpers.splitCells,
      _escape = helpers.escape,
      findClosingBracket$1 = helpers.findClosingBracket;

  function outputLink(cap, link, raw) {
    var href = link.href;
    var title = link.title ? _escape(link.title) : null;
    var text = cap[1].replace(/\\([\[\]])/g, '$1');

    if (cap[0].charAt(0) !== '!') {
      return {
        type: 'link',
        raw: raw,
        href: href,
        title: title,
        text: text
      };
    } else {
      return {
        type: 'image',
        raw: raw,
        href: href,
        title: title,
        text: _escape(text)
      };
    }
  }

  function indentCodeCompensation(raw, text) {
    var matchIndentToCode = raw.match(/^(\s+)(?:```)/);

    if (matchIndentToCode === null) {
      return text;
    }

    var indentToCode = matchIndentToCode[1];
    return text.split('\n').map(function (node) {
      var matchIndentInNode = node.match(/^\s+/);

      if (matchIndentInNode === null) {
        return node;
      }

      var indentInNode = matchIndentInNode[0];

      if (indentInNode.length >= indentToCode.length) {
        return node.slice(indentToCode.length);
      }

      return node;
    }).join('\n');
  }
  /**
   * Tokenizer
   */


  var Tokenizer_1 = /*#__PURE__*/function () {
    function Tokenizer(options) {
      this.options = options || defaults$1;
    }

    var _proto = Tokenizer.prototype;

    _proto.space = function space(src) {
      var cap = this.rules.block.newline.exec(src);

      if (cap) {
        if (cap[0].length > 1) {
          return {
            type: 'space',
            raw: cap[0]
          };
        }

        return {
          raw: '\n'
        };
      }
    };

    _proto.code = function code(src, tokens) {
      var cap = this.rules.block.code.exec(src);

      if (cap) {
        var lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

        if (lastToken && lastToken.type === 'paragraph') {
          return {
            raw: cap[0],
            text: cap[0].trimRight()
          };
        }

        var text = cap[0].replace(/^ {4}/gm, '');
        return {
          type: 'code',
          raw: cap[0],
          codeBlockStyle: 'indented',
          text: !this.options.pedantic ? rtrim$1(text, '\n') : text
        };
      }
    };

    _proto.fences = function fences(src) {
      var cap = this.rules.block.fences.exec(src);

      if (cap) {
        var raw = cap[0];
        var text = indentCodeCompensation(raw, cap[3] || '');
        return {
          type: 'code',
          raw: raw,
          lang: cap[2] ? cap[2].trim() : cap[2],
          text: text
        };
      }
    };

    _proto.heading = function heading(src) {
      var cap = this.rules.block.heading.exec(src);

      if (cap) {
        return {
          type: 'heading',
          raw: cap[0],
          depth: cap[1].length,
          text: cap[2]
        };
      }
    };

    _proto.nptable = function nptable(src) {
      var cap = this.rules.block.nptable.exec(src);

      if (cap) {
        var item = {
          type: 'table',
          header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : [],
          raw: cap[0]
        };

        if (item.header.length === item.align.length) {
          var l = item.align.length;
          var i;

          for (i = 0; i < l; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          l = item.cells.length;

          for (i = 0; i < l; i++) {
            item.cells[i] = splitCells$1(item.cells[i], item.header.length);
          }

          return item;
        }
      }
    };

    _proto.hr = function hr(src) {
      var cap = this.rules.block.hr.exec(src);

      if (cap) {
        return {
          type: 'hr',
          raw: cap[0]
        };
      }
    };

    _proto.blockquote = function blockquote(src) {
      var cap = this.rules.block.blockquote.exec(src);

      if (cap) {
        var text = cap[0].replace(/^ *> ?/gm, '');
        return {
          type: 'blockquote',
          raw: cap[0],
          text: text
        };
      }
    };

    _proto.list = function list(src) {
      var cap = this.rules.block.list.exec(src);

      if (cap) {
        var raw = cap[0];
        var bull = cap[2];
        var isordered = bull.length > 1;
        var isparen = bull[bull.length - 1] === ')';
        var list = {
          type: 'list',
          raw: raw,
          ordered: isordered,
          start: isordered ? +bull.slice(0, -1) : '',
          loose: false,
          items: []
        }; // Get each top-level item.

        var itemMatch = cap[0].match(this.rules.block.item);
        var next = false,
            item,
            space,
            b,
            addBack,
            loose,
            istask,
            ischecked;
        var l = itemMatch.length;

        for (var i = 0; i < l; i++) {
          item = itemMatch[i];
          raw = item; // Remove the list item's bullet
          // so it is seen as the next token.

          space = item.length;
          item = item.replace(/^ *([*+-]|\d+[.)]) */, ''); // Outdent whatever the
          // list item contains. Hacky.

          if (~item.indexOf('\n ')) {
            space -= item.length;
            item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
          } // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.


          if (i !== l - 1) {
            b = this.rules.block.bullet.exec(itemMatch[i + 1])[0];

            if (isordered ? b.length === 1 || !isparen && b[b.length - 1] === ')' : b.length > 1 || this.options.smartLists && b !== bull) {
              addBack = itemMatch.slice(i + 1).join('\n');
              list.raw = list.raw.substring(0, list.raw.length - addBack.length);
              i = l - 1;
            }
          } // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.


          loose = next || /\n\n(?!\s*$)/.test(item);

          if (i !== l - 1) {
            next = item.charAt(item.length - 1) === '\n';
            if (!loose) loose = next;
          }

          if (loose) {
            list.loose = true;
          } // Check for task list items


          istask = /^\[[ xX]\] /.test(item);
          ischecked = undefined;

          if (istask) {
            ischecked = item[1] !== ' ';
            item = item.replace(/^\[[ xX]\] +/, '');
          }

          list.items.push({
            type: 'list_item',
            raw: raw,
            task: istask,
            checked: ischecked,
            loose: loose,
            text: item
          });
        }

        return list;
      }
    };

    _proto.html = function html(src) {
      var cap = this.rules.block.html.exec(src);

      if (cap) {
        return {
          type: this.options.sanitize ? 'paragraph' : 'html',
          raw: cap[0],
          pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
          text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
        };
      }
    };

    _proto.def = function def(src) {
      var cap = this.rules.block.def.exec(src);

      if (cap) {
        if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
        var tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
        return {
          tag: tag,
          raw: cap[0],
          href: cap[2],
          title: cap[3]
        };
      }
    };

    _proto.table = function table(src) {
      var cap = this.rules.block.table.exec(src);

      if (cap) {
        var item = {
          type: 'table',
          header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
        };

        if (item.header.length === item.align.length) {
          item.raw = cap[0];
          var l = item.align.length;
          var i;

          for (i = 0; i < l; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          l = item.cells.length;

          for (i = 0; i < l; i++) {
            item.cells[i] = splitCells$1(item.cells[i].replace(/^ *\| *| *\| *$/g, ''), item.header.length);
          }

          return item;
        }
      }
    };

    _proto.lheading = function lheading(src) {
      var cap = this.rules.block.lheading.exec(src);

      if (cap) {
        return {
          type: 'heading',
          raw: cap[0],
          depth: cap[2].charAt(0) === '=' ? 1 : 2,
          text: cap[1]
        };
      }
    };

    _proto.paragraph = function paragraph(src) {
      var cap = this.rules.block.paragraph.exec(src);

      if (cap) {
        return {
          type: 'paragraph',
          raw: cap[0],
          text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
        };
      }
    };

    _proto.text = function text(src, tokens) {
      var cap = this.rules.block.text.exec(src);

      if (cap) {
        var lastToken = tokens[tokens.length - 1];

        if (lastToken && lastToken.type === 'text') {
          return {
            raw: cap[0],
            text: cap[0]
          };
        }

        return {
          type: 'text',
          raw: cap[0],
          text: cap[0]
        };
      }
    };

    _proto.escape = function escape(src) {
      var cap = this.rules.inline.escape.exec(src);

      if (cap) {
        return {
          type: 'escape',
          raw: cap[0],
          text: _escape(cap[1])
        };
      }
    };

    _proto.tag = function tag(src, inLink, inRawBlock) {
      var cap = this.rules.inline.tag.exec(src);

      if (cap) {
        if (!inLink && /^<a /i.test(cap[0])) {
          inLink = true;
        } else if (inLink && /^<\/a>/i.test(cap[0])) {
          inLink = false;
        }

        if (!inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          inRawBlock = true;
        } else if (inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          inRawBlock = false;
        }

        return {
          type: this.options.sanitize ? 'text' : 'html',
          raw: cap[0],
          inLink: inLink,
          inRawBlock: inRawBlock,
          text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
        };
      }
    };

    _proto.link = function link(src) {
      var cap = this.rules.inline.link.exec(src);

      if (cap) {
        var lastParenIndex = findClosingBracket$1(cap[2], '()');

        if (lastParenIndex > -1) {
          var start = cap[0].indexOf('!') === 0 ? 5 : 4;
          var linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = '';
        }

        var href = cap[2];
        var title = '';

        if (this.options.pedantic) {
          var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

          if (link) {
            href = link[1];
            title = link[3];
          } else {
            title = '';
          }
        } else {
          title = cap[3] ? cap[3].slice(1, -1) : '';
        }

        href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
        var token = outputLink(cap, {
          href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
          title: title ? title.replace(this.rules.inline._escapes, '$1') : title
        }, cap[0]);
        return token;
      }
    };

    _proto.reflink = function reflink(src, links) {
      var cap;

      if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
        var link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
        link = links[link.toLowerCase()];

        if (!link || !link.href) {
          var text = cap[0].charAt(0);
          return {
            type: 'text',
            raw: text,
            text: text
          };
        }

        var token = outputLink(cap, link, cap[0]);
        return token;
      }
    };

    _proto.strong = function strong(src, maskedSrc, prevChar) {
      if (prevChar === void 0) {
        prevChar = '';
      }

      var match = this.rules.inline.strong.start.exec(src);

      if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
        maskedSrc = maskedSrc.slice(-1 * src.length);
        var endReg = match[0] === '**' ? this.rules.inline.strong.endAst : this.rules.inline.strong.endUnd;
        endReg.lastIndex = 0;
        var cap;

        while ((match = endReg.exec(maskedSrc)) != null) {
          cap = this.rules.inline.strong.middle.exec(maskedSrc.slice(0, match.index + 3));

          if (cap) {
            return {
              type: 'strong',
              raw: src.slice(0, cap[0].length),
              text: src.slice(2, cap[0].length - 2)
            };
          }
        }
      }
    };

    _proto.em = function em(src, maskedSrc, prevChar) {
      if (prevChar === void 0) {
        prevChar = '';
      }

      var match = this.rules.inline.em.start.exec(src);

      if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
        maskedSrc = maskedSrc.slice(-1 * src.length);
        var endReg = match[0] === '*' ? this.rules.inline.em.endAst : this.rules.inline.em.endUnd;
        endReg.lastIndex = 0;
        var cap;

        while ((match = endReg.exec(maskedSrc)) != null) {
          cap = this.rules.inline.em.middle.exec(maskedSrc.slice(0, match.index + 2));

          if (cap) {
            return {
              type: 'em',
              raw: src.slice(0, cap[0].length),
              text: src.slice(1, cap[0].length - 1)
            };
          }
        }
      }
    };

    _proto.codespan = function codespan(src) {
      var cap = this.rules.inline.code.exec(src);

      if (cap) {
        var text = cap[2].replace(/\n/g, ' ');
        var hasNonSpaceChars = /[^ ]/.test(text);
        var hasSpaceCharsOnBothEnds = text.startsWith(' ') && text.endsWith(' ');

        if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
          text = text.substring(1, text.length - 1);
        }

        text = _escape(text, true);
        return {
          type: 'codespan',
          raw: cap[0],
          text: text
        };
      }
    };

    _proto.br = function br(src) {
      var cap = this.rules.inline.br.exec(src);

      if (cap) {
        return {
          type: 'br',
          raw: cap[0]
        };
      }
    };

    _proto.del = function del(src) {
      var cap = this.rules.inline.del.exec(src);

      if (cap) {
        return {
          type: 'del',
          raw: cap[0],
          text: cap[1]
        };
      }
    };

    _proto.autolink = function autolink(src, mangle) {
      var cap = this.rules.inline.autolink.exec(src);

      if (cap) {
        var text, href;

        if (cap[2] === '@') {
          text = _escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
          href = 'mailto:' + text;
        } else {
          text = _escape(cap[1]);
          href = text;
        }

        return {
          type: 'link',
          raw: cap[0],
          text: text,
          href: href,
          tokens: [{
            type: 'text',
            raw: text,
            text: text
          }]
        };
      }
    };

    _proto.url = function url(src, mangle) {
      var cap;

      if (cap = this.rules.inline.url.exec(src)) {
        var text, href;

        if (cap[2] === '@') {
          text = _escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
          href = 'mailto:' + text;
        } else {
          // do extended autolink path validation
          var prevCapZero;

          do {
            prevCapZero = cap[0];
            cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
          } while (prevCapZero !== cap[0]);

          text = _escape(cap[0]);

          if (cap[1] === 'www.') {
            href = 'http://' + text;
          } else {
            href = text;
          }
        }

        return {
          type: 'link',
          raw: cap[0],
          text: text,
          href: href,
          tokens: [{
            type: 'text',
            raw: text,
            text: text
          }]
        };
      }
    };

    _proto.inlineText = function inlineText(src, inRawBlock, smartypants) {
      var cap = this.rules.inline.text.exec(src);

      if (cap) {
        var text;

        if (inRawBlock) {
          text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0];
        } else {
          text = _escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
        }

        return {
          type: 'text',
          raw: cap[0],
          text: text
        };
      }
    };

    return Tokenizer;
  }();

  var noopTest$1 = helpers.noopTest,
      edit$1 = helpers.edit,
      merge$1 = helpers.merge;
  /**
   * Block-Level Grammar
   */

  var block = {
    newline: /^\n+/,
    code: /^( {4}[^\n]+\n*)+/,
    fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
    hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
    heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
    blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
    list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
    html: '^ {0,3}(?:' // optional indentation
    + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
    + '|comment[^\\n]*(\\n+|$)' // (2)
    + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
    + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
    + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
    + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
    + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
    + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
    + ')',
    def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
    nptable: noopTest$1,
    table: noopTest$1,
    lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
    // regex template, placeholders will be replaced according to different paragraph
    // interruption rules of commonmark and the original markdown spec:
    _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
    text: /^[^\n]+/
  };
  block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
  block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
  block.def = edit$1(block.def).replace('label', block._label).replace('title', block._title).getRegex();
  block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
  block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;
  block.item = edit$1(block.item, 'gm').replace(/bull/g, block.bullet).getRegex();
  block.list = edit$1(block.list).replace(/bull/g, block.bullet).replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))').replace('def', '\\n+(?=' + block.def.source + ')').getRegex();
  block._tag = 'address|article|aside|base|basefont|blockquote|body|caption' + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' + '|track|ul';
  block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
  block.html = edit$1(block.html, 'i').replace('comment', block._comment).replace('tag', block._tag).replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
  block.paragraph = edit$1(block._paragraph).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
  .replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
  .getRegex();
  block.blockquote = edit$1(block.blockquote).replace('paragraph', block.paragraph).getRegex();
  /**
   * Normal Block Grammar
   */

  block.normal = merge$1({}, block);
  /**
   * GFM Block Grammar
   */

  block.gfm = merge$1({}, block.normal, {
    nptable: '^ *([^|\\n ].*\\|.*)\\n' // Header
    + ' {0,3}([-:]+ *\\|[-| :]*)' // Align
    + '(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)',
    // Cells
    table: '^ *\\|(.+)\\n' // Header
    + ' {0,3}\\|?( *[-:]+[-| :]*)' // Align
    + '(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells

  });
  block.gfm.nptable = edit$1(block.gfm.nptable).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
  .getRegex();
  block.gfm.table = edit$1(block.gfm.table).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
  .getRegex();
  /**
   * Pedantic grammar (original John Gruber's loose markdown specification)
   */

  block.pedantic = merge$1({}, block.normal, {
    html: edit$1('^ *(?:comment *(?:\\n|\\s*$)' + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
    + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace('comment', block._comment).replace(/tag/g, '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b').getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
    fences: noopTest$1,
    // fences not supported
    paragraph: edit$1(block.normal._paragraph).replace('hr', block.hr).replace('heading', ' *#{1,6} *[^\n]').replace('lheading', block.lheading).replace('blockquote', ' {0,3}>').replace('|fences', '').replace('|list', '').replace('|html', '').getRegex()
  });
  /**
   * Inline-Level Grammar
   */

  var inline = {
    escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
    url: noopTest$1,
    tag: '^comment' + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
    + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
    + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
    + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
    + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
    // CDATA section
    link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
    reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
    nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
    reflinkSearch: 'reflink|nolink(?!\\()',
    strong: {
      start: /^(?:(\*\*(?=[*punctuation]))|\*\*)(?![\s])|__/,
      // (1) returns if starts w/ punctuation
      middle: /^\*\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*\*$|^__(?![\s])((?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?)__$/,
      endAst: /[^punctuation\s]\*\*(?!\*)|[punctuation]\*\*(?!\*)(?:(?=[punctuation_\s]|$))/,
      // last char can't be punct, or final * must also be followed by punct (or endline)
      endUnd: /[^\s]__(?!_)(?:(?=[punctuation*\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

    },
    em: {
      start: /^(?:(\*(?=[punctuation]))|\*)(?![*\s])|_/,
      // (1) returns if starts w/ punctuation
      middle: /^\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*$|^_(?![_\s])(?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?_$/,
      endAst: /[^punctuation\s]\*(?!\*)|[punctuation]\*(?!\*)(?:(?=[punctuation_\s]|$))/,
      // last char can't be punct, or final * must also be followed by punct (or endline)
      endUnd: /[^\s]_(?!_)(?:(?=[punctuation*\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

    },
    code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
    br: /^( {2,}|\\)\n(?!\s*$)/,
    del: noopTest$1,
    text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n)))/,
    punctuation: /^([\s*punctuation])/
  }; // list of punctuation marks from common mark spec
  // without * and _ to workaround cases with double emphasis

  inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
  inline.punctuation = edit$1(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

  inline._blockSkip = '\\[[^\\]]*?\\]\\([^\\)]*?\\)|`[^`]*?`|<[^>]*?>';
  inline._overlapSkip = '__[^_]*?__|\\*\\*\\[^\\*\\]*?\\*\\*';
  inline._comment = edit$1(block._comment).replace('(?:-->|$)', '-->').getRegex();
  inline.em.start = edit$1(inline.em.start).replace(/punctuation/g, inline._punctuation).getRegex();
  inline.em.middle = edit$1(inline.em.middle).replace(/punctuation/g, inline._punctuation).replace(/overlapSkip/g, inline._overlapSkip).getRegex();
  inline.em.endAst = edit$1(inline.em.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
  inline.em.endUnd = edit$1(inline.em.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
  inline.strong.start = edit$1(inline.strong.start).replace(/punctuation/g, inline._punctuation).getRegex();
  inline.strong.middle = edit$1(inline.strong.middle).replace(/punctuation/g, inline._punctuation).replace(/overlapSkip/g, inline._overlapSkip).getRegex();
  inline.strong.endAst = edit$1(inline.strong.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
  inline.strong.endUnd = edit$1(inline.strong.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
  inline.blockSkip = edit$1(inline._blockSkip, 'g').getRegex();
  inline.overlapSkip = edit$1(inline._overlapSkip, 'g').getRegex();
  inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
  inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
  inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
  inline.autolink = edit$1(inline.autolink).replace('scheme', inline._scheme).replace('email', inline._email).getRegex();
  inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
  inline.tag = edit$1(inline.tag).replace('comment', inline._comment).replace('attribute', inline._attribute).getRegex();
  inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
  inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
  inline.link = edit$1(inline.link).replace('label', inline._label).replace('href', inline._href).replace('title', inline._title).getRegex();
  inline.reflink = edit$1(inline.reflink).replace('label', inline._label).getRegex();
  inline.reflinkSearch = edit$1(inline.reflinkSearch, 'g').replace('reflink', inline.reflink).replace('nolink', inline.nolink).getRegex();
  /**
   * Normal Inline Grammar
   */

  inline.normal = merge$1({}, inline);
  /**
   * Pedantic Inline Grammar
   */

  inline.pedantic = merge$1({}, inline.normal, {
    strong: {
      start: /^__|\*\*/,
      middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      endAst: /\*\*(?!\*)/g,
      endUnd: /__(?!_)/g
    },
    em: {
      start: /^_|\*/,
      middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
      endAst: /\*(?!\*)/g,
      endUnd: /_(?!_)/g
    },
    link: edit$1(/^!?\[(label)\]\((.*?)\)/).replace('label', inline._label).getRegex(),
    reflink: edit$1(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace('label', inline._label).getRegex()
  });
  /**
   * GFM Inline Grammar
   */

  inline.gfm = merge$1({}, inline.normal, {
    escape: edit$1(inline.escape).replace('])', '~|])').getRegex(),
    _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
    url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
    _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
    del: /^~+(?=\S)([\s\S]*?\S)~+/,
    text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
  });
  inline.gfm.url = edit$1(inline.gfm.url, 'i').replace('email', inline.gfm._extended_email).getRegex();
  /**
   * GFM + Line Breaks Inline Grammar
   */

  inline.breaks = merge$1({}, inline.gfm, {
    br: edit$1(inline.br).replace('{2,}', '*').getRegex(),
    text: edit$1(inline.gfm.text).replace('\\b_', '\\b_| {2,}\\n').replace(/\{2,\}/g, '*').getRegex()
  });
  var rules = {
    block: block,
    inline: inline
  };

  var defaults$2 = defaults.defaults;
  var block$1 = rules.block,
      inline$1 = rules.inline;
  /**
   * smartypants text replacement
   */

  function smartypants(text) {
    return text // em-dashes
    .replace(/---/g, "\u2014") // en-dashes
    .replace(/--/g, "\u2013") // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018") // closing singles & apostrophes
    .replace(/'/g, "\u2019") // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C") // closing doubles
    .replace(/"/g, "\u201D") // ellipses
    .replace(/\.{3}/g, "\u2026");
  }
  /**
   * mangle email addresses
   */


  function mangle(text) {
    var out = '',
        i,
        ch;
    var l = text.length;

    for (i = 0; i < l; i++) {
      ch = text.charCodeAt(i);

      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }

      out += '&#' + ch + ';';
    }

    return out;
  }
  /**
   * Block Lexer
   */


  var Lexer_1 = /*#__PURE__*/function () {
    function Lexer(options) {
      this.tokens = [];
      this.tokens.links = Object.create(null);
      this.options = options || defaults$2;
      this.options.tokenizer = this.options.tokenizer || new Tokenizer_1();
      this.tokenizer = this.options.tokenizer;
      this.tokenizer.options = this.options;
      var rules = {
        block: block$1.normal,
        inline: inline$1.normal
      };

      if (this.options.pedantic) {
        rules.block = block$1.pedantic;
        rules.inline = inline$1.pedantic;
      } else if (this.options.gfm) {
        rules.block = block$1.gfm;

        if (this.options.breaks) {
          rules.inline = inline$1.breaks;
        } else {
          rules.inline = inline$1.gfm;
        }
      }

      this.tokenizer.rules = rules;
    }
    /**
     * Expose Rules
     */


    /**
     * Static Lex Method
     */
    Lexer.lex = function lex(src, options) {
      var lexer = new Lexer(options);
      return lexer.lex(src);
    }
    /**
     * Static Lex Inline Method
     */
    ;

    Lexer.lexInline = function lexInline(src, options) {
      var lexer = new Lexer(options);
      return lexer.inlineTokens(src);
    }
    /**
     * Preprocessing
     */
    ;

    var _proto = Lexer.prototype;

    _proto.lex = function lex(src) {
      src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ');
      this.blockTokens(src, this.tokens, true);
      this.inline(this.tokens);
      return this.tokens;
    }
    /**
     * Lexing
     */
    ;

    _proto.blockTokens = function blockTokens(src, tokens, top) {
      if (tokens === void 0) {
        tokens = [];
      }

      if (top === void 0) {
        top = true;
      }

      src = src.replace(/^ +$/gm, '');
      var token, i, l, lastToken;

      while (src) {
        // newline
        if (token = this.tokenizer.space(src)) {
          src = src.substring(token.raw.length);

          if (token.type) {
            tokens.push(token);
          }

          continue;
        } // code


        if (token = this.tokenizer.code(src, tokens)) {
          src = src.substring(token.raw.length);

          if (token.type) {
            tokens.push(token);
          } else {
            lastToken = tokens[tokens.length - 1];
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
          }

          continue;
        } // fences


        if (token = this.tokenizer.fences(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // heading


        if (token = this.tokenizer.heading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // table no leading pipe (gfm)


        if (token = this.tokenizer.nptable(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // hr


        if (token = this.tokenizer.hr(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // blockquote


        if (token = this.tokenizer.blockquote(src)) {
          src = src.substring(token.raw.length);
          token.tokens = this.blockTokens(token.text, [], top);
          tokens.push(token);
          continue;
        } // list


        if (token = this.tokenizer.list(src)) {
          src = src.substring(token.raw.length);
          l = token.items.length;

          for (i = 0; i < l; i++) {
            token.items[i].tokens = this.blockTokens(token.items[i].text, [], false);
          }

          tokens.push(token);
          continue;
        } // html


        if (token = this.tokenizer.html(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // def


        if (top && (token = this.tokenizer.def(src))) {
          src = src.substring(token.raw.length);

          if (!this.tokens.links[token.tag]) {
            this.tokens.links[token.tag] = {
              href: token.href,
              title: token.title
            };
          }

          continue;
        } // table (gfm)


        if (token = this.tokenizer.table(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // lheading


        if (token = this.tokenizer.lheading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // top-level paragraph


        if (top && (token = this.tokenizer.paragraph(src))) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // text


        if (token = this.tokenizer.text(src, tokens)) {
          src = src.substring(token.raw.length);

          if (token.type) {
            tokens.push(token);
          } else {
            lastToken = tokens[tokens.length - 1];
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
          }

          continue;
        }

        if (src) {
          var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }

      return tokens;
    };

    _proto.inline = function inline(tokens) {
      var i, j, k, l2, row, token;
      var l = tokens.length;

      for (i = 0; i < l; i++) {
        token = tokens[i];

        switch (token.type) {
          case 'paragraph':
          case 'text':
          case 'heading':
            {
              token.tokens = [];
              this.inlineTokens(token.text, token.tokens);
              break;
            }

          case 'table':
            {
              token.tokens = {
                header: [],
                cells: []
              }; // header

              l2 = token.header.length;

              for (j = 0; j < l2; j++) {
                token.tokens.header[j] = [];
                this.inlineTokens(token.header[j], token.tokens.header[j]);
              } // cells


              l2 = token.cells.length;

              for (j = 0; j < l2; j++) {
                row = token.cells[j];
                token.tokens.cells[j] = [];

                for (k = 0; k < row.length; k++) {
                  token.tokens.cells[j][k] = [];
                  this.inlineTokens(row[k], token.tokens.cells[j][k]);
                }
              }

              break;
            }

          case 'blockquote':
            {
              this.inline(token.tokens);
              break;
            }

          case 'list':
            {
              l2 = token.items.length;

              for (j = 0; j < l2; j++) {
                this.inline(token.items[j].tokens);
              }

              break;
            }
        }
      }

      return tokens;
    }
    /**
     * Lexing/Compiling
     */
    ;

    _proto.inlineTokens = function inlineTokens(src, tokens, inLink, inRawBlock, prevChar) {
      if (tokens === void 0) {
        tokens = [];
      }

      if (inLink === void 0) {
        inLink = false;
      }

      if (inRawBlock === void 0) {
        inRawBlock = false;
      }

      if (prevChar === void 0) {
        prevChar = '';
      }

      var token; // String with links masked to avoid interference with em and strong

      var maskedSrc = src;
      var match; // Mask out reflinks

      if (this.tokens.links) {
        var links = Object.keys(this.tokens.links);

        if (links.length > 0) {
          while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
            if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
              maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
            }
          }
        }
      } // Mask out other blocks


      while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
      }

      while (src) {
        // escape
        if (token = this.tokenizer.escape(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // tag


        if (token = this.tokenizer.tag(src, inLink, inRawBlock)) {
          src = src.substring(token.raw.length);
          inLink = token.inLink;
          inRawBlock = token.inRawBlock;
          tokens.push(token);
          continue;
        } // link


        if (token = this.tokenizer.link(src)) {
          src = src.substring(token.raw.length);

          if (token.type === 'link') {
            token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
          }

          tokens.push(token);
          continue;
        } // reflink, nolink


        if (token = this.tokenizer.reflink(src, this.tokens.links)) {
          src = src.substring(token.raw.length);

          if (token.type === 'link') {
            token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
          }

          tokens.push(token);
          continue;
        } // strong


        if (token = this.tokenizer.strong(src, maskedSrc, prevChar)) {
          src = src.substring(token.raw.length);
          token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
          tokens.push(token);
          continue;
        } // em


        if (token = this.tokenizer.em(src, maskedSrc, prevChar)) {
          src = src.substring(token.raw.length);
          token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
          tokens.push(token);
          continue;
        } // code


        if (token = this.tokenizer.codespan(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // br


        if (token = this.tokenizer.br(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // del (gfm)


        if (token = this.tokenizer.del(src)) {
          src = src.substring(token.raw.length);
          token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
          tokens.push(token);
          continue;
        } // autolink


        if (token = this.tokenizer.autolink(src, mangle)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // url (gfm)


        if (!inLink && (token = this.tokenizer.url(src, mangle))) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // text


        if (token = this.tokenizer.inlineText(src, inRawBlock, smartypants)) {
          src = src.substring(token.raw.length);
          prevChar = token.raw.slice(-1);
          tokens.push(token);
          continue;
        }

        if (src) {
          var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }

      return tokens;
    };

    _createClass(Lexer, null, [{
      key: "rules",
      get: function get() {
        return {
          block: block$1,
          inline: inline$1
        };
      }
    }]);

    return Lexer;
  }();

  var defaults$3 = defaults.defaults;
  var cleanUrl$1 = helpers.cleanUrl,
      escape$1 = helpers.escape;
  /**
   * Renderer
   */

  var Renderer_1 = /*#__PURE__*/function () {
    function Renderer(options) {
      this.options = options || defaults$3;
    }

    var _proto = Renderer.prototype;

    _proto.code = function code(_code, infostring, escaped) {
      var lang = (infostring || '').match(/\S*/)[0];

      if (this.options.highlight) {
        var out = this.options.highlight(_code, lang);

        if (out != null && out !== _code) {
          escaped = true;
          _code = out;
        }
      }

      if (!lang) {
        return '<pre><code>' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
      }

      return '<pre><code class="' + this.options.langPrefix + escape$1(lang, true) + '">' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
    };

    _proto.blockquote = function blockquote(quote) {
      return '<blockquote>\n' + quote + '</blockquote>\n';
    };

    _proto.html = function html(_html) {
      return _html;
    };

    _proto.heading = function heading(text, level, raw, slugger) {
      if (this.options.headerIds) {
        return '<h' + level + ' id="' + this.options.headerPrefix + slugger.slug(raw) + '">' + text + '</h' + level + '>\n';
      } // ignore IDs


      return '<h' + level + '>' + text + '</h' + level + '>\n';
    };

    _proto.hr = function hr() {
      return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };

    _proto.list = function list(body, ordered, start) {
      var type = ordered ? 'ol' : 'ul',
          startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
      return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
    };

    _proto.listitem = function listitem(text) {
      return '<li>' + text + '</li>\n';
    };

    _proto.checkbox = function checkbox(checked) {
      return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + (this.options.xhtml ? ' /' : '') + '> ';
    };

    _proto.paragraph = function paragraph(text) {
      return '<p>' + text + '</p>\n';
    };

    _proto.table = function table(header, body) {
      if (body) body = '<tbody>' + body + '</tbody>';
      return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
    };

    _proto.tablerow = function tablerow(content) {
      return '<tr>\n' + content + '</tr>\n';
    };

    _proto.tablecell = function tablecell(content, flags) {
      var type = flags.header ? 'th' : 'td';
      var tag = flags.align ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
      return tag + content + '</' + type + '>\n';
    } // span level renderer
    ;

    _proto.strong = function strong(text) {
      return '<strong>' + text + '</strong>';
    };

    _proto.em = function em(text) {
      return '<em>' + text + '</em>';
    };

    _proto.codespan = function codespan(text) {
      return '<code>' + text + '</code>';
    };

    _proto.br = function br() {
      return this.options.xhtml ? '<br/>' : '<br>';
    };

    _proto.del = function del(text) {
      return '<del>' + text + '</del>';
    };

    _proto.link = function link(href, title, text) {
      href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

      if (href === null) {
        return text;
      }

      var out = '<a href="' + escape$1(href) + '"';

      if (title) {
        out += ' title="' + title + '"';
      }

      out += '>' + text + '</a>';
      return out;
    };

    _proto.image = function image(href, title, text) {
      href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

      if (href === null) {
        return text;
      }

      var out = '<img src="' + href + '" alt="' + text + '"';

      if (title) {
        out += ' title="' + title + '"';
      }

      out += this.options.xhtml ? '/>' : '>';
      return out;
    };

    _proto.text = function text(_text) {
      return _text;
    };

    return Renderer;
  }();

  /**
   * TextRenderer
   * returns only the textual part of the token
   */
  var TextRenderer_1 = /*#__PURE__*/function () {
    function TextRenderer() {}

    var _proto = TextRenderer.prototype;

    // no need for block level renderers
    _proto.strong = function strong(text) {
      return text;
    };

    _proto.em = function em(text) {
      return text;
    };

    _proto.codespan = function codespan(text) {
      return text;
    };

    _proto.del = function del(text) {
      return text;
    };

    _proto.html = function html(text) {
      return text;
    };

    _proto.text = function text(_text) {
      return _text;
    };

    _proto.link = function link(href, title, text) {
      return '' + text;
    };

    _proto.image = function image(href, title, text) {
      return '' + text;
    };

    _proto.br = function br() {
      return '';
    };

    return TextRenderer;
  }();

  /**
   * Slugger generates header id
   */
  var Slugger_1 = /*#__PURE__*/function () {
    function Slugger() {
      this.seen = {};
    }

    var _proto = Slugger.prototype;

    _proto.serialize = function serialize(value) {
      return value.toLowerCase().trim() // remove html tags
      .replace(/<[!\/a-z].*?>/ig, '') // remove unwanted chars
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '').replace(/\s/g, '-');
    }
    /**
     * Finds the next safe (unique) slug to use
     */
    ;

    _proto.getNextSafeSlug = function getNextSafeSlug(originalSlug, isDryRun) {
      var slug = originalSlug;
      var occurenceAccumulator = 0;

      if (this.seen.hasOwnProperty(slug)) {
        occurenceAccumulator = this.seen[originalSlug];

        do {
          occurenceAccumulator++;
          slug = originalSlug + '-' + occurenceAccumulator;
        } while (this.seen.hasOwnProperty(slug));
      }

      if (!isDryRun) {
        this.seen[originalSlug] = occurenceAccumulator;
        this.seen[slug] = 0;
      }

      return slug;
    }
    /**
     * Convert string to unique id
     * @param {object} options
     * @param {boolean} options.dryrun Generates the next unique slug without updating the internal accumulator.
     */
    ;

    _proto.slug = function slug(value, options) {
      if (options === void 0) {
        options = {};
      }

      var slug = this.serialize(value);
      return this.getNextSafeSlug(slug, options.dryrun);
    };

    return Slugger;
  }();

  var defaults$4 = defaults.defaults;
  var unescape$1 = helpers.unescape;
  /**
   * Parsing & Compiling
   */

  var Parser_1 = /*#__PURE__*/function () {
    function Parser(options) {
      this.options = options || defaults$4;
      this.options.renderer = this.options.renderer || new Renderer_1();
      this.renderer = this.options.renderer;
      this.renderer.options = this.options;
      this.textRenderer = new TextRenderer_1();
      this.slugger = new Slugger_1();
    }
    /**
     * Static Parse Method
     */


    Parser.parse = function parse(tokens, options) {
      var parser = new Parser(options);
      return parser.parse(tokens);
    }
    /**
     * Static Parse Inline Method
     */
    ;

    Parser.parseInline = function parseInline(tokens, options) {
      var parser = new Parser(options);
      return parser.parseInline(tokens);
    }
    /**
     * Parse Loop
     */
    ;

    var _proto = Parser.prototype;

    _proto.parse = function parse(tokens, top) {
      if (top === void 0) {
        top = true;
      }

      var out = '',
          i,
          j,
          k,
          l2,
          l3,
          row,
          cell,
          header,
          body,
          token,
          ordered,
          start,
          loose,
          itemBody,
          item,
          checked,
          task,
          checkbox;
      var l = tokens.length;

      for (i = 0; i < l; i++) {
        token = tokens[i];

        switch (token.type) {
          case 'space':
            {
              continue;
            }

          case 'hr':
            {
              out += this.renderer.hr();
              continue;
            }

          case 'heading':
            {
              out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape$1(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
              continue;
            }

          case 'code':
            {
              out += this.renderer.code(token.text, token.lang, token.escaped);
              continue;
            }

          case 'table':
            {
              header = ''; // header

              cell = '';
              l2 = token.header.length;

              for (j = 0; j < l2; j++) {
                cell += this.renderer.tablecell(this.parseInline(token.tokens.header[j]), {
                  header: true,
                  align: token.align[j]
                });
              }

              header += this.renderer.tablerow(cell);
              body = '';
              l2 = token.cells.length;

              for (j = 0; j < l2; j++) {
                row = token.tokens.cells[j];
                cell = '';
                l3 = row.length;

                for (k = 0; k < l3; k++) {
                  cell += this.renderer.tablecell(this.parseInline(row[k]), {
                    header: false,
                    align: token.align[k]
                  });
                }

                body += this.renderer.tablerow(cell);
              }

              out += this.renderer.table(header, body);
              continue;
            }

          case 'blockquote':
            {
              body = this.parse(token.tokens);
              out += this.renderer.blockquote(body);
              continue;
            }

          case 'list':
            {
              ordered = token.ordered;
              start = token.start;
              loose = token.loose;
              l2 = token.items.length;
              body = '';

              for (j = 0; j < l2; j++) {
                item = token.items[j];
                checked = item.checked;
                task = item.task;
                itemBody = '';

                if (item.task) {
                  checkbox = this.renderer.checkbox(checked);

                  if (loose) {
                    if (item.tokens.length > 0 && item.tokens[0].type === 'text') {
                      item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;

                      if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                        item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                      }
                    } else {
                      item.tokens.unshift({
                        type: 'text',
                        text: checkbox
                      });
                    }
                  } else {
                    itemBody += checkbox;
                  }
                }

                itemBody += this.parse(item.tokens, loose);
                body += this.renderer.listitem(itemBody, task, checked);
              }

              out += this.renderer.list(body, ordered, start);
              continue;
            }

          case 'html':
            {
              // TODO parse inline content if parameter markdown=1
              out += this.renderer.html(token.text);
              continue;
            }

          case 'paragraph':
            {
              out += this.renderer.paragraph(this.parseInline(token.tokens));
              continue;
            }

          case 'text':
            {
              body = token.tokens ? this.parseInline(token.tokens) : token.text;

              while (i + 1 < l && tokens[i + 1].type === 'text') {
                token = tokens[++i];
                body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
              }

              out += top ? this.renderer.paragraph(body) : body;
              continue;
            }

          default:
            {
              var errMsg = 'Token with "' + token.type + '" type was not found.';

              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
        }
      }

      return out;
    }
    /**
     * Parse Inline Tokens
     */
    ;

    _proto.parseInline = function parseInline(tokens, renderer) {
      renderer = renderer || this.renderer;
      var out = '',
          i,
          token;
      var l = tokens.length;

      for (i = 0; i < l; i++) {
        token = tokens[i];

        switch (token.type) {
          case 'escape':
            {
              out += renderer.text(token.text);
              break;
            }

          case 'html':
            {
              out += renderer.html(token.text);
              break;
            }

          case 'link':
            {
              out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
              break;
            }

          case 'image':
            {
              out += renderer.image(token.href, token.title, token.text);
              break;
            }

          case 'strong':
            {
              out += renderer.strong(this.parseInline(token.tokens, renderer));
              break;
            }

          case 'em':
            {
              out += renderer.em(this.parseInline(token.tokens, renderer));
              break;
            }

          case 'codespan':
            {
              out += renderer.codespan(token.text);
              break;
            }

          case 'br':
            {
              out += renderer.br();
              break;
            }

          case 'del':
            {
              out += renderer.del(this.parseInline(token.tokens, renderer));
              break;
            }

          case 'text':
            {
              out += renderer.text(token.text);
              break;
            }

          default:
            {
              var errMsg = 'Token with "' + token.type + '" type was not found.';

              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
        }
      }

      return out;
    };

    return Parser;
  }();

  var merge$2 = helpers.merge,
      checkSanitizeDeprecation$1 = helpers.checkSanitizeDeprecation,
      escape$2 = helpers.escape;
  var getDefaults = defaults.getDefaults,
      changeDefaults = defaults.changeDefaults,
      defaults$5 = defaults.defaults;
  /**
   * Marked
   */

  function marked(src, opt, callback) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }

    if (typeof src !== 'string') {
      throw new Error('marked(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
    }

    if (typeof opt === 'function') {
      callback = opt;
      opt = null;
    }

    opt = merge$2({}, marked.defaults, opt || {});
    checkSanitizeDeprecation$1(opt);

    if (callback) {
      var highlight = opt.highlight;
      var tokens;

      try {
        tokens = Lexer_1.lex(src, opt);
      } catch (e) {
        return callback(e);
      }

      var done = function done(err) {
        var out;

        if (!err) {
          try {
            out = Parser_1.parse(tokens, opt);
          } catch (e) {
            err = e;
          }
        }

        opt.highlight = highlight;
        return err ? callback(err) : callback(null, out);
      };

      if (!highlight || highlight.length < 3) {
        return done();
      }

      delete opt.highlight;
      if (!tokens.length) return done();
      var pending = 0;
      marked.walkTokens(tokens, function (token) {
        if (token.type === 'code') {
          pending++;
          setTimeout(function () {
            highlight(token.text, token.lang, function (err, code) {
              if (err) {
                return done(err);
              }

              if (code != null && code !== token.text) {
                token.text = code;
                token.escaped = true;
              }

              pending--;

              if (pending === 0) {
                done();
              }
            });
          }, 0);
        }
      });

      if (pending === 0) {
        done();
      }

      return;
    }

    try {
      var _tokens = Lexer_1.lex(src, opt);

      if (opt.walkTokens) {
        marked.walkTokens(_tokens, opt.walkTokens);
      }

      return Parser_1.parse(_tokens, opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';

      if (opt.silent) {
        return '<p>An error occurred:</p><pre>' + escape$2(e.message + '', true) + '</pre>';
      }

      throw e;
    }
  }
  /**
   * Options
   */


  marked.options = marked.setOptions = function (opt) {
    merge$2(marked.defaults, opt);
    changeDefaults(marked.defaults);
    return marked;
  };

  marked.getDefaults = getDefaults;
  marked.defaults = defaults$5;
  /**
   * Use Extension
   */

  marked.use = function (extension) {
    var opts = merge$2({}, extension);

    if (extension.renderer) {
      (function () {
        var renderer = marked.defaults.renderer || new Renderer_1();

        var _loop = function _loop(prop) {
          var prevRenderer = renderer[prop];

          renderer[prop] = function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            var ret = extension.renderer[prop].apply(renderer, args);

            if (ret === false) {
              ret = prevRenderer.apply(renderer, args);
            }

            return ret;
          };
        };

        for (var prop in extension.renderer) {
          _loop(prop);
        }

        opts.renderer = renderer;
      })();
    }

    if (extension.tokenizer) {
      (function () {
        var tokenizer = marked.defaults.tokenizer || new Tokenizer_1();

        var _loop2 = function _loop2(prop) {
          var prevTokenizer = tokenizer[prop];

          tokenizer[prop] = function () {
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            var ret = extension.tokenizer[prop].apply(tokenizer, args);

            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args);
            }

            return ret;
          };
        };

        for (var prop in extension.tokenizer) {
          _loop2(prop);
        }

        opts.tokenizer = tokenizer;
      })();
    }

    if (extension.walkTokens) {
      var walkTokens = marked.defaults.walkTokens;

      opts.walkTokens = function (token) {
        extension.walkTokens(token);

        if (walkTokens) {
          walkTokens(token);
        }
      };
    }

    marked.setOptions(opts);
  };
  /**
   * Run callback for every token
   */


  marked.walkTokens = function (tokens, callback) {
    for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
      var token = _step.value;
      callback(token);

      switch (token.type) {
        case 'table':
          {
            for (var _iterator2 = _createForOfIteratorHelperLoose(token.tokens.header), _step2; !(_step2 = _iterator2()).done;) {
              var cell = _step2.value;
              marked.walkTokens(cell, callback);
            }

            for (var _iterator3 = _createForOfIteratorHelperLoose(token.tokens.cells), _step3; !(_step3 = _iterator3()).done;) {
              var row = _step3.value;

              for (var _iterator4 = _createForOfIteratorHelperLoose(row), _step4; !(_step4 = _iterator4()).done;) {
                var _cell = _step4.value;
                marked.walkTokens(_cell, callback);
              }
            }

            break;
          }

        case 'list':
          {
            marked.walkTokens(token.items, callback);
            break;
          }

        default:
          {
            if (token.tokens) {
              marked.walkTokens(token.tokens, callback);
            }
          }
      }
    }
  };
  /**
   * Parse Inline
   */


  marked.parseInline = function (src, opt) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked.parseInline(): input parameter is undefined or null');
    }

    if (typeof src !== 'string') {
      throw new Error('marked.parseInline(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
    }

    opt = merge$2({}, marked.defaults, opt || {});
    checkSanitizeDeprecation$1(opt);

    try {
      var tokens = Lexer_1.lexInline(src, opt);

      if (opt.walkTokens) {
        marked.walkTokens(tokens, opt.walkTokens);
      }

      return Parser_1.parseInline(tokens, opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';

      if (opt.silent) {
        return '<p>An error occurred:</p><pre>' + escape$2(e.message + '', true) + '</pre>';
      }

      throw e;
    }
  };
  /**
   * Expose
   */


  marked.Parser = Parser_1;
  marked.parser = Parser_1.parse;
  marked.Renderer = Renderer_1;
  marked.TextRenderer = TextRenderer_1;
  marked.Lexer = Lexer_1;
  marked.lexer = Lexer_1.lex;
  marked.Tokenizer = Tokenizer_1;
  marked.Slugger = Slugger_1;
  marked.parse = marked;
  var marked_1 = marked;

  return marked_1;

})));

},{}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],7:[function(require,module,exports){
/**
 * Actions that modify the URL.
 */
var LocationActions = {

  /**
   * Indicates a new location is being pushed to the history stack.
   */
  PUSH: 'push',

  /**
   * Indicates the current location should be replaced.
   */
  REPLACE: 'replace',

  /**
   * Indicates the most recent entry should be removed from the history stack.
   */
  POP: 'pop'

};

module.exports = LocationActions;

},{}],8:[function(require,module,exports){
var LocationActions = require('../actions/LocationActions');

/**
 * A scroll behavior that attempts to imitate the default behavior
 * of modern browsers.
 */
var ImitateBrowserBehavior = {

  updateScrollPosition: function (position, actionType) {
    switch (actionType) {
      case LocationActions.PUSH:
      case LocationActions.REPLACE:
        window.scrollTo(0, 0);
        break;
      case LocationActions.POP:
        if (position) {
          window.scrollTo(position.x, position.y);
        } else {
          window.scrollTo(0, 0);
        }
        break;
    }
  }

};

module.exports = ImitateBrowserBehavior;

},{"../actions/LocationActions":7}],9:[function(require,module,exports){
/**
 * A scroll behavior that always scrolls to the top of the page
 * after a transition.
 */
var ScrollToTopBehavior = {

  updateScrollPosition: function () {
    window.scrollTo(0, 0);
  }

};

module.exports = ScrollToTopBehavior;

},{}],10:[function(require,module,exports){
var React = require('react');
var FakeNode = require('../mixins/FakeNode');
var PropTypes = require('../utils/PropTypes');

/**
 * A <DefaultRoute> component is a special kind of <Route> that
 * renders when its parent matches but none of its siblings do.
 * Only one such route may be used at any given level in the
 * route hierarchy.
 */
var DefaultRoute = React.createClass({

  displayName: 'DefaultRoute',

  mixins: [ FakeNode ],

  propTypes: {
    name: React.PropTypes.string,
    path: PropTypes.falsy,
    handler: React.PropTypes.func.isRequired
  }

});

module.exports = DefaultRoute;

},{"../mixins/FakeNode":20,"../utils/PropTypes":31,"react":"react"}],11:[function(require,module,exports){
var React = require('react');
var classSet = require('react/lib/cx');
var assign = require('react/lib/Object.assign');
var Navigation = require('../mixins/Navigation');
var State = require('../mixins/State');

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * <Link> components are used to create an <a> element that links to a route.
 * When that route is active, the link gets an "active" class name (or the
 * value of its `activeClassName` prop).
 *
 * For example, assuming you have the following route:
 *
 *   <Route name="showPost" path="/posts/:postID" handler={Post}/>
 *
 * You could use the following component to link to that route:
 *
 *   <Link to="showPost" params={{ postID: "123" }} />
 *
 * In addition to params, links may pass along query string parameters
 * using the `query` prop.
 *
 *   <Link to="showPost" params={{ postID: "123" }} query={{ show:true }}/>
 */
var Link = React.createClass({

  displayName: 'Link',

  mixins: [ Navigation, State ],

  propTypes: {
    activeClassName: React.PropTypes.string.isRequired,
    to: React.PropTypes.string.isRequired,
    params: React.PropTypes.object,
    query: React.PropTypes.object,
    onClick: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      activeClassName: 'active'
    };
  },

  handleClick: function (event) {
    var allowTransition = true;
    var clickResult;

    if (this.props.onClick)
      clickResult = this.props.onClick(event);

    if (isModifiedEvent(event) || !isLeftClickEvent(event))
      return;

    if (clickResult === false || event.defaultPrevented === true)
      allowTransition = false;

    event.preventDefault();

    if (allowTransition)
      this.transitionTo(this.props.to, this.props.params, this.props.query);
  },

  /**
   * Returns the value of the "href" attribute to use on the DOM element.
   */
  getHref: function () {
    return this.makeHref(this.props.to, this.props.params, this.props.query);
  },

  /**
   * Returns the value of the "class" attribute to use on the DOM element, which contains
   * the value of the activeClassName property when this <Link> is active.
   */
  getClassName: function () {
    var classNames = {};

    if (this.props.className)
      classNames[this.props.className] = true;

    if (this.isActive(this.props.to, this.props.params, this.props.query))
      classNames[this.props.activeClassName] = true;

    return classSet(classNames);
  },

  render: function () {
    var props = assign({}, this.props, {
      href: this.getHref(),
      className: this.getClassName(),
      onClick: this.handleClick
    });

    return React.DOM.a(props, this.props.children);
  }

});

module.exports = Link;

},{"../mixins/Navigation":21,"../mixins/State":25,"react":"react","react/lib/Object.assign":52,"react/lib/cx":54}],12:[function(require,module,exports){
var React = require('react');
var FakeNode = require('../mixins/FakeNode');
var PropTypes = require('../utils/PropTypes');

/**
 * A <NotFoundRoute> is a special kind of <Route> that
 * renders when the beginning of its parent's path matches
 * but none of its siblings do, including any <DefaultRoute>.
 * Only one such route may be used at any given level in the
 * route hierarchy.
 */
var NotFoundRoute = React.createClass({

  displayName: 'NotFoundRoute',

  mixins: [ FakeNode ],

  propTypes: {
    name: React.PropTypes.string,
    path: PropTypes.falsy,
    handler: React.PropTypes.func.isRequired
  }

});

module.exports = NotFoundRoute;

},{"../mixins/FakeNode":20,"../utils/PropTypes":31,"react":"react"}],13:[function(require,module,exports){
var React = require('react');
var FakeNode = require('../mixins/FakeNode');
var PropTypes = require('../utils/PropTypes');

/**
 * A <Redirect> component is a special kind of <Route> that always
 * redirects to another route when it matches.
 */
var Redirect = React.createClass({

  displayName: 'Redirect',

  mixins: [ FakeNode ],

  propTypes: {
    path: React.PropTypes.string,
    from: React.PropTypes.string, // Alias for path.
    to: React.PropTypes.string,
    handler: PropTypes.falsy
  }

});

module.exports = Redirect;

},{"../mixins/FakeNode":20,"../utils/PropTypes":31,"react":"react"}],14:[function(require,module,exports){
var React = require('react');
var FakeNode = require('../mixins/FakeNode');

/**
 * <Route> components specify components that are rendered to the page when the
 * URL matches a given pattern.
 *
 * Routes are arranged in a nested tree structure. When a new URL is requested,
 * the tree is searched depth-first to find a route whose path matches the URL.
 * When one is found, all routes in the tree that lead to it are considered
 * "active" and their components are rendered into the DOM, nested in the same
 * order as they are in the tree.
 *
 * The preferred way to configure a router is using JSX. The XML-like syntax is
 * a great way to visualize how routes are laid out in an application.
 *
 *   var routes = [
 *     <Route handler={App}>
 *       <Route name="login" handler={Login}/>
 *       <Route name="logout" handler={Logout}/>
 *       <Route name="about" handler={About}/>
 *     </Route>
 *   ];
 *   
 *   Router.run(routes, function (Handler) {
 *     React.render(<Handler/>, document.body);
 *   });
 *
 * Handlers for Route components that contain children can render their active
 * child route using a <RouteHandler> element.
 *
 *   var App = React.createClass({
 *     render: function () {
 *       return (
 *         <div class="application">
 *           <RouteHandler/>
 *         </div>
 *       );
 *     }
 *   });
 */
var Route = React.createClass({

  displayName: 'Route',

  mixins: [ FakeNode ],

  propTypes: {
    name: React.PropTypes.string,
    path: React.PropTypes.string,
    handler: React.PropTypes.func.isRequired,
    ignoreScrollBehavior: React.PropTypes.bool
  }

});

module.exports = Route;

},{"../mixins/FakeNode":20,"react":"react"}],15:[function(require,module,exports){
var React = require('react');
var RouteHandlerMixin = require('../mixins/RouteHandler');

/**
 * A <RouteHandler> component renders the active child route handler
 * when routes are nested.
 */
var RouteHandler = React.createClass({

  displayName: 'RouteHandler',

  mixins: [RouteHandlerMixin],

  getDefaultProps: function () {
    return {
      ref: '__routeHandler__'
    };
  },

  render: function () {
    return this.getRouteHandler();
  }

});

module.exports = RouteHandler;

},{"../mixins/RouteHandler":23,"react":"react"}],16:[function(require,module,exports){
exports.DefaultRoute = require('./components/DefaultRoute');
exports.Link = require('./components/Link');
exports.NotFoundRoute = require('./components/NotFoundRoute');
exports.Redirect = require('./components/Redirect');
exports.Route = require('./components/Route');
exports.RouteHandler = require('./components/RouteHandler');

exports.HashLocation = require('./locations/HashLocation');
exports.HistoryLocation = require('./locations/HistoryLocation');
exports.RefreshLocation = require('./locations/RefreshLocation');

exports.ImitateBrowserBehavior = require('./behaviors/ImitateBrowserBehavior');
exports.ScrollToTopBehavior = require('./behaviors/ScrollToTopBehavior');

exports.Navigation = require('./mixins/Navigation');
exports.State = require('./mixins/State');

exports.create = require('./utils/createRouter');
exports.run = require('./utils/runRouter');

exports.History = require('./utils/History');

},{"./behaviors/ImitateBrowserBehavior":8,"./behaviors/ScrollToTopBehavior":9,"./components/DefaultRoute":10,"./components/Link":11,"./components/NotFoundRoute":12,"./components/Redirect":13,"./components/Route":14,"./components/RouteHandler":15,"./locations/HashLocation":17,"./locations/HistoryLocation":18,"./locations/RefreshLocation":19,"./mixins/Navigation":21,"./mixins/State":25,"./utils/History":28,"./utils/createRouter":34,"./utils/runRouter":38}],17:[function(require,module,exports){
var LocationActions = require('../actions/LocationActions');
var History = require('../utils/History');
var Path = require('../utils/Path');

/**
 * Returns the current URL path from the `hash` portion of the URL, including
 * query string.
 */
function getHashPath() {
  return Path.decode(
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    window.location.href.split('#')[1] || ''
  );
}

var _actionType;

function ensureSlash() {
  var path = getHashPath();

  if (path.charAt(0) === '/')
    return true;

  HashLocation.replace('/' + path);

  return false;
}

var _changeListeners = [];

function notifyChange(type) {
  if (type === LocationActions.PUSH)
    History.length += 1;

  var change = {
    path: getHashPath(),
    type: type
  };

  _changeListeners.forEach(function (listener) {
    listener(change);
  });
}

var _isListening = false;

function onHashChange() {
  if (ensureSlash()) {
    // If we don't have an _actionType then all we know is the hash
    // changed. It was probably caused by the user clicking the Back
    // button, but may have also been the Forward button or manual
    // manipulation. So just guess 'pop'.
    notifyChange(_actionType || LocationActions.POP);
    _actionType = null;
  }
}

/**
 * A Location that uses `window.location.hash`.
 */
var HashLocation = {

  addChangeListener: function (listener) {
    _changeListeners.push(listener);

    // Do this BEFORE listening for hashchange.
    ensureSlash();

    if (_isListening)
      return;

    if (window.addEventListener) {
      window.addEventListener('hashchange', onHashChange, false);
    } else {
      window.attachEvent('onhashchange', onHashChange);
    }

    _isListening = true;
  },

  removeChangeListener: function(listener) {
    for (var i = 0, l = _changeListeners.length; i < l; i ++) {
      if (_changeListeners[i] === listener) {
        _changeListeners.splice(i, 1);
        break;
      }
    }

    if (window.removeEventListener) {
      window.removeEventListener('hashchange', onHashChange, false);
    } else {
      window.removeEvent('onhashchange', onHashChange);
    }

    if (_changeListeners.length === 0)
      _isListening = false;
  },



  push: function (path) {
    _actionType = LocationActions.PUSH;
    window.location.hash = Path.encode(path);
  },

  replace: function (path) {
    _actionType = LocationActions.REPLACE;
    window.location.replace(window.location.pathname + '#' + Path.encode(path));
  },

  pop: function () {
    _actionType = LocationActions.POP;
    History.back();
  },

  getCurrentPath: getHashPath,

  toString: function () {
    return '<HashLocation>';
  }

};

module.exports = HashLocation;

},{"../actions/LocationActions":7,"../utils/History":28,"../utils/Path":29}],18:[function(require,module,exports){
var LocationActions = require('../actions/LocationActions');
var History = require('../utils/History');
var Path = require('../utils/Path');

/**
 * Returns the current URL path from `window.location`, including query string.
 */
function getWindowPath() {
  return Path.decode(
    window.location.pathname + window.location.search
  );
}

var _changeListeners = [];

function notifyChange(type) {
  var change = {
    path: getWindowPath(),
    type: type
  };

  _changeListeners.forEach(function (listener) {
    listener(change);
  });
}

var _isListening = false;

function onPopState() {
  notifyChange(LocationActions.POP);
}

/**
 * A Location that uses HTML5 history.
 */
var HistoryLocation = {

  addChangeListener: function (listener) {
    _changeListeners.push(listener);

    if (_isListening)
      return;

    if (window.addEventListener) {
      window.addEventListener('popstate', onPopState, false);
    } else {
      window.attachEvent('popstate', onPopState);
    }

    _isListening = true;
  },

  removeChangeListener: function(listener) {
    for (var i = 0, l = _changeListeners.length; i < l; i ++) {
      if (_changeListeners[i] === listener) {
        _changeListeners.splice(i, 1);
        break;
      }
    }

    if (window.addEventListener) {
      window.removeEventListener('popstate', onPopState);
    } else {
      window.removeEvent('popstate', onPopState);
    }

    if (_changeListeners.length === 0)
      _isListening = false;
  },



  push: function (path) {
    window.history.pushState({ path: path }, '', Path.encode(path));
    History.length += 1;
    notifyChange(LocationActions.PUSH);
  },

  replace: function (path) {
    window.history.replaceState({ path: path }, '', Path.encode(path));
    notifyChange(LocationActions.REPLACE);
  },

  pop: History.back,

  getCurrentPath: getWindowPath,

  toString: function () {
    return '<HistoryLocation>';
  }

};

module.exports = HistoryLocation;

},{"../actions/LocationActions":7,"../utils/History":28,"../utils/Path":29}],19:[function(require,module,exports){
var HistoryLocation = require('./HistoryLocation');
var History = require('../utils/History');
var Path = require('../utils/Path');

/**
 * A Location that uses full page refreshes. This is used as
 * the fallback for HistoryLocation in browsers that do not
 * support the HTML5 history API.
 */
var RefreshLocation = {

  push: function (path) {
    window.location = Path.encode(path);
  },

  replace: function (path) {
    window.location.replace(Path.encode(path));
  },

  pop: History.back,

  getCurrentPath: HistoryLocation.getCurrentPath,

  toString: function () {
    return '<RefreshLocation>';
  }

};

module.exports = RefreshLocation;

},{"../utils/History":28,"../utils/Path":29,"./HistoryLocation":18}],20:[function(require,module,exports){
var invariant = require('react/lib/invariant');

var FakeNode = {

  render: function () {
    invariant(
      false,
      '%s elements should not be rendered',
      this.constructor.displayName
    );
  }

};

module.exports = FakeNode;

},{"react/lib/invariant":56}],21:[function(require,module,exports){
var React = require('react');

/**
 * A mixin for components that modify the URL.
 *
 * Example:
 *
 *   var MyLink = React.createClass({
 *     mixins: [ Router.Navigation ],
 *     handleClick: function (event) {
 *       event.preventDefault();
 *       this.transitionTo('aRoute', { the: 'params' }, { the: 'query' });
 *     },
 *     render: function () {
 *       return (
 *         <a onClick={this.handleClick}>Click me!</a>
 *       );
 *     }
 *   });
 */
var Navigation = {

  contextTypes: {
    makePath: React.PropTypes.func.isRequired,
    makeHref: React.PropTypes.func.isRequired,
    transitionTo: React.PropTypes.func.isRequired,
    replaceWith: React.PropTypes.func.isRequired,
    goBack: React.PropTypes.func.isRequired
  },

  /**
   * Returns an absolute URL path created from the given route
   * name, URL parameters, and query values.
   */
  makePath: function (to, params, query) {
    return this.context.makePath(to, params, query);
  },

  /**
   * Returns a string that may safely be used as the href of a
   * link to the route with the given name.
   */
  makeHref: function (to, params, query) {
    return this.context.makeHref(to, params, query);
  },

  /**
   * Transitions to the URL specified in the arguments by pushing
   * a new URL onto the history stack.
   */
  transitionTo: function (to, params, query) {
    this.context.transitionTo(to, params, query);
  },

  /**
   * Transitions to the URL specified in the arguments by replacing
   * the current URL in the history stack.
   */
  replaceWith: function (to, params, query) {
    this.context.replaceWith(to, params, query);
  },

  /**
   * Transitions to the previous URL.
   */
  goBack: function () {
    this.context.goBack();
  }

};

module.exports = Navigation;

},{"react":"react"}],22:[function(require,module,exports){
var React = require('react');

/**
 * Provides the router with context for Router.Navigation.
 */
var NavigationContext = {

  childContextTypes: {
    makePath: React.PropTypes.func.isRequired,
    makeHref: React.PropTypes.func.isRequired,
    transitionTo: React.PropTypes.func.isRequired,
    replaceWith: React.PropTypes.func.isRequired,
    goBack: React.PropTypes.func.isRequired
  },

  getChildContext: function () {
    return {
      makePath: this.constructor.makePath,
      makeHref: this.constructor.makeHref,
      transitionTo: this.constructor.transitionTo,
      replaceWith: this.constructor.replaceWith,
      goBack: this.constructor.goBack
    };
  }

};

module.exports = NavigationContext;

},{"react":"react"}],23:[function(require,module,exports){
var React = require('react');

module.exports = {
  contextTypes: {
    getRouteAtDepth: React.PropTypes.func.isRequired,
    getRouteComponents: React.PropTypes.func.isRequired,
    routeHandlers: React.PropTypes.array.isRequired
  },

  childContextTypes: {
    routeHandlers: React.PropTypes.array.isRequired
  },

  getChildContext: function () {
    return {
      routeHandlers: this.context.routeHandlers.concat([ this ])
    };
  },

  getRouteDepth: function () {
    return this.context.routeHandlers.length - 1;
  },

  componentDidMount: function () {
    this._updateRouteComponent();
  },

  componentDidUpdate: function () {
    this._updateRouteComponent();
  },

  _updateRouteComponent: function () {
    var depth = this.getRouteDepth();
    var components = this.context.getRouteComponents();
    components[depth] = this.refs[this.props.ref || '__routeHandler__'];
  },

  getRouteHandler: function (props) {
    var route = this.context.getRouteAtDepth(this.getRouteDepth());
    return route ? React.createElement(route.handler, props || this.props) : null;
  }
};
},{"react":"react"}],24:[function(require,module,exports){
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;
var getWindowScrollPosition = require('../utils/getWindowScrollPosition');

function shouldUpdateScroll(state, prevState) {
  if (!prevState)
    return true;

  // Don't update scroll position when only the query has changed.
  if (state.pathname === prevState.pathname)
    return false;

  var routes = state.routes;
  var prevRoutes = prevState.routes;

  var sharedAncestorRoutes = routes.filter(function (route) {
    return prevRoutes.indexOf(route) !== -1;
  });

  return !sharedAncestorRoutes.some(function (route) {
    return route.ignoreScrollBehavior;
  });
}

/**
 * Provides the router with the ability to manage window scroll position
 * according to its scroll behavior.
 */
var Scrolling = {

  statics: {
    /**
     * Records curent scroll position as the last known position for the given URL path.
     */
    recordScrollPosition: function (path) {
      if (!this.scrollHistory)
        this.scrollHistory = {};

      this.scrollHistory[path] = getWindowScrollPosition();
    },

    /**
     * Returns the last known scroll position for the given URL path.
     */
    getScrollPosition: function (path) {
      if (!this.scrollHistory)
        this.scrollHistory = {};

      return this.scrollHistory[path] || null;
    }
  },

  componentWillMount: function () {
    invariant(
      this.getScrollBehavior() == null || canUseDOM,
      'Cannot use scroll behavior without a DOM'
    );
  },

  componentDidMount: function () {
    this._updateScroll();
  },

  componentDidUpdate: function (prevProps, prevState) {
    this._updateScroll(prevState);
  },

  _updateScroll: function (prevState) {
    if (!shouldUpdateScroll(this.state, prevState))
      return;

    var scrollBehavior = this.getScrollBehavior();

    if (scrollBehavior)
      scrollBehavior.updateScrollPosition(
        this.constructor.getScrollPosition(this.state.path),
        this.state.action
      );
  }

};

module.exports = Scrolling;

},{"../utils/getWindowScrollPosition":36,"react/lib/ExecutionEnvironment":51,"react/lib/invariant":56}],25:[function(require,module,exports){
var React = require('react');

/**
 * A mixin for components that need to know the path, routes, URL
 * params and query that are currently active.
 *
 * Example:
 *
 *   var AboutLink = React.createClass({
 *     mixins: [ Router.State ],
 *     render: function () {
 *       var className = this.props.className;
 *   
 *       if (this.isActive('about'))
 *         className += ' is-active';
 *   
 *       return React.DOM.a({ className: className }, this.props.children);
 *     }
 *   });
 */
var State = {

  contextTypes: {
    getCurrentPath: React.PropTypes.func.isRequired,
    getCurrentRoutes: React.PropTypes.func.isRequired,
    getCurrentPathname: React.PropTypes.func.isRequired,
    getCurrentParams: React.PropTypes.func.isRequired,
    getCurrentQuery: React.PropTypes.func.isRequired,
    isActive: React.PropTypes.func.isRequired
  },

  /**
   * Returns the current URL path.
   */
  getPath: function () {
    return this.context.getCurrentPath();
  },

  /**
   * Returns an array of the routes that are currently active.
   */
  getRoutes: function () {
    return this.context.getCurrentRoutes();
  },

  /**
   * Returns the current URL path without the query string.
   */
  getPathname: function () {
    return this.context.getCurrentPathname();
  },

  /**
   * Returns an object of the URL params that are currently active.
   */
  getParams: function () {
    return this.context.getCurrentParams();
  },

  /**
   * Returns an object of the query params that are currently active.
   */
  getQuery: function () {
    return this.context.getCurrentQuery();
  },

  /**
   * A helper method to determine if a given route, params, and query
   * are active.
   */
  isActive: function (to, params, query) {
    return this.context.isActive(to, params, query);
  }

};

module.exports = State;

},{"react":"react"}],26:[function(require,module,exports){
var React = require('react');
var assign = require('react/lib/Object.assign');
var Path = require('../utils/Path');

function routeIsActive(activeRoutes, routeName) {
  return activeRoutes.some(function (route) {
    return route.name === routeName;
  });
}

function paramsAreActive(activeParams, params) {
  for (var property in params)
    if (String(activeParams[property]) !== String(params[property]))
      return false;

  return true;
}

function queryIsActive(activeQuery, query) {
  for (var property in query)
    if (String(activeQuery[property]) !== String(query[property]))
      return false;

  return true;
}

/**
 * Provides the router with context for Router.State.
 */
var StateContext = {

  /**
   * Returns the current URL path + query string.
   */
  getCurrentPath: function () {
    return this.state.path;
  },

  /**
   * Returns a read-only array of the currently active routes.
   */
  getCurrentRoutes: function () {
    return this.state.routes.slice(0);
  },

  /**
   * Returns the current URL path without the query string.
   */
  getCurrentPathname: function () {
    return this.state.pathname;
  },

  /**
   * Returns a read-only object of the currently active URL parameters.
   */
  getCurrentParams: function () {
    return assign({}, this.state.params);
  },

  /**
   * Returns a read-only object of the currently active query parameters.
   */
  getCurrentQuery: function () {
    return assign({}, this.state.query);
  },

  /**
   * Returns true if the given route, params, and query are active.
   */
  isActive: function (to, params, query) {
    if (Path.isAbsolute(to))
      return to === this.state.path;

    return routeIsActive(this.state.routes, to) &&
      paramsAreActive(this.state.params, params) &&
      (query == null || queryIsActive(this.state.query, query));
  },

  childContextTypes: {
    getCurrentPath: React.PropTypes.func.isRequired,
    getCurrentRoutes: React.PropTypes.func.isRequired,
    getCurrentPathname: React.PropTypes.func.isRequired,
    getCurrentParams: React.PropTypes.func.isRequired,
    getCurrentQuery: React.PropTypes.func.isRequired,
    isActive: React.PropTypes.func.isRequired
  },

  getChildContext: function () {
    return {
      getCurrentPath: this.getCurrentPath,
      getCurrentRoutes: this.getCurrentRoutes,
      getCurrentPathname: this.getCurrentPathname,
      getCurrentParams: this.getCurrentParams,
      getCurrentQuery: this.getCurrentQuery,
      isActive: this.isActive
    };
  }

};

module.exports = StateContext;

},{"../utils/Path":29,"react":"react","react/lib/Object.assign":52}],27:[function(require,module,exports){
/**
 * Represents a cancellation caused by navigating away
 * before the previous transition has fully resolved.
 */
function Cancellation() { }

module.exports = Cancellation;

},{}],28:[function(require,module,exports){
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;

var History = {

  /**
   * Sends the browser back one entry in the history.
   */
  back: function () {
    invariant(
      canUseDOM,
      'Cannot use History.back without a DOM'
    );

    // Do this first so that History.length will
    // be accurate in location change listeners.
    History.length -= 1;

    window.history.back();
  },

  /**
   * The current number of entries in the history.
   */
  length: 1

};

module.exports = History;

},{"react/lib/ExecutionEnvironment":51,"react/lib/invariant":56}],29:[function(require,module,exports){
var invariant = require('react/lib/invariant');
var merge = require('qs/lib/utils').merge;
var qs = require('qs');

var paramCompileMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;
var paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*]/g;
var paramInjectTrailingSlashMatcher = /\/\/\?|\/\?/g;
var queryMatcher = /\?(.+)/;

var _compiledPatterns = {};

function compilePattern(pattern) {
  if (!(pattern in _compiledPatterns)) {
    var paramNames = [];
    var source = pattern.replace(paramCompileMatcher, function (match, paramName) {
      if (paramName) {
        paramNames.push(paramName);
        return '([^/?#]+)';
      } else if (match === '*') {
        paramNames.push('splat');
        return '(.*?)';
      } else {
        return '\\' + match;
      }
    });

    _compiledPatterns[pattern] = {
      matcher: new RegExp('^' + source + '$', 'i'),
      paramNames: paramNames
    };
  }

  return _compiledPatterns[pattern];
}

var Path = {

  /**
   * Safely decodes special characters in the given URL path.
   */
  decode: function (path) {
    return decodeURI(path.replace(/\+/g, ' '));
  },

  /**
   * Safely encodes special characters in the given URL path.
   */
  encode: function (path) {
    return encodeURI(path).replace(/%20/g, '+');
  },

  /**
   * Returns an array of the names of all parameters in the given pattern.
   */
  extractParamNames: function (pattern) {
    return compilePattern(pattern).paramNames;
  },

  /**
   * Extracts the portions of the given URL path that match the given pattern
   * and returns an object of param name => value pairs. Returns null if the
   * pattern does not match the given path.
   */
  extractParams: function (pattern, path) {
    var object = compilePattern(pattern);
    var match = path.match(object.matcher);

    if (!match)
      return null;

    var params = {};

    object.paramNames.forEach(function (paramName, index) {
      params[paramName] = match[index + 1];
    });

    return params;
  },

  /**
   * Returns a version of the given route path with params interpolated. Throws
   * if there is a dynamic segment of the route path for which there is no param.
   */
  injectParams: function (pattern, params) {
    params = params || {};

    var splatIndex = 0;

    return pattern.replace(paramInjectMatcher, function (match, paramName) {
      paramName = paramName || 'splat';

      // If param is optional don't check for existence
      if (paramName.slice(-1) !== '?') {
        invariant(
          params[paramName] != null,
          'Missing "' + paramName + '" parameter for path "' + pattern + '"'
        );
      } else {
        paramName = paramName.slice(0, -1);

        if (params[paramName] == null)
          return '';
      }

      var segment;
      if (paramName === 'splat' && Array.isArray(params[paramName])) {
        segment = params[paramName][splatIndex++];

        invariant(
          segment != null,
          'Missing splat # ' + splatIndex + ' for path "' + pattern + '"'
        );
      } else {
        segment = params[paramName];
      }

      return segment;
    }).replace(paramInjectTrailingSlashMatcher, '/');
  },

  /**
   * Returns an object that is the result of parsing any query string contained
   * in the given path, null if the path contains no query string.
   */
  extractQuery: function (path) {
    var match = path.match(queryMatcher);
    return match && qs.parse(match[1]);
  },

  /**
   * Returns a version of the given path without the query string.
   */
  withoutQuery: function (path) {
    return path.replace(queryMatcher, '');
  },

  /**
   * Returns a version of the given path with the parameters in the given
   * query merged into the query string.
   */
  withQuery: function (path, query) {
    var existingQuery = Path.extractQuery(path);

    if (existingQuery)
      query = query ? merge(existingQuery, query) : existingQuery;

    var queryString = query && qs.stringify(query);

    if (queryString)
      return Path.withoutQuery(path) + '?' + queryString;

    return path;
  },

  /**
   * Returns true if the given path is absolute.
   */
  isAbsolute: function (path) {
    return path.charAt(0) === '/';
  },

  /**
   * Returns a normalized version of the given path.
   */
  normalize: function (path, parentRoute) {
    return path.replace(/^\/*/, '/');
  },

  /**
   * Joins two URL paths together.
   */
  join: function (a, b) {
    return a.replace(/\/*$/, '/') + b;
  }

};

module.exports = Path;

},{"qs":40,"qs/lib/utils":44,"react/lib/invariant":56}],30:[function(require,module,exports){
var Promise = require('when/lib/Promise');

// TODO: Use process.env.NODE_ENV check + envify to enable
// when's promise monitor here when in dev.

module.exports = Promise;

},{"when/lib/Promise":45}],31:[function(require,module,exports){
var PropTypes = {

  /**
   * Requires that the value of a prop be falsy.
   */
  falsy: function (props, propName, componentName) {
    if (props[propName])
      return new Error('<' + componentName + '> may not have a "' + propName + '" prop');
  }

};

module.exports = PropTypes;

},{}],32:[function(require,module,exports){
/**
 * Encapsulates a redirect to the given route.
 */
function Redirect(to, params, query) {
  this.to = to;
  this.params = params;
  this.query = query;
}

module.exports = Redirect;

},{}],33:[function(require,module,exports){
var assign = require('react/lib/Object.assign');
var reversedArray = require('./reversedArray');
var Redirect = require('./Redirect');
var Promise = require('./Promise');

/**
 * Runs all hook functions serially and calls callback(error) when finished.
 * A hook may return a promise if it needs to execute asynchronously.
 */
function runHooks(hooks, callback) {
  var promise;
  try {
    promise = hooks.reduce(function (promise, hook) {
      // The first hook to use transition.wait makes the rest
      // of the transition async from that point forward.
      return promise ? promise.then(hook) : hook();
    }, null);
  } catch (error) {
    return callback(error); // Sync error.
  }

  if (promise) {
    // Use setTimeout to break the promise chain.
    promise.then(function () {
      setTimeout(callback);
    }, function (error) {
      setTimeout(function () {
        callback(error);
      });
    });
  } else {
    callback();
  }
}

/**
 * Calls the willTransitionFrom hook of all handlers in the given matches
 * serially in reverse with the transition object and the current instance of
 * the route's handler, so that the deepest nested handlers are called first.
 * Calls callback(error) when finished.
 */
function runTransitionFromHooks(transition, routes, components, callback) {
  components = reversedArray(components);

  var hooks = reversedArray(routes).map(function (route, index) {
    return function () {
      var handler = route.handler;

      if (!transition.isAborted && handler.willTransitionFrom)
        return handler.willTransitionFrom(transition, components[index]);

      var promise = transition._promise;
      transition._promise = null;

      return promise;
    };
  });

  runHooks(hooks, callback);
}

/**
 * Calls the willTransitionTo hook of all handlers in the given matches
 * serially with the transition object and any params that apply to that
 * handler. Calls callback(error) when finished.
 */
function runTransitionToHooks(transition, routes, params, query, callback) {
  var hooks = routes.map(function (route) {
    return function () {
      var handler = route.handler;

      if (!transition.isAborted && handler.willTransitionTo)
        handler.willTransitionTo(transition, params, query);

      var promise = transition._promise;
      transition._promise = null;

      return promise;
    };
  });

  runHooks(hooks, callback);
}

/**
 * Encapsulates a transition to a given path.
 *
 * The willTransitionTo and willTransitionFrom handlers receive
 * an instance of this class as their first argument.
 */
function Transition(path, retry) {
  this.path = path;
  this.abortReason = null;
  this.isAborted = false;
  this.retry = retry.bind(this);
  this._promise = null;
}

assign(Transition.prototype, {

  abort: function (reason) {
    if (this.isAborted) {
      // First abort wins.
      return;
    }

    this.abortReason = reason;
    this.isAborted = true;
  },

  redirect: function (to, params, query) {
    this.abort(new Redirect(to, params, query));
  },

  wait: function (value) {
    this._promise = Promise.resolve(value);
  },

  from: function (routes, components, callback) {
    return runTransitionFromHooks(this, routes, components, callback);
  },

  to: function (routes, params, query, callback) {
    return runTransitionToHooks(this, routes, params, query, callback);
  }

});

module.exports = Transition;

},{"./Promise":30,"./Redirect":32,"./reversedArray":37,"react/lib/Object.assign":52}],34:[function(require,module,exports){
(function (process){(function (){
/* jshint -W058 */
var React = require('react');
var warning = require('react/lib/warning');
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;
var ImitateBrowserBehavior = require('../behaviors/ImitateBrowserBehavior');
var RouteHandler = require('../components/RouteHandler');
var LocationActions = require('../actions/LocationActions');
var HashLocation = require('../locations/HashLocation');
var HistoryLocation = require('../locations/HistoryLocation');
var RefreshLocation = require('../locations/RefreshLocation');
var NavigationContext = require('../mixins/NavigationContext');
var StateContext = require('../mixins/StateContext');
var Scrolling = require('../mixins/Scrolling');
var createRoutesFromChildren = require('./createRoutesFromChildren');
var supportsHistory = require('./supportsHistory');
var Transition = require('./Transition');
var PropTypes = require('./PropTypes');
var Redirect = require('./Redirect');
var History = require('./History');
var Cancellation = require('./Cancellation');
var Path = require('./Path');

/**
 * The default location for new routers.
 */
var DEFAULT_LOCATION = canUseDOM ? HashLocation : '/';

/**
 * The default scroll behavior for new routers.
 */
var DEFAULT_SCROLL_BEHAVIOR = canUseDOM ? ImitateBrowserBehavior : null;

/**
 * The default error handler for new routers.
 */
function defaultErrorHandler(error) {
  // Throw so we don't silently swallow async errors.
  throw error; // This error probably originated in a transition hook.
}

/**
 * The default aborted transition handler for new routers.
 */
function defaultAbortHandler(abortReason, location) {
  if (typeof location === 'string')
    throw new Error('Unhandled aborted transition! Reason: ' + abortReason);

  if (abortReason instanceof Cancellation) {
    return;
  } else if (abortReason instanceof Redirect) {
    location.replace(this.makePath(abortReason.to, abortReason.params, abortReason.query));
  } else {
    location.pop();
  }
}

function findMatch(pathname, routes, defaultRoute, notFoundRoute) {
  var match, route, params;

  for (var i = 0, len = routes.length; i < len; ++i) {
    route = routes[i];

    // Check the subtree first to find the most deeply-nested match.
    match = findMatch(pathname, route.childRoutes, route.defaultRoute, route.notFoundRoute);

    if (match != null) {
      match.routes.unshift(route);
      return match;
    }

    // No routes in the subtree matched, so check this route.
    params = Path.extractParams(route.path, pathname);

    if (params)
      return createMatch(route, params);
  }

  // No routes matched, so try the default route if there is one.
  if (defaultRoute && (params = Path.extractParams(defaultRoute.path, pathname)))
    return createMatch(defaultRoute, params);

  // Last attempt: does the "not found" route match?
  if (notFoundRoute && (params = Path.extractParams(notFoundRoute.path, pathname)))
    return createMatch(notFoundRoute, params);

  return match;
}

function createMatch(route, params) {
  return { routes: [ route ], params: params };
}

function hasProperties(object, properties) {
  for (var propertyName in properties)
    if (properties.hasOwnProperty(propertyName) && object[propertyName] !== properties[propertyName])
      return false;

  return true;
}

function hasMatch(routes, route, prevParams, nextParams, prevQuery, nextQuery) {
  return routes.some(function (r) {
    if (r !== route)
      return false;

    var paramNames = route.paramNames;
    var paramName;

    // Ensure that all params the route cares about did not change.
    for (var i = 0, len = paramNames.length; i < len; ++i) {
      paramName = paramNames[i];

      if (nextParams[paramName] !== prevParams[paramName])
        return false;
    }

    // Ensure the query hasn't changed.
    return hasProperties(prevQuery, nextQuery) && hasProperties(nextQuery, prevQuery);
  });
}

/**
 * Creates and returns a new router using the given options. A router
 * is a ReactComponent class that knows how to react to changes in the
 * URL and keep the contents of the page in sync.
 *
 * Options may be any of the following:
 *
 * - routes           (required) The route config
 * - location         The location to use. Defaults to HashLocation when
 *                    the DOM is available, "/" otherwise
 * - scrollBehavior   The scroll behavior to use. Defaults to ImitateBrowserBehavior
 *                    when the DOM is available, null otherwise
 * - onError          A function that is used to handle errors
 * - onAbort          A function that is used to handle aborted transitions
 *
 * When rendering in a server-side environment, the location should simply
 * be the URL path that was used in the request, including the query string.
 */
function createRouter(options) {
  options = options || {};

  if (typeof options === 'function') {
    options = { routes: options }; // Router.create(<Route>)
  } else if (Array.isArray(options)) {
    options = { routes: options }; // Router.create([ <Route>, <Route> ])
  }

  var routes = [];
  var namedRoutes = {};
  var components = [];
  var location = options.location || DEFAULT_LOCATION;
  var scrollBehavior = options.scrollBehavior || DEFAULT_SCROLL_BEHAVIOR;
  var onError = options.onError || defaultErrorHandler;
  var onAbort = options.onAbort || defaultAbortHandler;
  var state = {};
  var nextState = {};
  var pendingTransition = null;

  function updateState() {
    state = nextState;
    nextState = {};
  }

  if (typeof location === 'string') {
    warning(
      !canUseDOM || process.env.NODE_ENV === 'test',
      'You should not use a static location in a DOM environment because ' +
      'the router will not be kept in sync with the current URL'
    );
  } else {
    invariant(
      canUseDOM,
      'You cannot use %s without a DOM',
      location
    );
  }

  // Automatically fall back to full page refreshes in
  // browsers that don't support the HTML history API.
  if (location === HistoryLocation && !supportsHistory())
    location = RefreshLocation;

  var router = React.createClass({

    displayName: 'Router',

    mixins: [ NavigationContext, StateContext, Scrolling ],

    statics: {

      defaultRoute: null,
      notFoundRoute: null,

      /**
       * Adds routes to this router from the given children object (see ReactChildren).
       */
      addRoutes: function (children) {
        routes.push.apply(routes, createRoutesFromChildren(children, this, namedRoutes));
      },

      /**
       * Returns an absolute URL path created from the given route
       * name, URL parameters, and query.
       */
      makePath: function (to, params, query) {
        var path;
        if (Path.isAbsolute(to)) {
          path = Path.normalize(to);
        } else {
          var route = namedRoutes[to];

          invariant(
            route,
            'Unable to find <Route name="%s">',
            to
          );

          path = route.path;
        }

        return Path.withQuery(Path.injectParams(path, params), query);
      },

      /**
       * Returns a string that may safely be used as the href of a link
       * to the route with the given name, URL parameters, and query.
       */
      makeHref: function (to, params, query) {
        var path = this.makePath(to, params, query);
        return (location === HashLocation) ? '#' + path : path;
      },

      /**
       * Transitions to the URL specified in the arguments by pushing
       * a new URL onto the history stack.
       */
      transitionTo: function (to, params, query) {
        invariant(
          typeof location !== 'string',
          'You cannot use transitionTo with a static location'
        );

        var path = this.makePath(to, params, query);

        if (pendingTransition) {
          // Replace so pending location does not stay in history.
          location.replace(path);
        } else {
          location.push(path);
        }
      },

      /**
       * Transitions to the URL specified in the arguments by replacing
       * the current URL in the history stack.
       */
      replaceWith: function (to, params, query) {
        invariant(
          typeof location !== 'string',
          'You cannot use replaceWith with a static location'
        );

        location.replace(this.makePath(to, params, query));
      },

      /**
       * Transitions to the previous URL if one is available. Returns true if the
       * router was able to go back, false otherwise.
       *
       * Note: The router only tracks history entries in your application, not the
       * current browser session, so you can safely call this function without guarding
       * against sending the user back to some other site. However, when using
       * RefreshLocation (which is the fallback for HistoryLocation in browsers that
       * don't support HTML5 history) this method will *always* send the client back
       * because we cannot reliably track history length.
       */
      goBack: function () {
        invariant(
          typeof location !== 'string',
          'You cannot use goBack with a static location'
        );

        if (History.length > 1 || location === RefreshLocation) {
          location.pop();
          return true;
        }

        warning(false, 'goBack() was ignored because there is no router history');

        return false;
      },

      /**
       * Performs a match of the given pathname against this router and returns an object
       * with the { routes, params } that match. Returns null if no match can be made.
       */
      match: function (pathname) {
        return findMatch(pathname, routes, this.defaultRoute, this.notFoundRoute) || null;
      },

      /**
       * Performs a transition to the given path and calls callback(error, abortReason)
       * when the transition is finished. If both arguments are null the router's state
       * was updated. Otherwise the transition did not complete.
       *
       * In a transition, a router first determines which routes are involved by beginning
       * with the current route, up the route tree to the first parent route that is shared
       * with the destination route, and back down the tree to the destination route. The
       * willTransitionFrom hook is invoked on all route handlers we're transitioning away
       * from, in reverse nesting order. Likewise, the willTransitionTo hook is invoked on
       * all route handlers we're transitioning to.
       *
       * Both willTransitionFrom and willTransitionTo hooks may either abort or redirect the
       * transition. To resolve asynchronously, they may use transition.wait(promise). If no
       * hooks wait, the transition is fully synchronous.
       */
      dispatch: function (path, action, callback) {
        if (pendingTransition) {
          pendingTransition.abort(new Cancellation);
          pendingTransition = null;
        }

        var prevPath = state.path;
        if (prevPath === path)
          return; // Nothing to do!

        // Record the scroll position as early as possible to
        // get it before browsers try update it automatically.
        if (prevPath && action !== LocationActions.REPLACE)
          this.recordScrollPosition(prevPath);

        var pathname = Path.withoutQuery(path);
        var match = this.match(pathname);

        warning(
          match != null,
          'No route matches path "%s". Make sure you have <Route path="%s"> somewhere in your routes',
          path, path
        );

        if (match == null)
          match = {};

        var prevRoutes = state.routes || [];
        var prevParams = state.params || {};
        var prevQuery = state.query || {};

        var nextRoutes = match.routes || [];
        var nextParams = match.params || {};
        var nextQuery = Path.extractQuery(path) || {};

        var fromRoutes, toRoutes;
        if (prevRoutes.length) {
          fromRoutes = prevRoutes.filter(function (route) {
            return !hasMatch(nextRoutes, route, prevParams, nextParams, prevQuery, nextQuery);
          });

          toRoutes = nextRoutes.filter(function (route) {
            return !hasMatch(prevRoutes, route, prevParams, nextParams, prevQuery, nextQuery);
          });
        } else {
          fromRoutes = [];
          toRoutes = nextRoutes;
        }

        var transition = new Transition(path, this.replaceWith.bind(this, path));
        pendingTransition = transition;

        transition.from(fromRoutes, components, function (error) {
          if (error || transition.isAborted)
            return callback.call(router, error, transition);

          transition.to(toRoutes, nextParams, nextQuery, function (error) {
            if (error || transition.isAborted)
              return callback.call(router, error, transition);

            nextState.path = path;
            nextState.action = action;
            nextState.pathname = pathname;
            nextState.routes = nextRoutes;
            nextState.params = nextParams;
            nextState.query = nextQuery;

            callback.call(router, null, transition);
          });
        });
      },

      /**
       * Starts this router and calls callback(router, state) when the route changes.
       *
       * If the router's location is static (i.e. a URL path in a server environment)
       * the callback is called only once. Otherwise, the location should be one of the
       * Router.*Location objects (e.g. Router.HashLocation or Router.HistoryLocation).
       */
      run: function (callback) {
        var dispatchHandler = function (error, transition) {
          pendingTransition = null;

          if (error) {
            onError.call(router, error);
          } else if (transition.isAborted) {
            onAbort.call(router, transition.abortReason, location);
          } else {
            callback.call(router, router, nextState);
          }
        };

        if (typeof location === 'string') {
          router.dispatch(location, null, dispatchHandler);
        } else {
          // Listen for changes to the location.
          var changeListener = function (change) {
            router.dispatch(change.path, change.type, dispatchHandler);
          };

          if (location.addChangeListener)
            location.addChangeListener(changeListener);

          // Bootstrap using the current path.
          router.dispatch(location.getCurrentPath(), null, dispatchHandler);
        }
      },

      teardown: function() {
        location.removeChangeListener(this.changeListener);
      }

    },

    propTypes: {
      children: PropTypes.falsy
    },

    getLocation: function () {
      return location;
    },

    getScrollBehavior: function () {
      return scrollBehavior;
    },

    getRouteAtDepth: function (depth) {
      var routes = this.state.routes;
      return routes && routes[depth];
    },

    getRouteComponents: function () {
      return components;
    },

    getInitialState: function () {
      updateState();
      return state;
    },

    componentWillReceiveProps: function () {
      updateState();
      this.setState(state);
    },

    componentWillUnmount: function() {
      router.teardown();
    },

    render: function () {
      return this.getRouteAtDepth(0) ? React.createElement(RouteHandler, this.props) : null;
    },

    childContextTypes: {
      getRouteAtDepth: React.PropTypes.func.isRequired,
      getRouteComponents: React.PropTypes.func.isRequired,
      routeHandlers: React.PropTypes.array.isRequired
    },

    getChildContext: function () {
      return {
        getRouteComponents: this.getRouteComponents,
        getRouteAtDepth: this.getRouteAtDepth,
        routeHandlers: [ this ]
      };
    }

  });

  if (options.routes)
    router.addRoutes(options.routes);

  return router;
}

module.exports = createRouter;

}).call(this)}).call(this,require('_process'))

},{"../actions/LocationActions":7,"../behaviors/ImitateBrowserBehavior":8,"../components/RouteHandler":15,"../locations/HashLocation":17,"../locations/HistoryLocation":18,"../locations/RefreshLocation":19,"../mixins/NavigationContext":22,"../mixins/Scrolling":24,"../mixins/StateContext":26,"./Cancellation":27,"./History":28,"./Path":29,"./PropTypes":31,"./Redirect":32,"./Transition":33,"./createRoutesFromChildren":35,"./supportsHistory":39,"_process":6,"react":"react","react/lib/ExecutionEnvironment":51,"react/lib/invariant":56,"react/lib/warning":57}],35:[function(require,module,exports){
/* jshint -W084 */
var React = require('react');
var warning = require('react/lib/warning');
var invariant = require('react/lib/invariant');
var DefaultRoute = require('../components/DefaultRoute');
var NotFoundRoute = require('../components/NotFoundRoute');
var Redirect = require('../components/Redirect');
var Route = require('../components/Route');
var Path = require('./Path');

var CONFIG_ELEMENT_TYPES = [
  DefaultRoute.type,
  NotFoundRoute.type,
  Redirect.type,
  Route.type
];

function createRedirectHandler(to, _params, _query) {
  return React.createClass({
    statics: {
      willTransitionTo: function (transition, params, query) {
        transition.redirect(to, _params || params, _query || query);
      }
    },

    render: function () {
      return null;
    }
  });
}

function checkPropTypes(componentName, propTypes, props) {
  for (var propName in propTypes) {
    if (propTypes.hasOwnProperty(propName)) {
      var error = propTypes[propName](props, propName, componentName);

      if (error instanceof Error)
        warning(false, error.message);
    }
  }
}

function createRoute(element, parentRoute, namedRoutes) {
  var type = element.type;
  var props = element.props;
  var componentName = (type && type.displayName) || 'UnknownComponent';

  invariant(
    CONFIG_ELEMENT_TYPES.indexOf(type) !== -1,
    'Unrecognized route configuration element "<%s>"',
    componentName
  );

  if (type.propTypes)
    checkPropTypes(componentName, type.propTypes, props);

  var route = { name: props.name };

  if (props.ignoreScrollBehavior) {
    route.ignoreScrollBehavior = true;
  }

  if (type === Redirect.type) {
    route.handler = createRedirectHandler(props.to, props.params, props.query);
    props.path = props.path || props.from || '*';
  } else {
    route.handler = props.handler;
  }

  var parentPath = (parentRoute && parentRoute.path) || '/';

  if ((props.path || props.name) && type !== DefaultRoute.type && type !== NotFoundRoute.type) {
    var path = props.path || props.name;

    // Relative paths extend their parent.
    if (!Path.isAbsolute(path))
      path = Path.join(parentPath, path);

    route.path = Path.normalize(path);
  } else {
    route.path = parentPath;

    if (type === NotFoundRoute.type)
      route.path += '*';
  }

  route.paramNames = Path.extractParamNames(route.path);

  // Make sure the route's path has all params its parent needs.
  if (parentRoute && Array.isArray(parentRoute.paramNames)) {
    parentRoute.paramNames.forEach(function (paramName) {
      invariant(
        route.paramNames.indexOf(paramName) !== -1,
        'The nested route path "%s" is missing the "%s" parameter of its parent path "%s"',
        route.path, paramName, parentRoute.path
      );
    });
  }

  // Make sure the route can be looked up by <Link>s.
  if (props.name) {
    invariant(
      namedRoutes[props.name] == null,
      'You cannot use the name "%s" for more than one route',
      props.name
    );

    namedRoutes[props.name] = route;
  }

  // Handle <NotFoundRoute>.
  if (type === NotFoundRoute.type) {
    invariant(
      parentRoute,
      '<NotFoundRoute> must have a parent <Route>'
    );

    invariant(
      parentRoute.notFoundRoute == null,
      'You may not have more than one <NotFoundRoute> per <Route>'
    );

    parentRoute.notFoundRoute = route;

    return null;
  }

  // Handle <DefaultRoute>.
  if (type === DefaultRoute.type) {
    invariant(
      parentRoute,
      '<DefaultRoute> must have a parent <Route>'
    );

    invariant(
      parentRoute.defaultRoute == null,
      'You may not have more than one <DefaultRoute> per <Route>'
    );

    parentRoute.defaultRoute = route;

    return null;
  }

  route.childRoutes = createRoutesFromChildren(props.children, route, namedRoutes);

  return route;
}

/**
 * Creates and returns an array of route objects from the given ReactChildren.
 */
function createRoutesFromChildren(children, parentRoute, namedRoutes) {
  var routes = [];

  React.Children.forEach(children, function (child) {
    // Exclude <DefaultRoute>s and <NotFoundRoute>s.
    if (child = createRoute(child, parentRoute, namedRoutes))
      routes.push(child);
  });

  return routes;
}

module.exports = createRoutesFromChildren;

},{"../components/DefaultRoute":10,"../components/NotFoundRoute":12,"../components/Redirect":13,"../components/Route":14,"./Path":29,"react":"react","react/lib/invariant":56,"react/lib/warning":57}],36:[function(require,module,exports){
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;

/**
 * Returns the current scroll position of the window as { x, y }.
 */
function getWindowScrollPosition() {
  invariant(
    canUseDOM,
    'Cannot get current scroll position without a DOM'
  );

  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
}

module.exports = getWindowScrollPosition;

},{"react/lib/ExecutionEnvironment":51,"react/lib/invariant":56}],37:[function(require,module,exports){
function reversedArray(array) {
  return array.slice(0).reverse();
}

module.exports = reversedArray;

},{}],38:[function(require,module,exports){
var createRouter = require('./createRouter');

/**
 * A high-level convenience method that creates, configures, and
 * runs a router in one shot. The method signature is:
 *
 *   Router.run(routes[, location ], callback);
 *
 * Using `window.location.hash` to manage the URL, you could do:
 *
 *   Router.run(routes, function (Handler) {
 *     React.render(<Handler/>, document.body);
 *   });
 * 
 * Using HTML5 history and a custom "cursor" prop:
 * 
 *   Router.run(routes, Router.HistoryLocation, function (Handler) {
 *     React.render(<Handler cursor={cursor}/>, document.body);
 *   });
 *
 * Returns the newly created router.
 *
 * Note: If you need to specify further options for your router such
 * as error/abort handling or custom scroll behavior, use Router.create
 * instead.
 *
 *   var router = Router.create(options);
 *   router.run(function (Handler) {
 *     // ...
 *   });
 */
function runRouter(routes, location, callback) {
  if (typeof location === 'function') {
    callback = location;
    location = null;
  }

  var router = createRouter({
    routes: routes,
    location: location
  });

  router.run(callback);

  return router;
}

module.exports = runRouter;

},{"./createRouter":34}],39:[function(require,module,exports){
function supportsHistory() {
  /*! taken from modernizr
   * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
   * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
   * changed to avoid false negatives for Windows Phones: https://github.com/rackt/react-router/issues/586
   */
  var ua = navigator.userAgent;
  if ((ua.indexOf('Android 2.') !== -1 ||
      (ua.indexOf('Android 4.0') !== -1)) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1 &&
      ua.indexOf('Windows Phone') === -1) {
    return false;
  }
  return (window.history && 'pushState' in window.history);
}

module.exports = supportsHistory;

},{}],40:[function(require,module,exports){
module.exports = require('./lib');

},{"./lib":41}],41:[function(require,module,exports){
// Load modules

var Stringify = require('./stringify');
var Parse = require('./parse');


// Declare internals

var internals = {};


module.exports = {
    stringify: Stringify,
    parse: Parse
};

},{"./parse":42,"./stringify":43}],42:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&',
    depth: 5,
    arrayLimit: 20,
    parameterLimit: 1000
};


internals.parseValues = function (str, options) {

    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0, il = parts.length; i < il; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
            obj[Utils.decode(part)] = '';
        }
        else {
            var key = Utils.decode(part.slice(0, pos));
            var val = Utils.decode(part.slice(pos + 1));

            if (!obj[key]) {
                obj[key] = val;
            }
            else {
                obj[key] = [].concat(obj[key]).concat(val);
            }
        }
    }

    return obj;
};


internals.parseObject = function (chain, val, options) {

    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj = {};
    if (root === '[]') {
        obj = [];
        obj = obj.concat(internals.parseObject(chain, val, options));
    }
    else {
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        if (!isNaN(index) &&
            root !== cleanRoot &&
            index <= options.arrayLimit) {

            obj = [];
            obj[index] = internals.parseObject(chain, val, options);
        }
        else {
            obj[cleanRoot] = internals.parseObject(chain, val, options);
        }
    }

    return obj;
};


internals.parseKeys = function (key, val, options) {

    if (!key) {
        return;
    }

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Don't allow them to overwrite object prototype properties

    if (Object.prototype.hasOwnProperty(segment[1])) {
        return;
    }

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {

        ++i;
        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
            keys.push(segment[1]);
        }
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return internals.parseObject(keys, val, options);
};


module.exports = function (str, options) {

    if (str === '' ||
        str === null ||
        typeof str === 'undefined') {

        return {};
    }

    options = options || {};
    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;

    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
    var obj = {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var newObj = internals.parseKeys(key, tempObj[key], options);
        obj = Utils.merge(obj, newObj);
    }

    return Utils.compact(obj);
};

},{"./utils":44}],43:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&'
};


internals.stringify = function (obj, prefix) {

    if (Utils.isBuffer(obj)) {
        obj = obj.toString();
    }
    else if (obj instanceof Date) {
        obj = obj.toISOString();
    }
    else if (obj === null) {
        obj = '';
    }

    if (typeof obj === 'string' ||
        typeof obj === 'number' ||
        typeof obj === 'boolean') {

        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
    }

    var values = [];

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']'));
        }
    }

    return values;
};


module.exports = function (obj, options) {

    options = options || {};
    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;

    var keys = [];

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys = keys.concat(internals.stringify(obj[key], key));
        }
    }

    return keys.join(delimiter);
};

},{"./utils":44}],44:[function(require,module,exports){
(function (Buffer){(function (){
// Load modules


// Declare internals

var internals = {};


exports.arrayToObject = function (source) {

    var obj = {};
    for (var i = 0, il = source.length; i < il; ++i) {
        if (typeof source[i] !== 'undefined') {

            obj[i] = source[i];
        }
    }

    return obj;
};


exports.merge = function (target, source) {

    if (!source) {
        return target;
    }

    if (Array.isArray(source)) {
        for (var i = 0, il = source.length; i < il; ++i) {
            if (typeof source[i] !== 'undefined') {
                if (typeof target[i] === 'object') {
                    target[i] = exports.merge(target[i], source[i]);
                }
                else {
                    target[i] = source[i];
                }
            }
        }

        return target;
    }

    if (Array.isArray(target)) {
        if (typeof source !== 'object') {
            target.push(source);
            return target;
        }
        else {
            target = exports.arrayToObject(target);
        }
    }

    var keys = Object.keys(source);
    for (var k = 0, kl = keys.length; k < kl; ++k) {
        var key = keys[k];
        var value = source[key];

        if (value &&
            typeof value === 'object') {

            if (!target[key]) {
                target[key] = value;
            }
            else {
                target[key] = exports.merge(target[key], value);
            }
        }
        else {
            target[key] = value;
        }
    }

    return target;
};


exports.decode = function (str) {

    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};


exports.compact = function (obj, refs) {

    if (typeof obj !== 'object' ||
        obj === null) {

        return obj;
    }

    refs = refs || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0, l = obj.length; i < l; ++i) {
            if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        obj[key] = exports.compact(obj[key], refs);
    }

    return obj;
};


exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};


exports.isBuffer = function (obj) {

    if (typeof Buffer !== 'undefined') {
        return Buffer.isBuffer(obj);
    }
    else {
        return false;
    }
};

}).call(this)}).call(this,require("buffer").Buffer)

},{"buffer":3}],45:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function (require) {

	var makePromise = require('./makePromise');
	var Scheduler = require('./Scheduler');
	var async = require('./async');

	return makePromise({
		scheduler: new Scheduler(async)
	});

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

},{"./Scheduler":47,"./async":48,"./makePromise":49}],46:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {
	/**
	 * Circular queue
	 * @param {number} capacityPow2 power of 2 to which this queue's capacity
	 *  will be set initially. eg when capacityPow2 == 3, queue capacity
	 *  will be 8.
	 * @constructor
	 */
	function Queue(capacityPow2) {
		this.head = this.tail = this.length = 0;
		this.buffer = new Array(1 << capacityPow2);
	}

	Queue.prototype.push = function(x) {
		if(this.length === this.buffer.length) {
			this._ensureCapacity(this.length * 2);
		}

		this.buffer[this.tail] = x;
		this.tail = (this.tail + 1) & (this.buffer.length - 1);
		++this.length;
		return this.length;
	};

	Queue.prototype.shift = function() {
		var x = this.buffer[this.head];
		this.buffer[this.head] = void 0;
		this.head = (this.head + 1) & (this.buffer.length - 1);
		--this.length;
		return x;
	};

	Queue.prototype._ensureCapacity = function(capacity) {
		var head = this.head;
		var buffer = this.buffer;
		var newBuffer = new Array(capacity);
		var i = 0;
		var len;

		if(head === 0) {
			len = this.length;
			for(; i<len; ++i) {
				newBuffer[i] = buffer[i];
			}
		} else {
			capacity = buffer.length;
			len = this.tail;
			for(; head<capacity; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}

			for(head=0; head<len; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}
		}

		this.buffer = newBuffer;
		this.head = 0;
		this.tail = this.length;
	};

	return Queue;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],47:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var Queue = require('./Queue');

	// Credit to Twisol (https://github.com/Twisol) for suggesting
	// this type of extensible queue + trampoline approach for next-tick conflation.

	/**
	 * Async task scheduler
	 * @param {function} async function to schedule a single async function
	 * @constructor
	 */
	function Scheduler(async) {
		this._async = async;
		this._queue = new Queue(15);
		this._afterQueue = new Queue(5);
		this._running = false;

		var self = this;
		this.drain = function() {
			self._drain();
		};
	}

	/**
	 * Enqueue a task
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.enqueue = function(task) {
		this._add(this._queue, task);
	};

	/**
	 * Enqueue a task to run after the main task queue
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.afterQueue = function(task) {
		this._add(this._afterQueue, task);
	};

	/**
	 * Drain the handler queue entirely, and then the after queue
	 */
	Scheduler.prototype._drain = function() {
		runQueue(this._queue);
		this._running = false;
		runQueue(this._afterQueue);
	};

	/**
	 * Add a task to the q, and schedule drain if not already scheduled
	 * @param {Queue} queue
	 * @param {{run:function}} task
	 * @private
	 */
	Scheduler.prototype._add = function(queue, task) {
		queue.push(task);
		if(!this._running) {
			this._running = true;
			this._async(this.drain);
		}
	};

	/**
	 * Run all the tasks in the q
	 * @param queue
	 */
	function runQueue(queue) {
		while(queue.length > 0) {
			queue.shift().run();
		}
	}

	return Scheduler;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"./Queue":46}],48:[function(require,module,exports){
(function (process){(function (){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	// Sniff "best" async scheduling option
	// Prefer process.nextTick or MutationObserver, then check for
	// vertx and finally fall back to setTimeout

	/*jshint maxcomplexity:6*/
	/*global process,document,setTimeout,MutationObserver,WebKitMutationObserver*/
	var nextTick, MutationObs;

	if (typeof process !== 'undefined' && process !== null &&
		typeof process.nextTick === 'function') {
		nextTick = function(f) {
			process.nextTick(f);
		};

	} else if (MutationObs =
		(typeof MutationObserver === 'function' && MutationObserver) ||
		(typeof WebKitMutationObserver === 'function' && WebKitMutationObserver)) {
		nextTick = (function (document, MutationObserver) {
			var scheduled;
			var el = document.createElement('div');
			var o = new MutationObserver(run);
			o.observe(el, { attributes: true });

			function run() {
				var f = scheduled;
				scheduled = void 0;
				f();
			}

			return function (f) {
				scheduled = f;
				el.setAttribute('class', 'x');
			};
		}(document, MutationObs));

	} else {
		nextTick = (function(cjsRequire) {
			var vertx;
			try {
				// vert.x 1.x || 2.x
				vertx = cjsRequire('vertx');
			} catch (ignore) {}

			if (vertx) {
				if (typeof vertx.runOnLoop === 'function') {
					return vertx.runOnLoop;
				}
				if (typeof vertx.runOnContext === 'function') {
					return vertx.runOnContext;
				}
			}

			// capture setTimeout to avoid being caught by fake timers
			// used in time based tests
			var capturedSetTimeout = setTimeout;
			return function (t) {
				capturedSetTimeout(t, 0);
			};
		}(require));
	}

	return nextTick;
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

}).call(this)}).call(this,require('_process'))

},{"_process":6}],49:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function makePromise(environment) {

		var tasks = environment.scheduler;

		var objectCreate = Object.create ||
			function(proto) {
				function Child() {}
				Child.prototype = proto;
				return new Child();
			};

		/**
		 * Create a promise whose fate is determined by resolver
		 * @constructor
		 * @returns {Promise} promise
		 * @name Promise
		 */
		function Promise(resolver, handler) {
			this._handler = resolver === Handler ? handler : init(resolver);
		}

		/**
		 * Run the supplied resolver
		 * @param resolver
		 * @returns {Pending}
		 */
		function init(resolver) {
			var handler = new Pending();

			try {
				resolver(promiseResolve, promiseReject, promiseNotify);
			} catch (e) {
				promiseReject(e);
			}

			return handler;

			/**
			 * Transition from pre-resolution state to post-resolution state, notifying
			 * all listeners of the ultimate fulfillment or rejection
			 * @param {*} x resolution value
			 */
			function promiseResolve (x) {
				handler.resolve(x);
			}
			/**
			 * Reject this promise with reason, which will be used verbatim
			 * @param {Error|*} reason rejection reason, strongly suggested
			 *   to be an Error type
			 */
			function promiseReject (reason) {
				handler.reject(reason);
			}

			/**
			 * Issue a progress event, notifying all progress listeners
			 * @param {*} x progress event payload to pass to all listeners
			 */
			function promiseNotify (x) {
				handler.notify(x);
			}
		}

		// Creation

		Promise.resolve = resolve;
		Promise.reject = reject;
		Promise.never = never;

		Promise._defer = defer;
		Promise._handler = getHandler;

		/**
		 * Returns a trusted promise. If x is already a trusted promise, it is
		 * returned, otherwise returns a new trusted Promise which follows x.
		 * @param  {*} x
		 * @return {Promise} promise
		 */
		function resolve(x) {
			return isPromise(x) ? x
				: new Promise(Handler, new Async(getHandler(x)));
		}

		/**
		 * Return a reject promise with x as its reason (x is used verbatim)
		 * @param {*} x
		 * @returns {Promise} rejected promise
		 */
		function reject(x) {
			return new Promise(Handler, new Async(new Rejected(x)));
		}

		/**
		 * Return a promise that remains pending forever
		 * @returns {Promise} forever-pending promise.
		 */
		function never() {
			return foreverPendingPromise; // Should be frozen
		}

		/**
		 * Creates an internal {promise, resolver} pair
		 * @private
		 * @returns {Promise}
		 */
		function defer() {
			return new Promise(Handler, new Pending());
		}

		// Transformation and flow control

		/**
		 * Transform this promise's fulfillment value, returning a new Promise
		 * for the transformed result.  If the promise cannot be fulfilled, onRejected
		 * is called with the reason.  onProgress *may* be called with updates toward
		 * this promise's fulfillment.
		 * @param {function=} onFulfilled fulfillment handler
		 * @param {function=} onRejected rejection handler
		 * @deprecated @param {function=} onProgress progress handler
		 * @return {Promise} new promise
		 */
		Promise.prototype.then = function(onFulfilled, onRejected) {
			var parent = this._handler;
			var state = parent.join().state();

			if ((typeof onFulfilled !== 'function' && state > 0) ||
				(typeof onRejected !== 'function' && state < 0)) {
				// Short circuit: value will not change, simply share handler
				return new this.constructor(Handler, parent);
			}

			var p = this._beget();
			var child = p._handler;

			parent.chain(child, parent.receiver, onFulfilled, onRejected,
					arguments.length > 2 ? arguments[2] : void 0);

			return p;
		};

		/**
		 * If this promise cannot be fulfilled due to an error, call onRejected to
		 * handle the error. Shortcut for .then(undefined, onRejected)
		 * @param {function?} onRejected
		 * @return {Promise}
		 */
		Promise.prototype['catch'] = function(onRejected) {
			return this.then(void 0, onRejected);
		};

		/**
		 * Creates a new, pending promise of the same type as this promise
		 * @private
		 * @returns {Promise}
		 */
		Promise.prototype._beget = function() {
			var parent = this._handler;
			var child = new Pending(parent.receiver, parent.join().context);
			return new this.constructor(Handler, child);
		};

		// Array combinators

		Promise.all = all;
		Promise.race = race;

		/**
		 * Return a promise that will fulfill when all promises in the
		 * input array have fulfilled, or will reject when one of the
		 * promises rejects.
		 * @param {array} promises array of promises
		 * @returns {Promise} promise for array of fulfillment values
		 */
		function all(promises) {
			/*jshint maxcomplexity:8*/
			var resolver = new Pending();
			var pending = promises.length >>> 0;
			var results = new Array(pending);

			var i, h, x, s;
			for (i = 0; i < promises.length; ++i) {
				x = promises[i];

				if (x === void 0 && !(i in promises)) {
					--pending;
					continue;
				}

				if (maybeThenable(x)) {
					h = getHandlerMaybeThenable(x);

					s = h.state();
					if (s === 0) {
						h.fold(settleAt, i, results, resolver);
					} else if (s > 0) {
						results[i] = h.value;
						--pending;
					} else {
						unreportRemaining(promises, i+1, h);
						resolver.become(h);
						break;
					}

				} else {
					results[i] = x;
					--pending;
				}
			}

			if(pending === 0) {
				resolver.become(new Fulfilled(results));
			}

			return new Promise(Handler, resolver);

			function settleAt(i, x, resolver) {
				/*jshint validthis:true*/
				this[i] = x;
				if(--pending === 0) {
					resolver.become(new Fulfilled(this));
				}
			}
		}

		function unreportRemaining(promises, start, rejectedHandler) {
			var i, h, x;
			for(i=start; i<promises.length; ++i) {
				x = promises[i];
				if(maybeThenable(x)) {
					h = getHandlerMaybeThenable(x);

					if(h !== rejectedHandler) {
						h.visit(h, void 0, h._unreport);
					}
				}
			}
		}

		/**
		 * Fulfill-reject competitive race. Return a promise that will settle
		 * to the same state as the earliest input promise to settle.
		 *
		 * WARNING: The ES6 Promise spec requires that race()ing an empty array
		 * must return a promise that is pending forever.  This implementation
		 * returns a singleton forever-pending promise, the same singleton that is
		 * returned by Promise.never(), thus can be checked with ===
		 *
		 * @param {array} promises array of promises to race
		 * @returns {Promise} if input is non-empty, a promise that will settle
		 * to the same outcome as the earliest input promise to settle. if empty
		 * is empty, returns a promise that will never settle.
		 */
		function race(promises) {
			// Sigh, race([]) is untestable unless we return *something*
			// that is recognizable without calling .then() on it.
			if(Object(promises) === promises && promises.length === 0) {
				return never();
			}

			var h = new Pending();
			var i, x;
			for(i=0; i<promises.length; ++i) {
				x = promises[i];
				if (x !== void 0 && i in promises) {
					getHandler(x).visit(h, h.resolve, h.reject);
				}
			}
			return new Promise(Handler, h);
		}

		// Promise internals
		// Below this, everything is @private

		/**
		 * Get an appropriate handler for x, without checking for cycles
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandler(x) {
			if(isPromise(x)) {
				return x._handler.join();
			}
			return maybeThenable(x) ? getHandlerUntrusted(x) : new Fulfilled(x);
		}

		/**
		 * Get a handler for thenable x.
		 * NOTE: You must only call this if maybeThenable(x) == true
		 * @param {object|function|Promise} x
		 * @returns {object} handler
		 */
		function getHandlerMaybeThenable(x) {
			return isPromise(x) ? x._handler.join() : getHandlerUntrusted(x);
		}

		/**
		 * Get a handler for potentially untrusted thenable x
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandlerUntrusted(x) {
			try {
				var untrustedThen = x.then;
				return typeof untrustedThen === 'function'
					? new Thenable(untrustedThen, x)
					: new Fulfilled(x);
			} catch(e) {
				return new Rejected(e);
			}
		}

		/**
		 * Handler for a promise that is pending forever
		 * @constructor
		 */
		function Handler() {}

		Handler.prototype.when
			= Handler.prototype.become
			= Handler.prototype.notify
			= Handler.prototype.fail
			= Handler.prototype._unreport
			= Handler.prototype._report
			= noop;

		Handler.prototype._state = 0;

		Handler.prototype.state = function() {
			return this._state;
		};

		/**
		 * Recursively collapse handler chain to find the handler
		 * nearest to the fully resolved value.
		 * @returns {object} handler nearest the fully resolved value
		 */
		Handler.prototype.join = function() {
			var h = this;
			while(h.handler !== void 0) {
				h = h.handler;
			}
			return h;
		};

		Handler.prototype.chain = function(to, receiver, fulfilled, rejected, progress) {
			this.when({
				resolver: to,
				receiver: receiver,
				fulfilled: fulfilled,
				rejected: rejected,
				progress: progress
			});
		};

		Handler.prototype.visit = function(receiver, fulfilled, rejected, progress) {
			this.chain(failIfRejected, receiver, fulfilled, rejected, progress);
		};

		Handler.prototype.fold = function(f, z, c, to) {
			this.visit(to, function(x) {
				f.call(c, z, x, this);
			}, to.reject, to.notify);
		};

		/**
		 * Handler that invokes fail() on any handler it becomes
		 * @constructor
		 */
		function FailIfRejected() {}

		inherit(Handler, FailIfRejected);

		FailIfRejected.prototype.become = function(h) {
			h.fail();
		};

		var failIfRejected = new FailIfRejected();

		/**
		 * Handler that manages a queue of consumers waiting on a pending promise
		 * @constructor
		 */
		function Pending(receiver, inheritedContext) {
			Promise.createContext(this, inheritedContext);

			this.consumers = void 0;
			this.receiver = receiver;
			this.handler = void 0;
			this.resolved = false;
		}

		inherit(Handler, Pending);

		Pending.prototype._state = 0;

		Pending.prototype.resolve = function(x) {
			this.become(getHandler(x));
		};

		Pending.prototype.reject = function(x) {
			if(this.resolved) {
				return;
			}

			this.become(new Rejected(x));
		};

		Pending.prototype.join = function() {
			if (!this.resolved) {
				return this;
			}

			var h = this;

			while (h.handler !== void 0) {
				h = h.handler;
				if (h === this) {
					return this.handler = cycle();
				}
			}

			return h;
		};

		Pending.prototype.run = function() {
			var q = this.consumers;
			var handler = this.join();
			this.consumers = void 0;

			for (var i = 0; i < q.length; ++i) {
				handler.when(q[i]);
			}
		};

		Pending.prototype.become = function(handler) {
			if(this.resolved) {
				return;
			}

			this.resolved = true;
			this.handler = handler;
			if(this.consumers !== void 0) {
				tasks.enqueue(this);
			}

			if(this.context !== void 0) {
				handler._report(this.context);
			}
		};

		Pending.prototype.when = function(continuation) {
			if(this.resolved) {
				tasks.enqueue(new ContinuationTask(continuation, this.handler));
			} else {
				if(this.consumers === void 0) {
					this.consumers = [continuation];
				} else {
					this.consumers.push(continuation);
				}
			}
		};

		Pending.prototype.notify = function(x) {
			if(!this.resolved) {
				tasks.enqueue(new ProgressTask(x, this));
			}
		};

		Pending.prototype.fail = function(context) {
			var c = typeof context === 'undefined' ? this.context : context;
			this.resolved && this.handler.join().fail(c);
		};

		Pending.prototype._report = function(context) {
			this.resolved && this.handler.join()._report(context);
		};

		Pending.prototype._unreport = function() {
			this.resolved && this.handler.join()._unreport();
		};

		/**
		 * Wrap another handler and force it into a future stack
		 * @param {object} handler
		 * @constructor
		 */
		function Async(handler) {
			this.handler = handler;
		}

		inherit(Handler, Async);

		Async.prototype.when = function(continuation) {
			tasks.enqueue(new ContinuationTask(continuation, this));
		};

		Async.prototype._report = function(context) {
			this.join()._report(context);
		};

		Async.prototype._unreport = function() {
			this.join()._unreport();
		};

		/**
		 * Handler that wraps an untrusted thenable and assimilates it in a future stack
		 * @param {function} then
		 * @param {{then: function}} thenable
		 * @constructor
		 */
		function Thenable(then, thenable) {
			Pending.call(this);
			tasks.enqueue(new AssimilateTask(then, thenable, this));
		}

		inherit(Pending, Thenable);

		/**
		 * Handler for a fulfilled promise
		 * @param {*} x fulfillment value
		 * @constructor
		 */
		function Fulfilled(x) {
			Promise.createContext(this);
			this.value = x;
		}

		inherit(Handler, Fulfilled);

		Fulfilled.prototype._state = 1;

		Fulfilled.prototype.fold = function(f, z, c, to) {
			runContinuation3(f, z, this, c, to);
		};

		Fulfilled.prototype.when = function(cont) {
			runContinuation1(cont.fulfilled, this, cont.receiver, cont.resolver);
		};

		var errorId = 0;

		/**
		 * Handler for a rejected promise
		 * @param {*} x rejection reason
		 * @constructor
		 */
		function Rejected(x) {
			Promise.createContext(this);

			this.id = ++errorId;
			this.value = x;
			this.handled = false;
			this.reported = false;

			this._report();
		}

		inherit(Handler, Rejected);

		Rejected.prototype._state = -1;

		Rejected.prototype.fold = function(f, z, c, to) {
			to.become(this);
		};

		Rejected.prototype.when = function(cont) {
			if(typeof cont.rejected === 'function') {
				this._unreport();
			}
			runContinuation1(cont.rejected, this, cont.receiver, cont.resolver);
		};

		Rejected.prototype._report = function(context) {
			tasks.afterQueue(new ReportTask(this, context));
		};

		Rejected.prototype._unreport = function() {
			this.handled = true;
			tasks.afterQueue(new UnreportTask(this));
		};

		Rejected.prototype.fail = function(context) {
			Promise.onFatalRejection(this, context === void 0 ? this.context : context);
		};

		function ReportTask(rejection, context) {
			this.rejection = rejection;
			this.context = context;
		}

		ReportTask.prototype.run = function() {
			if(!this.rejection.handled) {
				this.rejection.reported = true;
				Promise.onPotentiallyUnhandledRejection(this.rejection, this.context);
			}
		};

		function UnreportTask(rejection) {
			this.rejection = rejection;
		}

		UnreportTask.prototype.run = function() {
			if(this.rejection.reported) {
				Promise.onPotentiallyUnhandledRejectionHandled(this.rejection);
			}
		};

		// Unhandled rejection hooks
		// By default, everything is a noop

		// TODO: Better names: "annotate"?
		Promise.createContext
			= Promise.enterContext
			= Promise.exitContext
			= Promise.onPotentiallyUnhandledRejection
			= Promise.onPotentiallyUnhandledRejectionHandled
			= Promise.onFatalRejection
			= noop;

		// Errors and singletons

		var foreverPendingHandler = new Handler();
		var foreverPendingPromise = new Promise(Handler, foreverPendingHandler);

		function cycle() {
			return new Rejected(new TypeError('Promise cycle'));
		}

		// Task runners

		/**
		 * Run a single consumer
		 * @constructor
		 */
		function ContinuationTask(continuation, handler) {
			this.continuation = continuation;
			this.handler = handler;
		}

		ContinuationTask.prototype.run = function() {
			this.handler.join().when(this.continuation);
		};

		/**
		 * Run a queue of progress handlers
		 * @constructor
		 */
		function ProgressTask(value, handler) {
			this.handler = handler;
			this.value = value;
		}

		ProgressTask.prototype.run = function() {
			var q = this.handler.consumers;
			if(q === void 0) {
				return;
			}

			for (var c, i = 0; i < q.length; ++i) {
				c = q[i];
				runNotify(c.progress, this.value, this.handler, c.receiver, c.resolver);
			}
		};

		/**
		 * Assimilate a thenable, sending it's value to resolver
		 * @param {function} then
		 * @param {object|function} thenable
		 * @param {object} resolver
		 * @constructor
		 */
		function AssimilateTask(then, thenable, resolver) {
			this._then = then;
			this.thenable = thenable;
			this.resolver = resolver;
		}

		AssimilateTask.prototype.run = function() {
			var h = this.resolver;
			tryAssimilate(this._then, this.thenable, _resolve, _reject, _notify);

			function _resolve(x) { h.resolve(x); }
			function _reject(x)  { h.reject(x); }
			function _notify(x)  { h.notify(x); }
		};

		function tryAssimilate(then, thenable, resolve, reject, notify) {
			try {
				then.call(thenable, resolve, reject, notify);
			} catch (e) {
				reject(e);
			}
		}

		// Other helpers

		/**
		 * @param {*} x
		 * @returns {boolean} true iff x is a trusted Promise
		 */
		function isPromise(x) {
			return x instanceof Promise;
		}

		/**
		 * Test just enough to rule out primitives, in order to take faster
		 * paths in some code
		 * @param {*} x
		 * @returns {boolean} false iff x is guaranteed *not* to be a thenable
		 */
		function maybeThenable(x) {
			return (typeof x === 'object' || typeof x === 'function') && x !== null;
		}

		function runContinuation1(f, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject(f, h.value, receiver, next);
			Promise.exitContext();
		}

		function runContinuation3(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject3(f, x, h.value, receiver, next);
			Promise.exitContext();
		}

		function runNotify(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.notify(x);
			}

			Promise.enterContext(h);
			tryCatchReturn(f, x, receiver, next);
			Promise.exitContext();
		}

		/**
		 * Return f.call(thisArg, x), or if it throws return a rejected promise for
		 * the thrown exception
		 */
		function tryCatchReject(f, x, thisArg, next) {
			try {
				next.become(getHandler(f.call(thisArg, x)));
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * Same as above, but includes the extra argument parameter.
		 */
		function tryCatchReject3(f, x, y, thisArg, next) {
			try {
				f.call(thisArg, x, y, next);
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * Return f.call(thisArg, x), or if it throws, *return* the exception
		 */
		function tryCatchReturn(f, x, thisArg, next) {
			try {
				next.notify(f.call(thisArg, x));
			} catch(e) {
				next.notify(e);
			}
		}

		function inherit(Parent, Child) {
			Child.prototype = objectCreate(Parent.prototype);
			Child.prototype.constructor = Child;
		}

		function noop() {}

		return Promise;
	};
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],50:[function(require,module,exports){
(function (process){(function (){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CSSCore
 * @typechecks
 */

var invariant = require("./invariant");

/**
 * The CSSCore module specifies the API (and implements most of the methods)
 * that should be used when dealing with the display of elements (via their
 * CSS classes and visibility on screen. It is an API focused on mutating the
 * display and not reading it as no logical state should be encoded in the
 * display of elements.
 */

var CSSCore = {

  /**
   * Adds the class passed in to the element if it doesn't already have it.
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @return {DOMElement} the element passed in
   */
  addClass: function(element, className) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !/\s/.test(className),
      'CSSCore.addClass takes only a single class name. "%s" contains ' +
      'multiple classes.', className
    ) : invariant(!/\s/.test(className)));

    if (className) {
      if (element.classList) {
        element.classList.add(className);
      } else if (!CSSCore.hasClass(element, className)) {
        element.className = element.className + ' ' + className;
      }
    }
    return element;
  },

  /**
   * Removes the class passed in from the element
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @return {DOMElement} the element passed in
   */
  removeClass: function(element, className) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !/\s/.test(className),
      'CSSCore.removeClass takes only a single class name. "%s" contains ' +
      'multiple classes.', className
    ) : invariant(!/\s/.test(className)));

    if (className) {
      if (element.classList) {
        element.classList.remove(className);
      } else if (CSSCore.hasClass(element, className)) {
        element.className = element.className
          .replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g'), '$1')
          .replace(/\s+/g, ' ') // multiple spaces to one
          .replace(/^\s*|\s*$/g, ''); // trim the ends
      }
    }
    return element;
  },

  /**
   * Helper to add or remove a class from an element based on a condition.
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @param {*} bool condition to whether to add or remove the class
   * @return {DOMElement} the element passed in
   */
  conditionClass: function(element, className, bool) {
    return (bool ? CSSCore.addClass : CSSCore.removeClass)(element, className);
  },

  /**
   * Tests whether the element has the class specified.
   *
   * @param {DOMNode|DOMWindow} element the element to set the class on
   * @param {string} className the CSS className
   * @return {boolean} true if the element has the class, false if not
   */
  hasClass: function(element, className) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !/\s/.test(className),
      'CSS.hasClass takes only a single class name.'
    ) : invariant(!/\s/.test(className)));
    if (element.classList) {
      return !!className && element.classList.contains(className);
    }
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
  }

};

module.exports = CSSCore;

}).call(this)}).call(this,require('_process'))

},{"./invariant":56,"_process":6}],51:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ExecutionEnvironment
 */

/*jslint evil: true */

"use strict";

var canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  canUseEventListeners:
    canUseDOM && !!(window.addEventListener || window.attachEvent),

  canUseViewport: canUseDOM && !!window.screen,

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;

},{}],52:[function(require,module,exports){
/**
 * Copyright 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
};

module.exports = assign;

},{}],53:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactTransitionEvents
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

/**
 * EVENT_NAME_MAP is used to determine which event fired when a
 * transition/animation ends, based on the style property used to
 * define that event.
 */
var EVENT_NAME_MAP = {
  transitionend: {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'mozTransitionEnd',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd'
  },

  animationend: {
    'animation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'mozAnimationEnd',
    'OAnimation': 'oAnimationEnd',
    'msAnimation': 'MSAnimationEnd'
  }
};

var endEvents = [];

function detectEvents() {
  var testEl = document.createElement('div');
  var style = testEl.style;

  // On some platforms, in particular some releases of Android 4.x,
  // the un-prefixed "animation" and "transition" properties are defined on the
  // style object but the events that fire will still be prefixed, so we need
  // to check if the un-prefixed events are useable, and if not remove them
  // from the map
  if (!('AnimationEvent' in window)) {
    delete EVENT_NAME_MAP.animationend.animation;
  }

  if (!('TransitionEvent' in window)) {
    delete EVENT_NAME_MAP.transitionend.transition;
  }

  for (var baseEventName in EVENT_NAME_MAP) {
    var baseEvents = EVENT_NAME_MAP[baseEventName];
    for (var styleName in baseEvents) {
      if (styleName in style) {
        endEvents.push(baseEvents[styleName]);
        break;
      }
    }
  }
}

if (ExecutionEnvironment.canUseDOM) {
  detectEvents();
}

// We use the raw {add|remove}EventListener() call because EventListener
// does not know how to remove event listeners and we really should
// clean up. Also, these events are not triggered in older browsers
// so we should be A-OK here.

function addEventListener(node, eventName, eventListener) {
  node.addEventListener(eventName, eventListener, false);
}

function removeEventListener(node, eventName, eventListener) {
  node.removeEventListener(eventName, eventListener, false);
}

var ReactTransitionEvents = {
  addEndEventListener: function(node, eventListener) {
    if (endEvents.length === 0) {
      // If CSS transitions are not supported, trigger an "end animation"
      // event immediately.
      window.setTimeout(eventListener, 0);
      return;
    }
    endEvents.forEach(function(endEvent) {
      addEventListener(node, endEvent, eventListener);
    });
  },

  removeEndEventListener: function(node, eventListener) {
    if (endEvents.length === 0) {
      return;
    }
    endEvents.forEach(function(endEvent) {
      removeEventListener(node, endEvent, eventListener);
    });
  }
};

module.exports = ReactTransitionEvents;

},{"./ExecutionEnvironment":51}],54:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule cx
 */

/**
 * This function is used to mark string literals representing CSS class names
 * so that they can be transformed statically. This allows for modularization
 * and minification of CSS class names.
 *
 * In static_upstream, this function is actually implemented, but it should
 * eventually be replaced with something more descriptive, and the transform
 * that is used in the main stack should be ported for use elsewhere.
 *
 * @param string|object className to modularize, or an object of key/values.
 *                      In the object case, the values are conditions that
 *                      determine if the className keys should be included.
 * @param [string ...]  Variable list of classNames in the string case.
 * @return string       Renderable space-separated CSS className.
 */
function cx(classNames) {
  if (typeof classNames == 'object') {
    return Object.keys(classNames).filter(function(className) {
      return classNames[className];
    }).join(' ');
  } else {
    return Array.prototype.join.call(arguments, ' ');
  }
}

module.exports = cx;

},{}],55:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyFunction
 */

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function() { return this; };
emptyFunction.thatReturnsArgument = function(arg) { return arg; };

module.exports = emptyFunction;

},{}],56:[function(require,module,exports){
(function (process){(function (){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this)}).call(this,require('_process'))

},{"_process":6}],57:[function(require,module,exports){
(function (process){(function (){
/**
 * Copyright 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule warning
 */

"use strict";

var emptyFunction = require("./emptyFunction");

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("production" !== process.env.NODE_ENV) {
  warning = function(condition, format ) {for (var args=[],$__0=2,$__1=arguments.length;$__0<$__1;$__0++) args.push(arguments[$__0]);
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (!condition) {
      var argIndex = 0;
      console.warn('Warning: ' + format.replace(/%s/g, function()  {return args[argIndex++];}));
    }
  };
}

module.exports = warning;

}).call(this)}).call(this,require('_process'))

},{"./emptyFunction":55,"_process":6}],58:[function(require,module,exports){
module.exports={
  "name": "immutable",
  "version": "4.0.0-rc.12",
  "description": "Immutable Data Collections",
  "license": "MIT",
  "homepage": "https://immutable-js.com",
  "author": {
    "name": "Lee Byron",
    "url": "https://github.com/leebyron"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/immutable-js/immutable-js.git"
  },
  "bugs": {
    "url": "https://github.com/immutable-js/immutable-js/issues"
  },
  "main": "dist/immutable.js",
  "module": "dist/immutable.es.js",
  "typings": "dist/immutable-nonambient.d.ts",
  "typescript": {
    "definition": "dist/immutable.d.ts"
  },
  "scripts": {
    "build": "run-s build:*",
    "build:dist": "run-s clean:dist bundle:dist bundle:es copy:dist stats:dist prepare:dist",
    "build:pages": "gulp --gulpfile ./resources/gulpfile.js default",
    "stats:dist": "node ./resources/dist-stats.js",
    "clean:dist": "rimraf dist",
    "bundle:dist": "rollup -c ./resources/rollup-config.js",
    "bundle:es": "rollup -c ./resources/rollup-config-es.js",
    "copy:dist": "node ./resources/copy-dist-typedefs.js",
    "prepare:dist": "./resources/prepare-dist.sh",
    "format": "npm run lint:format -- --write",
    "lint": "run-s lint:*",
    "lint:ts": "tslint \"__tests__/**/*.ts\"",
    "lint:js": "eslint \"{__tests__,src,pages/src,pages/lib}/**/*.js\"",
    "lint:format": "prettier --check \"{__tests__,src,pages/src,pages/lib,perf,resources}/**/*{\\.js,\\.ts}\"",
    "testonly": "./resources/jest",
    "test": "run-s format build lint testonly test:types",
    "check:git-clean": "./resources/check-changes",
    "test:types": "run-s test:types:*",
    "test:types:ts": "tsc ./type-definitions/Immutable.d.ts --lib es2015 && dtslint type-definitions/ts-tests",
    "test:types:flow": "flow check type-definitions/tests --include-warnings",
    "perf": "node ./resources/bench.js",
    "start": "gulp --gulpfile ./resources/gulpfile.js dev"
  },
  "prettier": {
    "singleQuote": true,
    "trailingComma": "es5",
    "semi": true,
    "arrowParens": "avoid"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "ts"
    ],
    "transform": {
      "^.+\\.ts$": "<rootDir>/resources/jestPreprocessor.js"
    },
    "testRegex": "/__tests__/.*\\.(ts|js)$",
    "unmockedModulePathPatterns": [
      "./node_modules/react"
    ]
  },
  "devDependencies": {
    "benchmark": "2.1.4",
    "browser-sync": "^2.26.12",
    "browserify": "16.5.2",
    "colors": "1.4.0",
    "del": "6.0.0",
    "dtslint": "4.1.0",
    "eslint": "7.11.0",
    "eslint-config-airbnb": "18.2.0",
    "eslint-config-prettier": "6.12.0",
    "eslint-plugin-import": "2.22.1",
    "eslint-plugin-jsx-a11y": "6.3.1",
    "eslint-plugin-prettier": "3.1.4",
    "eslint-plugin-react": "7.21.4",
    "flow-bin": "0.85.0",
    "gulp": "4.0.2",
    "gulp-concat": "2.6.1",
    "gulp-filter": "6.0.0",
    "gulp-header": "2.0.9",
    "gulp-less": "4.0.1",
    "gulp-size": "3.0.0",
    "gulp-sourcemaps": "2.6.5",
    "gulp-uglify": "3.0.2",
    "gulp-util": "3.0.8",
    "jasmine-check": "0.1.5",
    "jest": "26.5.2",
    "marked": "1.2.0",
    "microtime": "3.0.0",
    "mkdirp": "1.0.4",
    "npm-run-all": "4.1.5",
    "prettier": "^2.3.1",
    "react": "^0.12.2",
    "react-router": "^0.11.6",
    "react-tools": "0.13.3",
    "rimraf": "3.0.2",
    "rollup": "2.29.0",
    "rollup-plugin-buble": "0.19.2",
    "rollup-plugin-commonjs": "9.1.3",
    "rollup-plugin-json": "3.0.0",
    "rollup-plugin-strip-banner": "2.0.0",
    "through2": "4.0.2",
    "transducers-js": "^0.4.174",
    "tslint": "6.1.3",
    "typescript": "4.3.4",
    "uglify-js": "3.11.1",
    "uglify-save-license": "0.4.1",
    "vinyl-buffer": "1.0.1",
    "vinyl-source-stream": "2.0.0"
  },
  "files": [
    "dist",
    "contrib",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "immutable",
    "persistent",
    "lazy",
    "data",
    "datastructure",
    "functional",
    "collection",
    "stateless",
    "sequence",
    "iteration"
  ]
}

},{}],59:[function(require,module,exports){
module.exports={"Immutable":{"doc":{"synopsis":"Immutable data encourages pure functions (data-in, data-out) and lends itself\nto much simpler application development and enabling techniques from\nfunctional programming such as lazy evaluation.","description":"While designed to bring these powerful functional concepts to JavaScript, it\npresents an Object-Oriented API familiar to Javascript engineers and closely\nmirroring that of Array, Map, and Set. It is easy and efficient to convert to\nand from plain Javascript types.\n\n## How to read these docs\n\nIn order to better explain what kinds of values the Immutable.js API expects\nand produces, this documentation is presented in a statically typed dialect of\nJavaScript (like [Flow][] or [TypeScript][]). You *don't need* to use these\ntype checking tools in order to use Immutable.js, however becoming familiar\nwith their syntax will help you get a deeper understanding of this API.\n\n**A few examples and how to read them.**\n\nAll methods describe the kinds of data they accept and the kinds of data\nthey return. For example a function which accepts two numbers and returns\na number would look like this:\n\n```js\nsum(first: number, second: number): number\n```\n\nSometimes, methods can accept different kinds of data or return different\nkinds of data, and this is described with a *type variable*, which is\ntypically in all-caps. For example, a function which always returns the same\nkind of data it was provided would look like this:\n\n```js\nidentity<T>(value: T): T\n```\n\nType variables are defined with classes and referred to in methods. For\nexample, a class that holds onto a value for you might look like this:\n\n```js\nclass Box<T> {\n  constructor(value: T)\n  getValue(): T\n}\n```\n\nIn order to manipulate Immutable data, methods that we're used to affecting\na Collection instead return a new Collection of the same type. The type\n`this` refers to the same kind of class. For example, a List which returns\nnew Lists when you `push` a value onto it might look like:\n\n```js\nclass List<T> {\n  push(value: T): this\n}\n```\n\nMany methods in Immutable.js accept values which implement the JavaScript\n[Iterable][] protocol, and might appear like `Iterable<string>` for something\nwhich represents sequence of strings. Typically in JavaScript we use plain\nArrays (`[]`) when an Iterable is expected, but also all of the Immutable.js\ncollections are iterable themselves!\n\nFor example, to get a value deep within a structure of data, we might use\n`getIn` which expects an `Iterable` path:\n\n```\ngetIn(path: Iterable<string | number>): unknown\n```\n\nTo use this method, we could pass an array: `data.getIn([ \"key\", 2 ])`.\n\n\nNote: All examples are presented in the modern [ES2015][] version of\nJavaScript. Use tools like Babel to support older browsers.\n\nFor example:\n\n```js\n// ES2015\nconst mappedFoo = foo.map(x => x * x);\n// ES5\nvar mappedFoo = foo.map(function (x) { return x * x; });\n```\n\n[ES2015]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla\n[TypeScript]: https://www.typescriptlang.org/\n[Flow]: https://flowtype.org/\n[Iterable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols","notes":[]},"module":{"List":{"doc":{"synopsis":"Lists are ordered indexed dense collections, much like a JavaScript\nArray.","description":"Lists are immutable and fully persistent with O(log32 N) gets and sets,\nand O(1) push and pop.\n\nLists implement Deque, with efficient addition and removal from both the\nend (`push`, `pop`) and beginning (`unshift`, `shift`).\n\nUnlike a JavaScript Array, there is no distinction between an\n\"unset\" index and an index set to `undefined`. `List#forEach` visits all\nindices from 0 to size, regardless of whether they were explicitly defined.","notes":[]},"module":{"isList":{"call":{"doc":{"synopsis":"True if the provided value is a List","description":"<!-- runkit:activate -->\n```js\nconst { List } = require('immutable');\nList.isList([]); // false\nList.isList(List()); // true\n```","notes":[]},"signatures":[{"params":[{"name":"maybeList","type":{"k":17}}],"type":{"k":1},"line":120}]}},"of":{"call":{"doc":{"synopsis":"Creates a new List containing `values`.","description":"<!-- runkit:activate -->\n```js\nconst { List } = require('immutable');\nList.of(1, 2, 3, 4)\n// List [ 1, 2, 3, 4 ]\n```\n\nNote: Values are not altered or converted in any way.\n\n<!-- runkit:activate -->\n```js\nconst { List } = require('immutable');\nList.of({x:1}, 2, [3], 4)\n// List [ { x: 1 }, 2, [ 3 ], 4 ]\n```","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":141}]}}},"call":{"doc":{"synopsis":"Create a new immutable List containing the values of the provided\ncollection-like.","description":"Note: `List` is a factory function and not a class, and does not use the\n`new` keyword during construction.\n\n<!-- runkit:activate -->\n```js\nconst { List, Set } = require('immutable')\n\nconst emptyList = List()\n// List []\n\nconst plainArray = [ 1, 2, 3, 4 ]\nconst listFromPlainArray = List(plainArray)\n// List [ 1, 2, 3, 4 ]\n\nconst plainSet = Set([ 1, 2, 3, 4 ])\nconst listFromPlainSet = List(plainSet)\n// List [ 1, 2, 3, 4 ]\n\nconst arrayIterator = plainArray[Symbol.iterator]()\nconst listFromCollectionArray = List(arrayIterator)\n// List [ 1, 2, 3, 4 ]\n\nlistFromPlainArray.equals(listFromCollectionArray) // true\nlistFromPlainSet.equals(listFromCollectionArray) // true\nlistFromPlainSet.equals(listFromPlainArray) // true\n```","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":175},{"typeParams":["T"],"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":176},{"type":{"k":9,"name":"List","args":[{"k":17}]},"line":177}]},"interface":{"line":179,"typeParams":["T"],"extends":[{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"T"}]}],"groups":[{"members":{"#size":{"line":184}}},{"title":"Persistent changes","members":{"#set":{"doc":{"synopsis":"Returns a new List which includes `value` at `index`. If `index` already\nexists in this List, it will be replaced.","description":"`index` may be a negative number, which indexes back from the end of the\nList. `v.set(-1, \"value\")` sets the last item in the List.\n\nIf `index` larger than `size`, the returned List's `size` will be large\nenough to include the `index`.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nconst originalList = List([ 0 ]);\n// List [ 0 ]\noriginalList.set(1, 1);\n// List [ 0, 1 ]\noriginalList.set(0, 'overwritten');\n// List [ \"overwritten\" ]\noriginalList.set(2, 2);\n// List [ 0, undefined, 2 ]\n\nList().set(50000, 'value').size;\n// 50001\n```\n\nNote: `set` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"index","type":{"k":2}},{"name":"value","type":{"k":8,"param":"T"}}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":217}]},"#delete":{"doc":{"synopsis":"Returns a new List which excludes this `index` and with a size 1 less\nthan this List. Values at indices above `index` are shifted down by 1 to\nfill the position.","description":"This is synonymous with `list.splice(index, 1)`.\n\n`index` may be a negative number, which indexes back from the end of the\nList. `v.delete(-1)` deletes the last item in the List.\n\nNote: `delete` cannot be safely used in IE8\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nList([ 0, 1, 2, 3, 4 ]).delete(0);\n// List [ 1, 2, 3, 4 ]\n```\n\nSince `delete()` re-indexes values, it produces a complete copy, which\nhas `O(N)` complexity.\n\nNote: `delete` *cannot* be used in `withMutations`.\n","notes":[{"name":"alias","body":"remove"}]},"signatures":[{"params":[{"name":"index","type":{"k":2}}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":246}]},"#insert":{"doc":{"synopsis":"Returns a new List with `value` at `index` with a size 1 more than this\nList. Values at indices above `index` are shifted over by 1.","description":"This is synonymous with `list.splice(index, 0, value)`.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nList([ 0, 1, 2, 3, 4 ]).insert(6, 5)\n// List [ 0, 1, 2, 3, 4, 5 ]\n```\n\nSince `insert()` re-indexes values, it produces a complete copy, which\nhas `O(N)` complexity.\n\nNote: `insert` *cannot* be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"index","type":{"k":2}},{"name":"value","type":{"k":8,"param":"T"}}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":268}]},"#clear":{"doc":{"synopsis":"Returns a new List with 0 size and no values in constant time.","description":"<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nList([ 1, 2, 3, 4 ]).clear()\n// List []\n```\n\nNote: `clear` can be used in `withMutations`.","notes":[]},"signatures":[{"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":283}]},"#push":{"doc":{"synopsis":"Returns a new List with the provided `values` appended, starting at this\nList's `size`.","description":"<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nList([ 1, 2, 3, 4 ]).push(5)\n// List [ 1, 2, 3, 4, 5 ]\n```\n\nNote: `push` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":299}]},"#pop":{"doc":{"synopsis":"Returns a new List with a size ones less than this List, excluding\nthe last index in this List.","description":"Note: this differs from `Array#pop` because it returns a new\nList rather than the removed value. Use `last()` to get the last value\nin this List.\n\n```js\nList([ 1, 2, 3, 4 ]).pop()\n// List[ 1, 2, 3 ]\n```\n\nNote: `pop` can be used in `withMutations`.","notes":[]},"signatures":[{"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":316}]},"#unshift":{"doc":{"synopsis":"Returns a new List with the provided `values` prepended, shifting other\nvalues ahead to higher indices.","description":"<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nList([ 2, 3, 4]).unshift(1);\n// List [ 1, 2, 3, 4 ]\n```\n\nNote: `unshift` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":332}]},"#shift":{"doc":{"synopsis":"Returns a new List with a size ones less than this List, excluding\nthe first index in this List, shifting all other values to a lower index.","description":"Note: this differs from `Array#shift` because it returns a new\nList rather than the removed value. Use `first()` to get the first\nvalue in this List.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nList([ 0, 1, 2, 3, 4 ]).shift();\n// List [ 1, 2, 3, 4 ]\n```\n\nNote: `shift` can be used in `withMutations`.","notes":[]},"signatures":[{"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":352}]},"#update":{"doc":{"synopsis":"Returns a new List with an updated value at `index` with the return\nvalue of calling `updater` with the existing value, or `notSetValue` if\n`index` was not set. If called with a single argument, `updater` is\ncalled with the List itself.","description":"`index` may be a negative number, which indexes back from the end of the\nList. `v.update(-1)` updates the last item in the List.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nconst list = List([ 'a', 'b', 'c' ])\nconst result = list.update(2, val => val.toUpperCase())\n// List [ \"a\", \"b\", \"C\" ]\n```\n\nThis can be very useful as a way to \"chain\" a normal function into a\nsequence of methods. RxJS calls this \"let\" and lodash calls it \"thru\".\n\nFor example, to sum a List after mapping and filtering:\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nfunction sum(collection) {\n  return collection.reduce((sum, x) => sum + x, 0)\n}\n\nList([ 1, 2, 3 ])\n  .map(x => x + 1)\n  .filter(x => x % 2 === 0)\n  .update(sum)\n// 6\n```\n\nNote: `update(index)` can be used in `withMutations`.\n","notes":[{"name":"see","body":"`Map#update`"}]},"signatures":[{"params":[{"name":"index","type":{"k":2}},{"name":"notSetValue","type":{"k":8,"param":"T"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}}],"type":{"k":8,"param":"T"}}}],"type":{"k":10},"line":396},{"params":[{"name":"index","type":{"k":2}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}}],"type":{"k":8,"param":"T"}}}],"type":{"k":10},"line":397},{"typeParams":["R"],"params":[{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":10}}],"type":{"k":8,"param":"R"}}}],"type":{"k":8,"param":"R"},"line":398}]},"#setSize":{"doc":{"synopsis":"Returns a new List with size `size`. If `size` is less than this\nList's size, the new List will exclude values at the higher indices.\nIf `size` is greater than this List's size, the new List will have\nundefined values for the newly available indices.","description":"When building a new List and the final size is known up front, `setSize`\nused in conjunction with `withMutations` may result in the more\nperformant construction.","notes":[]},"signatures":[{"params":[{"name":"size","type":{"k":2}}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"T"}]},"line":410}]}}},{"title":"Deep persistent changes","members":{"#setIn":{"doc":{"synopsis":"Returns a new List having set `value` at this `keyPath`. If any keys in\n`keyPath` do not exist, a new immutable Map will be created at that key.","description":"Index numbers are used as keys to determine the path to follow in\nthe List.\n\n<!-- runkit:activate -->\n```js\nconst { List } = require('immutable')\nconst list = List([ 0, 1, 2, List([ 3, 4 ])])\nlist.setIn([3, 0], 999);\n// List [ 0, 1, 2, List [ 999, 4 ] ]\n```\n\nPlain JavaScript Object or Arrays may be nested within an Immutable.js\nCollection, and setIn() can update those values as well, treating them\nimmutably by creating new copies of those values with the changes applied.\n\n<!-- runkit:activate -->\n```js\nconst { List } = require('immutable')\nconst list = List([ 0, 1, 2, { plain: 'object' }])\nlist.setIn([3, 'plain'], 'value');\n// List([ 0, 1, 2, { plain: 'value' }])\n```\n\nNote: `setIn` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"value","type":{"k":17}}],"type":{"k":10},"line":444}]},"#deleteIn":{"doc":{"synopsis":"Returns a new List having removed the value at this `keyPath`. If any\nkeys in `keyPath` do not exist, no change will occur.","description":"<!-- runkit:activate -->\n```js\nconst { List } = require('immutable')\nconst list = List([ 0, 1, 2, List([ 3, 4 ])])\nlist.deleteIn([3, 0]);\n// List [ 0, 1, 2, List [ 4 ] ]\n```\n\nPlain JavaScript Object or Arrays may be nested within an Immutable.js\nCollection, and removeIn() can update those values as well, treating them\nimmutably by creating new copies of those values with the changes applied.\n\n<!-- runkit:activate -->\n```js\nconst { List } = require('immutable')\nconst list = List([ 0, 1, 2, { plain: 'object' }])\nlist.removeIn([3, 'plain']);\n// List([ 0, 1, 2, {}])\n```\n\nNote: `deleteIn` *cannot* be safely used in `withMutations`.\n","notes":[{"name":"alias","body":"removeIn"}]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}}],"type":{"k":10},"line":474}]},"#updateIn":{"doc":{"synopsis":"Note: `updateIn` can be used in `withMutations`.\n","description":"","notes":[{"name":"see","body":"`Map#updateIn`"}]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"notSetValue","type":{"k":17}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":17}}],"type":{"k":17}}}],"type":{"k":10},"line":482},{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":17}}],"type":{"k":17}}}],"type":{"k":10},"line":483}]},"#mergeIn":{"doc":{"synopsis":"Note: `mergeIn` can be used in `withMutations`.\n","description":"","notes":[{"name":"see","body":"`Map#mergeIn`"}]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":10},"line":490}]},"#mergeDeepIn":{"doc":{"synopsis":"Note: `mergeDeepIn` can be used in `withMutations`.\n","description":"","notes":[{"name":"see","body":"`Map#mergeDeepIn`"}]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":10},"line":497}]}}},{"title":"Transient changes","members":{"#withMutations":{"doc":{"synopsis":"Note: Not all methods can be safely used on a mutable collection or within\n`withMutations`! Check the documentation for each method to see if it\nallows being used in `withMutations`.\n","description":"","notes":[{"name":"see","body":"`Map#withMutations`"}]},"signatures":[{"params":[{"name":"mutator","type":{"k":7,"params":[{"name":"mutable","type":{"k":10}}],"type":{"k":17}}}],"type":{"k":10},"line":508}]},"#asMutable":{"doc":{"synopsis":"An alternative API for withMutations()","description":"Note: Not all methods can be safely used on a mutable collection or within\n`withMutations`! Check the documentation for each method to see if it\nallows being used in `withMutations`.\n","notes":[{"name":"see","body":"`Map#asMutable`"}]},"signatures":[{"type":{"k":10},"line":519}]},"#wasAltered":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"`Map#wasAltered`"}]},"signatures":[{"type":{"k":1},"line":524}]},"#asImmutable":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"`Map#asImmutable`"}]},"signatures":[{"type":{"k":10},"line":529}]}}},{"title":"Sequence algorithms","members":{"#concat":{"doc":{"synopsis":"Returns a new List with other values or collections concatenated to this one.","description":"Note: `concat` can be used in `withMutations`.\n","notes":[{"name":"alias","body":"merge"}]},"signatures":[{"typeParams":["C"],"params":[{"name":"valuesOrCollections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"C"}]},{"k":8,"param":"C"}]}]},"varArgs":true}],"type":{"k":9,"name":"List","args":[{"k":12,"types":[{"k":8,"param":"T"},{"k":8,"param":"C"}]}]},"line":540}]},"#map":{"doc":{"synopsis":"Returns a new List with values passed through a\n`mapper` function.","description":"<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nList([ 1, 2 ]).map(x => 10 * x)\n// List [ 10, 20 ]\n```","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"M"}]},"line":555}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the List, returning a new List.","description":"Similar to `list.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"M"}]},"line":565}]},"#filter":{"doc":{"synopsis":"Returns a new List with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"F"}]},"line":577},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":581}]},"#zip":{"doc":{"synopsis":"Returns a List \"zipped\" with the provided collection.","description":"Like `zipWith`, but using the default `zipper`: creating an `Array`.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nconst a = List([ 1, 2, 3 ]);\nconst b = List([ 4, 5, 6 ]);\nconst c = a.zip(b); // List [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]\n```","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"List","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":600},{"typeParams":["U","V"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"List","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":601},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"List","args":[{"k":17}]},"line":602}]},"#zipAll":{"doc":{"synopsis":"Returns a List \"zipped\" with the provided collections.","description":"Unlike `zip`, `zipAll` continues zipping until the longest collection is\nexhausted. Missing values from shorter collections are filled with `undefined`.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nconst a = List([ 1, 2 ]);\nconst b = List([ 3, 4, 5 ]);\nconst c = a.zipAll(b); // List [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]\n```\n\nNote: Since zipAll will return a collection as large as the largest\ninput, some results may contain undefined values. TypeScript cannot\naccount for these without cases (as of v2.5).","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"List","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":623},{"typeParams":["U","V"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"List","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":624},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"List","args":[{"k":17}]},"line":625}]},"#zipWith":{"doc":{"synopsis":"Returns a List \"zipped\" with the provided collections by using a\ncustom `zipper` function.","description":"<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable');\" }\n-->\n```js\nconst a = List([ 1, 2, 3 ]);\nconst b = List([ 4, 5, 6 ]);\nconst c = a.zipWith((a, b) => a + b, b);\n// List [ 5, 7, 9 ]\n```","notes":[]},"signatures":[{"typeParams":["U","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"Z"}]},"line":641},{"typeParams":["U","V","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}},{"name":"thirdValue","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"thirdCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"Z"}]},"line":645},{"typeParams":["Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"any","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":8,"param":"Z"}}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"List","args":[{"k":8,"param":"Z"}]},"line":650}]}}}]}},"Map":{"doc":{"synopsis":"Immutable Map is an unordered Collection.Keyed of (key, value) pairs with\n`O(log32 N)` gets and `O(log32 N)` persistent sets.","description":"Iteration order of a Map is undefined, however is stable. Multiple\niterations of the same Map will iterate in the same order.\n\nMap's keys can be of any type, and use `Immutable.is` to determine key\nequality. This allows the use of any value (including NaN) as a key.\n\nBecause `Immutable.is` returns equality based on value semantics, and\nImmutable collections are treated as values, any Immutable collection may\nbe used as a key.\n\n<!-- runkit:activate -->\n```js\nconst { Map, List } = require('immutable');\nMap().set(List([ 1 ]), 'listofone').get(List([ 1 ]));\n// 'listofone'\n```\n\nAny JavaScript object may be used as a key, however strict identity is used\nto evaluate key equality. Two similar looking objects will represent two\ndifferent keys.\n\nImplemented by a hash-array mapped trie.","notes":[]},"module":{"isMap":{"call":{"doc":{"synopsis":"True if the provided value is a Map","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nMap.isMap({}) // false\nMap.isMap(Map()) // true\n```","notes":[]},"signatures":[{"params":[{"name":"maybeMap","type":{"k":17}}],"type":{"k":1},"line":696}]}}},"call":{"doc":{"synopsis":"Creates a new Immutable Map.","description":"Created with the same key value pairs as the provided Collection.Keyed or\nJavaScript Object or expects a Collection of [K, V] tuple entries.\n\nNote: `Map` is a factory function and not a class, and does not use the\n`new` keyword during construction.\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nMap({ key: \"value\" })\nMap([ [ \"key\", \"value\" ] ])\n```\n\nKeep in mind, when using JS objects to construct Immutable Maps, that\nJavaScript Object properties are always strings, even if written in a\nquote-less shorthand, while Immutable Maps accept keys of any type.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable');\" }\n-->\n```js\nlet obj = { 1: \"one\" }\nObject.keys(obj) // [ \"1\" ]\nassert.equal(obj[\"1\"], obj[1]) // \"one\" === \"one\"\n\nlet map = Map(obj)\nassert.notEqual(map.get(\"1\"), map.get(1)) // \"one\" !== undefined\n```\n\nProperty access for JavaScript Objects first converts the key to a string,\nbut since Immutable Map keys can be of any type the argument to `get()` is\nnot altered.","notes":[]},"signatures":[{"typeParams":["K","V"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]}}],"type":{"k":9,"name":"Map","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":753},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}}],"type":{"k":9,"name":"Map","args":[{"k":3},{"k":8,"param":"V"}]},"line":754},{"typeParams":["K","V"],"type":{"k":9,"name":"Map","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":755},{"type":{"k":9,"name":"Map","args":[{"k":17},{"k":17}]},"line":756}]},"interface":{"line":758,"typeParams":["K","V"],"extends":[{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}],"groups":[{"members":{"#size":{"line":763}}},{"title":"Persistent changes","members":{"#set":{"doc":{"synopsis":"Returns a new Map also containing the new key, value pair. If an equivalent\nkey already exists in this Map, it will be replaced.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst originalMap = Map()\nconst newerMap = originalMap.set('key', 'value')\nconst newestMap = newerMap.set('key', 'newer value')\n\noriginalMap\n// Map {}\nnewerMap\n// Map { \"key\": \"value\" }\nnewestMap\n// Map { \"key\": \"newer value\" }\n```\n\nNote: `set` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":10},"line":788}]},"#delete":{"doc":{"synopsis":"Returns a new Map which excludes this `key`.","description":"Note: `delete` cannot be safely used in IE8, but is provided to mirror\nthe ES6 collection API.\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst originalMap = Map({\n  key: 'value',\n  otherKey: 'other value'\n})\n// Map { \"key\": \"value\", \"otherKey\": \"other value\" }\noriginalMap.delete('otherKey')\n// Map { \"key\": \"value\" }\n```\n\nNote: `delete` can be used in `withMutations`.\n","notes":[{"name":"alias","body":"remove"}]},"signatures":[{"params":[{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":10},"line":812}]},"#deleteAll":{"doc":{"synopsis":"Returns a new Map which excludes the provided `keys`.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst names = Map({ a: \"Aaron\", b: \"Barry\", c: \"Connor\" })\nnames.deleteAll([ 'a', 'c' ])\n// Map { \"b\": \"Barry\" }\n```\n\nNote: `deleteAll` can be used in `withMutations`.\n","notes":[{"name":"alias","body":"removeAll"}]},"signatures":[{"params":[{"name":"keys","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"K"}]}}],"type":{"k":10},"line":830}]},"#clear":{"doc":{"synopsis":"Returns a new Map containing no keys or values.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nMap({ key: 'value' }).clear()\n// Map {}\n```\n\nNote: `clear` can be used in `withMutations`.","notes":[]},"signatures":[{"type":{"k":10},"line":845}]},"#update":{"doc":{"synopsis":"Returns a new Map having updated the value at this `key` with the return\nvalue of calling `updater` with the existing value.","description":"Similar to: `map.set(key, updater(map.get(key)))`.\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst aMap = Map({ key: 'value' })\nconst newMap = aMap.update('key', value => value + value)\n// Map { \"key\": \"valuevalue\" }\n```\n\nThis is most commonly used to call methods on collections within a\nstructure of data. For example, in order to `.push()` onto a nested `List`,\n`update` and `push` can be used together:\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map, List } = require('immutable');\" }\n-->\n```js\nconst aMap = Map({ nestedList: List([ 1, 2, 3 ]) })\nconst newMap = aMap.update('nestedList', list => list.push(4))\n// Map { \"nestedList\": List [ 1, 2, 3, 4 ] }\n```\n\nWhen a `notSetValue` is provided, it is provided to the `updater`\nfunction when the value at the key does not exist in the Map.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable');\" }\n-->\n```js\nconst aMap = Map({ key: 'value' })\nconst newMap = aMap.update('noKey', 'no value', value => value + value)\n// Map { \"key\": \"value\", \"noKey\": \"no valueno value\" }\n```\n\nHowever, if the `updater` function returns the same value it was called\nwith, then no change will occur. This is still true if `notSetValue`\nis provided.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable');\" }\n-->\n```js\nconst aMap = Map({ apples: 10 })\nconst newMap = aMap.update('oranges', 0, val => val)\n// Map { \"apples\": 10 }\nassert.strictEqual(newMap, map);\n```\n\nFor code using ES2015 or later, using `notSetValue` is discourged in\nfavor of function parameter default values. This helps to avoid any\npotential confusion with identify functions as described above.\n\nThe previous example behaves differently when written with default values:\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable');\" }\n-->\n```js\nconst aMap = Map({ apples: 10 })\nconst newMap = aMap.update('oranges', (val = 0) => val)\n// Map { \"apples\": 10, \"oranges\": 0 }\n```\n\nIf no key is provided, then the `updater` function return value is\nreturned as well.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable');\" }\n-->\n```js\nconst aMap = Map({ key: 'value' })\nconst result = aMap.update(aMap => aMap.get('key'))\n// \"value\"\n```\n\nThis can be very useful as a way to \"chain\" a normal function into a\nsequence of methods. RxJS calls this \"let\" and lodash calls it \"thru\".\n\nFor example, to sum the values in a Map\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable');\" }\n-->\n```js\nfunction sum(collection) {\n  return collection.reduce((sum, x) => sum + x, 0)\n}\n\nMap({ x: 1, y: 2, z: 3 })\n  .map(x => x + 1)\n  .filter(x => x % 2 === 0)\n  .update(sum)\n// 6\n```\n\nNote: `update(key)` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":8,"param":"V"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"V"}}}],"type":{"k":10},"line":949},{"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"V"}}}],"type":{"k":10},"line":950},{"typeParams":["R"],"params":[{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":10}}],"type":{"k":8,"param":"R"}}}],"type":{"k":8,"param":"R"},"line":951}]},"#merge":{"doc":{"synopsis":"Returns a new Map resulting from merging the provided Collections\n(or JS objects) into this Map. In other words, this takes each entry of\neach collection and sets it on this Map.","description":"Note: Values provided to `merge` are shallowly converted before being\nmerged. No nested values are altered.\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst one = Map({ a: 10, b: 20, c: 30 })\nconst two = Map({ b: 40, a: 50, d: 60 })\none.merge(two) // Map { \"a\": 50, \"b\": 40, \"c\": 30, \"d\": 60 }\ntwo.merge(one) // Map { \"b\": 20, \"a\": 10, \"d\": 60, \"c\": 30 }\n```\n\nNote: `merge` can be used in `withMutations`.\n","notes":[{"name":"alias","body":"concat"}]},"signatures":[{"typeParams":["KC","VC"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"KC"},{"k":8,"param":"VC"}]}]}]},"varArgs":true}],"type":{"k":9,"name":"Map","args":[{"k":12,"types":[{"k":8,"param":"K"},{"k":8,"param":"KC"}]},{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"VC"}]}]},"line":974},{"typeParams":["C"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"C"}}]}]},"varArgs":true}],"type":{"k":9,"name":"Map","args":[{"k":12,"types":[{"k":8,"param":"K"},{"k":3}]},{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"C"}]}]},"line":975}]},"#mergeWith":{"doc":{"synopsis":"Like `merge()`, `mergeWith()` returns a new Map resulting from merging\nthe provided Collections (or JS objects) into this Map, but uses the\n`merger` function for dealing with conflicts.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst one = Map({ a: 10, b: 20, c: 30 })\nconst two = Map({ b: 40, a: 50, d: 60 })\none.mergeWith((oldVal, newVal) => oldVal / newVal, two)\n// { \"a\": 0.2, \"b\": 0.5, \"c\": 30, \"d\": 60 }\ntwo.mergeWith((oldVal, newVal) => oldVal / newVal, one)\n// { \"b\": 2, \"a\": 5, \"d\": 60, \"c\": 30 }\n```\n\nNote: `mergeWith` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"merger","type":{"k":7,"params":[{"name":"oldVal","type":{"k":8,"param":"V"}},{"name":"newVal","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":8,"param":"V"}}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]},{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}]}]},"varArgs":true}],"type":{"k":10},"line":997}]},"#mergeDeep":{"doc":{"synopsis":"Like `merge()`, but when two Collections conflict, it merges them as well,\nrecursing deeply through the nested data.","description":"Note: Values provided to `merge` are shallowly converted before being\nmerged. No nested values are altered unless they will also be merged at\na deeper level.\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst one = Map({ a: Map({ x: 10, y: 10 }), b: Map({ x: 20, y: 50 }) })\nconst two = Map({ a: Map({ x: 2 }), b: Map({ y: 5 }), c: Map({ z: 3 }) })\none.mergeDeep(two)\n// Map {\n//   \"a\": Map { \"x\": 2, \"y\": 10 },\n//   \"b\": Map { \"x\": 20, \"y\": 5 },\n//   \"c\": Map { \"z\": 3 }\n// }\n```\n\nNote: `mergeDeep` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]},{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}]}]},"varArgs":true}],"type":{"k":10},"line":1025}]},"#mergeDeepWith":{"doc":{"synopsis":"Like `mergeDeep()`, but when two non-Collections conflict, it uses the\n`merger` function to determine the resulting value.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst one = Map({ a: Map({ x: 10, y: 10 }), b: Map({ x: 20, y: 50 }) })\nconst two = Map({ a: Map({ x: 2 }), b: Map({ y: 5 }), c: Map({ z: 3 }) })\none.mergeDeepWith((oldVal, newVal) => oldVal / newVal, two)\n// Map {\n//   \"a\": Map { \"x\": 5, \"y\": 10 },\n//   \"b\": Map { \"x\": 20, \"y\": 10 },\n//   \"c\": Map { \"z\": 3 }\n// }\n```\n\nNote: `mergeDeepWith` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"merger","type":{"k":7,"params":[{"name":"oldVal","type":{"k":17}},{"name":"newVal","type":{"k":17}},{"name":"key","type":{"k":17}}],"type":{"k":17}}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]},{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}]}]},"varArgs":true}],"type":{"k":10},"line":1046}]}}},{"title":"Deep persistent changes","members":{"#setIn":{"doc":{"synopsis":"Returns a new Map having set `value` at this `keyPath`. If any keys in\n`keyPath` do not exist, a new immutable Map will be created at that key.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst originalMap = Map({\n  subObject: Map({\n    subKey: 'subvalue',\n    subSubObject: Map({\n      subSubKey: 'subSubValue'\n    })\n  })\n})\n\nconst newMap = originalMap.setIn(['subObject', 'subKey'], 'ha ha!')\n// Map {\n//   \"subObject\": Map {\n//     \"subKey\": \"ha ha!\",\n//     \"subSubObject\": Map { \"subSubKey\": \"subSubValue\" }\n//   }\n// }\n\nconst newerMap = originalMap.setIn(\n  ['subObject', 'subSubObject', 'subSubKey'],\n  'ha ha ha!'\n)\n// Map {\n//   \"subObject\": Map {\n//     \"subKey\": \"subvalue\",\n//     \"subSubObject\": Map { \"subSubKey\": \"ha ha ha!\" }\n//   }\n// }\n```\n\nPlain JavaScript Object or Arrays may be nested within an Immutable.js\nCollection, and setIn() can update those values as well, treating them\nimmutably by creating new copies of those values with the changes applied.\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst originalMap = Map({\n  subObject: {\n    subKey: 'subvalue',\n    subSubObject: {\n      subSubKey: 'subSubValue'\n    }\n  }\n})\n\noriginalMap.setIn(['subObject', 'subKey'], 'ha ha!')\n// Map {\n//   \"subObject\": {\n//     subKey: \"ha ha!\",\n//     subSubObject: { subSubKey: \"subSubValue\" }\n//   }\n// }\n```\n\nIf any key in the path exists but cannot be updated (such as a primitive\nlike number or a custom Object like Date), an error will be thrown.\n\nNote: `setIn` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"value","type":{"k":17}}],"type":{"k":10},"line":1120}]},"#deleteIn":{"doc":{"synopsis":"Returns a new Map having removed the value at this `keyPath`. If any keys\nin `keyPath` do not exist, no change will occur.","description":"Note: `deleteIn` can be used in `withMutations`.\n","notes":[{"name":"alias","body":"removeIn"}]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}}],"type":{"k":10},"line":1130}]},"#updateIn":{"doc":{"synopsis":"Returns a new Map having applied the `updater` to the entry found at the\nkeyPath.","description":"This is most commonly used to call methods on collections nested within a\nstructure of data. For example, in order to `.push()` onto a nested `List`,\n`updateIn` and `push` can be used together:\n\n<!-- runkit:activate -->\n```js\nconst { Map, List } = require('immutable')\nconst map = Map({ inMap: Map({ inList: List([ 1, 2, 3 ]) }) })\nconst newMap = map.updateIn(['inMap', 'inList'], list => list.push(4))\n// Map { \"inMap\": Map { \"inList\": List [ 1, 2, 3, 4 ] } }\n```\n\nIf any keys in `keyPath` do not exist, new Immutable `Map`s will\nbe created at those keys. If the `keyPath` does not already contain a\nvalue, the `updater` function will be called with `notSetValue`, if\nprovided, otherwise `undefined`.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable')\" }\n-->\n```js\nconst map = Map({ a: Map({ b: Map({ c: 10 }) }) })\nconst newMap = map.updateIn(['a', 'b', 'c'], val => val * 2)\n// Map { \"a\": Map { \"b\": Map { \"c\": 20 } } }\n```\n\nIf the `updater` function returns the same value it was called with, then\nno change will occur. This is still true if `notSetValue` is provided.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable')\" }\n-->\n```js\nconst map = Map({ a: Map({ b: Map({ c: 10 }) }) })\nconst newMap = map.updateIn(['a', 'b', 'x'], 100, val => val)\n// Map { \"a\": Map { \"b\": Map { \"c\": 10 } } }\nassert.strictEqual(newMap, aMap)\n```\n\nFor code using ES2015 or later, using `notSetValue` is discourged in\nfavor of function parameter default values. This helps to avoid any\npotential confusion with identify functions as described above.\n\nThe previous example behaves differently when written with default values:\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable')\" }\n-->\n```js\nconst map = Map({ a: Map({ b: Map({ c: 10 }) }) })\nconst newMap = map.updateIn(['a', 'b', 'x'], (val = 100) => val)\n// Map { \"a\": Map { \"b\": Map { \"c\": 10, \"x\": 100 } } }\n```\n\nPlain JavaScript Object or Arrays may be nested within an Immutable.js\nCollection, and updateIn() can update those values as well, treating them\nimmutably by creating new copies of those values with the changes applied.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Map } = require('immutable')\" }\n-->\n```js\nconst map = Map({ a: { b: { c: 10 } } })\nconst newMap = map.updateIn(['a', 'b', 'c'], val => val * 2)\n// Map { \"a\": { b: { c: 20 } } }\n```\n\nIf any key in the path exists but cannot be updated (such as a primitive\nlike number or a custom Object like Date), an error will be thrown.\n\nNote: `updateIn` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"notSetValue","type":{"k":17}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":17}}],"type":{"k":17}}}],"type":{"k":10},"line":1209},{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":17}}],"type":{"k":17}}}],"type":{"k":10},"line":1210}]},"#mergeIn":{"doc":{"synopsis":"A combination of `updateIn` and `merge`, returning a new Map, but\nperforming the merge at a point arrived at by following the keyPath.\nIn other words, these two lines are equivalent:","description":"```js\nmap.updateIn(['a', 'b', 'c'], abc => abc.merge(y))\nmap.mergeIn(['a', 'b', 'c'], y)\n```\n\nNote: `mergeIn` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":10},"line":1224}]},"#mergeDeepIn":{"doc":{"synopsis":"A combination of `updateIn` and `mergeDeep`, returning a new Map, but\nperforming the deep merge at a point arrived at by following the keyPath.\nIn other words, these two lines are equivalent:","description":"```js\nmap.updateIn(['a', 'b', 'c'], abc => abc.mergeDeep(y))\nmap.mergeDeepIn(['a', 'b', 'c'], y)\n```\n\nNote: `mergeDeepIn` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":10},"line":1238}]}}},{"title":"Transient changes","members":{"#withMutations":{"doc":{"synopsis":"Every time you call one of the above functions, a new immutable Map is\ncreated. If a pure function calls a number of these to produce a final\nreturn value, then a penalty on performance and memory has been paid by\ncreating all of the intermediate immutable Maps.","description":"If you need to apply a series of mutations to produce a new immutable\nMap, `withMutations()` creates a temporary mutable copy of the Map which\ncan apply mutations in a highly performant manner. In fact, this is\nexactly how complex mutations like `merge` are done.\n\nAs an example, this results in the creation of 2, not 4, new Maps:\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst map1 = Map()\nconst map2 = map1.withMutations(map => {\n  map.set('a', 1).set('b', 2).set('c', 3)\n})\nassert.equal(map1.size, 0)\nassert.equal(map2.size, 3)\n```\n\nNote: Not all methods can be used on a mutable collection or within\n`withMutations`! Read the documentation for each method to see if it\nis safe to use in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"mutator","type":{"k":7,"params":[{"name":"mutable","type":{"k":10}}],"type":{"k":17}}}],"type":{"k":10},"line":1270}]},"#asMutable":{"doc":{"synopsis":"Another way to avoid creation of intermediate Immutable maps is to create\na mutable copy of this collection. Mutable copies *always* return `this`,\nand thus shouldn't be used for equality. Your function should never return\na mutable copy of a collection, only use it internally to create a new\ncollection.","description":"If possible, use `withMutations` to work with temporary mutable copies as\nit provides an easier to use API and considers many common optimizations.\n\nNote: if the collection is already mutable, `asMutable` returns itself.\n\nNote: Not all methods can be used on a mutable collection or within\n`withMutations`! Read the documentation for each method to see if it\nis safe to use in `withMutations`.\n","notes":[{"name":"see","body":"`Map#asImmutable`"}]},"signatures":[{"type":{"k":10},"line":1290}]},"#wasAltered":{"doc":{"synopsis":"Returns true if this is a mutable copy (see `asMutable()`) and mutative\nalterations have been applied.\n","description":"","notes":[{"name":"see","body":"`Map#asMutable`"}]},"signatures":[{"type":{"k":1},"line":1298}]},"#asImmutable":{"doc":{"synopsis":"The yin to `asMutable`'s yang. Because it applies to mutable collections,\nthis operation is *mutable* and may return itself (though may not\nreturn itself, i.e. if the result is an empty collection). Once\nperformed, the original mutable copy must no longer be mutated since it\nmay be the immutable result.","description":"If possible, use `withMutations` to work with temporary mutable copies as\nit provides an easier to use API and considers many common optimizations.\n","notes":[{"name":"see","body":"`Map#asMutable`"}]},"signatures":[{"type":{"k":10},"line":1312}]}}},{"title":"Sequence algorithms","members":{"#map":{"doc":{"synopsis":"Returns a new Map with values passed through a\n`mapper` function.","description":"    Map({ a: 1, b: 2 }).map(x => 10 * x)\n    // Map { a: 10, b: 20 }","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Map","args":[{"k":8,"param":"K"},{"k":8,"param":"M"}]},"line":1323}]},"#mapKeys":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"Collection.Keyed.mapKeys"}]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":8,"param":"V"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Map","args":[{"k":8,"param":"M"},{"k":8,"param":"V"}]},"line":1331}]},"#mapEntries":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"Collection.Keyed.mapEntries"}]},"signatures":[{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"entry","type":{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":14,"types":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Map","args":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]},"line":1339}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Map, returning a new Map.","description":"Similar to `data.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Map","args":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]},"line":1349}]},"#filter":{"doc":{"synopsis":"Returns a new Map with only the entries for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Map","args":[{"k":8,"param":"K"},{"k":8,"param":"F"}]},"line":1361},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":1365}]},"#flip":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"Collection.Keyed.flip"}]},"signatures":[{"type":{"k":9,"name":"Map","args":[{"k":8,"param":"V"},{"k":8,"param":"K"}]},"line":1373}]}}}]}},"OrderedMap":{"doc":{"synopsis":"A type of Map that has the additional guarantee that the iteration order of\nentries will be the order in which they were set().","description":"The iteration behavior of OrderedMap is the same as native ES6 Map and\nJavaScript Object.\n\nNote that `OrderedMap` are more expensive than non-ordered `Map` and may\nconsume more memory. `OrderedMap#set` is amortized O(log32 N), but not\nstable.","notes":[]},"module":{"isOrderedMap":{"call":{"doc":{"synopsis":"True if the provided value is an OrderedMap.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeOrderedMap","type":{"k":17}}],"type":{"k":1},"line":1394}]}}},"call":{"doc":{"synopsis":"Creates a new Immutable OrderedMap.","description":"Created with the same key value pairs as the provided Collection.Keyed or\nJavaScript Object or expects a Collection of [K, V] tuple entries.\n\nThe iteration order of key-value pairs provided to this constructor will\nbe preserved in the OrderedMap.\n\n    let newOrderedMap = OrderedMap({key: \"value\"})\n    let newOrderedMap = OrderedMap([[\"key\", \"value\"]])\n\nNote: `OrderedMap` is a factory function and not a class, and does not use\nthe `new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["K","V"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]}}],"type":{"k":9,"name":"OrderedMap","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":1412},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}}],"type":{"k":9,"name":"OrderedMap","args":[{"k":3},{"k":8,"param":"V"}]},"line":1413},{"typeParams":["K","V"],"type":{"k":9,"name":"OrderedMap","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":1414},{"type":{"k":9,"name":"OrderedMap","args":[{"k":17},{"k":17}]},"line":1415}]},"interface":{"line":1417,"typeParams":["K","V"],"extends":[{"k":9,"name":"Map","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}],"groups":[{"members":{"#size":{"line":1422},"#set":{"doc":{"synopsis":"Returns a new OrderedMap also containing the new key, value pair. If an\nequivalent key already exists in this OrderedMap, it will be replaced\nwhile maintaining the existing order.","description":"<!-- runkit:activate -->\n```js\nconst { OrderedMap } = require('immutable')\nconst originalMap = OrderedMap({a:1, b:1, c:1})\nconst updatedMap = originalMap.set('b', 2)\n\noriginalMap\n// OrderedMap {a: 1, b: 1, c: 1}\nupdatedMap\n// OrderedMap {a: 1, b: 2, c: 1}\n```\n\nNote: `set` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":10},"line":1443}]},"#merge":{"doc":{"synopsis":"Returns a new OrderedMap resulting from merging the provided Collections\n(or JS objects) into this OrderedMap. In other words, this takes each\nentry of each collection and sets it on this OrderedMap.","description":"Note: Values provided to `merge` are shallowly converted before being\nmerged. No nested values are altered.\n\n<!-- runkit:activate -->\n```js\nconst { OrderedMap } = require('immutable')\nconst one = OrderedMap({ a: 10, b: 20, c: 30 })\nconst two = OrderedMap({ b: 40, a: 50, d: 60 })\none.merge(two) // OrderedMap { \"a\": 50, \"b\": 40, \"c\": 30, \"d\": 60 }\ntwo.merge(one) // OrderedMap { \"b\": 20, \"a\": 10, \"d\": 60, \"c\": 30 }\n```\n\nNote: `merge` can be used in `withMutations`.\n","notes":[{"name":"alias","body":"concat"}]},"signatures":[{"typeParams":["KC","VC"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"KC"},{"k":8,"param":"VC"}]}]}]},"varArgs":true}],"type":{"k":9,"name":"OrderedMap","args":[{"k":12,"types":[{"k":8,"param":"K"},{"k":8,"param":"KC"}]},{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"VC"}]}]},"line":1466},{"typeParams":["C"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"C"}}]}]},"varArgs":true}],"type":{"k":9,"name":"OrderedMap","args":[{"k":12,"types":[{"k":8,"param":"K"},{"k":3}]},{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"C"}]}]},"line":1467}]}}},{"title":"Sequence algorithms","members":{"#map":{"doc":{"synopsis":"Returns a new OrderedMap with values passed through a\n`mapper` function.","description":"    OrderedMap({ a: 1, b: 2 }).map(x => 10 * x)\n    // OrderedMap { \"a\": 10, \"b\": 20 }\n\nNote: `map()` always returns a new instance, even if it produced the same\nvalue at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"OrderedMap","args":[{"k":8,"param":"K"},{"k":8,"param":"M"}]},"line":1483}]},"#mapKeys":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"Collection.Keyed.mapKeys"}]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":8,"param":"V"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"OrderedMap","args":[{"k":8,"param":"M"},{"k":8,"param":"V"}]},"line":1491}]},"#mapEntries":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"Collection.Keyed.mapEntries"}]},"signatures":[{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"entry","type":{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":14,"types":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"OrderedMap","args":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]},"line":1499}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the OrderedMap, returning a new OrderedMap.","description":"Similar to `data.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"OrderedMap","args":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]},"line":1509}]},"#filter":{"doc":{"synopsis":"Returns a new OrderedMap with only the entries for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"OrderedMap","args":[{"k":8,"param":"K"},{"k":8,"param":"F"}]},"line":1521},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":1525}]},"#flip":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"Collection.Keyed.flip"}]},"signatures":[{"type":{"k":9,"name":"OrderedMap","args":[{"k":8,"param":"V"},{"k":8,"param":"K"}]},"line":1533}]}}}]}},"Set":{"doc":{"synopsis":"A Collection of unique values with `O(log32 N)` adds and has.","description":"When iterating a Set, the entries will be (value, value) pairs. Iteration\norder of a Set is undefined, however is stable. Multiple iterations of the\nsame Set will iterate in the same order.\n\nSet values, like Map keys, may be of any type. Equality is determined using\n`Immutable.is`, enabling Sets to uniquely include other Immutable\ncollections, custom value types, and NaN.","notes":[]},"module":{"isSet":{"call":{"doc":{"synopsis":"True if the provided value is a Set","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeSet","type":{"k":17}}],"type":{"k":1},"line":1553}]}},"of":{"call":{"doc":{"synopsis":"Creates a new Set containing `values`.","description":"","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"T"}]},"line":1558}]}},"fromKeys":{"call":{"doc":{"synopsis":"`Set.fromKeys()` creates a new immutable Set containing the keys from\nthis Collection or JavaScript Object.","description":"","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"iter","type":{"k":9,"name":"Collection","args":[{"k":8,"param":"T"},{"k":17}]}}],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"T"}]},"line":1564},{"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]}}],"type":{"k":9,"name":"Set","args":[{"k":3}]},"line":1565}]}},"intersect":{"call":{"doc":{"synopsis":"`Set.intersect()` creates a new immutable Set that is the intersection of\na collection of other sets.","description":"```js\nconst { Set } = require('immutable')\nconst intersected = Set.intersect([\n  Set([ 'a', 'b', 'c' ])\n  Set([ 'c', 'a', 't' ])\n])\n// Set [ \"a\", \"c\" ]\n```","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"sets","type":{"k":9,"name":"Iterable","args":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}]}}],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"T"}]},"line":1580}]}},"union":{"call":{"doc":{"synopsis":"`Set.union()` creates a new immutable Set that is the union of a\ncollection of other sets.","description":"```js\nconst { Set } = require('immutable')\nconst unioned = Set.union([\n  Set([ 'a', 'b', 'c' ])\n  Set([ 'c', 'a', 't' ])\n])\n// Set [ \"a\", \"b\", \"c\", \"t\" ]\n```","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"sets","type":{"k":9,"name":"Iterable","args":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}]}}],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"T"}]},"line":1595}]}}},"call":{"doc":{"synopsis":"Create a new immutable Set containing the values of the provided\ncollection-like.","description":"Note: `Set` is a factory function and not a class, and does not use the\n`new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"T"}]},"line":1605},{"typeParams":["T"],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"T"}]},"line":1606},{"type":{"k":9,"name":"Set","args":[{"k":17}]},"line":1607}]},"interface":{"line":1609,"typeParams":["T"],"extends":[{"k":9,"name":"Collection.Set","args":[{"k":8,"param":"T"}]}],"groups":[{"members":{"#size":{"line":1614}}},{"title":"Persistent changes","members":{"#add":{"doc":{"synopsis":"Returns a new Set which also includes this value.","description":"Note: `add` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"value","type":{"k":8,"param":"T"}}],"type":{"k":10},"line":1623}]},"#delete":{"doc":{"synopsis":"Returns a new Set which excludes this value.","description":"Note: `delete` can be used in `withMutations`.\n\nNote: `delete` **cannot** be safely used in IE8, use `remove` if\nsupporting old browsers.\n","notes":[{"name":"alias","body":"remove"}]},"signatures":[{"params":[{"name":"value","type":{"k":8,"param":"T"}}],"type":{"k":10},"line":1635}]},"#clear":{"doc":{"synopsis":"Returns a new Set containing no values.","description":"Note: `clear` can be used in `withMutations`.","notes":[]},"signatures":[{"type":{"k":10},"line":1643}]},"#union":{"doc":{"synopsis":"Returns a Set including any value from `collections` that does not already\nexist in this Set.","description":"Note: `union` can be used in `withMutations`.","notes":[{"name":"alias","body":"merge"},{"name":"alias","body":"concat"}]},"signatures":[{"typeParams":["C"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"C"}]}]},"varArgs":true}],"type":{"k":9,"name":"Set","args":[{"k":12,"types":[{"k":8,"param":"T"},{"k":8,"param":"C"}]}]},"line":1653}]},"#intersect":{"doc":{"synopsis":"Returns a Set which has removed any values not also contained\nwithin `collections`.","description":"Note: `intersect` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}]},"varArgs":true}],"type":{"k":10},"line":1663}]},"#subtract":{"doc":{"synopsis":"Returns a Set excluding any values contained within `collections`.","description":"<!-- runkit:activate -->\n```js\nconst { OrderedSet } = require('immutable')\nOrderedSet([ 1, 2, 3 ]).subtract([1, 3])\n// OrderedSet [2]\n```\n\nNote: `subtract` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}]},"varArgs":true}],"type":{"k":10},"line":1677}]}}},{"title":"Transient changes","members":{"#withMutations":{"doc":{"synopsis":"Note: Not all methods can be used on a mutable collection or within\n`withMutations`! Check the documentation for each method to see if it\nmentions being safe to use in `withMutations`.\n","description":"","notes":[{"name":"see","body":"`Map#withMutations`"}]},"signatures":[{"params":[{"name":"mutator","type":{"k":7,"params":[{"name":"mutable","type":{"k":10}}],"type":{"k":17}}}],"type":{"k":10},"line":1689}]},"#asMutable":{"doc":{"synopsis":"Note: Not all methods can be used on a mutable collection or within\n`withMutations`! Check the documentation for each method to see if it\nmentions being safe to use in `withMutations`.\n","description":"","notes":[{"name":"see","body":"`Map#asMutable`"}]},"signatures":[{"type":{"k":10},"line":1698}]},"#wasAltered":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"`Map#wasAltered`"}]},"signatures":[{"type":{"k":1},"line":1703}]},"#asImmutable":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"`Map#asImmutable`"}]},"signatures":[{"type":{"k":10},"line":1708}]}}},{"title":"Sequence algorithms","members":{"#map":{"doc":{"synopsis":"Returns a new Set with values passed through a\n`mapper` function.","description":"    Set([1,2]).map(x => 10 * x)\n    // Set [10,20]","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"M"}]},"line":1719}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Set, returning a new Set.","description":"Similar to `set.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"M"}]},"line":1729}]},"#filter":{"doc":{"synopsis":"Returns a new Set with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"F"}]},"line":1741},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":1745}]}}}]}},"OrderedSet":{"doc":{"synopsis":"A type of Set that has the additional guarantee that the iteration order of\nvalues will be the order in which they were `add`ed.","description":"The iteration behavior of OrderedSet is the same as native ES6 Set.\n\nNote that `OrderedSet` are more expensive than non-ordered `Set` and may\nconsume more memory. `OrderedSet#add` is amortized O(log32 N), but not\nstable.","notes":[]},"module":{"isOrderedSet":{"call":{"doc":{"synopsis":"True if the provided value is an OrderedSet.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeOrderedSet","type":{"k":17}}],"type":{"k":1},"line":1767}]}},"of":{"call":{"doc":{"synopsis":"Creates a new OrderedSet containing `values`.","description":"","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"T"}]},"line":1772}]}},"fromKeys":{"call":{"doc":{"synopsis":"`OrderedSet.fromKeys()` creates a new immutable OrderedSet containing\nthe keys from this Collection or JavaScript Object.","description":"","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"iter","type":{"k":9,"name":"Collection","args":[{"k":8,"param":"T"},{"k":17}]}}],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"T"}]},"line":1778},{"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]}}],"type":{"k":9,"name":"OrderedSet","args":[{"k":3}]},"line":1779}]}}},"call":{"doc":{"synopsis":"Create a new immutable OrderedSet containing the values of the provided\ncollection-like.","description":"Note: `OrderedSet` is a factory function and not a class, and does not use\nthe `new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"T"}]},"line":1789},{"typeParams":["T"],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"T"}]},"line":1790},{"type":{"k":9,"name":"OrderedSet","args":[{"k":17}]},"line":1791}]},"interface":{"line":1793,"typeParams":["T"],"extends":[{"k":9,"name":"Set","args":[{"k":8,"param":"T"}]}],"groups":[{"members":{"#size":{"line":1798},"#union":{"doc":{"synopsis":"Returns an OrderedSet including any value from `collections` that does\nnot already exist in this OrderedSet.","description":"Note: `union` can be used in `withMutations`.","notes":[{"name":"alias","body":"merge"},{"name":"alias","body":"concat"}]},"signatures":[{"typeParams":["C"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"C"}]}]},"varArgs":true}],"type":{"k":9,"name":"OrderedSet","args":[{"k":12,"types":[{"k":8,"param":"T"},{"k":8,"param":"C"}]}]},"line":1808}]}}},{"title":"Sequence algorithms","members":{"#map":{"doc":{"synopsis":"Returns a new Set with values passed through a\n`mapper` function.","description":"    OrderedSet([ 1, 2 ]).map(x => 10 * x)\n    // OrderedSet [10, 20]","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"M"}]},"line":1821}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the OrderedSet, returning a new OrderedSet.","description":"Similar to `set.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"M"}]},"line":1831}]},"#filter":{"doc":{"synopsis":"Returns a new OrderedSet with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"F"}]},"line":1843},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":1847}]},"#zip":{"doc":{"synopsis":"Returns an OrderedSet of the same type \"zipped\" with the provided\ncollections.","description":"Like `zipWith`, but using the default `zipper`: creating an `Array`.\n\n```js\nconst a = OrderedSet([ 1, 2, 3 ])\nconst b = OrderedSet([ 4, 5, 6 ])\nconst c = a.zip(b)\n// OrderedSet [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]\n```","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"OrderedSet","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":1865},{"typeParams":["U","V"],"params":[{"name":"other1","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"OrderedSet","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":1866},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"OrderedSet","args":[{"k":17}]},"line":1867}]},"#zipAll":{"doc":{"synopsis":"Returns a OrderedSet of the same type \"zipped\" with the provided\ncollections.","description":"Unlike `zip`, `zipAll` continues zipping until the longest collection is\nexhausted. Missing values from shorter collections are filled with `undefined`.\n\n```js\nconst a = OrderedSet([ 1, 2 ]);\nconst b = OrderedSet([ 3, 4, 5 ]);\nconst c = a.zipAll(b); // OrderedSet [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]\n```\n\nNote: Since zipAll will return a collection as large as the largest\ninput, some results may contain undefined values. TypeScript cannot\naccount for these without cases (as of v2.5).","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"OrderedSet","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":1886},{"typeParams":["U","V"],"params":[{"name":"other1","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"OrderedSet","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":1887},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"OrderedSet","args":[{"k":17}]},"line":1888}]},"#zipWith":{"doc":{"synopsis":"Returns an OrderedSet of the same type \"zipped\" with the provided\ncollections by using a custom `zipper` function.\n","description":"","notes":[{"name":"see","body":"Seq.Indexed.zipWith"}]},"signatures":[{"typeParams":["U","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"Z"}]},"line":1896},{"typeParams":["U","V","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}},{"name":"thirdValue","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"thirdCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"Z"}]},"line":1900},{"typeParams":["Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"any","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":8,"param":"Z"}}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"Z"}]},"line":1905}]}}}]}},"Stack":{"doc":{"synopsis":"Stacks are indexed collections which support very efficient O(1) addition\nand removal from the front using `unshift(v)` and `shift()`.","description":"For familiarity, Stack also provides `push(v)`, `pop()`, and `peek()`, but\nbe aware that they also operate on the front of the list, unlike List or\na JavaScript Array.\n\nNote: `reverse()` or any inherent reverse traversal (`reduceRight`,\n`lastIndexOf`, etc.) is not efficient with a Stack.\n\nStack is implemented with a Single-Linked List.","notes":[]},"module":{"isStack":{"call":{"doc":{"synopsis":"True if the provided value is a Stack","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeStack","type":{"k":17}}],"type":{"k":1},"line":1931}]}},"of":{"call":{"doc":{"synopsis":"Creates a new Stack containing `values`.","description":"","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":1936}]}}},"call":{"doc":{"synopsis":"Create a new immutable Stack containing the values of the provided\ncollection-like.","description":"The iteration order of the provided collection is preserved in the\nresulting `Stack`.\n\nNote: `Stack` is a factory function and not a class, and does not use the\n`new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":1949},{"typeParams":["T"],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":1950},{"type":{"k":9,"name":"Stack","args":[{"k":17}]},"line":1951}]},"interface":{"line":1953,"typeParams":["T"],"extends":[{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"T"}]}],"groups":[{"members":{"#size":{"line":1958}}},{"title":"Reading values","members":{"#peek":{"doc":{"synopsis":"Alias for `Stack.first()`.","description":"","notes":[]},"signatures":[{"type":{"k":12,"types":[{"k":8,"param":"T"},{"k":11}]},"line":1965}]}}},{"title":"Persistent changes","members":{"#clear":{"doc":{"synopsis":"Returns a new Stack with 0 size and no values.","description":"Note: `clear` can be used in `withMutations`.","notes":[]},"signatures":[{"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":1975}]},"#unshift":{"doc":{"synopsis":"Returns a new Stack with the provided `values` prepended, shifting other\nvalues ahead to higher indices.","description":"This is very efficient for Stack.\n\nNote: `unshift` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":1985}]},"#unshiftAll":{"doc":{"synopsis":"Like `Stack#unshift`, but accepts a collection rather than varargs.","description":"Note: `unshiftAll` can be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"iter","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":1992}]},"#shift":{"doc":{"synopsis":"Returns a new Stack with a size ones less than this Stack, excluding\nthe first item in this Stack, shifting all other values to a lower index.","description":"Note: this differs from `Array#shift` because it returns a new\nStack rather than the removed value. Use `first()` or `peek()` to get the\nfirst value in this Stack.\n\nNote: `shift` can be used in `withMutations`.","notes":[]},"signatures":[{"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":2004}]},"#push":{"doc":{"synopsis":"Alias for `Stack#unshift` and is not equivalent to `List#push`.","description":"","notes":[]},"signatures":[{"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":2009}]},"#pushAll":{"doc":{"synopsis":"Alias for `Stack#unshiftAll`.","description":"","notes":[]},"signatures":[{"params":[{"name":"iter","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":2014}]},"#pop":{"doc":{"synopsis":"Alias for `Stack#shift` and is not equivalent to `List#pop`.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"T"}]},"line":2019}]}}},{"title":"Transient changes","members":{"#withMutations":{"doc":{"synopsis":"Note: Not all methods can be used on a mutable collection or within\n`withMutations`! Check the documentation for each method to see if it\nmentions being safe to use in `withMutations`.\n","description":"","notes":[{"name":"see","body":"`Map#withMutations`"}]},"signatures":[{"params":[{"name":"mutator","type":{"k":7,"params":[{"name":"mutable","type":{"k":10}}],"type":{"k":17}}}],"type":{"k":10},"line":2031}]},"#asMutable":{"doc":{"synopsis":"Note: Not all methods can be used on a mutable collection or within\n`withMutations`! Check the documentation for each method to see if it\nmentions being safe to use in `withMutations`.\n","description":"","notes":[{"name":"see","body":"`Map#asMutable`"}]},"signatures":[{"type":{"k":10},"line":2040}]},"#wasAltered":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"`Map#wasAltered`"}]},"signatures":[{"type":{"k":1},"line":2045}]},"#asImmutable":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"`Map#asImmutable`"}]},"signatures":[{"type":{"k":10},"line":2050}]}}},{"title":"Sequence algorithms","members":{"#concat":{"doc":{"synopsis":"Returns a new Stack with other collections concatenated to this one.","description":"","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"valuesOrCollections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"C"}]},{"k":8,"param":"C"}]}]},"varArgs":true}],"type":{"k":9,"name":"Stack","args":[{"k":12,"types":[{"k":8,"param":"T"},{"k":8,"param":"C"}]}]},"line":2057}]},"#map":{"doc":{"synopsis":"Returns a new Stack with values passed through a\n`mapper` function.","description":"    Stack([ 1, 2 ]).map(x => 10 * x)\n    // Stack [ 10, 20 ]\n\nNote: `map()` always returns a new instance, even if it produced the same\nvalue at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"M"}]},"line":2069}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Stack, returning a new Stack.","description":"Similar to `stack.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"M"}]},"line":2079}]},"#filter":{"doc":{"synopsis":"Returns a new Set with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Set","args":[{"k":8,"param":"F"}]},"line":2091},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":2095}]},"#zip":{"doc":{"synopsis":"Returns a Stack \"zipped\" with the provided collections.","description":"Like `zipWith`, but using the default `zipper`: creating an `Array`.\n\n```js\nconst a = Stack([ 1, 2, 3 ]);\nconst b = Stack([ 4, 5, 6 ]);\nconst c = a.zip(b); // Stack [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]\n```","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"Stack","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":2111},{"typeParams":["U","V"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Stack","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":2112},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"Stack","args":[{"k":17}]},"line":2113}]},"#zipAll":{"doc":{"synopsis":"Returns a Stack \"zipped\" with the provided collections.","description":"Unlike `zip`, `zipAll` continues zipping until the longest collection is\nexhausted. Missing values from shorter collections are filled with `undefined`.\n\n```js\nconst a = Stack([ 1, 2 ]);\nconst b = Stack([ 3, 4, 5 ]);\nconst c = a.zipAll(b); // Stack [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]\n```\n\nNote: Since zipAll will return a collection as large as the largest\ninput, some results may contain undefined values. TypeScript cannot\naccount for these without cases (as of v2.5).","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"Stack","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":2131},{"typeParams":["U","V"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Stack","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":2132},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"Stack","args":[{"k":17}]},"line":2133}]},"#zipWith":{"doc":{"synopsis":"Returns a Stack \"zipped\" with the provided collections by using a\ncustom `zipper` function.","description":"```js\nconst a = Stack([ 1, 2, 3 ]);\nconst b = Stack([ 4, 5, 6 ]);\nconst c = a.zipWith((a, b) => a + b, b);\n// Stack [ 5, 7, 9 ]\n```","notes":[]},"signatures":[{"typeParams":["U","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"Z"}]},"line":2146},{"typeParams":["U","V","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}},{"name":"thirdValue","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"thirdCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"Z"}]},"line":2150},{"typeParams":["Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"any","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":8,"param":"Z"}}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"Z"}]},"line":2155}]}}}]}},"Range":{"call":{"doc":{"synopsis":"Returns a Seq.Indexed of numbers from `start` (inclusive) to `end`\n(exclusive), by `step`, where `start` defaults to 0, `step` to 1, and `end` to\ninfinity. When `start` is equal to `end`, returns empty range.","description":"Note: `Range` is a factory function and not a class, and does not use the\n`new` keyword during construction.\n\n```js\nconst { Range } = require('immutable')\nRange() // [ 0, 1, 2, 3, ... ]\nRange(10) // [ 10, 11, 12, 13, ... ]\nRange(10, 15) // [ 10, 11, 12, 13, 14 ]\nRange(10, 30, 5) // [ 10, 15, 20, 25 ]\nRange(30, 10, 5) // [ 30, 25, 20, 15 ]\nRange(30, 30, 5) // []\n```","notes":[]},"signatures":[{"params":[{"name":"start","type":{"k":2},"optional":true},{"name":"end","type":{"k":2},"optional":true},{"name":"step","type":{"k":2},"optional":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":2}]},"line":2180}]}},"Repeat":{"call":{"doc":{"synopsis":"Returns a Seq.Indexed of `value` repeated `times` times. When `times` is\nnot defined, returns an infinite `Seq` of `value`.","description":"Note: `Repeat` is a factory function and not a class, and does not use the\n`new` keyword during construction.\n\n```js\nconst { Repeat } = require('immutable')\nRepeat('foo') // [ 'foo', 'foo', 'foo', ... ]\nRepeat('bar', 4) // [ 'bar', 'bar', 'bar', 'bar' ]\n```","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"times","type":{"k":2},"optional":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"T"}]},"line":2196}]}},"Record":{"doc":{"synopsis":"A record is similar to a JS object, but enforces a specific set of allowed\nstring keys, and has default values.","description":"The `Record()` function produces new Record Factories, which when called\ncreate Record instances.\n\n```js\nconst { Record } = require('immutable')\nconst ABRecord = Record({ a: 1, b: 2 })\nconst myRecord = ABRecord({ b: 3 })\n```\n\nRecords always have a value for the keys they define. `remove`ing a key\nfrom a record simply resets it to the default value for that key.\n\n```js\nmyRecord.size // 2\nmyRecord.get('a') // 1\nmyRecord.get('b') // 3\nconst myRecordWithoutB = myRecord.remove('b')\nmyRecordWithoutB.get('b') // 2\nmyRecordWithoutB.size // 2\n```\n\nValues provided to the constructor not found in the Record type will\nbe ignored. For example, in this case, ABRecord is provided a key \"x\" even\nthough only \"a\" and \"b\" have been defined. The value for \"x\" will be\nignored for this record.\n\n```js\nconst myRecord = ABRecord({ b: 3, x: 10 })\nmyRecord.get('x') // undefined\n```\n\nBecause Records have a known set of string keys, property get access works\nas expected, however property sets will throw an Error.\n\nNote: IE8 does not support property access. Only use `get()` when\nsupporting IE8.\n\n```js\nmyRecord.b // 3\nmyRecord.b = 5 // throws Error\n```\n\nRecord Types can be extended as well, allowing for custom methods on your\nRecord. This is not a common pattern in functional environments, but is in\nmany JS programs.\n\nHowever Record Types are more restricted than typical JavaScript classes.\nThey do not use a class constructor, which also means they cannot use\nclass properties (since those are technically part of a constructor).\n\nWhile Record Types can be syntactically created with the JavaScript `class`\nform, the resulting Record function is actually a factory function, not a\nclass constructor. Even though Record Types are not classes, JavaScript\ncurrently requires the use of `new` when creating new Record instances if\nthey are defined as a `class`.\n\n```\nclass ABRecord extends Record({ a: 1, b: 2 }) {\n  getAB() {\n    return this.a + this.b;\n  }\n}\n\nvar myRecord = new ABRecord({b: 3})\nmyRecord.getAB() // 4\n```\n\n\n**Flow Typing Records:**\n\nImmutable.js exports two Flow types designed to make it easier to use\nRecords with flow typed code, `RecordOf<TProps>` and `RecordFactory<TProps>`.\n\nWhen defining a new kind of Record factory function, use a flow type that\ndescribes the values the record contains along with `RecordFactory<TProps>`.\nTo type instances of the Record (which the factory function returns),\nuse `RecordOf<TProps>`.\n\nTypically, new Record definitions will export both the Record factory\nfunction as well as the Record instance type for use in other code.\n\n```js\nimport type { RecordFactory, RecordOf } from 'immutable';\n\n// Use RecordFactory<TProps> for defining new Record factory functions.\ntype Point3DProps = { x: number, y: number, z: number };\nconst defaultValues: Point3DProps = { x: 0, y: 0, z: 0 };\nconst makePoint3D: RecordFactory<Point3DProps> = Record(defaultValues);\nexport makePoint3D;\n\n// Use RecordOf<T> for defining new instances of that Record.\nexport type Point3D = RecordOf<Point3DProps>;\nconst some3DPoint: Point3D = makePoint3D({ x: 10, y: 20, z: 30 });\n```\n\n**Flow Typing Record Subclasses:**\n\nRecords can be subclassed as a means to add additional methods to Record\ninstances. This is generally discouraged in favor of a more functional API,\nsince Subclasses have some minor overhead. However the ability to create\na rich API on Record types can be quite valuable.\n\nWhen using Flow to type Subclasses, do not use `RecordFactory<TProps>`,\ninstead apply the props type when subclassing:\n\n```js\ntype PersonProps = {name: string, age: number};\nconst defaultValues: PersonProps = {name: 'Aristotle', age: 2400};\nconst PersonRecord = Record(defaultValues);\nclass Person extends PersonRecord<PersonProps> {\n  getName(): string {\n    return this.get('name')\n  }\n\n  setName(name: string): this {\n    return this.set('name', name);\n  }\n}\n```\n\n**Choosing Records vs plain JavaScript objects**\n\nRecords offer a persistently immutable alternative to plain JavaScript\nobjects, however they're not required to be used within Immutable.js\ncollections. In fact, the deep-access and deep-updating functions\nlike `getIn()` and `setIn()` work with plain JavaScript Objects as well.\n\nDeciding to use Records or Objects in your application should be informed\nby the tradeoffs and relative benefits of each:\n\n- *Runtime immutability*: plain JS objects may be carefully treated as\n  immutable, however Record instances will *throw* if attempted to be\n  mutated directly. Records provide this additional guarantee, however at\n  some marginal runtime cost. While JS objects are mutable by nature, the\n  use of type-checking tools like [Flow](https://medium.com/@gcanti/immutability-with-flow-faa050a1aef4)\n  can help gain confidence in code written to favor immutability.\n\n- *Value equality*: Records use value equality when compared with `is()`\n  or `record.equals()`. That is, two Records with the same keys and values\n  are equal. Plain objects use *reference equality*. Two objects with the\n  same keys and values are not equal since they are different objects.\n  This is important to consider when using objects as keys in a `Map` or\n  values in a `Set`, which use equality when retrieving values.\n\n- *API methods*: Records have a full featured API, with methods like\n  `.getIn()`, and `.equals()`. These can make working with these values\n  easier, but comes at the cost of not allowing keys with those names.\n\n- *Default values*: Records provide default values for every key, which\n  can be useful when constructing Records with often unchanging values.\n  However default values can make using Flow and TypeScript more laborious.\n\n- *Serialization*: Records use a custom internal representation to\n  efficiently store and update their values. Converting to and from this\n  form isn't free. If converting Records to plain objects is common,\n  consider sticking with plain objects to begin with.","notes":[]},"module":{"isRecord":{"call":{"doc":{"synopsis":"True if `maybeRecord` is an instance of a Record.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeRecord","type":{"k":17}}],"type":{"k":1},"line":2365}]}},"getDescriptiveName":{"call":{"doc":{"synopsis":"Records allow passing a second parameter to supply a descriptive name\nthat appears when converting a Record to a string or in any error\nmessages. A descriptive name for any record can be accessed by using this\nmethod. If one was not provided, the string \"Record\" is returned.","description":"```js\nconst { Record } = require('immutable')\nconst Person = Record({\n  name: null\n}, 'Person')\n\nvar me = Person({ name: 'My Name' })\nme.toString() // \"Person { \"name\": \"My Name\" }\"\nRecord.getDescriptiveName(me) // \"Person\"\n```","notes":[]},"signatures":[{"params":[{"name":"record","type":{"k":9,"name":"Record","args":[{"k":0}]}}],"type":{"k":3},"line":2384}]}},"Factory":{"doc":{"synopsis":"A Record.Factory is created by the `Record()` function. Record instances\nare created by passing it some of the accepted values for that Record\ntype:","description":"<!-- runkit:activate\n     { \"preamble\": \"const { Record } = require('immutable')\" }\n-->\n```js\n// makePerson is a Record Factory function\nconst makePerson = Record({ name: null, favoriteColor: 'unknown' });\n\n// alan is a Record instance\nconst alan = makePerson({ name: 'Alan' });\n```\n\nNote that Record Factories return `Record<TProps> & Readonly<TProps>`,\nthis allows use of both the Record instance API, and direct property\naccess on the resulting instances:\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Record } = require('immutable');const makePerson = Record({ name: null, favoriteColor: 'unknown' });const alan = makePerson({ name: 'Alan' });\" }\n-->\n```js\n// Use the Record API\nconsole.log('Record API: ' + alan.get('name'))\n\n// Or direct property access (Readonly)\nconsole.log('property access: ' + alan.name)\n```\n\n**Flow Typing Records:**\n\nUse the `RecordFactory<TProps>` Flow type to get high quality type checking of\nRecords:\n\n```js\nimport type { RecordFactory, RecordOf } from 'immutable';\n\n// Use RecordFactory<TProps> for defining new Record factory functions.\ntype PersonProps = { name: ?string, favoriteColor: string };\nconst makePerson: RecordFactory<PersonProps> = Record({ name: null, favoriteColor: 'unknown' });\n\n// Use RecordOf<T> for defining new instances of that Record.\ntype Person = RecordOf<PersonProps>;\nconst alan: Person = makePerson({ name: 'Alan' });\n```","notes":[]},"module":{},"interface":{"line":2436,"typeParams":["TProps"],"groups":[{"members":{"#displayName":{"line":2444}}}]},"call":{"signatures":[{"typeParams":["TProps"],"params":[{"name":"values","type":{"k":12,"types":[{"k":9,"name":"Partial","args":[{"k":8,"param":"TProps"}]},{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":3},{"k":17}]}]}]},"optional":true}],"type":{"k":13,"types":[{"k":9,"name":"Record","args":[{"k":8,"param":"TProps"}]},{"k":9,"name":"Readonly","args":[{"k":8,"param":"TProps"}]}]},"line":2447}]}}},"call":{"doc":{"synopsis":"Unlike other types in Immutable.js, the `Record()` function creates a new\nRecord Factory, which is a function that creates Record instances.","description":"See above for examples of using `Record()`.\n\nNote: `Record` is a factory function and not a class, and does not use the\n`new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["TProps"],"params":[{"name":"defaultValues","type":{"k":8,"param":"TProps"}},{"name":"name","type":{"k":3},"optional":true}],"type":{"k":9,"name":"Record.Factory","args":[{"k":8,"param":"TProps"}]},"line":2459}]},"interface":{"line":2461,"typeParams":["TProps"],"groups":[{"title":"Reading values","members":{"#has":{"signatures":[{"params":[{"name":"key","type":{"k":3}}],"type":{"k":1},"line":2465}]},"#get":{"doc":{"synopsis":"Returns the value associated with the provided key, which may be the\ndefault value defined when creating the Record factory function.","description":"If the requested key is not defined by this Record type, then\nnotSetValue will be returned if provided. Note that this scenario would\nproduce an error when using Flow or TypeScript.","notes":[]},"signatures":[{"typeParams":["K"],"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":17},"optional":true}],"type":{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}},"line":2475},{"typeParams":["T"],"params":[{"name":"key","type":{"k":3}},{"name":"notSetValue","type":{"k":8,"param":"T"}}],"type":{"k":8,"param":"T"},"line":2476}]}}},{"title":"Reading deep values","members":{"#hasIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}}],"type":{"k":1},"line":2480}]},"#getIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}}],"type":{"k":17},"line":2481}]}}},{"title":"Value equality","members":{"#equals":{"signatures":[{"params":[{"name":"other","type":{"k":17}}],"type":{"k":1},"line":2485}]},"#hashCode":{"signatures":[{"type":{"k":2},"line":2486}]}}},{"title":"Persistent changes","members":{"#set":{"signatures":[{"typeParams":["K"],"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}}}],"type":{"k":10},"line":2490}]},"#update":{"signatures":[{"typeParams":["K"],"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}}}],"type":{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}}}}],"type":{"k":10},"line":2491}]},"#merge":{"signatures":[{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Partial","args":[{"k":8,"param":"TProps"}]},{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":3},{"k":17}]}]}]}]},"varArgs":true}],"type":{"k":10},"line":2492}]},"#mergeDeep":{"signatures":[{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Partial","args":[{"k":8,"param":"TProps"}]},{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":3},{"k":17}]}]}]}]},"varArgs":true}],"type":{"k":10},"line":2493}]},"#mergeWith":{"signatures":[{"params":[{"name":"merger","type":{"k":7,"params":[{"name":"oldVal","type":{"k":17}},{"name":"newVal","type":{"k":17}},{"name":"key","type":{"k":16,"operator":"keyof","type":{"k":8,"param":"TProps"}}}],"type":{"k":17}}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Partial","args":[{"k":8,"param":"TProps"}]},{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":3},{"k":17}]}]}]}]},"varArgs":true}],"type":{"k":10},"line":2495}]},"#mergeDeepWith":{"signatures":[{"params":[{"name":"merger","type":{"k":7,"params":[{"name":"oldVal","type":{"k":17}},{"name":"newVal","type":{"k":17}},{"name":"key","type":{"k":17}}],"type":{"k":17}}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Partial","args":[{"k":8,"param":"TProps"}]},{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":3},{"k":17}]}]}]}]},"varArgs":true}],"type":{"k":10},"line":2499}]},"#delete":{"doc":{"synopsis":"Returns a new instance of this Record type with the value for the\nspecific key set to its default value.\n","description":"","notes":[{"name":"alias","body":"remove"}]},"signatures":[{"typeParams":["K"],"params":[{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":10},"line":2510}]},"#clear":{"doc":{"synopsis":"Returns a new instance of this Record type with all values set\nto their default values.","description":"","notes":[]},"signatures":[{"type":{"k":10},"line":2517}]}}},{"title":"Deep persistent changes","members":{"#setIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"value","type":{"k":17}}],"type":{"k":10},"line":2521}]},"#updateIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":17}}],"type":{"k":17}}}],"type":{"k":10},"line":2522}]},"#mergeIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":10},"line":2523}]},"#mergeDeepIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":10},"line":2524}]},"#deleteIn":{"doc":{"synopsis":"","description":"","notes":[{"name":"alias","body":"removeIn"}]},"signatures":[{"params":[{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}}],"type":{"k":10},"line":2529}]}}},{"title":"Conversion to JavaScript types","members":{"#toJS":{"doc":{"synopsis":"Deeply converts this Record to equivalent native JavaScript Object.","description":"Note: This method may not be overridden. Objects with custom\nserialization to plain JS may override toJSON() instead.","notes":[]},"signatures":[{"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]},"line":2540}]},"#toJSON":{"doc":{"synopsis":"Shallowly converts this Record to equivalent native JavaScript Object.","description":"","notes":[]},"signatures":[{"type":{"k":8,"param":"TProps"},"line":2545}]},"#toObject":{"doc":{"synopsis":"Shallowly converts this Record to equivalent JavaScript Object.","description":"","notes":[]},"signatures":[{"type":{"k":8,"param":"TProps"},"line":2550}]}}},{"title":"Transient changes","members":{"#withMutations":{"doc":{"synopsis":"Note: Not all methods can be used on a mutable collection or within\n`withMutations`! Only `set` may be used mutatively.\n","description":"","notes":[{"name":"see","body":"`Map#withMutations`"}]},"signatures":[{"params":[{"name":"mutator","type":{"k":7,"params":[{"name":"mutable","type":{"k":10}}],"type":{"k":17}}}],"type":{"k":10},"line":2560}]},"#asMutable":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"`Map#asMutable`"}]},"signatures":[{"type":{"k":10},"line":2565}]},"#wasAltered":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"`Map#wasAltered`"}]},"signatures":[{"type":{"k":1},"line":2570}]},"#asImmutable":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"`Map#asImmutable`"}]},"signatures":[{"type":{"k":10},"line":2575}]}}},{"title":"Sequence algorithms","members":{"#toSeq":{"signatures":[{"type":{"k":9,"name":"Seq.Keyed","args":[{"k":16,"operator":"keyof","type":{"k":8,"param":"TProps"}},{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":16,"operator":"keyof","type":{"k":8,"param":"TProps"}}}]},"line":2579}]},"#[Symbol.iterator]":{"signatures":[{"type":{"k":9,"name":"IterableIterator","args":[{"k":14,"types":[{"k":16,"operator":"keyof","type":{"k":8,"param":"TProps"}},{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":16,"operator":"keyof","type":{"k":8,"param":"TProps"}}}]}]},"line":2581}]}}}]}},"Seq":{"doc":{"synopsis":"`Seq` describes a lazy operation, allowing them to efficiently chain\nuse of all the higher-order collection methods (such as `map` and `filter`)\nby not creating intermediate collections.","description":"**Seq is immutable** — Once a Seq is created, it cannot be\nchanged, appended to, rearranged or otherwise modified. Instead, any\nmutative method called on a `Seq` will return a new `Seq`.\n\n**Seq is lazy** — `Seq` does as little work as necessary to respond to any\nmethod call. Values are often created during iteration, including implicit\niteration when reducing or converting to a concrete data structure such as\na `List` or JavaScript `Array`.\n\nFor example, the following performs no work, because the resulting\n`Seq`'s values are never iterated:\n\n```js\nconst { Seq } = require('immutable')\nconst oddSquares = Seq([ 1, 2, 3, 4, 5, 6, 7, 8 ])\n  .filter(x => x % 2 !== 0)\n  .map(x => x * x)\n```\n\nOnce the `Seq` is used, it performs only the work necessary. In this\nexample, no intermediate arrays are ever created, filter is called three\ntimes, and map is only called once:\n\n```js\noddSquares.get(1); // 9\n```\n\nAny collection can be converted to a lazy Seq with `Seq()`.\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nconst map = Map({ a: 1, b: 2, c: 3 })\nconst lazySeq = Seq(map)\n```\n\n`Seq` allows for the efficient chaining of operations, allowing for the\nexpression of logic that can otherwise be very tedious:\n\n```js\nlazySeq\n  .flip()\n  .map(key => key.toUpperCase())\n  .flip()\n// Seq { A: 1, B: 1, C: 1 }\n```\n\nAs well as expressing logic that would otherwise seem memory or time\nlimited, for example `Range` is a special kind of Lazy sequence.\n\n<!-- runkit:activate -->\n```js\nconst { Range } = require('immutable')\nRange(1, Infinity)\n  .skip(1000)\n  .map(n => -n)\n  .filter(n => n % 2 === 0)\n  .take(2)\n  .reduce((r, n) => r * n, 1)\n// 1006008\n```\n\nSeq is often used to provide a rich collection API to JavaScript Object.\n\n```js\nSeq({ x: 0, y: 1, z: 2 }).map(v => v * 2).toObject();\n// { x: 0, y: 2, z: 4 }\n```","notes":[]},"module":{"isSeq":{"call":{"doc":{"synopsis":"True if `maybeSeq` is a Seq, it is not backed by a concrete\nstructure such as Map, List, or Set.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeSeq","type":{"k":17}}],"type":{"k":1},"line":2673}]}},"Keyed":{"doc":{"synopsis":"`Seq` which represents key-value pairs.","description":"","notes":[]},"module":{},"call":{"doc":{"synopsis":"Always returns a Seq.Keyed, if input is not keyed, expects an\ncollection of [K, V] tuples.","description":"Note: `Seq.Keyed` is a conversion function and not a class, and does not\nuse the `new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["K","V"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]}}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":2688},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":3},{"k":8,"param":"V"}]},"line":2689},{"typeParams":["K","V"],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":2690},{"type":{"k":9,"name":"Seq.Keyed","args":[{"k":17},{"k":17}]},"line":2691}]},"interface":{"line":2693,"typeParams":["K","V"],"extends":[{"k":9,"name":"Seq","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}],"groups":[{"members":{"#toJS":{"doc":{"synopsis":"Deeply converts this Keyed Seq to equivalent native JavaScript Object.","description":"Converts keys to Strings.","notes":[]},"signatures":[{"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]},"line":2699}]},"#toJSON":{"doc":{"synopsis":"Shallowly converts this Keyed Seq to equivalent native JavaScript Object.","description":"Converts keys to Strings.","notes":[]},"signatures":[{"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]},"line":2706}]},"#toArray":{"doc":{"synopsis":"Shallowly converts this collection to an Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]},"line":2711}]},"#toSeq":{"doc":{"synopsis":"Returns itself","description":"","notes":[]},"signatures":[{"type":{"k":10},"line":2716}]},"#concat":{"doc":{"synopsis":"Returns a new Seq with other collections concatenated to this one.","description":"All entries will be present in the resulting Seq, even if they\nhave the same key.","notes":[]},"signatures":[{"typeParams":["KC","VC"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"KC"},{"k":8,"param":"VC"}]}]}]},"varArgs":true}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":12,"types":[{"k":8,"param":"K"},{"k":8,"param":"KC"}]},{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"VC"}]}]},"line":2724},{"typeParams":["C"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"C"}}]}]},"varArgs":true}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":12,"types":[{"k":8,"param":"K"},{"k":3}]},{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"C"}]}]},"line":2725}]},"#map":{"doc":{"synopsis":"Returns a new Seq.Keyed with values passed through a\n`mapper` function.","description":"```js\nconst { Seq } = require('immutable')\nSeq.Keyed({ a: 1, b: 2 }).map(x => 10 * x)\n// Seq { \"a\": 10, \"b\": 20 }\n```\n\nNote: `map()` always returns a new instance, even if it produced the\nsame value at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"M"}]},"line":2740}]},"#mapKeys":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"Collection.Keyed.mapKeys"}]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":8,"param":"V"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"M"},{"k":8,"param":"V"}]},"line":2748}]},"#mapEntries":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"Collection.Keyed.mapEntries"}]},"signatures":[{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"entry","type":{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":14,"types":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]},"line":2756}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Seq, returning a Seq of the same type.","description":"Similar to `seq.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]},"line":2766}]},"#filter":{"doc":{"synopsis":"Returns a new Seq with only the entries for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"F"}]},"line":2778},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":2782}]},"#flip":{"doc":{"synopsis":"","description":"","notes":[{"name":"see","body":"Collection.Keyed.flip"}]},"signatures":[{"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"V"},{"k":8,"param":"K"}]},"line":2790}]}}}]}},"Indexed":{"doc":{"synopsis":"`Seq` which represents an ordered indexed list of values.","description":"","notes":[]},"module":{"of":{"call":{"doc":{"synopsis":"Provides an Seq.Indexed of the values provided.","description":"","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"T"}]},"line":2802}]}}},"call":{"doc":{"synopsis":"Always returns Seq.Indexed, discarding associated keys and\nsupplying incrementing indices.","description":"Note: `Seq.Indexed` is a conversion function and not a class, and does\nnot use the `new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"T"}]},"line":2812},{"typeParams":["T"],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"T"}]},"line":2813},{"type":{"k":9,"name":"Seq.Indexed","args":[{"k":17}]},"line":2814}]},"interface":{"line":2816,"typeParams":["T"],"extends":[{"k":9,"name":"Seq","args":[{"k":2},{"k":8,"param":"T"}]},{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"T"}]}],"groups":[{"members":{"#toJS":{"doc":{"synopsis":"Deeply converts this Indexed Seq to equivalent native JavaScript Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":17}]},"line":2820}]},"#toJSON":{"doc":{"synopsis":"Shallowly converts this Indexed Seq to equivalent native JavaScript Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"line":2825}]},"#toArray":{"doc":{"synopsis":"Shallowly converts this collection to an Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"line":2830}]},"#toSeq":{"doc":{"synopsis":"Returns itself","description":"","notes":[]},"signatures":[{"type":{"k":10},"line":2835}]},"#concat":{"doc":{"synopsis":"Returns a new Seq with other collections concatenated to this one.","description":"","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"valuesOrCollections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"C"}]},{"k":8,"param":"C"}]}]},"varArgs":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":12,"types":[{"k":8,"param":"T"},{"k":8,"param":"C"}]}]},"line":2840}]},"#map":{"doc":{"synopsis":"Returns a new Seq.Indexed with values passed through a\n`mapper` function.","description":"```js\nconst { Seq } = require('immutable')\nSeq.Indexed([ 1, 2 ]).map(x => 10 * x)\n// Seq [ 10, 20 ]\n```\n\nNote: `map()` always returns a new instance, even if it produced the\nsame value at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"M"}]},"line":2855}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Seq, returning a a Seq of the same type.","description":"Similar to `seq.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"M"}]},"line":2865}]},"#filter":{"doc":{"synopsis":"Returns a new Seq with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"F"}]},"line":2877},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":2881}]},"#zip":{"doc":{"synopsis":"Returns a Seq \"zipped\" with the provided collections.","description":"Like `zipWith`, but using the default `zipper`: creating an `Array`.\n\n```js\nconst a = Seq([ 1, 2, 3 ]);\nconst b = Seq([ 4, 5, 6 ]);\nconst c = a.zip(b); // Seq [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]\n```","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":2897},{"typeParams":["U","V"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":2898},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":17}]},"line":2899}]},"#zipAll":{"doc":{"synopsis":"Returns a Seq \"zipped\" with the provided collections.","description":"Unlike `zip`, `zipAll` continues zipping until the longest collection is\nexhausted. Missing values from shorter collections are filled with `undefined`.\n\n```js\nconst a = Seq([ 1, 2 ]);\nconst b = Seq([ 3, 4, 5 ]);\nconst c = a.zipAll(b); // Seq [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]\n```","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":2913},{"typeParams":["U","V"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":2914},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":17}]},"line":2915}]},"#zipWith":{"doc":{"synopsis":"Returns a Seq \"zipped\" with the provided collections by using a\ncustom `zipper` function.","description":"```js\nconst a = Seq([ 1, 2, 3 ]);\nconst b = Seq([ 4, 5, 6 ]);\nconst c = a.zipWith((a, b) => a + b, b);\n// Seq [ 5, 7, 9 ]\n```","notes":[]},"signatures":[{"typeParams":["U","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"Z"}]},"line":2928},{"typeParams":["U","V","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}},{"name":"thirdValue","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"thirdCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"Z"}]},"line":2932},{"typeParams":["Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"any","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":8,"param":"Z"}}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"Z"}]},"line":2937}]}}}]}},"Set":{"doc":{"synopsis":"`Seq` which represents a set of values.","description":"Because `Seq` are often lazy, `Seq.Set` does not provide the same guarantee\nof value uniqueness as the concrete `Set`.","notes":[]},"module":{"of":{"call":{"doc":{"synopsis":"Returns a Seq.Set of the provided values","description":"","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":9,"name":"Seq.Set","args":[{"k":8,"param":"T"}]},"line":2955}]}}},"call":{"doc":{"synopsis":"Always returns a Seq.Set, discarding associated indices or keys.","description":"Note: `Seq.Set` is a conversion function and not a class, and does not\nuse the `new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Seq.Set","args":[{"k":8,"param":"T"}]},"line":2964},{"typeParams":["T"],"type":{"k":9,"name":"Seq.Set","args":[{"k":8,"param":"T"}]},"line":2965},{"type":{"k":9,"name":"Seq.Set","args":[{"k":17}]},"line":2966}]},"interface":{"line":2968,"typeParams":["T"],"extends":[{"k":9,"name":"Seq","args":[{"k":8,"param":"T"},{"k":8,"param":"T"}]},{"k":9,"name":"Collection.Set","args":[{"k":8,"param":"T"}]}],"groups":[{"members":{"#toJS":{"doc":{"synopsis":"Deeply converts this Set Seq to equivalent native JavaScript Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":17}]},"line":2972}]},"#toJSON":{"doc":{"synopsis":"Shallowly converts this Set Seq to equivalent native JavaScript Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"line":2977}]},"#toArray":{"doc":{"synopsis":"Shallowly converts this collection to an Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"line":2982}]},"#toSeq":{"doc":{"synopsis":"Returns itself","description":"","notes":[]},"signatures":[{"type":{"k":10},"line":2987}]},"#concat":{"doc":{"synopsis":"Returns a new Seq with other collections concatenated to this one.","description":"All entries will be present in the resulting Seq, even if they\nare duplicates.","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"U"}]}]},"varArgs":true}],"type":{"k":9,"name":"Seq.Set","args":[{"k":12,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":2995}]},"#map":{"doc":{"synopsis":"Returns a new Seq.Set with values passed through a\n`mapper` function.","description":"```js\nSeq.Set([ 1, 2 ]).map(x => 10 * x)\n// Seq { 10, 20 }\n```\n\nNote: `map()` always returns a new instance, even if it produced the\nsame value at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Set","args":[{"k":8,"param":"M"}]},"line":3009}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Seq, returning a Seq of the same type.","description":"Similar to `seq.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Set","args":[{"k":8,"param":"M"}]},"line":3019}]},"#filter":{"doc":{"synopsis":"Returns a new Seq with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Set","args":[{"k":8,"param":"F"}]},"line":3031},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":3035}]}}}]}}},"call":{"doc":{"synopsis":"Creates a Seq.","description":"Returns a particular kind of `Seq` based on the input.\n\n  * If a `Seq`, that same `Seq`.\n  * If an `Collection`, a `Seq` of the same kind (Keyed, Indexed, or Set).\n  * If an Array-like, an `Seq.Indexed`.\n  * If an Iterable Object, an `Seq.Indexed`.\n  * If an Object, a `Seq.Keyed`.\n\nNote: An Iterator itself will be treated as an object, becoming a `Seq.Keyed`,\nwhich is usually not what you want. You should turn your Iterator Object into\nan iterable object by defining a Symbol.iterator (or @@iterator) method which\nreturns `this`.\n\nNote: `Seq` is a conversion function and not a class, and does not use the\n`new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["S"],"params":[{"name":"seq","type":{"k":8,"param":"S"}}],"type":{"k":8,"param":"S"},"line":3062},{"typeParams":["K","V"],"params":[{"name":"collection","type":{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":3063},{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"T"}]},"line":3064},{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Collection.Set","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Seq.Set","args":[{"k":8,"param":"T"}]},"line":3065},{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"T"}]},"line":3066},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":3},{"k":8,"param":"V"}]},"line":3067},{"type":{"k":9,"name":"Seq","args":[{"k":17},{"k":17}]},"line":3068}]},"interface":{"line":3070,"typeParams":["K","V"],"extends":[{"k":9,"name":"Collection","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}],"groups":[{"members":{"#size":{"line":3082}}},{"title":"Force evaluation","members":{"#cacheResult":{"doc":{"synopsis":"Because Sequences are lazy and designed to be chained together, they do\nnot cache their results. For example, this map function is called a total\nof 6 times, as each `join` iterates the Seq of three values.","description":"    var squares = Seq([ 1, 2, 3 ]).map(x => x * x)\n    squares.join() + squares.join()\n\nIf you know a `Seq` will be used multiple times, it may be more\nefficient to first cache it in memory. Here, the map function is called\nonly 3 times.\n\n    var squares = Seq([ 1, 2, 3 ]).map(x => x * x).cacheResult()\n    squares.join() + squares.join()\n\nUse this method judiciously, as it must fully evaluate a Seq which can be\na burden on memory and possibly performance.\n\nNote: after calling `cacheResult`, a Seq will always have a `size`.","notes":[]},"signatures":[{"type":{"k":10},"line":3107}]}}},{"title":"Sequence algorithms","members":{"#map":{"doc":{"synopsis":"Returns a new Seq with values passed through a\n`mapper` function.","description":"```js\nconst { Seq } = require('immutable')\nSeq([ 1, 2 ]).map(x => 10 * x)\n// Seq [ 10, 20 ]\n```\n\nNote: `map()` always returns a new instance, even if it produced the same\nvalue at every step.\nNote: used only for sets.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq","args":[{"k":8,"param":"K"},{"k":8,"param":"M"}]},"line":3124},{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq","args":[{"k":8,"param":"M"},{"k":8,"param":"M"}]},"line":3143}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Seq, returning a Seq of the same type.","description":"Similar to `seq.map(...).flatten(true)`.\nNote: Used only for sets.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq","args":[{"k":8,"param":"K"},{"k":8,"param":"M"}]},"line":3153},{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq","args":[{"k":8,"param":"M"},{"k":8,"param":"M"}]},"line":3164}]},"#filter":{"doc":{"synopsis":"Returns a new Seq with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq","args":[{"k":8,"param":"K"},{"k":8,"param":"F"}]},"line":3176},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":3180}]}}}]}},"Collection":{"doc":{"synopsis":"The `Collection` is a set of (key, value) entries which can be iterated, and\nis the base class for all collections in `immutable`, allowing them to\nmake use of all the Collection methods (such as `map` and `filter`).","description":"Note: A collection is always iterated in the same order, however that order\nmay not always be well defined, as is the case for the `Map` and `Set`.\n\nCollection is the abstract base class for concrete data structures. It\ncannot be constructed directly.\n\nImplementations should extend one of the subclasses, `Collection.Keyed`,\n`Collection.Indexed`, or `Collection.Set`.","notes":[]},"module":{"Keyed":{"doc":{"synopsis":"Keyed Collections have discrete keys tied to each value.","description":"When iterating `Collection.Keyed`, each iteration will yield a `[K, V]`\ntuple, in other words, `Collection#entries` is the default iterator for\nKeyed Collections.","notes":[]},"module":{},"call":{"doc":{"synopsis":"Creates a Collection.Keyed","description":"Similar to `Collection()`, however it expects collection-likes of [K, V]\ntuples if not constructed from a Collection.Keyed or JS Object.\n\nNote: `Collection.Keyed` is a conversion function and not a class, and\ndoes not use the `new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["K","V"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]}}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":3241},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":3},{"k":8,"param":"V"}]},"line":3242}]},"interface":{"line":3244,"typeParams":["K","V"],"extends":[{"k":9,"name":"Collection","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}],"groups":[{"members":{"#toJS":{"doc":{"synopsis":"Deeply converts this Keyed collection to equivalent native JavaScript Object.","description":"Converts keys to Strings.","notes":[]},"signatures":[{"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]},"line":3250}]},"#toJSON":{"doc":{"synopsis":"Shallowly converts this Keyed collection to equivalent native JavaScript Object.","description":"Converts keys to Strings.","notes":[]},"signatures":[{"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]},"line":3257}]},"#toArray":{"doc":{"synopsis":"Shallowly converts this collection to an Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]},"line":3262}]},"#toSeq":{"doc":{"synopsis":"Returns Seq.Keyed.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":3268}]}}},{"title":"Sequence functions","members":{"#flip":{"doc":{"synopsis":"Returns a new Collection.Keyed of the same type where the keys and values\nhave been flipped.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nMap({ a: 'z', b: 'y' }).flip()\n// Map { \"z\": \"a\", \"y\": \"b\" }\n```","notes":[]},"signatures":[{"type":{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"V"},{"k":8,"param":"K"}]},"line":3284}]},"#concat":{"doc":{"synopsis":"Returns a new Collection with other collections concatenated to this one.","description":"","notes":[]},"signatures":[{"typeParams":["KC","VC"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"KC"},{"k":8,"param":"VC"}]}]}]},"varArgs":true}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":12,"types":[{"k":8,"param":"K"},{"k":8,"param":"KC"}]},{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"VC"}]}]},"line":3289},{"typeParams":["C"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"C"}}]}]},"varArgs":true}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":12,"types":[{"k":8,"param":"K"},{"k":3}]},{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"C"}]}]},"line":3290}]},"#map":{"doc":{"synopsis":"Returns a new Collection.Keyed with values passed through a\n`mapper` function.","description":"```js\nconst { Collection } = require('immutable')\nCollection.Keyed({ a: 1, b: 2 }).map(x => 10 * x)\n// Seq { \"a\": 10, \"b\": 20 }\n```\n\nNote: `map()` always returns a new instance, even if it produced the\nsame value at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"M"}]},"line":3305}]},"#mapKeys":{"doc":{"synopsis":"Returns a new Collection.Keyed of the same type with keys passed through\na `mapper` function.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nMap({ a: 1, b: 2 }).mapKeys(x => x.toUpperCase())\n// Map { \"A\": 1, \"B\": 2 }\n```\n\nNote: `mapKeys()` always returns a new instance, even if it produced\nthe same key at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":8,"param":"V"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"M"},{"k":8,"param":"V"}]},"line":3324}]},"#mapEntries":{"doc":{"synopsis":"Returns a new Collection.Keyed of the same type with entries\n([key, value] tuples) passed through a `mapper` function.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nMap({ a: 1, b: 2 })\n  .mapEntries(([ k, v ]) => [ k.toUpperCase(), v * 2 ])\n// Map { \"A\": 2, \"B\": 4 }\n```\n\nNote: `mapEntries()` always returns a new instance, even if it produced\nthe same entry at every step.","notes":[]},"signatures":[{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"entry","type":{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":14,"types":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]},"line":3344}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Collection, returning a Collection of the same type.","description":"Similar to `collection.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]},"line":3354}]},"#filter":{"doc":{"synopsis":"Returns a new Collection with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"F"}]},"line":3366},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":3370}]},"#[Symbol.iterator]":{"signatures":[{"type":{"k":9,"name":"IterableIterator","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]},"line":3375}]}}}]}},"Indexed":{"doc":{"synopsis":"Indexed Collections have incrementing numeric keys. They exhibit\nslightly different behavior than `Collection.Keyed` for some methods in order\nto better mirror the behavior of JavaScript's `Array`, and add methods\nwhich do not make sense on non-indexed Collections such as `indexOf`.","description":"Unlike JavaScript arrays, `Collection.Indexed`s are always dense. \"Unset\"\nindices and `undefined` indices are indistinguishable, and all indices from\n0 to `size` are visited when iterated.\n\nAll Collection.Indexed methods return re-indexed Collections. In other words,\nindices always start at 0 and increment until size. If you wish to\npreserve indices, using them as keys, convert to a Collection.Keyed by\ncalling `toKeyedSeq`.","notes":[]},"module":{},"call":{"doc":{"synopsis":"Creates a new Collection.Indexed.","description":"Note: `Collection.Indexed` is a conversion function and not a class, and\ndoes not use the `new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"T"}]},"line":3402}]},"interface":{"line":3404,"typeParams":["T"],"extends":[{"k":9,"name":"Collection","args":[{"k":2},{"k":8,"param":"T"}]}],"groups":[{"members":{"#toJS":{"doc":{"synopsis":"Deeply converts this Indexed collection to equivalent native JavaScript Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":17}]},"line":3408}]},"#toJSON":{"doc":{"synopsis":"Shallowly converts this Indexed collection to equivalent native JavaScript Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"line":3413}]},"#toArray":{"doc":{"synopsis":"Shallowly converts this collection to an Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"line":3418}]}}},{"title":"Reading values","members":{"#get":{"doc":{"synopsis":"Returns the value associated with the provided index, or notSetValue if\nthe index is beyond the bounds of the Collection.","description":"`index` may be a negative number, which indexes back from the end of the\nCollection. `s.get(-1)` gets the last item in the Collection.","notes":[]},"signatures":[{"typeParams":["NSV"],"params":[{"name":"index","type":{"k":2}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}}],"type":{"k":12,"types":[{"k":8,"param":"T"},{"k":8,"param":"NSV"}]},"line":3429},{"params":[{"name":"index","type":{"k":2}}],"type":{"k":12,"types":[{"k":8,"param":"T"},{"k":11}]},"line":3430}]}}},{"title":"Conversion to Seq","members":{"#toSeq":{"doc":{"synopsis":"Returns Seq.Indexed.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"T"}]},"line":3439}]},"#fromEntrySeq":{"doc":{"synopsis":"If this is a collection of [key, value] entry tuples, it will return a\nSeq.Keyed of those entries.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Keyed","args":[{"k":17},{"k":17}]},"line":3445}]}}},{"title":"Combination","members":{"#interpose":{"doc":{"synopsis":"Returns a Collection of the same type with `separator` between each item\nin this Collection.","description":"","notes":[]},"signatures":[{"params":[{"name":"separator","type":{"k":8,"param":"T"}}],"type":{"k":10},"line":3454}]},"#interleave":{"doc":{"synopsis":"Returns a Collection of the same type with the provided `collections`\ninterleaved into this collection.","description":"The resulting Collection includes the first item from each, then the\nsecond from each, etc.\n\n<!-- runkit:activate\n     { \"preamble\": \"require('immutable')\"}\n-->\n```js\nconst { List } = require('immutable')\nList([ 1, 2, 3 ]).interleave(List([ 'A', 'B', 'C' ]))\n// List [ 1, \"A\", 2, \"B\", 3, \"C\" ]\n```\n\nThe shortest Collection stops interleave.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable')\" }\n-->\n```js\nList([ 1, 2, 3 ]).interleave(\n  List([ 'A', 'B' ]),\n  List([ 'X', 'Y', 'Z' ])\n)\n// List [ 1, \"A\", \"X\", 2, \"B\", \"Y\" ]\n```\n\nSince `interleave()` re-indexes values, it produces a complete copy,\nwhich has `O(N)` complexity.\n\nNote: `interleave` *cannot* be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"T"}]}]},"varArgs":true}],"type":{"k":10},"line":3490}]},"#splice":{"doc":{"synopsis":"Splice returns a new indexed Collection by replacing a region of this\nCollection with new values. If values are not provided, it only skips the\nregion to be removed.","description":"`index` may be a negative number, which indexes back from the end of the\nCollection. `s.splice(-2)` splices after the second to last item.\n\n<!-- runkit:activate -->\n```js\nconst { List } = require('immutable')\nList([ 'a', 'b', 'c', 'd' ]).splice(1, 2, 'q', 'r', 's')\n// List [ \"a\", \"q\", \"r\", \"s\", \"d\" ]\n```\n\nSince `splice()` re-indexes values, it produces a complete copy, which\nhas `O(N)` complexity.\n\nNote: `splice` *cannot* be used in `withMutations`.","notes":[]},"signatures":[{"params":[{"name":"index","type":{"k":2}},{"name":"removeNum","type":{"k":2}},{"name":"values","type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"varArgs":true}],"type":{"k":10},"line":3512}]},"#zip":{"doc":{"synopsis":"Returns a Collection of the same type \"zipped\" with the provided\ncollections.","description":"Like `zipWith`, but using the default `zipper`: creating an `Array`.\n\n\n<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable')\" }\n-->\n```js\nconst a = List([ 1, 2, 3 ]);\nconst b = List([ 4, 5, 6 ]);\nconst c = a.zip(b); // List [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]\n```","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":3534},{"typeParams":["U","V"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":3535},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":17}]},"line":3536}]},"#zipAll":{"doc":{"synopsis":"Returns a Collection \"zipped\" with the provided collections.","description":"Unlike `zip`, `zipAll` continues zipping until the longest collection is\nexhausted. Missing values from shorter collections are filled with `undefined`.\n\n```js\nconst a = List([ 1, 2 ]);\nconst b = List([ 3, 4, 5 ]);\nconst c = a.zipAll(b); // List [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]\n```","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":3550},{"typeParams":["U","V"],"params":[{"name":"other","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"other2","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":14,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"},{"k":8,"param":"V"}]}]},"line":3551},{"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":17}]},"line":3552}]},"#zipWith":{"doc":{"synopsis":"Returns a Collection of the same type \"zipped\" with the provided\ncollections by using a custom `zipper` function.","description":"<!-- runkit:activate\n     { \"preamble\": \"const { List } = require('immutable')\" }\n-->\n```js\nconst a = List([ 1, 2, 3 ]);\nconst b = List([ 4, 5, 6 ]);\nconst c = a.zipWith((a, b) => a + b, b);\n// List [ 5, 7, 9 ]\n```","notes":[]},"signatures":[{"typeParams":["U","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"Z"}]},"line":3568},{"typeParams":["U","V","Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"otherValue","type":{"k":8,"param":"U"}},{"name":"thirdValue","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"Z"}}},{"name":"otherCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"U"}]}},{"name":"thirdCollection","type":{"k":9,"name":"Collection","args":[{"k":17},{"k":8,"param":"V"}]}}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"Z"}]},"line":3572},{"typeParams":["Z"],"params":[{"name":"zipper","type":{"k":7,"params":[{"name":"any","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":8,"param":"Z"}}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]}]},"varArgs":true}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"Z"}]},"line":3577}]}}},{"title":"Search for value","members":{"#indexOf":{"doc":{"synopsis":"Returns the first index at which a given value can be found in the\nCollection, or -1 if it is not present.","description":"","notes":[]},"signatures":[{"params":[{"name":"searchValue","type":{"k":8,"param":"T"}}],"type":{"k":2},"line":3589}]},"#lastIndexOf":{"doc":{"synopsis":"Returns the last index at which a given value can be found in the\nCollection, or -1 if it is not present.","description":"","notes":[]},"signatures":[{"params":[{"name":"searchValue","type":{"k":8,"param":"T"}}],"type":{"k":2},"line":3595}]},"#findIndex":{"doc":{"synopsis":"Returns the first index in the Collection where a value satisfies the\nprovided predicate function. Otherwise -1 is returned.","description":"","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":2},"line":3601}]},"#findLastIndex":{"doc":{"synopsis":"Returns the last index in the Collection where a value satisfies the\nprovided predicate function. Otherwise -1 is returned.","description":"","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":2},"line":3610}]}}},{"title":"Sequence algorithms","members":{"#concat":{"doc":{"synopsis":"Returns a new Collection with other collections concatenated to this one.","description":"","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"valuesOrCollections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"C"}]},{"k":8,"param":"C"}]}]},"varArgs":true}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":12,"types":[{"k":8,"param":"T"},{"k":8,"param":"C"}]}]},"line":3620}]},"#map":{"doc":{"synopsis":"Returns a new Collection.Indexed with values passed through a\n`mapper` function.","description":"```js\nconst { Collection } = require('immutable')\nCollection.Indexed([1,2]).map(x => 10 * x)\n// Seq [ 1, 2 ]\n```\n\nNote: `map()` always returns a new instance, even if it produced the\nsame value at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"M"}]},"line":3635}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Collection, returning a Collection of the same type.","description":"Similar to `collection.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"M"}]},"line":3645}]},"#filter":{"doc":{"synopsis":"Returns a new Collection with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"F"}]},"line":3657},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"index","type":{"k":2}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":3661}]},"#[Symbol.iterator]":{"signatures":[{"type":{"k":9,"name":"IterableIterator","args":[{"k":8,"param":"T"}]},"line":3666}]}}}]}},"Set":{"doc":{"synopsis":"Set Collections only represent values. They have no associated keys or\nindices. Duplicate values are possible in the lazy `Seq.Set`s, however\nthe concrete `Set` Collection does not allow duplicate values.","description":"Collection methods on Collection.Set such as `map` and `forEach` will provide\nthe value as both the first and second arguments to the provided function.\n\n```js\nconst { Collection } = require('immutable')\nconst seq = Collection.Set([ 'A', 'B', 'C' ])\n// Seq { \"A\", \"B\", \"C\" }\nseq.forEach((v, k) =>\n assert.equal(v, k)\n)\n```","notes":[]},"module":{},"call":{"doc":{"synopsis":"Similar to `Collection()`, but always returns a Collection.Set.","description":"Note: `Collection.Set` is a factory function and not a class, and does\nnot use the `new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Collection.Set","args":[{"k":8,"param":"T"}]},"line":3695}]},"interface":{"line":3697,"typeParams":["T"],"extends":[{"k":9,"name":"Collection","args":[{"k":8,"param":"T"},{"k":8,"param":"T"}]}],"groups":[{"members":{"#toJS":{"doc":{"synopsis":"Deeply converts this Set collection to equivalent native JavaScript Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":17}]},"line":3701}]},"#toJSON":{"doc":{"synopsis":"Shallowly converts this Set collection to equivalent native JavaScript Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"line":3706}]},"#toArray":{"doc":{"synopsis":"Shallowly converts this collection to an Array.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Array","args":[{"k":8,"param":"T"}]},"line":3711}]},"#toSeq":{"doc":{"synopsis":"Returns Seq.Set.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Set","args":[{"k":8,"param":"T"}]},"line":3717}]}}},{"title":"Sequence algorithms","members":{"#concat":{"doc":{"synopsis":"Returns a new Collection with other collections concatenated to this one.","description":"","notes":[]},"signatures":[{"typeParams":["U"],"params":[{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":9,"name":"Iterable","args":[{"k":8,"param":"U"}]}]},"varArgs":true}],"type":{"k":9,"name":"Collection.Set","args":[{"k":12,"types":[{"k":8,"param":"T"},{"k":8,"param":"U"}]}]},"line":3724}]},"#map":{"doc":{"synopsis":"Returns a new Collection.Set with values passed through a\n`mapper` function.","description":"```\nCollection.Set([ 1, 2 ]).map(x => 10 * x)\n// Seq { 1, 2 }\n```\n\nNote: `map()` always returns a new instance, even if it produced the\nsame value at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Set","args":[{"k":8,"param":"M"}]},"line":3738}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Collection, returning a Collection of the same type.","description":"Similar to `collection.map(...).flatten(true)`.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Set","args":[{"k":8,"param":"M"}]},"line":3748}]},"#filter":{"doc":{"synopsis":"Returns a new Collection with only the values for which the `predicate`\nfunction returns true.","description":"Note: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection.Set","args":[{"k":8,"param":"F"}]},"line":3760},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"T"}},{"name":"key","type":{"k":8,"param":"T"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":3764}]},"#[Symbol.iterator]":{"signatures":[{"type":{"k":9,"name":"IterableIterator","args":[{"k":8,"param":"T"}]},"line":3769}]}}}]}}},"call":{"doc":{"synopsis":"Creates a Collection.","description":"The type of Collection created is based on the input.\n\n  * If an `Collection`, that same `Collection`.\n  * If an Array-like, an `Collection.Indexed`.\n  * If an Object with an Iterator defined, an `Collection.Indexed`.\n  * If an Object, an `Collection.Keyed`.\n\nThis methods forces the conversion of Objects and Strings to Collections.\nIf you want to ensure that a Collection of one item is returned, use\n`Seq.of`.\n\nNote: An Iterator itself will be treated as an object, becoming a `Seq.Keyed`,\nwhich is usually not what you want. You should turn your Iterator Object into\nan iterable object by defining a Symbol.iterator (or @@iterator) method which\nreturns `this`.\n\nNote: `Collection` is a conversion function and not a class, and does not\nuse the `new` keyword during construction.","notes":[]},"signatures":[{"typeParams":["I"],"params":[{"name":"collection","type":{"k":8,"param":"I"}}],"type":{"k":8,"param":"I"},"line":3796},{"typeParams":["T"],"params":[{"name":"collection","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"T"}]}}],"type":{"k":9,"name":"Collection.Indexed","args":[{"k":8,"param":"T"}]},"line":3797},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}}],"type":{"k":9,"name":"Collection.Keyed","args":[{"k":3},{"k":8,"param":"V"}]},"line":3798}]},"interface":{"line":3800,"typeParams":["K","V"],"extends":[{"k":9,"name":"ValueObject"}],"groups":[{"title":"Value equality","members":{"#equals":{"doc":{"synopsis":"True if this and the other Collection have value equality, as defined\nby `Immutable.is()`.","description":"Note: This is equivalent to `Immutable.is(this, other)`, but provided to\nallow for chained expressions.","notes":[]},"signatures":[{"params":[{"name":"other","type":{"k":17}}],"type":{"k":1},"line":3811}]},"#hashCode":{"doc":{"synopsis":"Computes and returns the hashed identity for this Collection.","description":"The `hashCode` of a Collection is used to determine potential equality,\nand is used when adding this to a `Set` or as a key in a `Map`, enabling\nlookup via a different instance.\n\n<!-- runkit:activate\n     { \"preamble\": \"const { Set,  List } = require('immutable')\" }\n-->\n```js\nconst a = List([ 1, 2, 3 ]);\nconst b = List([ 1, 2, 3 ]);\nassert.notStrictEqual(a, b); // different instances\nconst set = Set([ a ]);\nassert.equal(set.has(b), true);\n```\n\nIf two values have the same `hashCode`, they are [not guaranteed\nto be equal][Hash Collision]. If two values have different `hashCode`s,\nthey must not be equal.\n\n[Hash Collision]: https://en.wikipedia.org/wiki/Collision_(computer_science)","notes":[]},"signatures":[{"type":{"k":2},"line":3837}]}}},{"title":"Reading values","members":{"#get":{"doc":{"synopsis":"Returns the value associated with the provided key, or notSetValue if\nthe Collection does not contain this key.","description":"Note: it is possible a key may be associated with an `undefined` value,\nso if `notSetValue` is not provided and this method returns `undefined`,\nthat does not guarantee the key was not found.","notes":[]},"signatures":[{"typeParams":["NSV"],"params":[{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"NSV"}]},"line":3850},{"params":[{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":3851}]},"#has":{"doc":{"synopsis":"True if a key exists within this `Collection`, using `Immutable.is`\nto determine equality","description":"","notes":[]},"signatures":[{"params":[{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":1},"line":3857}]},"#includes":{"doc":{"synopsis":"True if a value exists within this `Collection`, using `Immutable.is`\nto determine equality","description":"","notes":[{"name":"alias","body":"contains"}]},"signatures":[{"params":[{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":1},"line":3864}]},"#first":{"doc":{"synopsis":"In case the `Collection` is not empty returns the first element of the\n`Collection`.\nIn case the `Collection` is empty returns the optional default\nvalue if provided, if no default value is provided returns undefined.","description":"","notes":[]},"signatures":[{"typeParams":["NSV"],"params":[{"name":"notSetValue","type":{"k":8,"param":"NSV"},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"NSV"}]},"line":3873}]},"#last":{"doc":{"synopsis":"In case the `Collection` is not empty returns the last element of the\n`Collection`.\nIn case the `Collection` is empty returns the optional default\nvalue if provided, if no default value is provided returns undefined.","description":"","notes":[]},"signatures":[{"typeParams":["NSV"],"params":[{"name":"notSetValue","type":{"k":8,"param":"NSV"},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"NSV"}]},"line":3881}]}}},{"title":"Reading deep values","members":{"#getIn":{"doc":{"synopsis":"Returns the value found by following a path of keys or indices through\nnested Collections.","description":"<!-- runkit:activate -->\n```js\nconst { Map, List } = require('immutable')\nconst deepData = Map({ x: List([ Map({ y: 123 }) ]) });\ndeepData.getIn(['x', 0, 'y']) // 123\n```\n\nPlain JavaScript Object or Arrays may be nested within an Immutable.js\nCollection, and getIn() can access those values as well:\n\n<!-- runkit:activate -->\n```js\nconst { Map, List } = require('immutable')\nconst deepData = Map({ x: [ { y: 123 } ] });\ndeepData.getIn(['x', 0, 'y']) // 123\n```","notes":[]},"signatures":[{"params":[{"name":"searchKeyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"notSetValue","type":{"k":17},"optional":true}],"type":{"k":17},"line":3906}]},"#hasIn":{"doc":{"synopsis":"True if the result of following a path of keys or indices through nested\nCollections results in a set value.","description":"","notes":[]},"signatures":[{"params":[{"name":"searchKeyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}}],"type":{"k":1},"line":3912}]}}},{"title":"Persistent changes","members":{"#update":{"doc":{"synopsis":"This can be very useful as a way to \"chain\" a normal function into a\nsequence of methods. RxJS calls this \"let\" and lodash calls it \"thru\".","description":"For example, to sum a Seq after mapping and filtering:\n\n<!-- runkit:activate -->\n```js\nconst { Seq } = require('immutable')\n\nfunction sum(collection) {\n  return collection.reduce((sum, x) => sum + x, 0)\n}\n\nSeq([ 1, 2, 3 ])\n  .map(x => x + 1)\n  .filter(x => x % 2 === 0)\n  .update(sum)\n// 6\n```","notes":[]},"signatures":[{"typeParams":["R"],"params":[{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":10}}],"type":{"k":8,"param":"R"}}}],"type":{"k":8,"param":"R"},"line":3937}]}}},{"title":"Conversion to JavaScript types","members":{"#toJS":{"doc":{"synopsis":"Deeply converts this Collection to equivalent native JavaScript Array or Object.","description":"`Collection.Indexed`, and `Collection.Set` become `Array`, while\n`Collection.Keyed` become `Object`, converting keys to Strings.","notes":[]},"signatures":[{"type":{"k":12,"types":[{"k":9,"name":"Array","args":[{"k":17}]},{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]}]},"line":3948}]},"#toJSON":{"doc":{"synopsis":"Shallowly converts this Collection to equivalent native JavaScript Array or Object.","description":"`Collection.Indexed`, and `Collection.Set` become `Array`, while\n`Collection.Keyed` become `Object`, converting keys to Strings.","notes":[]},"signatures":[{"type":{"k":12,"types":[{"k":9,"name":"Array","args":[{"k":8,"param":"V"}]},{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}]},"line":3956}]},"#toArray":{"doc":{"synopsis":"Shallowly converts this collection to an Array.","description":"`Collection.Indexed`, and `Collection.Set` produce an Array of values.\n`Collection.Keyed` produce an Array of [key, value] tuples.","notes":[]},"signatures":[{"type":{"k":12,"types":[{"k":9,"name":"Array","args":[{"k":8,"param":"V"}]},{"k":9,"name":"Array","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]}]},"line":3964}]},"#toObject":{"doc":{"synopsis":"Shallowly converts this Collection to an Object.","description":"Converts keys to Strings.","notes":[]},"signatures":[{"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]},"line":3971}]}}},{"title":"Conversion to Collections","members":{"#toMap":{"doc":{"synopsis":"Converts this Collection to a Map, Throws if keys are not hashable.","description":"Note: This is equivalent to `Map(this.toKeyedSeq())`, but provided\nfor convenience and to allow for chained expressions.","notes":[]},"signatures":[{"type":{"k":9,"name":"Map","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":3982}]},"#toOrderedMap":{"doc":{"synopsis":"Converts this Collection to a Map, maintaining the order of iteration.","description":"Note: This is equivalent to `OrderedMap(this.toKeyedSeq())`, but\nprovided for convenience and to allow for chained expressions.","notes":[]},"signatures":[{"type":{"k":9,"name":"OrderedMap","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":3990}]},"#toSet":{"doc":{"synopsis":"Converts this Collection to a Set, discarding keys. Throws if values\nare not hashable.","description":"Note: This is equivalent to `Set(this)`, but provided to allow for\nchained expressions.","notes":[]},"signatures":[{"type":{"k":9,"name":"Set","args":[{"k":8,"param":"V"}]},"line":3999}]},"#toOrderedSet":{"doc":{"synopsis":"Converts this Collection to a Set, maintaining the order of iteration and\ndiscarding keys.","description":"Note: This is equivalent to `OrderedSet(this.valueSeq())`, but provided\nfor convenience and to allow for chained expressions.","notes":[]},"signatures":[{"type":{"k":9,"name":"OrderedSet","args":[{"k":8,"param":"V"}]},"line":4008}]},"#toList":{"doc":{"synopsis":"Converts this Collection to a List, discarding keys.","description":"This is similar to `List(collection)`, but provided to allow for chained\nexpressions. However, when called on `Map` or other keyed collections,\n`collection.toList()` discards the keys and creates a list of only the\nvalues, whereas `List(collection)` creates a list of entry tuples.\n\n<!-- runkit:activate -->\n```js\nconst { Map, List } = require('immutable')\nvar myMap = Map({ a: 'Apple', b: 'Banana' })\nList(myMap) // List [ [ \"a\", \"Apple\" ], [ \"b\", \"Banana\" ] ]\nmyMap.toList() // List [ \"Apple\", \"Banana\" ]\n```","notes":[]},"signatures":[{"type":{"k":9,"name":"List","args":[{"k":8,"param":"V"}]},"line":4026}]},"#toStack":{"doc":{"synopsis":"Converts this Collection to a Stack, discarding keys. Throws if values\nare not hashable.","description":"Note: This is equivalent to `Stack(this)`, but provided to allow for\nchained expressions.","notes":[]},"signatures":[{"type":{"k":9,"name":"Stack","args":[{"k":8,"param":"V"}]},"line":4035}]}}},{"title":"Conversion to Seq","members":{"#toSeq":{"doc":{"synopsis":"Converts this Collection to a Seq of the same kind (indexed,\nkeyed, or set).","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":4044}]},"#toKeyedSeq":{"doc":{"synopsis":"Returns a Seq.Keyed from this Collection where indices are treated as keys.","description":"This is useful if you want to operate on an\nCollection.Indexed and preserve the [index, value] pairs.\n\nThe returned Seq will have identical iteration order as\nthis Collection.\n\n<!-- runkit:activate -->\n```js\nconst { Seq } = require('immutable')\nconst indexedSeq = Seq([ 'A', 'B', 'C' ])\n// Seq [ \"A\", \"B\", \"C\" ]\nindexedSeq.filter(v => v === 'B')\n// Seq [ \"B\" ]\nconst keyedSeq = indexedSeq.toKeyedSeq()\n// Seq { 0: \"A\", 1: \"B\", 2: \"C\" }\nkeyedSeq.filter(v => v === 'B')\n// Seq { 1: \"B\" }\n```","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},"line":4068}]},"#toIndexedSeq":{"doc":{"synopsis":"Returns an Seq.Indexed of the values of this Collection, discarding keys.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"V"}]},"line":4073}]},"#toSetSeq":{"doc":{"synopsis":"Returns a Seq.Set of the values of this Collection, discarding keys.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Set","args":[{"k":8,"param":"V"}]},"line":4078}]}}},{"title":"Iterators","members":{"#keys":{"doc":{"synopsis":"An iterator of this `Collection`'s keys.","description":"Note: this will return an ES6 iterator which does not support\nImmutable.js sequence algorithms. Use `keySeq` instead, if this is\nwhat you want.","notes":[]},"signatures":[{"type":{"k":9,"name":"IterableIterator","args":[{"k":8,"param":"K"}]},"line":4090}]},"#values":{"doc":{"synopsis":"An iterator of this `Collection`'s values.","description":"Note: this will return an ES6 iterator which does not support\nImmutable.js sequence algorithms. Use `valueSeq` instead, if this is\nwhat you want.","notes":[]},"signatures":[{"type":{"k":9,"name":"IterableIterator","args":[{"k":8,"param":"V"}]},"line":4099}]},"#entries":{"doc":{"synopsis":"An iterator of this `Collection`'s entries as `[ key, value ]` tuples.","description":"Note: this will return an ES6 iterator which does not support\nImmutable.js sequence algorithms. Use `entrySeq` instead, if this is\nwhat you want.","notes":[]},"signatures":[{"type":{"k":9,"name":"IterableIterator","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]},"line":4108}]}}},{"title":"Collections (Seq)","members":{"#keySeq":{"doc":{"synopsis":"Returns a new Seq.Indexed of the keys of this Collection,\ndiscarding values.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"K"}]},"line":4117}]},"#valueSeq":{"doc":{"synopsis":"Returns an Seq.Indexed of the values of this Collection, discarding keys.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Indexed","args":[{"k":8,"param":"V"}]},"line":4122}]},"#entrySeq":{"doc":{"synopsis":"Returns a new Seq.Indexed of [key, value] tuples.","description":"","notes":[]},"signatures":[{"type":{"k":9,"name":"Seq.Indexed","args":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]},"line":4127}]}}},{"title":"Sequence algorithms","members":{"#map":{"doc":{"synopsis":"Returns a new Collection of the same type with values passed through a\n`mapper` function.","description":"<!-- runkit:activate -->\n```js\nconst { Collection } = require('immutable')\nCollection({ a: 1, b: 2 }).map(x => 10 * x)\n// Seq { \"a\": 10, \"b\": 20 }\n```\n\nNote: `map()` always returns a new instance, even if it produced the same\nvalue at every step.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"M"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection","args":[{"k":8,"param":"K"},{"k":8,"param":"M"}]},"line":4146}]},"#filter":{"doc":{"synopsis":"Returns a new Collection of the same type with only the entries for which\nthe `predicate` function returns true.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nMap({ a: 1, b: 2, c: 3, d: 4}).filter(x => x % 2 === 0)\n// Map { \"b\": 2, \"d\": 4 }\n```\n\nNote: `filter()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"typeParams":["F"],"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection","args":[{"k":8,"param":"K"},{"k":8,"param":"F"}]},"line":4173},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":4177}]},"#filterNot":{"doc":{"synopsis":"Returns a new Collection of the same type with only the entries for which\nthe `predicate` function returns false.","description":"<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nMap({ a: 1, b: 2, c: 3, d: 4}).filterNot(x => x % 2 === 0)\n// Map { \"a\": 1, \"c\": 3 }\n```\n\nNote: `filterNot()` always returns a new instance, even if it results in\nnot filtering out any values.","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":4196}]},"#reverse":{"doc":{"synopsis":"Returns a new Collection of the same type in reverse order.","description":"","notes":[]},"signatures":[{"type":{"k":10},"line":4204}]},"#sort":{"doc":{"synopsis":"Returns a new Collection of the same type which includes the same entries,\nstably sorted by using a `comparator`.","description":"If a `comparator` is not provided, a default comparator uses `<` and `>`.\n\n`comparator(valueA, valueB)`:\n\n  * Returns `0` if the elements should not be swapped.\n  * Returns `-1` (or any negative number) if `valueA` comes before `valueB`\n  * Returns `1` (or any positive number) if `valueA` comes after `valueB`\n  * Is pure, i.e. it must always return the same value for the same pair\n    of values.\n\nWhen sorting collections which have no defined order, their ordered\nequivalents will be returned. e.g. `map.sort()` returns OrderedMap.\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nMap({ \"c\": 3, \"a\": 1, \"b\": 2 }).sort((a, b) => {\n  if (a < b) { return -1; }\n  if (a > b) { return 1; }\n  if (a === b) { return 0; }\n});\n// OrderedMap { \"a\": 1, \"b\": 2, \"c\": 3 }\n```\n\nNote: `sort()` Always returns a new instance, even if the original was\nalready sorted.\n\nNote: This is always an eager operation.","notes":[]},"signatures":[{"params":[{"name":"comparator","type":{"k":7,"params":[{"name":"valueA","type":{"k":8,"param":"V"}},{"name":"valueB","type":{"k":8,"param":"V"}}],"type":{"k":2}},"optional":true}],"type":{"k":10},"line":4239}]},"#sortBy":{"doc":{"synopsis":"Like `sort`, but also accepts a `comparatorValueMapper` which allows for\nsorting by more sophisticated means:","description":"    hitters.sortBy(hitter => hitter.avgHits)\n\nNote: `sortBy()` Always returns a new instance, even if the original was\nalready sorted.\n\nNote: This is always an eager operation.","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"comparatorValueMapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"C"}}},{"name":"comparator","type":{"k":7,"params":[{"name":"valueA","type":{"k":8,"param":"C"}},{"name":"valueB","type":{"k":8,"param":"C"}}],"type":{"k":2}},"optional":true}],"type":{"k":10},"line":4252}]},"#groupBy":{"doc":{"synopsis":"Returns a `Collection.Keyed` of `Collection.Keyeds`, grouped by the return\nvalue of the `grouper` function.","description":"Note: This is always an eager operation.\n\n<!-- runkit:activate -->\n```js\nconst { List, Map } = require('immutable')\nconst listOfMaps = List([\n  Map({ v: 0 }),\n  Map({ v: 1 }),\n  Map({ v: 1 }),\n  Map({ v: 0 }),\n  Map({ v: 2 })\n])\nconst groupsOfMaps = listOfMaps.groupBy(x => x.get('v'))\n// Map {\n//   0: List [ Map{ \"v\": 0 }, Map { \"v\": 0 } ],\n//   1: List [ Map{ \"v\": 1 }, Map { \"v\": 1 } ],\n//   2: List [ Map{ \"v\": 2 } ],\n// }\n```","notes":[]},"signatures":[{"typeParams":["G"],"params":[{"name":"grouper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"G"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Seq.Keyed","args":[{"k":8,"param":"G"},{"k":9,"name":"Collection","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}]},"line":4281}]}}},{"title":"Side effects","members":{"#forEach":{"doc":{"synopsis":"The `sideEffect` is executed for every entry in the Collection.","description":"Unlike `Array#forEach`, if any call of `sideEffect` returns\n`false`, the iteration will stop. Returns the number of entries iterated\n(including the last iteration which returned false).","notes":[]},"signatures":[{"params":[{"name":"sideEffect","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":17}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":2},"line":4296}]}}},{"title":"Creating subsets","members":{"#slice":{"doc":{"synopsis":"Returns a new Collection of the same type representing a portion of this\nCollection from start up to but not including end.","description":"If begin is negative, it is offset from the end of the Collection. e.g.\n`slice(-2)` returns a Collection of the last two entries. If it is not\nprovided the new Collection will begin at the beginning of this Collection.\n\nIf end is negative, it is offset from the end of the Collection. e.g.\n`slice(0, -1)` returns a Collection of everything but the last entry. If\nit is not provided, the new Collection will continue through the end of\nthis Collection.\n\nIf the requested slice is equivalent to the current Collection, then it\nwill return itself.","notes":[]},"signatures":[{"params":[{"name":"begin","type":{"k":2},"optional":true},{"name":"end","type":{"k":2},"optional":true}],"type":{"k":10},"line":4320}]},"#rest":{"doc":{"synopsis":"Returns a new Collection of the same type containing all entries except\nthe first.","description":"","notes":[]},"signatures":[{"type":{"k":10},"line":4326}]},"#butLast":{"doc":{"synopsis":"Returns a new Collection of the same type containing all entries except\nthe last.","description":"","notes":[]},"signatures":[{"type":{"k":10},"line":4332}]},"#skip":{"doc":{"synopsis":"Returns a new Collection of the same type which excludes the first `amount`\nentries from this Collection.","description":"","notes":[]},"signatures":[{"params":[{"name":"amount","type":{"k":2}}],"type":{"k":10},"line":4338}]},"#skipLast":{"doc":{"synopsis":"Returns a new Collection of the same type which excludes the last `amount`\nentries from this Collection.","description":"","notes":[]},"signatures":[{"params":[{"name":"amount","type":{"k":2}}],"type":{"k":10},"line":4344}]},"#skipWhile":{"doc":{"synopsis":"Returns a new Collection of the same type which includes entries starting\nfrom when `predicate` first returns false.","description":"<!-- runkit:activate -->\n```js\nconst { List } = require('immutable')\nList([ 'dog', 'frog', 'cat', 'hat', 'god' ])\n  .skipWhile(x => x.match(/g/))\n// List [ \"cat\", \"hat\", \"god\" ]\n```","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":4358}]},"#skipUntil":{"doc":{"synopsis":"Returns a new Collection of the same type which includes entries starting\nfrom when `predicate` first returns true.","description":"<!-- runkit:activate -->\n```js\nconst { List } = require('immutable')\nList([ 'dog', 'frog', 'cat', 'hat', 'god' ])\n  .skipUntil(x => x.match(/hat/))\n// List [ \"hat\", \"god\" ]\n```","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":4375}]},"#take":{"doc":{"synopsis":"Returns a new Collection of the same type which includes the first `amount`\nentries from this Collection.","description":"","notes":[]},"signatures":[{"params":[{"name":"amount","type":{"k":2}}],"type":{"k":10},"line":4384}]},"#takeLast":{"doc":{"synopsis":"Returns a new Collection of the same type which includes the last `amount`\nentries from this Collection.","description":"","notes":[]},"signatures":[{"params":[{"name":"amount","type":{"k":2}}],"type":{"k":10},"line":4390}]},"#takeWhile":{"doc":{"synopsis":"Returns a new Collection of the same type which includes entries from this\nCollection as long as the `predicate` returns true.","description":"<!-- runkit:activate -->\n```js\nconst { List } = require('immutable')\nList([ 'dog', 'frog', 'cat', 'hat', 'god' ])\n  .takeWhile(x => x.match(/o/))\n// List [ \"dog\", \"frog\" ]\n```","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":4404}]},"#takeUntil":{"doc":{"synopsis":"Returns a new Collection of the same type which includes entries from this\nCollection as long as the `predicate` returns false.","description":"<!-- runkit:activate -->\n```js\nconst { List } = require('immutable')\nList([ 'dog', 'frog', 'cat', 'hat', 'god' ])\n  .takeUntil(x => x.match(/at/))\n// List [ \"dog\", \"frog\" ]\n```","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":10},"line":4421}]}}},{"title":"Combination","members":{"#concat":{"doc":{"synopsis":"Returns a new Collection of the same type with other values and\ncollection-like concatenated to this one.","description":"For Seqs, all entries will be present in the resulting Seq, even if they\nhave the same key.","notes":[]},"signatures":[{"params":[{"name":"valuesOrCollections","type":{"k":9,"name":"Array","args":[{"k":17}]},"varArgs":true}],"type":{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]},"line":4436}]},"#flatten":{"doc":{"synopsis":"Flattens nested Collections.","description":"Will deeply flatten the Collection by default, returning a Collection of the\nsame type, but a `depth` can be provided in the form of a number or\nboolean (where true means to shallowly flatten one level). A depth of 0\n(or shallow: false) will deeply flatten.\n\nFlattens only others Collection, not Arrays or Objects.\n\nNote: `flatten(true)` operates on Collection<unknown, Collection<K, V>> and\nreturns Collection<K, V>","notes":[]},"signatures":[{"params":[{"name":"depth","type":{"k":2},"optional":true}],"type":{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]},"line":4451},{"params":[{"name":"shallow","type":{"k":1},"optional":true}],"type":{"k":9,"name":"Collection","args":[{"k":17},{"k":17}]},"line":4452}]},"#flatMap":{"doc":{"synopsis":"Flat-maps the Collection, returning a Collection of the same type.","description":"Similar to `collection.map(...).flatten(true)`.\nUsed for Dictionaries only.","notes":[]},"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"M"}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection","args":[{"k":8,"param":"K"},{"k":8,"param":"M"}]},"line":4459},{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]}]}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Collection","args":[{"k":8,"param":"KM"},{"k":8,"param":"VM"}]},"line":4470}]}}},{"title":"Reducing a value","members":{"#reduce":{"doc":{"synopsis":"Reduces the Collection to a value by calling the `reducer` for every entry\nin the Collection and passing along the reduced value.","description":"If `initialReduction` is not provided, the first item in the\nCollection will be used.\n","notes":[{"name":"see","body":"`Array#reduce`."}]},"signatures":[{"typeParams":["R"],"params":[{"name":"reducer","type":{"k":7,"params":[{"name":"reduction","type":{"k":8,"param":"R"}},{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"R"}}},{"name":"initialReduction","type":{"k":8,"param":"R"}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":8,"param":"R"},"line":4486},{"typeParams":["R"],"params":[{"name":"reducer","type":{"k":7,"params":[{"name":"reduction","type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"R"}]}},{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"R"}}}],"type":{"k":8,"param":"R"},"line":4491}]},"#reduceRight":{"doc":{"synopsis":"Reduces the Collection in reverse (from the right side).","description":"Note: Similar to this.reverse().reduce(), and provided for parity\nwith `Array#reduceRight`.","notes":[]},"signatures":[{"typeParams":["R"],"params":[{"name":"reducer","type":{"k":7,"params":[{"name":"reduction","type":{"k":8,"param":"R"}},{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"R"}}},{"name":"initialReduction","type":{"k":8,"param":"R"}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":8,"param":"R"},"line":4501},{"typeParams":["R"],"params":[{"name":"reducer","type":{"k":7,"params":[{"name":"reduction","type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"R"}]}},{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"R"}}}],"type":{"k":8,"param":"R"},"line":4506}]},"#every":{"doc":{"synopsis":"True if `predicate` returns true for all entries in the Collection.","description":"","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":1},"line":4513}]},"#some":{"doc":{"synopsis":"True if `predicate` returns true for any entry in the Collection.","description":"","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":1},"line":4521}]},"#join":{"doc":{"synopsis":"Joins values together as a string, inserting a separator between each.\nThe default separator is `\",\"`.","description":"","notes":[]},"signatures":[{"params":[{"name":"separator","type":{"k":3},"optional":true}],"type":{"k":3},"line":4530}]},"#isEmpty":{"doc":{"synopsis":"Returns true if this Collection includes no values.","description":"For some lazy `Seq`, `isEmpty` might need to iterate to determine\nemptiness. At most one iteration will occur.","notes":[]},"signatures":[{"type":{"k":1},"line":4538}]},"#count":{"doc":{"synopsis":"Returns the size of this Collection.","description":"Regardless of if this Collection can describe its size lazily (some Seqs\ncannot), this method will always return the correct size. E.g. it\nevaluates a lazy `Seq` if necessary.\n\nIf `predicate` is provided, then this returns the count of entries in the\nCollection for which the `predicate` returns true.","notes":[]},"signatures":[{"type":{"k":2},"line":4550},{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":2},"line":4551}]},"#countBy":{"doc":{"synopsis":"Returns a `Seq.Keyed` of counts, grouped by the return value of\nthe `grouper` function.","description":"Note: This is not a lazy operation.","notes":[]},"signatures":[{"typeParams":["G"],"params":[{"name":"grouper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"G"}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":9,"name":"Map","args":[{"k":8,"param":"G"},{"k":2}]},"line":4562}]}}},{"title":"Search for value","members":{"#find":{"doc":{"synopsis":"Returns the first value for which the `predicate` returns true.","description":"","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true},{"name":"notSetValue","type":{"k":8,"param":"V"},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":4573}]},"#findLast":{"doc":{"synopsis":"Returns the last value for which the `predicate` returns true.","description":"Note: `predicate` will be called for each entry in reverse.","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true},{"name":"notSetValue","type":{"k":8,"param":"V"},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":4584}]},"#findEntry":{"doc":{"synopsis":"Returns the first [key, value] entry for which the `predicate` returns true.","description":"","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true},{"name":"notSetValue","type":{"k":8,"param":"V"},"optional":true}],"type":{"k":12,"types":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},{"k":11}]},"line":4593}]},"#findLastEntry":{"doc":{"synopsis":"Returns the last [key, value] entry for which the `predicate`\nreturns true.","description":"Note: `predicate` will be called for each entry in reverse.","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true},{"name":"notSetValue","type":{"k":8,"param":"V"},"optional":true}],"type":{"k":12,"types":[{"k":14,"types":[{"k":8,"param":"K"},{"k":8,"param":"V"}]},{"k":11}]},"line":4605}]},"#findKey":{"doc":{"synopsis":"Returns the key for which the `predicate` returns true.","description":"","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"K"},{"k":11}]},"line":4614}]},"#findLastKey":{"doc":{"synopsis":"Returns the last key for which the `predicate` returns true.","description":"Note: `predicate` will be called for each entry in reverse.","notes":[]},"signatures":[{"params":[{"name":"predicate","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":1}}},{"name":"context","type":{"k":17},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"K"},{"k":11}]},"line":4624}]},"#keyOf":{"doc":{"synopsis":"Returns the key associated with the search value, or undefined.","description":"","notes":[]},"signatures":[{"params":[{"name":"searchValue","type":{"k":8,"param":"V"}}],"type":{"k":12,"types":[{"k":8,"param":"K"},{"k":11}]},"line":4632}]},"#lastKeyOf":{"doc":{"synopsis":"Returns the last key associated with the search value, or undefined.","description":"","notes":[]},"signatures":[{"params":[{"name":"searchValue","type":{"k":8,"param":"V"}}],"type":{"k":12,"types":[{"k":8,"param":"K"},{"k":11}]},"line":4637}]},"#max":{"doc":{"synopsis":"Returns the maximum value in this collection. If any values are\ncomparatively equivalent, the first one found will be returned.","description":"The `comparator` is used in the same way as `Collection#sort`. If it is not\nprovided, the default comparator is `>`.\n\nWhen two values are considered equivalent, the first encountered will be\nreturned. Otherwise, `max` will operate independent of the order of input\nas long as the comparator is commutative. The default comparator `>` is\ncommutative *only* when types do not differ.\n\nIf `comparator` returns 0 and either value is NaN, undefined, or null,\nthat value will be returned.","notes":[]},"signatures":[{"params":[{"name":"comparator","type":{"k":7,"params":[{"name":"valueA","type":{"k":8,"param":"V"}},{"name":"valueB","type":{"k":8,"param":"V"}}],"type":{"k":2}},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":4654}]},"#maxBy":{"doc":{"synopsis":"Like `max`, but also accepts a `comparatorValueMapper` which allows for\ncomparing by more sophisticated means:","description":"    hitters.maxBy(hitter => hitter.avgHits);\n","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"comparatorValueMapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"C"}}},{"name":"comparator","type":{"k":7,"params":[{"name":"valueA","type":{"k":8,"param":"C"}},{"name":"valueB","type":{"k":8,"param":"C"}}],"type":{"k":2}},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":4663}]},"#min":{"doc":{"synopsis":"Returns the minimum value in this collection. If any values are\ncomparatively equivalent, the first one found will be returned.","description":"The `comparator` is used in the same way as `Collection#sort`. If it is not\nprovided, the default comparator is `<`.\n\nWhen two values are considered equivalent, the first encountered will be\nreturned. Otherwise, `min` will operate independent of the order of input\nas long as the comparator is commutative. The default comparator `<` is\ncommutative *only* when types do not differ.\n\nIf `comparator` returns 0 and either value is NaN, undefined, or null,\nthat value will be returned.","notes":[]},"signatures":[{"params":[{"name":"comparator","type":{"k":7,"params":[{"name":"valueA","type":{"k":8,"param":"V"}},{"name":"valueB","type":{"k":8,"param":"V"}}],"type":{"k":2}},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":4683}]},"#minBy":{"doc":{"synopsis":"Like `min`, but also accepts a `comparatorValueMapper` which allows for\ncomparing by more sophisticated means:","description":"    hitters.minBy(hitter => hitter.avgHits);\n","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"comparatorValueMapper","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"iter","type":{"k":10}}],"type":{"k":8,"param":"C"}}},{"name":"comparator","type":{"k":7,"params":[{"name":"valueA","type":{"k":8,"param":"C"}},{"name":"valueB","type":{"k":8,"param":"C"}}],"type":{"k":2}},"optional":true}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":4692}]}}},{"title":"Comparison","members":{"#isSubset":{"doc":{"synopsis":"True if `iter` includes every value in this Collection.","description":"","notes":[]},"signatures":[{"params":[{"name":"iter","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"V"}]}}],"type":{"k":1},"line":4703}]},"#isSuperset":{"doc":{"synopsis":"True if this Collection includes every value in `iter`.","description":"","notes":[]},"signatures":[{"params":[{"name":"iter","type":{"k":9,"name":"Iterable","args":[{"k":8,"param":"V"}]}}],"type":{"k":1},"line":4708}]}}}]}},"ValueObject":{"interface":{"line":4714,"doc":{"synopsis":"The interface to fulfill to qualify as a Value Object.","description":"","notes":[]},"groups":[{"members":{"#equals":{"doc":{"synopsis":"True if this and the other Collection have value equality, as defined\nby `Immutable.is()`.","description":"Note: This is equivalent to `Immutable.is(this, other)`, but provided to\nallow for chained expressions.","notes":[]},"signatures":[{"params":[{"name":"other","type":{"k":17}}],"type":{"k":1},"line":4722}]},"#hashCode":{"doc":{"synopsis":"Computes and returns the hashed identity for this Collection.","description":"The `hashCode` of a Collection is used to determine potential equality,\nand is used when adding this to a `Set` or as a key in a `Map`, enabling\nlookup via a different instance.\n\n<!-- runkit:activate -->\n```js\nconst { List, Set } = require('immutable');\nconst a = List([ 1, 2, 3 ]);\nconst b = List([ 1, 2, 3 ]);\nassert.notStrictEqual(a, b); // different instances\nconst set = Set([ a ]);\nassert.equal(set.has(b), true);\n```\n\nNote: hashCode() MUST return a Uint32 number. The easiest way to\nguarantee this is to return `myHash | 0` from a custom implementation.\n\nIf two values have the same `hashCode`, they are [not guaranteed\nto be equal][Hash Collision]. If two values have different `hashCode`s,\nthey must not be equal.\n\nNote: `hashCode()` is not guaranteed to always be called before\n`equals()`. Most but not all Immutable.js collections use hash codes to\norganize their internal data structures, while all Immutable.js\ncollections use equality during lookups.\n\n[Hash Collision]: https://en.wikipedia.org/wiki/Collision_(computer_science)","notes":[]},"signatures":[{"type":{"k":2},"line":4755}]}}}]}},"fromJS":{"call":{"doc":{"synopsis":"Deeply converts plain JS objects and arrays to Immutable Maps and Lists.","description":"If a `reviver` is optionally provided, it will be called with every\ncollection as a Seq (beginning with the most nested collections\nand proceeding to the top-level collection itself), along with the key\nreferring to each collection and the parent JS object provided as `this`.\nFor the top level, object, the key will be `\"\"`. This `reviver` is expected\nto return a new Immutable Collection, allowing for custom conversions from\ndeep JS objects. Finally, a `path` is provided which is the sequence of\nkeys to this value from the starting value.\n\n`reviver` acts similarly to the [same parameter in `JSON.parse`][1].\n\nIf `reviver` is not provided, the default behavior will convert Objects\ninto Maps and Arrays into Lists like so:\n\n<!-- runkit:activate -->\n```js\nconst { fromJS, isKeyed } = require('immutable')\nfunction (key, value) {\n  return isKeyed(value) ? value.toMap() : value.toList()\n}\n```\n\n`fromJS` is conservative in its conversion. It will only convert\narrays which pass `Array.isArray` to Lists, and only raw objects (no custom\nprototype) to Map.\n\nAccordingly, this example converts native JS data to OrderedMap and List:\n\n<!-- runkit:activate -->\n```js\nconst { fromJS, isKeyed } = require('immutable')\nfromJS({ a: {b: [10, 20, 30]}, c: 40}, function (key, value, path) {\n  console.log(key, value, path)\n  return isKeyed(value) ? value.toOrderedMap() : value.toList()\n})\n\n> \"b\", [ 10, 20, 30 ], [ \"a\", \"b\" ]\n> \"a\", {b: [10, 20, 30]}, [ \"a\" ]\n> \"\", {a: {b: [10, 20, 30]}, c: 40}, []\n```\n\nKeep in mind, when using JS objects to construct Immutable Maps, that\nJavaScript Object properties are always strings, even if written in a\nquote-less shorthand, while Immutable Maps accept keys of any type.\n\n<!-- runkit:activate -->\n```js\nconst { Map } = require('immutable')\nlet obj = { 1: \"one\" };\nObject.keys(obj); // [ \"1\" ]\nassert.equal(obj[\"1\"], obj[1]); // \"one\" === \"one\"\n\nlet map = Map(obj);\nassert.notEqual(map.get(\"1\"), map.get(1)); // \"one\" !== undefined\n```\n\nProperty access for JavaScript Objects first converts the key to a string,\nbut since Immutable Map keys can be of any type the argument to `get()` is\nnot altered.\n\n[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter\n     \"Using the reviver parameter\"","notes":[]},"signatures":[{"params":[{"name":"jsValue","type":{"k":17}},{"name":"reviver","type":{"k":7,"params":[{"name":"key","type":{"k":12,"types":[{"k":3},{"k":2}]}},{"name":"sequence","type":{"k":12,"types":[{"k":9,"name":"Collection.Keyed","args":[{"k":3},{"k":17}]},{"k":9,"name":"Collection.Indexed","args":[{"k":17}]}]}},{"name":"path","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":3},{"k":2}]}]},"optional":true}],"type":{"k":17}},"optional":true}],"type":{"k":17},"line":4824}]}},"is":{"call":{"doc":{"synopsis":"Value equality check with semantics similar to `Object.is`, but treats\nImmutable `Collection`s as values, equal if the second `Collection` includes\nequivalent values.","description":"It's used throughout Immutable when checking for equality, including `Map`\nkey equality and `Set` membership.\n\n<!-- runkit:activate -->\n```js\nconst { Map, is } = require('immutable')\nconst map1 = Map({ a: 1, b: 1, c: 1 })\nconst map2 = Map({ a: 1, b: 1, c: 1 })\nassert.equal(map1 !== map2, true)\nassert.equal(Object.is(map1, map2), false)\nassert.equal(is(map1, map2), true)\n```\n\n`is()` compares primitive types like strings and numbers, Immutable.js\ncollections like `Map` and `List`, but also any custom object which\nimplements `ValueObject` by providing `equals()` and `hashCode()` methods.\n\nNote: Unlike `Object.is`, `Immutable.is` assumes `0` and `-0` are the same\nvalue, matching the behavior of ES6 Map key equality.","notes":[]},"signatures":[{"params":[{"name":"first","type":{"k":17}},{"name":"second","type":{"k":17}}],"type":{"k":1},"line":4858}]}},"hash":{"call":{"doc":{"synopsis":"The `hash()` function is an important part of how Immutable determines if\ntwo values are equivalent and is used to determine how to store those\nvalues. Provided with any value, `hash()` will return a 31-bit integer.","description":"When designing Objects which may be equal, it's important that when a\n`.equals()` method returns true, that both values `.hashCode()` method\nreturn the same value. `hash()` may be used to produce those values.\n\nFor non-Immutable Objects that do not provide a `.hashCode()` functions\n(including plain Objects, plain Arrays, Date objects, etc), a unique hash\nvalue will be created for each *instance*. That is, the create hash\nrepresents referential equality, and not value equality for Objects. This\nensures that if that Object is mutated over time that its hash code will\nremain consistent, allowing Objects to be used as keys and values in\nImmutable.js collections.\n\nNote that `hash()` attempts to balance between speed and avoiding\ncollisions, however it makes no attempt to produce secure hashes.\n\n*New in Version 4.0*","notes":[]},"signatures":[{"params":[{"name":"value","type":{"k":17}}],"type":{"k":2},"line":4882}]}},"isImmutable":{"call":{"doc":{"synopsis":"True if `maybeImmutable` is an Immutable Collection or Record.","description":"Note: Still returns true even if the collections is within a `withMutations()`.\n\n<!-- runkit:activate -->\n```js\nconst { isImmutable, Map, List, Stack } = require('immutable');\nisImmutable([]); // false\nisImmutable({}); // false\nisImmutable(Map()); // true\nisImmutable(List()); // true\nisImmutable(Stack()); // true\nisImmutable(Map().asMutable()); // true\n```","notes":[]},"signatures":[{"params":[{"name":"maybeImmutable","type":{"k":17}}],"type":{"k":1},"line":4900}]}},"isCollection":{"call":{"doc":{"synopsis":"True if `maybeCollection` is a Collection, or any of its subclasses.","description":"<!-- runkit:activate -->\n```js\nconst { isCollection, Map, List, Stack } = require('immutable');\nisCollection([]); // false\nisCollection({}); // false\nisCollection(Map()); // true\nisCollection(List()); // true\nisCollection(Stack()); // true\n```","notes":[]},"signatures":[{"params":[{"name":"maybeCollection","type":{"k":17}}],"type":{"k":1},"line":4915}]}},"isKeyed":{"call":{"doc":{"synopsis":"True if `maybeKeyed` is a Collection.Keyed, or any of its subclasses.","description":"<!-- runkit:activate -->\n```js\nconst { isKeyed, Map, List, Stack } = require('immutable');\nisKeyed([]); // false\nisKeyed({}); // false\nisKeyed(Map()); // true\nisKeyed(List()); // false\nisKeyed(Stack()); // false\n```","notes":[]},"signatures":[{"params":[{"name":"maybeKeyed","type":{"k":17}}],"type":{"k":1},"line":4930}]}},"isIndexed":{"call":{"doc":{"synopsis":"True if `maybeIndexed` is a Collection.Indexed, or any of its subclasses.","description":"<!-- runkit:activate -->\n```js\nconst { isIndexed, Map, List, Stack, Set } = require('immutable');\nisIndexed([]); // false\nisIndexed({}); // false\nisIndexed(Map()); // false\nisIndexed(List()); // true\nisIndexed(Stack()); // true\nisIndexed(Set()); // false\n```","notes":[]},"signatures":[{"params":[{"name":"maybeIndexed","type":{"k":17}}],"type":{"k":1},"line":4946}]}},"isAssociative":{"call":{"doc":{"synopsis":"True if `maybeAssociative` is either a Keyed or Indexed Collection.","description":"<!-- runkit:activate -->\n```js\nconst { isAssociative, Map, List, Stack, Set } = require('immutable');\nisAssociative([]); // false\nisAssociative({}); // false\nisAssociative(Map()); // true\nisAssociative(List()); // true\nisAssociative(Stack()); // true\nisAssociative(Set()); // false\n```","notes":[]},"signatures":[{"params":[{"name":"maybeAssociative","type":{"k":17}}],"type":{"k":1},"line":4962}]}},"isOrdered":{"call":{"doc":{"synopsis":"True if `maybeOrdered` is a Collection where iteration order is well\ndefined. True for Collection.Indexed as well as OrderedMap and OrderedSet.","description":"<!-- runkit:activate -->\n```js\nconst { isOrdered, Map, OrderedMap, List, Set } = require('immutable');\nisOrdered([]); // false\nisOrdered({}); // false\nisOrdered(Map()); // false\nisOrdered(OrderedMap()); // true\nisOrdered(List()); // true\nisOrdered(Set()); // false\n```","notes":[]},"signatures":[{"params":[{"name":"maybeOrdered","type":{"k":17}}],"type":{"k":1},"line":4979}]}},"isValueObject":{"call":{"doc":{"synopsis":"True if `maybeValue` is a JavaScript Object which has *both* `equals()`\nand `hashCode()` methods.","description":"Any two instances of *value objects* can be compared for value equality with\n`Immutable.is()` and can be used as keys in a `Map` or members in a `Set`.","notes":[]},"signatures":[{"params":[{"name":"maybeValue","type":{"k":17}}],"type":{"k":1},"line":4988}]}},"isSeq":{"call":{"doc":{"synopsis":"True if `maybeSeq` is a Seq.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeSeq","type":{"k":17}}],"type":{"k":1},"line":4994}]}},"isList":{"call":{"doc":{"synopsis":"True if `maybeList` is a List.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeList","type":{"k":17}}],"type":{"k":1},"line":4999}]}},"isMap":{"call":{"doc":{"synopsis":"True if `maybeMap` is a Map.","description":"Also true for OrderedMaps.","notes":[]},"signatures":[{"params":[{"name":"maybeMap","type":{"k":17}}],"type":{"k":1},"line":5006}]}},"isOrderedMap":{"call":{"doc":{"synopsis":"True if `maybeOrderedMap` is an OrderedMap.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeOrderedMap","type":{"k":17}}],"type":{"k":1},"line":5011}]}},"isStack":{"call":{"doc":{"synopsis":"True if `maybeStack` is a Stack.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeStack","type":{"k":17}}],"type":{"k":1},"line":5016}]}},"isSet":{"call":{"doc":{"synopsis":"True if `maybeSet` is a Set.","description":"Also true for OrderedSets.","notes":[]},"signatures":[{"params":[{"name":"maybeSet","type":{"k":17}}],"type":{"k":1},"line":5023}]}},"isOrderedSet":{"call":{"doc":{"synopsis":"True if `maybeOrderedSet` is an OrderedSet.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeOrderedSet","type":{"k":17}}],"type":{"k":1},"line":5028}]}},"isRecord":{"call":{"doc":{"synopsis":"True if `maybeRecord` is a Record.","description":"","notes":[]},"signatures":[{"params":[{"name":"maybeRecord","type":{"k":17}}],"type":{"k":1},"line":5033}]}},"get":{"call":{"doc":{"synopsis":"Returns the value within the provided collection associated with the\nprovided key, or notSetValue if the key is not defined in the collection.","description":"A functional alternative to `collection.get(key)` which will also work on\nplain Objects and Arrays as an alternative for `collection[key]`.\n\n<!-- runkit:activate -->\n```js\nconst { get } = require('immutable')\nget([ 'dog', 'frog', 'cat' ], 2) // 'frog'\nget({ x: 123, y: 456 }, 'x') // 123\nget({ x: 123, y: 456 }, 'z', 'ifNotSet') // 'ifNotSet'\n```","notes":[]},"signatures":[{"typeParams":["K","V"],"params":[{"name":"collection","type":{"k":9,"name":"Collection","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}},{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":5052},{"typeParams":["K","V","NSV"],"params":[{"name":"collection","type":{"k":9,"name":"Collection","args":[{"k":8,"param":"K"},{"k":8,"param":"V"}]}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"NSV"}]},"line":5053},{"typeParams":["TProps","K"],"params":[{"name":"record","type":{"k":9,"name":"Record","args":[{"k":8,"param":"TProps"}]}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":17}}],"type":{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}},"line":5054},{"typeParams":["V"],"params":[{"name":"collection","type":{"k":9,"name":"Array","args":[{"k":8,"param":"V"}]}},{"name":"key","type":{"k":2}}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":5055},{"typeParams":["V","NSV"],"params":[{"name":"collection","type":{"k":9,"name":"Array","args":[{"k":8,"param":"V"}]}},{"name":"key","type":{"k":2}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"NSV"}]},"line":5056},{"typeParams":["C","K"],"params":[{"name":"object","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":17}}],"type":{"k":15,"type":{"k":8,"param":"C"},"index":{"k":8,"param":"K"}},"line":5057},{"typeParams":["V"],"params":[{"name":"collection","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}},{"name":"key","type":{"k":3}}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":11}]},"line":5058},{"typeParams":["V","NSV"],"params":[{"name":"collection","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]}},{"name":"key","type":{"k":3}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}}],"type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"NSV"}]},"line":5059}]}},"has":{"call":{"doc":{"synopsis":"Returns true if the key is defined in the provided collection.","description":"A functional alternative to `collection.has(key)` which will also work with\nplain Objects and Arrays as an alternative for\n`collection.hasOwnProperty(key)`.\n\n<!-- runkit:activate -->\n```js\nconst { has } = require('immutable')\nhas([ 'dog', 'frog', 'cat' ], 2) // true\nhas([ 'dog', 'frog', 'cat' ], 5) // false\nhas({ x: 123, y: 456 }, 'x') // true\nhas({ x: 123, y: 456 }, 'z') // false\n```","notes":[]},"signatures":[{"params":[{"name":"collection","type":{"k":9,"name":"Object"}},{"name":"key","type":{"k":17}}],"type":{"k":1},"line":5077}]}},"remove":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the value at key removed.","description":"A functional alternative to `collection.remove(key)` which will also work\nwith plain Objects and Arrays as an alternative for\n`delete collectionCopy[key]`.\n\n<!-- runkit:activate -->\n```js\nconst { remove } = require('immutable')\nconst originalArray = [ 'dog', 'frog', 'cat' ]\nremove(originalArray, 1) // [ 'dog', 'cat' ]\nconsole.log(originalArray) // [ 'dog', 'frog', 'cat' ]\nconst originalObject = { x: 123, y: 456 }\nremove(originalObject, 'x') // { y: 456 }\nconsole.log(originalObject) // { x: 123, y: 456 }\n```","notes":[]},"signatures":[{"typeParams":["K","C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":8,"param":"C"},"line":5097},{"typeParams":["TProps","C","K"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":8,"param":"C"},"line":5098},{"typeParams":["C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":2}}],"type":{"k":8,"param":"C"},"line":5099},{"typeParams":["C","K"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":8,"param":"C"},"line":5100},{"typeParams":["C","K"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}}],"type":{"k":8,"param":"C"},"line":5101}]}},"set":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the value at key set to the provided\nvalue.","description":"A functional alternative to `collection.set(key, value)` which will also\nwork with plain Objects and Arrays as an alternative for\n`collectionCopy[key] = value`.\n\n<!-- runkit:activate -->\n```js\nconst { set } = require('immutable')\nconst originalArray = [ 'dog', 'frog', 'cat' ]\nset(originalArray, 1, 'cow') // [ 'dog', 'cow', 'cat' ]\nconsole.log(originalArray) // [ 'dog', 'frog', 'cat' ]\nconst originalObject = { x: 123, y: 456 }\nset(originalObject, 'x', 789) // { x: 789, y: 456 }\nconsole.log(originalObject) // { x: 123, y: 456 }\n```","notes":[]},"signatures":[{"typeParams":["K","V","C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"C"},"line":5122},{"typeParams":["TProps","C","K"],"params":[{"name":"record","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}}}],"type":{"k":8,"param":"C"},"line":5123},{"typeParams":["V","C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":2}},{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"C"},"line":5124},{"typeParams":["C","K"],"params":[{"name":"object","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"value","type":{"k":15,"type":{"k":8,"param":"C"},"index":{"k":8,"param":"K"}}}],"type":{"k":8,"param":"C"},"line":5125},{"typeParams":["V","C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":3}},{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"C"},"line":5126}]}},"update":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the value at key set to the result of\nproviding the existing value to the updating function.","description":"A functional alternative to `collection.update(key, fn)` which will also\nwork with plain Objects and Arrays as an alternative for\n`collectionCopy[key] = fn(collection[key])`.\n\n<!-- runkit:activate -->\n```js\nconst { update } = require('immutable')\nconst originalArray = [ 'dog', 'frog', 'cat' ]\nupdate(originalArray, 1, val => val.toUpperCase()) // [ 'dog', 'FROG', 'cat' ]\nconsole.log(originalArray) // [ 'dog', 'frog', 'cat' ]\nconst originalObject = { x: 123, y: 456 }\nupdate(originalObject, 'x', val => val * 6) // { x: 738, y: 456 }\nconsole.log(originalObject) // { x: 123, y: 456 }\n```","notes":[]},"signatures":[{"typeParams":["K","V","C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"V"}}}],"type":{"k":8,"param":"C"},"line":5147},{"typeParams":["K","V","C","NSV"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"NSV"}]}}],"type":{"k":8,"param":"V"}}}],"type":{"k":8,"param":"C"},"line":5148},{"typeParams":["TProps","C","K"],"params":[{"name":"record","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}}}],"type":{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}}}}],"type":{"k":8,"param":"C"},"line":5149},{"typeParams":["TProps","C","K","NSV"],"params":[{"name":"record","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":12,"types":[{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}},{"k":8,"param":"NSV"}]}}],"type":{"k":15,"type":{"k":8,"param":"TProps"},"index":{"k":8,"param":"K"}}}}],"type":{"k":8,"param":"C"},"line":5150},{"typeParams":["V"],"params":[{"name":"collection","type":{"k":9,"name":"Array","args":[{"k":8,"param":"V"}]}},{"name":"key","type":{"k":2}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"V"}}}],"type":{"k":9,"name":"Array","args":[{"k":8,"param":"V"}]},"line":5151},{"typeParams":["V","NSV"],"params":[{"name":"collection","type":{"k":9,"name":"Array","args":[{"k":8,"param":"V"}]}},{"name":"key","type":{"k":2}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"NSV"}]}}],"type":{"k":8,"param":"V"}}}],"type":{"k":9,"name":"Array","args":[{"k":8,"param":"V"}]},"line":5152},{"typeParams":["C","K"],"params":[{"name":"object","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":15,"type":{"k":8,"param":"C"},"index":{"k":8,"param":"K"}}}],"type":{"k":15,"type":{"k":8,"param":"C"},"index":{"k":8,"param":"K"}}}}],"type":{"k":8,"param":"C"},"line":5153},{"typeParams":["C","K","NSV"],"params":[{"name":"object","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":12,"types":[{"k":15,"type":{"k":8,"param":"C"},"index":{"k":8,"param":"K"}},{"k":8,"param":"NSV"}]}}],"type":{"k":15,"type":{"k":8,"param":"C"},"index":{"k":8,"param":"K"}}}}],"type":{"k":8,"param":"C"},"line":5154},{"typeParams":["V","C","K"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":8,"param":"V"}}],"type":{"k":8,"param":"V"}}}],"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]},"line":5155},{"typeParams":["V","C","K","NSV"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"key","type":{"k":8,"param":"K"}},{"name":"notSetValue","type":{"k":8,"param":"NSV"}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":12,"types":[{"k":8,"param":"V"},{"k":8,"param":"NSV"}]}}],"type":{"k":8,"param":"V"}}}],"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":8,"param":"V"}}]},"line":5156}]}},"getIn":{"call":{"doc":{"synopsis":"Returns the value at the provided key path starting at the provided\ncollection, or notSetValue if the key path is not defined.","description":"A functional alternative to `collection.getIn(keypath)` which will also\nwork with plain Objects and Arrays.\n\n<!-- runkit:activate -->\n```js\nconst { getIn } = require('immutable')\ngetIn({ x: { y: { z: 123 }}}, ['x', 'y', 'z']) // 123\ngetIn({ x: { y: { z: 123 }}}, ['x', 'q', 'p'], 'ifNotSet') // 'ifNotSet'\n```","notes":[]},"signatures":[{"params":[{"name":"collection","type":{"k":17}},{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"notSetValue","type":{"k":17}}],"type":{"k":17},"line":5172}]}},"hasIn":{"call":{"doc":{"synopsis":"Returns true if the key path is defined in the provided collection.","description":"A functional alternative to `collection.hasIn(keypath)` which will also\nwork with plain Objects and Arrays.\n\n<!-- runkit:activate -->\n```js\nconst { hasIn } = require('immutable')\nhasIn({ x: { y: { z: 123 }}}, ['x', 'y', 'z']) // true\nhasIn({ x: { y: { z: 123 }}}, ['x', 'q', 'p']) // false\n```","notes":[]},"signatures":[{"params":[{"name":"collection","type":{"k":17}},{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}}],"type":{"k":1},"line":5187}]}},"removeIn":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the value at the key path removed.","description":"A functional alternative to `collection.removeIn(keypath)` which will also\nwork with plain Objects and Arrays.\n\n<!-- runkit:activate -->\n```js\nconst { removeIn } = require('immutable')\nconst original = { x: { y: { z: 123 }}}\nremoveIn(original, ['x', 'y', 'z']) // { x: { y: {}}}\nconsole.log(original) // { x: { y: { z: 123 }}}\n```","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}}],"type":{"k":8,"param":"C"},"line":5203}]}},"setIn":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the value at the key path set to the\nprovided value.","description":"A functional alternative to `collection.setIn(keypath)` which will also\nwork with plain Objects and Arrays.\n\n<!-- runkit:activate -->\n```js\nconst { setIn } = require('immutable')\nconst original = { x: { y: { z: 123 }}}\nsetIn(original, ['x', 'y', 'z'], 456) // { x: { y: { z: 456 }}}\nconsole.log(original) // { x: { y: { z: 123 }}}\n```","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"value","type":{"k":17}}],"type":{"k":8,"param":"C"},"line":5220}]}},"updateIn":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the value at key path set to the\nresult of providing the existing value to the updating function.","description":"A functional alternative to `collection.updateIn(keypath)` which will also\nwork with plain Objects and Arrays.\n\n<!-- runkit:activate -->\n```js\nconst { updateIn } = require('immutable')\nconst original = { x: { y: { z: 123 }}}\nupdateIn(original, ['x', 'y', 'z'], val => val * 6) // { x: { y: { z: 738 }}}\nconsole.log(original) // { x: { y: { z: 123 }}}\n```","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":17}}],"type":{"k":17}}}],"type":{"k":8,"param":"C"},"line":5237},{"typeParams":["C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"keyPath","type":{"k":9,"name":"Iterable","args":[{"k":17}]}},{"name":"notSetValue","type":{"k":17}},{"name":"updater","type":{"k":7,"params":[{"name":"value","type":{"k":17}}],"type":{"k":17}}}],"type":{"k":8,"param":"C"},"line":5238}]}},"merge":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the remaining collections merged in.","description":"A functional alternative to `collection.merge()` which will also work with\nplain Objects and Arrays.\n\n<!-- runkit:activate -->\n```js\nconst { merge } = require('immutable')\nconst original = { x: 123, y: 456 }\nmerge(original, { y: 789, z: 'abc' }) // { x: 123, y: 789, z: 'abc' }\nconsole.log(original) // { x: 123, y: 456 }\n```","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":17}]},{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":17},{"k":17}]}]},{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]}]}]},"varArgs":true}],"type":{"k":8,"param":"C"},"line":5254}]}},"mergeWith":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the remaining collections merged in,\ncalling the `merger` function whenever an existing value is encountered.","description":"A functional alternative to `collection.mergeWith()` which will also work\nwith plain Objects and Arrays.\n\n<!-- runkit:activate -->\n```js\nconst { mergeWith } = require('immutable')\nconst original = { x: 123, y: 456 }\nmergeWith(\n  (oldVal, newVal) => oldVal + newVal,\n  original,\n  { y: 789, z: 'abc' }\n) // { x: 123, y: 1245, z: 'abc' }\nconsole.log(original) // { x: 123, y: 456 }\n```","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"merger","type":{"k":7,"params":[{"name":"oldVal","type":{"k":17}},{"name":"newVal","type":{"k":17}},{"name":"key","type":{"k":17}}],"type":{"k":17}}},{"name":"collection","type":{"k":8,"param":"C"}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":17}]},{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":17},{"k":17}]}]},{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]}]}]},"varArgs":true}],"type":{"k":8,"param":"C"},"line":5278}]}},"mergeDeep":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the remaining collections merged in\ndeeply (recursively).","description":"A functional alternative to `collection.mergeDeep()` which will also work\nwith plain Objects and Arrays.\n\n<!-- runkit:activate -->\n```js\nconst { mergeDeep } = require('immutable')\nconst original = { x: { y: 123 }}\nmergeDeep(original, { x: { z: 456 }}) // { x: { y: 123, z: 456 }}\nconsole.log(original) // { x: { y: 123 }}\n```","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"collection","type":{"k":8,"param":"C"}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":17}]},{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":17},{"k":17}]}]},{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]}]}]},"varArgs":true}],"type":{"k":8,"param":"C"},"line":5299}]}},"mergeDeepWith":{"call":{"doc":{"synopsis":"Returns a copy of the collection with the remaining collections merged in\ndeeply (recursively), calling the `merger` function whenever an existing\nvalue is encountered.","description":"A functional alternative to `collection.mergeDeepWith()` which will also\nwork with plain Objects and Arrays.\n\n<!-- runkit:activate -->\n```js\nconst { mergeDeepWith } = require('immutable')\nconst original = { x: { y: 123 }}\nmergeDeepWith(\n  (oldVal, newVal) => oldVal + newVal,\n  original,\n  { x: { y: 456 }}\n) // { x: { y: 579 }}\nconsole.log(original) // { x: { y: 123 }}\n```","notes":[]},"signatures":[{"typeParams":["C"],"params":[{"name":"merger","type":{"k":7,"params":[{"name":"oldVal","type":{"k":17}},{"name":"newVal","type":{"k":17}},{"name":"key","type":{"k":17}}],"type":{"k":17}}},{"name":"collection","type":{"k":8,"param":"C"}},{"name":"collections","type":{"k":9,"name":"Array","args":[{"k":12,"types":[{"k":9,"name":"Iterable","args":[{"k":17}]},{"k":9,"name":"Iterable","args":[{"k":14,"types":[{"k":17},{"k":17}]}]},{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":17}}]}]}]},"varArgs":true}],"type":{"k":8,"param":"C"},"line":5324}]}}}},"immutable":{"module":{}}}
},{}],60:[function(require,module,exports){
var TypeKind = {
  Any: 0,

  Boolean: 1,
  Number: 2,
  String: 3,
  Object: 4,
  Array: 5,
  Never: 6,
  Function: 7,

  Param: 8,
  Type: 9,

  This: 10,
  Undefined: 11,
  Union: 12,
  Intersection: 13,
  Tuple: 14,
  Indexed: 15,
  Operator: 16,

  Unknown: 17,
};

module.exports = TypeKind;

},{}],61:[function(require,module,exports){
var $__0=    require('../../'),Seq=$__0.Seq;
// Note: intentionally using raw defs, not getTypeDefs to avoid circular ref.
var defs = require('../generated/immutable.d.json');

function collectMemberGroups(interfaceDef, options) {
  var members = {};

  if (interfaceDef) {
    collectFromDef(interfaceDef);
  }

  var groups = { '': [] };

  if (options.showInGroups) {
    Seq(members).forEach(function(member)  {
      (groups[member.group] || (groups[member.group] = [])).push(member);
    });
  } else {
    groups[''] = Seq(members)
      .sortBy(function(member)  {return member.memberName;})
      .toArray();
  }

  if (!options.showInherited) {
    groups = Seq(groups)
      .map(function(members)  {return members.filter(function(member)  {return !member.inherited;});})
      .toObject();
  }

  return groups;

  function collectFromDef(def, name) {
    def.groups &&
      def.groups.forEach(function(g)  {
        Seq(g.members).forEach(function(memberDef, memberName)  {
          collectMember(g.title || '', memberName, memberDef);
        });
      });

    def.extends &&
      def.extends.forEach(function(e)  {
        var superModule = defs.Immutable;
        e.name.split('.').forEach(function(part)  {
          superModule =
            superModule && superModule.module && superModule.module[part];
        });
        var superInterface = superModule && superModule.interface;
        if (superInterface) {
          collectFromDef(superInterface, e.name);
        }
      });

    function collectMember(group, memberName, memberDef) {
      var member = members[memberName];
      if (member) {
        if (!member.inherited) {
          member.overrides = { name:name, def:def, memberDef:memberDef };
        }
        if (!member.group && group) {
          member.group = group;
        }
      } else {
        member = {
          group:group,
          memberName: memberName.substr(1),
          memberDef:memberDef,
        };
        if (def !== interfaceDef) {
          member.inherited = { name:name, def:def };
        }
        members[memberName] = member;
      }
    }
  }
}

module.exports = collectMemberGroups;

},{"../../":1,"../generated/immutable.d.json":59}],62:[function(require,module,exports){
var markdownDocs = require('./markdownDocs');
var defs = require('../generated/immutable.d.json');

markdownDocs(defs);

module.exports = defs;

},{"../generated/immutable.d.json":59,"./markdownDocs":64}],63:[function(require,module,exports){
var marked = require('marked');
var $__0=    require('../../'),Seq=$__0.Seq;
var prism = require('./prism');
var collectMemberGroups = require('./collectMemberGroups');
// Note: intentionally using raw defs, not getTypeDefs to avoid circular ref.
var defs = require('../generated/immutable.d.json');

function collectAllMembersForAllTypes(defs) {
  var allMembers = new WeakMap();
  _collectAllMembersForAllTypes(defs);
  return allMembers;
  function _collectAllMembersForAllTypes(defs) {
    Seq(defs).forEach(function(def)  {
      if (def.interface) {
        var groups = collectMemberGroups(def.interface, {
          showInherited: true,
        });
        allMembers.set(
          def.interface,
          Seq.Keyed(
            groups[''].map(function(member)  {return [member.memberName, member.memberDef];})
          ).toObject()
        );
      }
      if (def.module) {
        _collectAllMembersForAllTypes(def.module);
      }
    });
    return allMembers;
  }
}

var allMembers = collectAllMembersForAllTypes(defs);

// functions come before keywords
prism.languages.insertBefore('javascript', 'keyword', {
  var: /\b(this)\b/g,
  'block-keyword': /\b(if|else|while|for|function)\b/g,
  primitive: /\b(true|false|null|undefined)\b/g,
  function: prism.languages.function,
});

prism.languages.insertBefore('javascript', {
  qualifier: /\b[A-Z][a-z0-9_]+/g,
});

marked.setOptions({
  xhtml: true,
  highlight: function(code)  {return prism.highlight(code, prism.languages.javascript);},
});

var renderer = new marked.Renderer();

const runkitRegExp = /^<!--\s*runkit:activate((.|\n)*)-->(.|\n)*$/;
const runkitContext = { options: '{}', activated: false };

renderer.html = function (text) {
  const result = runkitRegExp.exec(text);

  if (!result) return text;

  runkitContext.activated = true;
  try {
    runkitContext.options = result[1] ? JSON.parse(result[1]) : {};
  } catch (e) {
    runkitContext.options = {};
  }
  return text;
};

renderer.code = function (code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  const runItButton = runkitContext.activated
    ? '<a class="try-it" data-options="' +
      escape(JSON.stringify(runkitContext.options)) +
      '" onClick="runIt(this)">run it</a>'
    : '';

  runkitContext.activated = false;
  runkitContext.options = '{}';

  return (
    '<code class="codeBlock">' +
    (escaped ? code : escapeCode(code, true)) +
    runItButton +
    '</code>'
  );
};

var METHOD_RX = /^(\w+)(?:[#.](\w+))?(?:\(\))?$/;
var PARAM_RX = /^\w+$/;
var MDN_TYPES = {
  Array: true,
  Object: true,
  JSON: true,
};
var MDN_BASE_URL =
  'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/';

renderer.codespan = function (text) {
  return '<code>' + decorateCodeSpan(text, this.options) + '</code>';
};

function decorateCodeSpan(text, options) {
  var context = options.context;

  if (
    context.signatures &&
    PARAM_RX.test(text) &&
    context.signatures.some(
      function(sig)  {return sig.params && sig.params.some(function(param)  {return param.name === text;});}
    )
  ) {
    return '<span class="t param">' + text + '</span>';
  }

  var method = METHOD_RX.exec(text);
  if (method) {
    method = method.slice(1).filter(Boolean);
    if (MDN_TYPES[method[0]]) {
      return (
        '<a href="' + MDN_BASE_URL + method.join('/') + '">' + text + '</a>'
      );
    }
    if (
      context.typePath &&
      !arrEndsWith(context.typePath, method) &&
      !arrEndsWith(context.typePath.slice(0, -1), method)
    ) {
      var path = findPath(context, method);
      if (path) {
        var relPath = context.relPath || '';
        return (
          '<a target="_self" href="' +
          relPath +
          '#/' +
          path.slice(1).join('/') +
          '">' +
          text +
          '</a>'
        );
      }
    }
  }

  if (options.highlight) {
    return options.highlight(unescapeCode(text), prism.languages.javascript);
  }

  return text;
}

function arrEndsWith(arr1, arr2) {
  for (var ii = 1; ii <= arr2.length; ii++) {
    if (arr2[arr2.length - ii] !== arr1[arr1.length - ii]) {
      return false;
    }
  }
  return true;
}

function findPath(context, search) {
  var relative = context.typePath;

  for (var ii = 0; ii <= relative.length; ii++) {
    var path = relative.slice(0, relative.length - ii).concat(search);
    if (
      path.reduce(
        function(def, name) 
          {return def &&
          ((def.module && def.module[name]) ||
            (def.interface &&
              allMembers &&
              allMembers.get(def.interface)[name]) ||
            undefined);},
        { module: defs }
      )
    ) {
      return path;
    }
  }
}

function escapeCode(code) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescapeCode(code) {
  return code
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function markdown(content, context) {
  context || (context = {});
  return content ? marked(content, { renderer:renderer, context:context }) : content;
}

module.exports = markdown;

},{"../../":1,"../generated/immutable.d.json":59,"./collectMemberGroups":61,"./prism":65,"marked":5}],64:[function(require,module,exports){
var $__0=    require('../../'),Seq=$__0.Seq;
var markdown = require('./markdown');

function markdownDocs(defs) {
  markdownTypes(defs, []);

  function markdownTypes(typeDefs, path) {
    Seq(typeDefs).forEach(function(typeDef, typeName)  {
      var typePath = path.concat(typeName);
      markdownDoc(typeDef.doc, { typePath:typePath });
      typeDef.call &&
        markdownDoc(typeDef.call.doc, {
          typePath:typePath,
          signatures: typeDef.call.signatures,
        });
      if (typeDef.interface) {
        markdownDoc(typeDef.interface.doc, { defs:defs, typePath:typePath });
        Seq(typeDef.interface.groups).forEach(function(group) 
          {return Seq(group.members).forEach(function(member, memberName) 
            {return markdownDoc(member.doc, {
              typePath: typePath.concat(memberName.slice(1)),
              signatures: member.signatures,
            });}
          );}
        );
      }
      typeDef.module && markdownTypes(typeDef.module, typePath);
    });
  }
}

function markdownDoc(doc, context) {
  if (!doc) {
    return;
  }
  doc.synopsis && (doc.synopsis = markdown(doc.synopsis, context));
  doc.description && (doc.description = markdown(doc.description, context));
  doc.notes &&
    doc.notes.forEach(function(note)  {
      if (note.name !== 'alias') {
        note.body = markdown(note.body, context);
      }
    });
}

module.exports = markdownDocs;

},{"../../":1,"./markdown":63}],65:[function(require,module,exports){
/* eslint-disable */

/* **********************************************
     Begin prism-core.js
********************************************** */

self =
  typeof window !== 'undefined'
    ? window // if in browser
    : typeof WorkerGlobalScope !== 'undefined' &&
      self instanceof WorkerGlobalScope
    ? self // if in worker
    : {}; // if in node js

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function () {
  // Private helper vars
  var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;

  var _ = (self.Prism = {
    util: {
      encode: function (tokens) {
        if (tokens instanceof Token) {
          return new Token(
            tokens.type,
            _.util.encode(tokens.content),
            tokens.alias
          );
        } else if (_.util.type(tokens) === 'Array') {
          return tokens.map(_.util.encode);
        } else {
          return tokens
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/\u00a0/g, ' ');
        }
      },

      type: function (o) {
        return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
      },

      // Deep clone a language definition (e.g. to extend it)
      clone: function (o) {
        var type = _.util.type(o);

        switch (type) {
          case 'Object':
            var clone = {};

            for (var key in o) {
              if (o.hasOwnProperty(key)) {
                clone[key] = _.util.clone(o[key]);
              }
            }

            return clone;

          case 'Array':
            return o.slice();
        }

        return o;
      },
    },

    languages: {
      extend: function (id, redef) {
        var lang = _.util.clone(_.languages[id]);

        for (var key in redef) {
          lang[key] = redef[key];
        }

        return lang;
      },

      /**
       * Insert a token before another token in a language literal
       * As this needs to recreate the object (we cannot actually insert before keys in object literals),
       * we cannot just provide an object, we need anobject and a key.
       * @param inside The key (or language id) of the parent
       * @param before The key to insert before. If not provided, the function appends instead.
       * @param insert Object with the key/value pairs to insert
       * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
       */
      insertBefore: function (inside, before, insert, root) {
        root = root || _.languages;
        var grammar = root[inside];

        if (arguments.length == 2) {
          insert = arguments[1];

          for (var newToken in insert) {
            if (insert.hasOwnProperty(newToken)) {
              grammar[newToken] = insert[newToken];
            }
          }

          return grammar;
        }

        var ret = {};

        for (var token in grammar) {
          if (grammar.hasOwnProperty(token)) {
            if (token == before) {
              for (var newToken in insert) {
                if (insert.hasOwnProperty(newToken)) {
                  ret[newToken] = insert[newToken];
                }
              }
            }

            ret[token] = grammar[token];
          }
        }

        // Update references in other language definitions
        _.languages.DFS(_.languages, function (key, value) {
          if (value === root[inside] && key != inside) {
            this[key] = ret;
          }
        });

        return (root[inside] = ret);
      },

      // Traverse a language definition with Depth First Search
      DFS: function (o, callback, type) {
        for (var i in o) {
          if (o.hasOwnProperty(i)) {
            callback.call(o, i, o[i], type || i);

            if (_.util.type(o[i]) === 'Object') {
              _.languages.DFS(o[i], callback);
            } else if (_.util.type(o[i]) === 'Array') {
              _.languages.DFS(o[i], callback, i);
            }
          }
        }
      },
    },

    highlightAll: function (async, callback) {
      var elements = document.querySelectorAll(
        'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
      );

      for (var i = 0, element; (element = elements[i++]); ) {
        _.highlightElement(element, async === true, callback);
      }
    },

    highlightElement: function (element, async, callback) {
      // Find language
      var language,
        grammar,
        parent = element;

      while (parent && !lang.test(parent.className)) {
        parent = parent.parentNode;
      }

      if (parent) {
        language = (parent.className.match(lang) || [, ''])[1];
        grammar = _.languages[language];
      }

      if (!grammar) {
        return;
      }

      // Set language on the element, if not present
      element.className =
        element.className.replace(lang, '').replace(/\s+/g, ' ') +
        ' language-' +
        language;

      // Set language on the parent, for styling
      parent = element.parentNode;

      if (/pre/i.test(parent.nodeName)) {
        parent.className =
          parent.className.replace(lang, '').replace(/\s+/g, ' ') +
          ' language-' +
          language;
      }

      var code = element.textContent;

      if (!code) {
        return;
      }

      var env = {
        element: element,
        language: language,
        grammar: grammar,
        code: code,
      };

      _.hooks.run('before-highlight', env);

      if (async && self.Worker) {
        var worker = new Worker(_.filename);

        worker.onmessage = function (evt) {
          env.highlightedCode = Token.stringify(JSON.parse(evt.data), language);

          _.hooks.run('before-insert', env);

          env.element.innerHTML = env.highlightedCode;

          callback && callback.call(env.element);
          _.hooks.run('after-highlight', env);
        };

        worker.postMessage(
          JSON.stringify({
            language: env.language,
            code: env.code,
          })
        );
      } else {
        env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

        _.hooks.run('before-insert', env);

        env.element.innerHTML = env.highlightedCode;

        callback && callback.call(element);

        _.hooks.run('after-highlight', env);
      }
    },

    highlight: function (text, grammar, language) {
      var tokens = _.tokenize(text, grammar);
      return Token.stringify(_.util.encode(tokens), language);
    },

    tokenize: function (text, grammar, language) {
      var Token = _.Token;

      var strarr = [text];

      var rest = grammar.rest;

      if (rest) {
        for (var token in rest) {
          grammar[token] = rest[token];
        }

        delete grammar.rest;
      }

      tokenloop: for (var token in grammar) {
        if (!grammar.hasOwnProperty(token) || !grammar[token]) {
          continue;
        }

        var patterns = grammar[token];
        patterns = _.util.type(patterns) === 'Array' ? patterns : [patterns];

        for (var j = 0; j < patterns.length; ++j) {
          var pattern = patterns[j],
            inside = pattern.inside,
            lookbehind = !!pattern.lookbehind,
            lookbehindLength = 0,
            alias = pattern.alias;

          pattern = pattern.pattern || pattern;

          for (var i = 0; i < strarr.length; i++) {
            // Don’t cache length as it changes during the loop

            var str = strarr[i];

            if (strarr.length > text.length) {
              // Something went terribly wrong, ABORT, ABORT!
              break tokenloop;
            }

            if (str instanceof Token) {
              continue;
            }

            pattern.lastIndex = 0;

            var match = pattern.exec(str);

            if (match) {
              if (lookbehind) {
                lookbehindLength = match[1].length;
              }

              var from = match.index - 1 + lookbehindLength,
                match = match[0].slice(lookbehindLength),
                len = match.length,
                to = from + len,
                before = str.slice(0, from + 1),
                after = str.slice(to + 1);

              var args = [i, 1];

              if (before) {
                args.push(before);
              }

              var wrapped = new Token(
                token,
                inside ? _.tokenize(match, inside) : match,
                alias
              );

              args.push(wrapped);

              if (after) {
                args.push(after);
              }

              Array.prototype.splice.apply(strarr, args);
            }
          }
        }
      }

      return strarr;
    },

    hooks: {
      all: {},

      add: function (name, callback) {
        var hooks = _.hooks.all;

        hooks[name] = hooks[name] || [];

        hooks[name].push(callback);
      },

      run: function (name, env) {
        var callbacks = _.hooks.all[name];

        if (!callbacks || !callbacks.length) {
          return;
        }

        for (var i = 0, callback; (callback = callbacks[i++]); ) {
          callback(env);
        }
      },
    },
  });

  var Token = (_.Token = function (type, content, alias) {
    this.type = type;
    this.content = content;
    this.alias = alias;
  });

  Token.stringify = function (o, language, parent) {
    if (typeof o == 'string') {
      return o;
    }

    if (Object.prototype.toString.call(o) == '[object Array]') {
      return o
        .map(function (element) {
          return Token.stringify(element, language, o);
        })
        .join('');
    }

    var env = {
      type: o.type,
      content: Token.stringify(o.content, language, parent),
      tag: 'span',
      classes: ['token', o.type],
      attributes: {},
      language: language,
      parent: parent,
    };

    if (env.type == 'comment') {
      env.attributes['spellcheck'] = 'true';
    }

    if (o.alias) {
      var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
      Array.prototype.push.apply(env.classes, aliases);
    }

    _.hooks.run('wrap', env);

    var attributes = '';

    for (var name in env.attributes) {
      attributes += name + '="' + (env.attributes[name] || '') + '"';
    }

    return (
      '<' +
      env.tag +
      ' class="' +
      env.classes.join(' ') +
      '" ' +
      attributes +
      '>' +
      env.content +
      '</' +
      env.tag +
      '>'
    );
  };

  if (!self.document) {
    if (!self.addEventListener) {
      // in Node.js
      return self.Prism;
    }
    // In worker
    self.addEventListener(
      'message',
      function (evt) {
        var message = JSON.parse(evt.data),
          lang = message.language,
          code = message.code;

        self.postMessage(
          JSON.stringify(_.util.encode(_.tokenize(code, _.languages[lang])))
        );
        self.close();
      },
      false
    );

    return self.Prism;
  }

  // Get current script and highlight
  var script = document.getElementsByTagName('script');

  script = script[script.length - 1];

  if (script) {
    _.filename = script.src;

    if (document.addEventListener && !script.hasAttribute('data-manual')) {
      document.addEventListener('DOMContentLoaded', _.highlightAll);
    }
  }

  return self.Prism;
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Prism;
}

/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
  comment: /<!--[\w\W]*?-->/g,
  prolog: /<\?.+?\?>/,
  doctype: /<!DOCTYPE.+?>/,
  cdata: /<!\[CDATA\[[\w\W]*?]]>/i,
  tag: {
    pattern:
      /<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,
    inside: {
      tag: {
        pattern: /^<\/?[\w:-]+/i,
        inside: {
          punctuation: /^<\/?/,
          namespace: /^[\w-]+?:/,
        },
      },
      'attr-value': {
        pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
        inside: {
          punctuation: /=|>|"/g,
        },
      },
      punctuation: /\/?>/g,
      'attr-name': {
        pattern: /[\w:-]+/g,
        inside: {
          namespace: /^[\w-]+?:/,
        },
      },
    },
  },
  entity: /\&#?[\da-z]{1,8};/gi,
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function (env) {
  if (env.type === 'entity') {
    env.attributes['title'] = env.content.replace(/&amp;/, '&');
  }
});

/* **********************************************
     Begin prism-css.js
********************************************** */

Prism.languages.css = {
  comment: /\/\*[\w\W]*?\*\//g,
  atrule: {
    pattern: /@[\w-]+?.*?(;|(?=\s*{))/gi,
    inside: {
      punctuation: /[;:]/g,
    },
  },
  url: /url\((["']?).*?\1\)/gi,
  selector: /[^\{\}\s][^\{\};]*(?=\s*\{)/g,
  property: /(\b|\B)[\w-]+(?=\s*:)/gi,
  string: /("|')(\\?.)*?\1/g,
  important: /\B!important\b/gi,
  punctuation: /[\{\};:]/g,
  function: /[-a-z0-9]+(?=\()/gi,
};

if (Prism.languages.markup) {
  Prism.languages.insertBefore('markup', 'tag', {
    style: {
      pattern: /<style[\w\W]*?>[\w\W]*?<\/style>/gi,
      inside: {
        tag: {
          pattern: /<style[\w\W]*?>|<\/style>/gi,
          inside: Prism.languages.markup.tag.inside,
        },
        rest: Prism.languages.css,
      },
      alias: 'language-css',
    },
  });

  Prism.languages.insertBefore(
    'inside',
    'attr-value',
    {
      'style-attr': {
        pattern: /\s*style=("|').+?\1/gi,
        inside: {
          'attr-name': {
            pattern: /^\s*style/gi,
            inside: Prism.languages.markup.tag.inside,
          },
          punctuation: /^\s*=\s*['"]|['"]\s*$/,
          'attr-value': {
            pattern: /.+/gi,
            inside: Prism.languages.css,
          },
        },
        alias: 'language-css',
      },
    },
    Prism.languages.markup.tag
  );
}

/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
  comment: [
    {
      pattern: /(^|[^\\])\/\*[\w\W]*?\*\//g,
      lookbehind: true,
    },
    {
      pattern: /(^|[^\\:])\/\/.*?(\r?\n|$)/g,
      lookbehind: true,
    },
  ],
  string: /("|')(\\?.)*?\1/g,
  'class-name': {
    pattern:
      /((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/gi,
    lookbehind: true,
    inside: {
      punctuation: /(\.|\\)/,
    },
  },
  keyword:
    /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,
  boolean: /\b(true|false)\b/g,
  function: {
    pattern: /[a-z0-9_]+\(/gi,
    inside: {
      punctuation: /\(/,
    },
  },
  number: /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
  operator: /[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,
  ignore: /&(lt|gt|amp);/gi,
  punctuation: /[{}[\];(),.:]/g,
};

/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
  keyword:
    /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/g,
  number: /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g,
});

Prism.languages.insertBefore('javascript', 'keyword', {
  regex: {
    pattern:
      /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
    lookbehind: true,
  },
});

if (Prism.languages.markup) {
  Prism.languages.insertBefore('markup', 'tag', {
    script: {
      pattern: /<script[\w\W]*?>[\w\W]*?<\/script>/gi,
      inside: {
        tag: {
          pattern: /<script[\w\W]*?>|<\/script>/gi,
          inside: Prism.languages.markup.tag.inside,
        },
        rest: Prism.languages.javascript,
      },
      alias: 'language-javascript',
    },
  });
}

/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
  if (!self.Prism || !self.document || !document.querySelector) {
    return;
  }

  var Extensions = {
    js: 'javascript',
    html: 'markup',
    svg: 'markup',
    xml: 'markup',
    py: 'python',
    rb: 'ruby',
  };

  Array.prototype.slice
    .call(document.querySelectorAll('pre[data-src]'))
    .forEach(function (pre) {
      var src = pre.getAttribute('data-src');
      var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
      var language = Extensions[extension] || extension;

      var code = document.createElement('code');
      code.className = 'language-' + language;

      pre.textContent = '';

      code.textContent = 'Loading…';

      pre.appendChild(code);

      var xhr = new XMLHttpRequest();

      xhr.open('GET', src, true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status < 400 && xhr.responseText) {
            code.textContent = xhr.responseText;

            Prism.highlightElement(code);
          } else if (xhr.status >= 400) {
            code.textContent =
              '✖ Error ' +
              xhr.status +
              ' while fetching file: ' +
              xhr.statusText;
          } else {
            code.textContent = '✖ Error: File does not exist or is empty';
          }
        }
      };

      xhr.send(null);
    });
})();

},{}],66:[function(require,module,exports){
(function (global){(function (){
global.runIt = function runIt(button) {
  if (!global.RunKit) return;

  var container = document.createElement('div');
  var codeElement = button.parentNode;
  var parent = codeElement.parentNode;

  parent.insertBefore(container, codeElement);
  parent.removeChild(codeElement);
  codeElement.removeChild(button);

  const options = JSON.parse(unescape(button.dataset.options));

  function withCorrectVersion(code) {
    return code.replace(
      /require\('immutable'\)/g,
      "require('immutable@4.0.0-rc.9')"
    );
  }

  global.RunKit.createNotebook({
    element: container,
    nodeVersion: options.nodeVersion || '*',
    preamble: withCorrectVersion(
      'const assert = (' +
        makeAssert +
        ")(require('immutable'));" +
        (options.preamble || '')
    ),
    source: withCorrectVersion(
      codeElement.textContent.replace(/\n(>[^\n]*\n?)+$/g, '')
    ),
    minHeight: '52px',
    onLoad: function (notebook) {
      notebook.evaluate();
    },
  });
};

function makeAssert(I) {
  var isIterable = I.isIterable || I.Iterable.isIterable;
  var html = ("\n    <style>\n      * {\n        font-size: 14px;\n        font-family: monospace;\n      }\n\n      code {\n        font-family: monospace;\n        color: #4183C4;\n        text-decoration: none;\n        text-decoration: none;\n        background: rgba(65, 131, 196, 0.1);\n        border-radius: 2px;\n        padding: 2px;\n    }\n\n      .success {\n        color: rgba(84,184,54,1.0);\n      }\n\n      .success:before {\n        content: \"✅\";\n      }\n\n      .failure {\n        color: rgba(220,47,33,1.0);\n      }\n\n      .failure i {\n        color: rgba(210,44,31,1.0);\n      }\n\n      .failure:before {\n        content: \"❌\";\n      }\n    </style>"



































);

  function compare(lhs, rhs, same, identical) {
    var both = !identical && isIterable(lhs) && isIterable(rhs);

    if (both) return lhs.equals(rhs);

    return lhs === rhs;
  }

  function message(lhs, rhs, same, identical) {
    var result = compare(lhs, rhs, same, identical);
    var comparison = result
      ? identical
        ? 'strict equal to'
        : 'does equal'
      : identical
      ? 'not strict equal to'
      : 'does not equal';
    var className = result === same ? 'success' : 'failure';
    var lhsString = isIterable(lhs) ? lhs + '' : JSON.stringify(lhs);
    var rhsString = isIterable(rhs) ? rhs + '' : JSON.stringify(rhs);

    return (html += ("\n      <span class=\"" + 
className + "\">\n        <code>" + 
lhsString + "</code>\n        " + 
comparison + "\n        <code>" + 
rhsString + "</code>\n      </span><br/>"
));
  }

  function equal(lhs, rhs) {
    return message(lhs, rhs, true);
  }

  function notEqual(lhs, rhs) {
    return message(lhs, rhs, false);
  }

  function strictEqual(lhs, rhs) {
    return message(lhs, rhs, true, true);
  }

  function notStrictEqual(lhs, rhs) {
    return message(lhs, rhs, false, true);
  }

  return { equal:equal, notEqual:notEqual, strictEqual:strictEqual, notStrictEqual:notStrictEqual };
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],67:[function(require,module,exports){
var React = require('react');
var CSSCore = require('react/lib/CSSCore');
var Router = require('react-router');
var $__0=    require('../../../../'),Seq=$__0.Seq;
var TypeKind = require('../../../lib/TypeKind');
var defs = require('../../../lib/getTypeDefs');

var InterfaceDef = React.createClass({displayName: "InterfaceDef",
  render:function() {
    var name = this.props.name;
    var def = this.props.def;
    return (
      React.createElement("span", {className: "t interfaceDef"}, 
        React.createElement("span", {className: "t keyword"}, "type "), 
        React.createElement("span", {className: "t typeName"}, name), 
        def.typeParams && [
          '<',
          Seq(def.typeParams)
            .map(function(t, k)  
              {return React.createElement("span", {className: "t typeParam", key: k}, 
                t
              );}
            )
            .interpose(', ')
            .toArray(),
          '>',
        ], 
        def.extends && [
          React.createElement("span", {className: "t keyword"}, " extends "),
          Seq(def.extends)
            .map(function(e, i)  {return React.createElement(TypeDef, {key: i, type: e});})
            .interpose(', ')
            .toArray(),
        ], 
        def.implements && [
          React.createElement("span", {className: "t keyword"}, " implements "),
          Seq(def.implements)
            .map(function(e, i)  {return React.createElement(TypeDef, {key: i, type: e});})
            .interpose(', ')
            .toArray(),
        ]
      )
    );
  },
});

exports.InterfaceDef = InterfaceDef;

var CallSigDef = React.createClass({displayName: "CallSigDef",
  render:function() {
    var info = this.props.info;
    var module = this.props.module;
    var name = this.props.name;
    var callSig = this.props.callSig || {};

    var shouldWrap = callSigLength(info, module, name, callSig) > 80;

    return (
      React.createElement("span", {className: "t callSig"}, 
        module && [React.createElement("span", {className: "t fnQualifier"}, module), '.'], 
        React.createElement("span", {className: "t fnName"}, name), 
        callSig.typeParams && [
          '<',
          Seq(callSig.typeParams)
            .map(function(t)  {return React.createElement("span", {className: "t typeParam"}, t);})
            .interpose(', ')
            .toArray(),
          '>',
        ], 
        '(', 
        callSig && functionParams(info, callSig.params, shouldWrap), 
        ')', 
        callSig.type && [': ', React.createElement(TypeDef, {info: info, type: callSig.type})]
      )
    );
  },
});

exports.CallSigDef = CallSigDef;

var TypeDef = React.createClass({displayName: "TypeDef",
  render:function() {
    var info = this.props.info;
    var type = this.props.type;
    var prefix = this.props.prefix;
    switch (type.k) {
      case TypeKind.Never:
        return this.wrap('primitive', 'never');
      case TypeKind.Any:
        return this.wrap('primitive', 'any');
      case TypeKind.Unknown:
        return this.wrap('primitive', 'unknown');
      case TypeKind.This:
        return this.wrap('primitive', 'this');
      case TypeKind.Undefined:
        return this.wrap('primitive', 'undefined');
      case TypeKind.Boolean:
        return this.wrap('primitive', 'boolean');
      case TypeKind.Number:
        return this.wrap('primitive', 'number');
      case TypeKind.String:
        return this.wrap('primitive', 'string');
      case TypeKind.Union:
        return this.wrap('union', [
          Seq(type.types)
            .map(function(t)  {return React.createElement(TypeDef, {info: info, type: t});})
            .interpose(' | ')
            .toArray(),
        ]);
      case TypeKind.Intersection:
        return this.wrap('intersection', [
          Seq(type.types)
            .map(function(t)  {return React.createElement(TypeDef, {info: info, type: t});})
            .interpose(' & ')
            .toArray(),
        ]);
      case TypeKind.Tuple:
        return this.wrap('tuple', [
          '[',
          Seq(type.types)
            .map(function(t)  {return React.createElement(TypeDef, {info: info, type: t});})
            .interpose(', ')
            .toArray(),
          ']',
        ]);
      case TypeKind.Object:
        return this.wrap('object', [
          '{',
          Seq(type.members)
            .map(function(t)  {return React.createElement(MemberDef, {member: t});})
            .interpose(', ')
            .toArray(),
          '}',
        ]);
      case TypeKind.Indexed:
        return this.wrap('indexed', [
          React.createElement(TypeDef, {info: info, type: type.type}),
          '[',
          React.createElement(TypeDef, {info: info, type: type.index}),
          ']',
        ]);
      case TypeKind.Operator:
        return this.wrap('operator', [
          this.wrap('primitive', type.operator),
          ' ',
          React.createElement(TypeDef, {info: info, type: type.type}),
        ]);
      case TypeKind.Array:
        return this.wrap('array', [
          React.createElement(TypeDef, {info: info, type: type.type}),
          '[]',
        ]);
      case TypeKind.Function:
        var shouldWrap = (prefix || 0) + funcLength(info, type) > 78;
        return this.wrap('function', [
          type.typeParams && [
            '<',
            Seq(type.typeParams)
              .map(function(t, k)  
                {return React.createElement("span", {className: "t typeParam", key: k}, 
                  t
                );}
              )
              .interpose(', ')
              .toArray(),
            '>',
          ],
          '(',
          functionParams(info, type.params, shouldWrap),
          ') => ',
          React.createElement(TypeDef, {info: info, type: type.type}),
        ]);
      case TypeKind.Param:
        return info && info.propMap[info.defining + '<' + type.param] ? (
          React.createElement(TypeDef, {type: info.propMap[info.defining + '<' + type.param]})
        ) : (
          this.wrap('typeParam', type.param)
        );
      case TypeKind.Type:
        var qualifiedType = (type.qualifier || []).concat([type.name]);
        var qualifiedTypeName = qualifiedType.join('.');
        var def = qualifiedTypeName
          .split('.')
          .reduce(
            function(def, name)  {return def && def.module && def.module[name];},
            defs.Immutable
          );
        var typeNameElement = [
          type.qualifier && [
            Seq(type.qualifier)
              .map(function(q)  {return React.createElement("span", {className: "t typeQualifier"}, q);})
              .interpose('.')
              .toArray(),
            '.',
          ],
          React.createElement("span", {className: "t typeName"}, type.name),
        ];
        if (def) {
          typeNameElement = (
            React.createElement(Router.Link, {to: '/' + qualifiedTypeName}, 
              typeNameElement
            )
          );
        }
        return this.wrap('type', [
          typeNameElement,
          type.args && [
            '<',
            Seq(type.args)
              .map(function(a)  {return React.createElement(TypeDef, {info: info, type: a});})
              .interpose(', ')
              .toArray(),
            '>',
          ],
        ]);
    }
    throw new Error('Unknown kind ' + type.k);
  },

  mouseOver:function(event) {
    CSSCore.addClass(this.getDOMNode(), 'over');
    event.stopPropagation();
  },

  mouseOut:function() {
    CSSCore.removeClass(this.getDOMNode(), 'over');
  },

  wrap:function(className, child) {
    return (
      React.createElement("span", {
        className: 't ' + className, 
        onMouseOver: this.mouseOver, 
        onFocus: this.mouseOver, 
        onMouseOut: this.mouseOut, 
        onBlur: this.mouseOut
      }, 
        child
      )
    );
  },
});

exports.TypeDef = TypeDef;

var MemberDef = React.createClass({displayName: "MemberDef",
  render:function() {
    var module = this.props.module;
    var member = this.props.member;
    return (
      React.createElement("span", {className: "t member"}, 
        module && [React.createElement("span", {className: "t fnQualifier"}, module), '.'], 
        member.index ? (
          ['[', functionParams(null, member.params), ']']
        ) : (
          React.createElement("span", {className: "t memberName"}, member.name)
        ), 
        member.type && [': ', React.createElement(TypeDef, {type: member.type})]
      )
    );
  },
});

exports.MemberDef = MemberDef;

function functionParams(info, params, shouldWrap) {
  var elements = Seq(params)
    .map(function(t)  {return [
      t.varArgs ? '...' : null,
      React.createElement("span", {className: "t param"}, t.name),
      t.optional ? '?: ' : ': ',
      React.createElement(TypeDef, {
        prefix: t.name.length + (t.varArgs ? 3 : 0) + (t.optional ? 3 : 2), 
        info: info, 
        type: t.type}
      ),
    ];})
    .interpose(shouldWrap ? [',', React.createElement("br", null)] : ', ')
    .toArray();
  return shouldWrap ? (
    React.createElement("div", {className: "t blockParams"}, elements)
  ) : (
    elements
  );
}

function callSigLength(info, module, name, sig) {
  return (module ? module.length + 1 : 0) + name.length + funcLength(info, sig);
}

function funcLength(info, sig) {
  return (
    (sig.typeParams ? 2 + sig.typeParams.join(', ').length : 0) +
    2 +
    (sig.params ? paramLength(info, sig.params) : 0) +
    (sig.type ? 2 + typeLength(info, sig.type) : 0)
  );
}

function paramLength(info, params) {
  return params.reduce(
    function(s, p) 
      {return s +
      (p.varArgs ? 3 : 0) +
      p.name.length +
      (p.optional ? 3 : 2) +
      typeLength(info, p.type);},
    (params.length - 1) * 2
  );
}

function memberLength(info, members) {
  return members.reduce(
    function(s, m) 
      {return s +
      (m.index ? paramLength(info, m.params) + 4 : m.name + 2) +
      typeLength(info, m.type);},
    (members.length - 1) * 2
  );
}

function typeLength(info, type) {
  if (!type) {
    throw new Error('Expected type');
  }
  switch (type.k) {
    case TypeKind.Never:
      return 5;
    case TypeKind.Any:
      return 3;
    case TypeKind.Unknown:
      return 7;
    case TypeKind.This:
      return 4;
    case TypeKind.Undefined:
      return 9;
    case TypeKind.Boolean:
      return 7;
    case TypeKind.Number:
      return 6;
    case TypeKind.String:
      return 6;
    case TypeKind.Union:
    case TypeKind.Intersection:
      return (
        type.types.reduce(function(s, t)  {return s + typeLength(info, t);}, 0) +
        (type.types.length - 1) * 3
      );
    case TypeKind.Tuple:
      return (
        2 +
        type.types.reduce(function(s, t)  {return s + typeLength(info, t);}, 0) +
        (type.types.length - 1) * 2
      );
    case TypeKind.Object:
      return 2 + memberLength(info, type.members);
    case TypeKind.Indexed:
      return 2 + typeLength(info, type.type) + typeLength(info, type.index);
    case TypeKind.Operator:
      return 1 + type.operator.length + typeLength(info, type.type);
    case TypeKind.Array:
      return typeLength(info, type.type) + 2;
    case TypeKind.Function:
      return 2 + funcLength(info, type);
    case TypeKind.Param:
      return info && info.propMap[info.defining + '<' + type.param]
        ? typeLength(null, info.propMap[info.defining + '<' + type.param])
        : type.param.length;
    case TypeKind.Type:
      return (
        (type.qualifier ? 1 + type.qualifier.join('.').length : 0) +
        type.name.length +
        (!type.args
          ? 0
          : type.args.reduce(
              function(s, a)  {return s + typeLength(info, a);},
              type.args.length * 2
            ))
      );
  }
  throw new Error('Type with unknown kind ' + JSON.stringify(type));
}

},{"../../../../":1,"../../../lib/TypeKind":60,"../../../lib/getTypeDefs":62,"react":"react","react-router":16,"react/lib/CSSCore":50}],68:[function(require,module,exports){
var React = require('react');
var SVGSet = require('../../src/SVGSet');
var Logo = require('../../src/Logo');
var packageJson = require('../../../../package.json');

var DocHeader = React.createClass({displayName: "DocHeader",
  render:function() {
    return (
      React.createElement("div", {className: "header"}, 
        React.createElement("div", {className: "miniHeader"}, 
          React.createElement("div", {className: "miniHeaderContents"}, 
            React.createElement("a", {href: "../", target: "_self", className: "miniLogo"}, 
              React.createElement(SVGSet, null, 
                React.createElement(Logo, {color: "#FC4349"}), 
                React.createElement(Logo, {color: "#2C3E50", inline: true})
              )
            ), 
            React.createElement("a", {href: "./", target: "_self"}, 
              "Docs (v", 
              packageJson.version, ")"
            ), 
            React.createElement("a", {href: "https://stackoverflow.com/questions/tagged/immutable.js?sort=votes"}, 
              "Questions"
            ), 
            React.createElement("a", {href: "https://github.com/immutable-js/immutable-js/"}, "Github")
          )
        )
      )
    );
  },
});

module.exports = DocHeader;

},{"../../../../package.json":58,"../../src/Logo":77,"../../src/SVGSet":78,"react":"react"}],69:[function(require,module,exports){
var React = require('react');
var Router = require('react-router');
var $__0=    require('../../../../'),Seq=$__0.Seq;
var Markdown = require('./MarkDown');

var DocOverview = React.createClass({displayName: "DocOverview",
  render:function() {
    var def = this.props.def;
    var doc = def.doc;

    return (
      React.createElement("div", null, 
        doc && (
          React.createElement("section", null, 
            React.createElement(Markdown, {contents: doc.synopsis}), 
            doc.description && React.createElement(Markdown, {contents: doc.description})
          )
        ), 

        React.createElement("h4", {className: "groupTitle"}, "API"), 

        Seq(def.module)
          .map(function(t, name)  {
            var isFunction = !t.interface && !t.module;
            if (isFunction) {
              t = t.call;
            }
            return (
              React.createElement("section", {key: name, className: "interfaceMember"}, 
                React.createElement("h3", {className: "memberLabel"}, 
                  React.createElement(Router.Link, {to: '/' + name}, 
                    name + (isFunction ? '()' : '')
                  )
                ), 
                t.doc && (
                  React.createElement(Markdown, {className: "detail", contents: t.doc.synopsis})
                )
              )
            );
          })
          .valueSeq()
          .toArray()
      )
    );
  },
});

module.exports = DocOverview;

},{"../../../../":1,"./MarkDown":71,"react":"react","react-router":16}],70:[function(require,module,exports){
var React = require('react');

var DocSearch = React.createClass({displayName: "DocSearch",
  getInitialState:function() {
    return { enabled: true };
  },
  componentDidMount:function() {
    var script = document.createElement('script');
    var firstScript = document.getElementsByTagName('script')[0];
    script.src =
      'https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.js';
    script.addEventListener(
      'load',
      function()  {
        // Initialize Algolia search.
        if (window.docsearch) {
          window.docsearch({
            apiKey: '83f61f865ef4cb682e0432410c2f7809',
            indexName: 'immutable_js',
            inputSelector: '#algolia-docsearch',
          });
        } else {
          this.setState({ enabled: false });
        }
      }.bind(this),
      false
    );
    firstScript.parentNode.insertBefore(script, firstScript);

    var link = document.createElement('link');
    var firstLink = document.getElementsByTagName('link')[0];
    link.rel = 'stylesheet';
    link.href =
      'https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.css';
    firstLink.parentNode.insertBefore(link, firstLink);
  },
  render:function() {
    return this.state.enabled ? (
      React.createElement("input", {
        id: "algolia-docsearch", 
        className: "docSearch", 
        type: "search", 
        placeholder: "Search Immutable.js Documentation"}
      )
    ) : null;
  },
});

module.exports = DocSearch;

},{"react":"react"}],71:[function(require,module,exports){
var React = require('react');

var MarkDown = React.createClass({displayName: "MarkDown",
  shouldComponentUpdate:function() {
    return false;
  },

  render:function() {
    var html = this.props.contents;
    return (
      React.createElement("div", {
        className: this.props.className, 
        dangerouslySetInnerHTML: { __html: html}}
      )
    );
  },
});

module.exports = MarkDown;

},{"react":"react"}],72:[function(require,module,exports){
var React = require('react');
var ReactTransitionEvents = require('react/lib/ReactTransitionEvents');
var Router = require('react-router');
var $__0=     require('./Defs'),CallSigDef=$__0.CallSigDef,MemberDef=$__0.MemberDef;
var PageDataMixin = require('./PageDataMixin');
var isMobile = require('./isMobile');
var MarkDown = require('./MarkDown');

var $__1=    React.addons,TransitionGroup=$__1.TransitionGroup;

var MemberDoc = React.createClass({displayName: "MemberDoc",
  mixins: [PageDataMixin, Router.Navigation],

  getInitialState:function() {
    var showDetail = this.props.showDetail;
    return { detail: showDetail };
  },

  componentDidMount:function() {
    if (this.props.showDetail) {
      var node = this.getDOMNode();
      var navType = this.getPageData().type;
      if (navType === 'init' || navType === 'push') {
        window.scrollTo(window.scrollX, offsetTop(node) - FIXED_HEADER_HEIGHT);
      }
    }
  },

  componentWillReceiveProps:function(nextProps) {
    if (nextProps.showDetail && !this.props.showDetail) {
      this.scrollTo = true;
      this.setState({ detail: true });
    }
  },

  componentDidUpdate:function() {
    if (this.scrollTo) {
      this.scrollTo = false;
      var node = this.getDOMNode();
      var navType = this.getPageData().type;
      if (navType === 'init' || navType === 'push') {
        window.scrollTo(window.scrollX, offsetTop(node) - FIXED_HEADER_HEIGHT);
      }
    }
  },

  toggleDetail:function() {
    // Note: removed this because it drops the URL bar on mobile, and that's
    // the only place it's currently being used.
    // var member = this.props.member;
    // var name = member.memberName;
    // var typeName = this.props.parentName;
    // var showDetail = this.props.showDetail;
    // if (!this.state.detail) {
    //   this.replaceWith('/' + (typeName ? typeName + '/' : '') + name );
    // } else if (this.state.detail && showDetail) {
    //   this.replaceWith('/' + (typeName || '') );
    // }
    this.setState({ detail: !this.state.detail });
  },

  render:function() {
    var typePropMap = this.props.typePropMap;
    var member = this.props.member;
    var module = member.isStatic ? this.props.parentName : null;
    var name = member.memberName;
    var def = member.memberDef;
    var doc = def.doc || {};
    var isProp = !def.signatures;

    var typeInfo = member.inherited && {
      propMap: typePropMap,
      defining: member.inherited.name,
    };

    var showDetail = isMobile ? this.state.detail : true;

    var memberAnchorLink = this.props.parentName + '/' + name;

    return (
      React.createElement("div", {className: "interfaceMember"}, 
        React.createElement("h3", {className: "memberLabel"}, 
          React.createElement(Router.Link, {
            to: '/' + memberAnchorLink, 
            onClick: isMobile ? this.toggleDetail : null
          }, 
            (module ? module + '.' : '') + name + (isProp ? '' : '()')
          )
        ), 
        React.createElement(TransitionGroup, {childFactory: makeSlideDown}, 
          showDetail && (
            React.createElement("div", {key: "detail", className: "detail"}, 
              doc.synopsis && (
                React.createElement(MarkDown, {className: "synopsis", contents: doc.synopsis})
              ), 
              isProp ? (
                React.createElement("code", {className: "codeBlock memberSignature"}, 
                  React.createElement(MemberDef, {
                    module: module, 
                    member: { name:name, type: def.type}}
                  )
                )
              ) : (
                React.createElement("code", {className: "codeBlock memberSignature"}, 
                  def.signatures.map(function(callSig, i)  {return [
                    React.createElement(CallSigDef, {
                      key: i, 
                      info: typeInfo, 
                      module: module, 
                      name: name, 
                      callSig: callSig}
                    ),
                    '\n',
                  ];})
                )
              ), 
              member.inherited && (
                React.createElement("section", null, 
                  React.createElement("h4", {className: "infoHeader"}, "Inherited from"), 
                  React.createElement("code", null, 
                    React.createElement(Router.Link, {to: '/' + member.inherited.name + '/' + name}, 
                      member.inherited.name + '#' + name
                    )
                  )
                )
              ), 
              member.overrides && (
                React.createElement("section", null, 
                  React.createElement("h4", {className: "infoHeader"}, "Overrides"), 
                  React.createElement("code", null, 
                    React.createElement(Router.Link, {to: '/' + member.overrides.name + '/' + name}, 
                      member.overrides.name + '#' + name
                    )
                  )
                )
              ), 
              doc.notes &&
                doc.notes.map(function(note, i)  
                  {return React.createElement("section", {key: i}, 
                    React.createElement("h4", {className: "infoHeader"}, note.name), 
                    note.name === 'alias' ? (
                      React.createElement("code", null, 
                        React.createElement(CallSigDef, {name: note.body})
                      )
                    ) : (
                      React.createElement(MarkDown, {className: "discussion", contents: note.body})
                    )
                  );}
                ), 
              doc.description && (
                React.createElement("section", null, 
                  React.createElement("h4", {className: "infoHeader"}, 
                    doc.description.substr(0, 5) === '<code'
                      ? 'Example'
                      : 'Discussion'
                  ), 
                  React.createElement(MarkDown, {className: "discussion", contents: doc.description})
                )
              )
            )
          )
        )
      )
    );
  },
});

function makeSlideDown(child) {
  return React.createElement(SlideDown, null, child);
}

var SlideDown = React.createClass({displayName: "SlideDown",
  componentWillEnter:function(done) {
    this.slide(false, done);
  },

  componentWillLeave:function(done) {
    this.slide(true, done);
  },

  slide:function(slidingUp, done) {
    var node = this.getDOMNode();
    node.style.height = 'auto';
    var height = getComputedStyle(node).height;
    var start = slidingUp ? height : 0;
    var end = slidingUp ? 0 : height;
    node.style.transition = '';
    node.style.height = start;
    node.style.transition = 'height 0.35s ease-in-out';
    var endListener = function()  {
      ReactTransitionEvents.removeEndEventListener(node, endListener);
      done();
    };
    ReactTransitionEvents.addEndEventListener(node, endListener);
    this.timeout = setTimeout(function()  {
      node.style.height = end;
    }, 17);
  },

  render:function() {
    return this.props.children;
  },
});

var FIXED_HEADER_HEIGHT = 75;

function offsetTop(node) {
  var top = 0;
  do {
    top += node.offsetTop;
  } while ((node = node.offsetParent));
  return top;
}

module.exports = MemberDoc;

},{"./Defs":67,"./MarkDown":71,"./PageDataMixin":73,"./isMobile":76,"react":"react","react-router":16,"react/lib/ReactTransitionEvents":53}],73:[function(require,module,exports){
var React = require('react');

module.exports = {
  contextTypes: {
    getPageData: React.PropTypes.func.isRequired,
  },

  /**
   * Returns the most recent change event.
   */
  getPageData:function() {
    return this.context.getPageData();
  },
};

},{"react":"react"}],74:[function(require,module,exports){
var React = require('react');
var Router = require('react-router');
var $__0=     require('../../../../'),Map=$__0.Map,Seq=$__0.Seq;
var defs = require('../../../lib/getTypeDefs');

var SideBar = React.createClass({displayName: "SideBar",
  render:function() {
    var type = defs.Immutable;

    return (
      React.createElement("div", {className: "sideBar"}, 
        React.createElement("div", {className: "toolBar"}, 
          React.createElement("div", {
            onClick: this.props.toggleShowInGroups, 
            onKeyPress: this.props.toggleShowInGroups
          }, 
            React.createElement("span", {className: this.props.showInGroups && 'selected'}, 
              "Grouped"
            ), 
            ' • ', 
            React.createElement("span", {className: this.props.showInGroups || 'selected'}, 
              "Alphabetized"
            )
          ), 
          React.createElement("div", {
            onClick: this.props.toggleShowInherited, 
            onKeyPress: this.props.toggleShowInherited
          }, 
            React.createElement("span", {className: this.props.showInherited && 'selected'}, 
              "Inherited"
            ), 
            ' • ', 
            React.createElement("span", {className: this.props.showInherited || 'selected'}, 
              "Defined"
            )
          )
        ), 
        React.createElement("div", {className: "scrollContent"}, 
          React.createElement("h4", {className: "groupTitle"}, "API"), 
          Seq(type.module)
            .flatMap(function(t, name)  {return flattenSubmodules(Map(), t, name);})
            .map(function(t, name)  {return this.renderSideBarType(name, t);}.bind(this))
            .valueSeq()
            .toArray()
        )
      )
    );
  },

  renderSideBarType:function(typeName, type) {
    var isFocus = this.props.focus === typeName;
    var isFunction = !type.interface && !type.module;
    var call = type.call;
    var functions = Seq(type.module).filter(function(t)  {return !t.interface && !t.module;});

    var label = typeName + (isFunction ? '()' : '');

    if (!isFocus) {
      label = React.createElement(Router.Link, {to: '/' + typeName}, label);
    }

    var memberGroups = this.props.memberGroups;

    var members =
      !isFocus || isFunction ? null : (
        React.createElement("div", {className: "members"}, 
          call && (
            React.createElement("section", null, 
              React.createElement("h4", {className: "groupTitle"}, "Construction"), 
              React.createElement("div", null, 
                React.createElement(Router.Link, {to: '/' + typeName + '/' + typeName}, 
                  typeName + '()'
                )
              )
            )
          ), 

          functions.count() > 0 && (
            React.createElement("section", null, 
              React.createElement("h4", {className: "groupTitle"}, "Static Methods"), 
              functions
                .map(function(t, name)  
                  {return React.createElement("div", {key: name}, 
                    React.createElement(Router.Link, {to: '/' + typeName + '/' + name}, 
                      typeName + '.' + name + '()'
                    )
                  );}
                )
                .valueSeq()
                .toArray()
            )
          ), 

          React.createElement("section", null, 
            Seq(memberGroups)
              .map(function(members, title) 
                {return members.length === 0
                  ? null
                  : Seq([
                      React.createElement("h4", {key: title || 'Members', className: "groupTitle"}, 
                        title || 'Members'
                      ),
                      Seq(members).map(function(member)  
                        {return React.createElement("div", {key: member.memberName}, 
                          React.createElement(Router.Link, {
                            to: '/' + typeName + '/' + member.memberName
                          }, 
                            member.memberName +
                              (member.memberDef.signatures ? '()' : '')
                          )
                        );}
                      ),
                    ]);}
              )
              .flatten()
              .valueSeq()
              .toArray()
          )
        )
      );

    return (
      React.createElement("div", {key: typeName}, 
        React.createElement("h2", null, label), 
        members
      )
    );
  },
});

function flattenSubmodules(modules, type, name) {
  modules = modules.set(name, type);
  return type.module
    ? Seq(type.module)
        .filter(function(t)  {return t.interface || t.module;})
        .reduce(
          function(modules, subT, subName) 
            {return flattenSubmodules(modules, subT, name + '.' + subName);},
          modules
        )
    : modules;
}

module.exports = SideBar;

},{"../../../../":1,"../../../lib/getTypeDefs":62,"react":"react","react-router":16}],75:[function(require,module,exports){
var React = require('react');
var Router = require('react-router');
var $__0=    require('../../../../'),Seq=$__0.Seq;
var $__1=     require('./Defs'),InterfaceDef=$__1.InterfaceDef,CallSigDef=$__1.CallSigDef;
var MemberDoc = require('./MemberDoc');
var isMobile = require('./isMobile');
var SideBar = require('./SideBar');
var MarkDown = require('./MarkDown');
var DocOverview = require('./DocOverview');
var collectMemberGroups = require('../../../lib/collectMemberGroups');
var TypeKind = require('../../../lib/TypeKind');
var defs = require('../../../lib/getTypeDefs');

var typeDefURL =
  'https://github.com/immutable-js/immutable-js/blob/main/type-definitions/Immutable.d.ts';
var issuesURL = 'https://github.com/immutable-js/immutable-js/issues';

var Disclaimer = function () {
  return (
    React.createElement("section", {className: "disclaimer"}, 
      "This documentation is generated from", ' ', 
      React.createElement("a", {href: typeDefURL}, "Immutable.d.ts"), ". Pull requests and", ' ', 
      React.createElement("a", {href: issuesURL}, "Issues"), " welcome."
    )
  );
};

var TypeDocumentation = React.createClass({displayName: "TypeDocumentation",
  getInitialState:function() {
    return {
      showInherited: true,
      showInGroups: true,
    };
  },

  toggleShowInGroups:function() {
    this.setState({ showInGroups: !this.state.showInGroups });
  },

  toggleShowInherited:function() {
    this.setState({ showInherited: !this.state.showInherited });
  },

  render:function() {
    var name = this.props.name;
    var memberName = this.props.memberName;
    var def = this.props.def;

    var memberGroups = collectMemberGroups(def && def.interface, {
      showInGroups: this.state.showInGroups,
      showInherited: this.state.showInherited,
    });

    return (
      React.createElement("div", null, 
        isMobile || (
          React.createElement(SideBar, {
            focus: name, 
            memberGroups: memberGroups, 
            toggleShowInherited: this.toggleShowInherited, 
            toggleShowInGroups: this.toggleShowInGroups, 
            showInGroups: this.state.showInGroups, 
            showInherited: this.state.showInherited}
          )
        ), 
        React.createElement("div", {key: name, className: "docContents"}, 
          !def ? (
            React.createElement(NotFound, null)
          ) : !name ? (
            React.createElement(DocOverview, {def: def})
          ) : !def.interface && !def.module ? (
            React.createElement(FunctionDoc, {name: name, def: def.call})
          ) : (
            React.createElement(TypeDoc, {
              name: name, 
              def: def, 
              memberName: memberName, 
              memberGroups: memberGroups}
            )
          )
        )
      )
    );
  },
});

function NotFound() {
  return React.createElement("div", null, "Not found");
}

var FunctionDoc = React.createClass({displayName: "FunctionDoc",
  render:function() {
    var name = this.props.name;
    var def = this.props.def;
    var doc = def.doc || {};

    return (
      React.createElement("div", null, 
        React.createElement("h1", {className: "typeHeader"}, name + '()'), 
        doc.synopsis && (
          React.createElement(MarkDown, {className: "synopsis", contents: doc.synopsis})
        ), 
        React.createElement("code", {className: "codeBlock memberSignature"}, 
          def.signatures.map(function(callSig, i)  {return [
            React.createElement(CallSigDef, {key: i, name: name, callSig: callSig}),
            '\n',
          ];})
        ), 
        doc.notes &&
          doc.notes.map(function(note, i)  
            {return React.createElement("section", {key: i}, 
              React.createElement("h4", {className: "infoHeader"}, note.name), 
              note.name === 'alias' ? (
                React.createElement(CallSigDef, {name: note.body})
              ) : (
                note.body
              )
            );}
          ), 
        doc.description && (
          React.createElement("section", null, 
            React.createElement("h4", {className: "infoHeader"}, 
              doc.description.substr(0, 5) === '<code'
                ? 'Example'
                : 'Discussion'
            ), 
            React.createElement(MarkDown, {className: "discussion", contents: doc.description})
          )
        ), 
        React.createElement(Disclaimer, null)
      )
    );
  },
});

var TypeDoc = React.createClass({displayName: "TypeDoc",
  render:function() {
    var name = this.props.name;
    var def = this.props.def;
    var memberName = this.props.memberName;
    var memberGroups = this.props.memberGroups;

    var doc = def.doc || {};
    var call = def.call;
    var functions = Seq(def.module).filter(function(t)  {return !t.interface && !t.module;});
    var types = Seq(def.module).filter(function(t)  {return t.interface || t.module;});
    var interfaceDef = def.interface;
    var typePropMap = getTypePropMap(interfaceDef);

    return (
      React.createElement("div", null, 
        React.createElement("h1", {className: "typeHeader"}, name), 
        doc.synopsis && (
          React.createElement(MarkDown, {className: "synopsis", contents: doc.synopsis})
        ), 
        interfaceDef && (
          React.createElement("code", {className: "codeBlock memberSignature"}, 
            React.createElement(InterfaceDef, {name: name, def: interfaceDef})
          )
        ), 

        doc.notes &&
          doc.notes.map(function(note, i)  
            {return React.createElement("section", {key: i}, 
              React.createElement("h4", {className: "infoHeader"}, note.name), 
              note.name === 'alias' ? (
                React.createElement(CallSigDef, {name: note.body})
              ) : (
                note.body
              )
            );}
          ), 

        doc.description && (
          React.createElement("section", null, 
            React.createElement("h4", {className: "infoHeader"}, 
              doc.description.substr(0, 5) === '<code'
                ? 'Example'
                : 'Discussion'
            ), 
            React.createElement(MarkDown, {className: "discussion", contents: doc.description})
          )
        ), 

        types.count() > 0 && (
          React.createElement("section", null, 
            React.createElement("h4", {className: "groupTitle"}, "Sub-types"), 
            types
              .map(function(t, typeName)  
                {return React.createElement("div", {key: typeName}, 
                  React.createElement(Router.Link, {
                    to: '/' + (name ? name + '.' + typeName : typeName)
                  }, 
                    name ? name + '.' + typeName : typeName
                  )
                );}
              )
              .valueSeq()
              .toArray()
          )
        ), 

        call && (
          React.createElement("section", null, 
            React.createElement("h4", {className: "groupTitle"}, "Construction"), 
            React.createElement(MemberDoc, {
              showDetail: name === memberName, 
              parentName: name, 
              member: {
                memberName: name,
                memberDef: call,
              }}
            )
          )
        ), 

        functions.count() > 0 && (
          React.createElement("section", null, 
            React.createElement("h4", {className: "groupTitle"}, "Static methods"), 
            functions
              .map(function(t, fnName)  
                {return React.createElement(MemberDoc, {
                  key: fnName, 
                  showDetail: fnName === memberName, 
                  parentName: name, 
                  member: {
                    memberName: fnName,
                    memberDef: t.call,
                    isStatic: true,
                  }}
                );}
              )
              .valueSeq()
              .toArray()
          )
        ), 

        React.createElement("section", null, 
          Seq(memberGroups)
            .map(function(members, title) 
              {return members.length === 0
                ? null
                : Seq([
                    React.createElement("h4", {key: title || 'Members', className: "groupTitle"}, 
                      title || 'Members'
                    ),
                    Seq(members).map(function(member)  
                      {return React.createElement(MemberDoc, {
                        typePropMap: typePropMap, 
                        key: member.memberName, 
                        showDetail: member.memberName === memberName, 
                        parentName: name, 
                        member: member}
                      );}
                    ),
                  ]);}
            )
            .flatten()
            .valueSeq()
            .toArray()
        ), 

        React.createElement(Disclaimer, null)
      )
    );
  },
});

/**
 * Get a map from super type parameter to concrete type definition. This is
 * used when rendering inherited type definitions to ensure contextually
 * relevant information.
 *
 * Example:
 *
 *   type A<T> implements B<number, T>
 *   type B<K, V> implements C<K, V, V>
 *   type C<X, Y, Z>
 *
 * parse C:
 *   {}
 *
 * parse B:
 *   { C<X: K
 *     C<Y: V
 *     C<Z: V }
 *
 * parse A:
 *   { B<K: number
 *     B<V: T
 *     C<X: number
 *     C<Y: T
 *     C<Z: T }
 */
function getTypePropMap(def) {
  var map = {};
  def &&
    def.extends &&
    def.extends.forEach(function(e)  {
      var superModule = defs.Immutable;
      e.name.split('.').forEach(function(part)  {
        superModule =
          superModule && superModule.module && superModule.module[part];
      });
      var superInterface = superModule && superModule.interface;
      if (superInterface) {
        var interfaceMap = Seq(superInterface.typeParams)
          .toKeyedSeq()
          .flip()
          .map(function(i)  {return e.args[i];})
          .toObject();
        Seq(interfaceMap).forEach(function(v, k)  {
          map[e.name + '<' + k] = v;
        });
        var superMap = getTypePropMap(superInterface);
        Seq(superMap).forEach(function(v, k)  {
          map[k] = v.k === TypeKind.Param ? interfaceMap[v.param] : v;
        });
      }
    });
  return map;
}

module.exports = TypeDocumentation;

},{"../../../../":1,"../../../lib/TypeKind":60,"../../../lib/collectMemberGroups":61,"../../../lib/getTypeDefs":62,"./Defs":67,"./DocOverview":69,"./MarkDown":71,"./MemberDoc":72,"./SideBar":74,"./isMobile":76,"react":"react","react-router":16}],"/home/runner/work/immutable-js/immutable-js/pages/src/docs/src/index.js":[function(require,module,exports){
var React = require('react');
var assign = require('react/lib/Object.assign');
var Router = require('react-router');
var DocHeader = require('./DocHeader');
var DocSearch = require('./DocSearch.js');
var TypeDocumentation = require('./TypeDocumentation');
var defs = require('../../../lib/getTypeDefs');

var $__0=      Router,Route=$__0.Route,DefaultRoute=$__0.DefaultRoute,RouteHandler=$__0.RouteHandler;

require('../../../lib/runkit-embed');

var Documentation = React.createClass({displayName: "Documentation",
  render:function() {
    return (
      React.createElement("div", null, 
        React.createElement(DocHeader, null), 
        React.createElement("div", {className: "pageBody", id: "body"}, 
          React.createElement("div", {className: "contents"}, 
            React.createElement(DocSearch, null), 
            React.createElement(RouteHandler, null)
          )
        )
      )
    );
  },
});

var DocDeterminer = React.createClass({displayName: "DocDeterminer",
  mixins: [Router.State],

  render:function() {
    var $__0=      determineDoc(this.getPath()),def=$__0.def,name=$__0.name,memberName=$__0.memberName;
    return React.createElement(TypeDocumentation, {def: def, name: name, memberName: memberName});
  },
});

function determineDoc(path) {
  var $__0=    path.split('/'),name=$__0[1],memberName=$__0[2];

  var namePath = name ? name.split('.') : [];
  var def = namePath.reduce(
    function(def, subName)  {return def && def.module && def.module[subName];},
    defs.Immutable
  );

  return { def:def, name:name, memberName:memberName };
}

module.exports = React.createClass({displayName: "exports",
  childContextTypes: {
    getPageData: React.PropTypes.func.isRequired,
  },

  getChildContext:function() {
    return {
      getPageData: this.getPageData,
    };
  },

  getPageData:function() {
    return this.pageData;
  },

  componentWillMount:function() {
    var location;
    var scrollBehavior;

    if (window.document) {
      location = Router.HashLocation;
      location.addChangeListener(function(change)  {
        this.pageData = assign({}, change, determineDoc(change.path));
      }.bind(this));

      this.pageData = !window.document
        ? {}
        : assign(
            {
              path: location.getCurrentPath(),
              type: 'init',
            },
            determineDoc(location.getCurrentPath())
          );

      scrollBehavior = {
        updateScrollPosition: function(position, actionType)  {
          switch (actionType) {
            case 'push':
              return this.getPageData().memberName
                ? null
                : window.scrollTo(0, 0);
            case 'pop':
              return window.scrollTo(
                position ? position.x : 0,
                position ? position.y : 0
              );
          }
        }.bind(this),
      };
    }

    Router.create({
      routes: (
        React.createElement(Route, {handler: Documentation, path: "/"}, 
          React.createElement(DefaultRoute, {handler: DocDeterminer}), 
          React.createElement(Route, {name: "type", path: "/:name", handler: DocDeterminer}), 
          React.createElement(Route, {
            name: "method", 
            path: "/:name/:memberName", 
            handler: DocDeterminer}
          )
        )
      ),
      location: location,
      scrollBehavior: scrollBehavior,
    }).run(function(Handler)  {
      this.setState({ handler: Handler });
      if (window.document) {
        window.document.title = (this.pageData.name + " — Immutable.js");
      }
    }.bind(this));
  },

  // TODO: replace this. this is hacky and probably wrong

  componentDidMount:function() {
    setTimeout(function()  {
      this.pageData.type = '';
    }.bind(this), 0);
  },

  componentDidUpdate:function() {
    setTimeout(function()  {
      this.pageData.type = '';
    }.bind(this), 0);
  },

  render:function() {
    var Handler = this.state.handler;
    return React.createElement(Handler, null);
  },
});

},{"../../../lib/getTypeDefs":62,"../../../lib/runkit-embed":66,"./DocHeader":68,"./DocSearch.js":70,"./TypeDocumentation":75,"react":"react","react-router":16,"react/lib/Object.assign":52}],76:[function(require,module,exports){
var isMobile =
  window.matchMedia && window.matchMedia('(max-device-width: 680px)');
module.exports = false && !!(isMobile && isMobile.matches);

},{}],77:[function(require,module,exports){
var React = require('react');

var Logo = React.createClass({displayName: "Logo",
  shouldComponentUpdate: function (nextProps) {
    return nextProps.opacity !== this.props.opacity;
  },

  render: function () {
    var opacity = this.props.opacity;
    if (opacity === undefined) {
      opacity = 1;
    }
    return !this.props.inline ? (
      React.createElement("g", {fill: this.props.color, style: { opacity: this.props.opacity}}, 
        React.createElement("path", {d: "M0,0l13.9,0v41.1H0L0,0z"}), 
        React.createElement("path", {d: "M18.2,0L29,0l10.7,15.8L50.4,0l10.9,0v41.1H48.1V26.3l-8.4,12.3l-8.4-12.3v14.8H18.2V0z"}), 
        React.createElement("path", {d: "M65.5,0l10.9,0L87,15.8L97.7,0l10.9,0v41.1H95.4V26.3L87,38.7l-8.4-12.3v14.8H65.5V0z"}), 
        React.createElement("path", {
          d: "M128.6,42.2c-2.6,0-4.9-0.3-7-1c-2.1-0.7-3.9-1.6-5.4-3c-1.5-1.3-2.6-3-3.4-5c-0.8-2-1.2-4.4-1.2-7.1V0" + ' ' +
          "l13.1,0v25.6c0,1.4,0.3,2.5,0.9,3.3c0.6,0.8,1.6,1.1,3,1.1c1.4,0,2.4-0.4,3-1.1c0.6-0.8,0.9-1.9,0.9-3.3V0l13.2,0v26.1" + ' ' +
          "c0,2.7-0.4,5.1-1.2,7.1c-0.8,2-2,3.7-3.5,5c-1.5,1.3-3.3,2.3-5.4,3C133.5,41.8,131.2,42.2,128.6,42.2z"}
        ), 
        React.createElement("path", {d: "M155.4,10.8h-7.6V0l28.7,0v10.8h-7.6v30.3h-13.6V10.8z"}), 
        React.createElement("path", {
          d: "M186.4,0l9.9,0l15.6,41.1h-12.9l-1.4-3.7h-12.5l-1.4,3.7h-12.9L186.4,0z M194.1,28.4l-2.8-7.2l-2.8,7.2" + ' ' +
          "H194.1z"}
        ), 
        React.createElement("path", {
          d: "M212.9,0L229,0c2.1,0,3.9,0.2,5.6,0.7c1.7,0.5,3.2,1.2,4.4,2.1s2.2,2.1,2.8,3.5c0.7,1.4,1,3,1,4.8" + ' ' +
          "c0,1.3-0.2,2.4-0.5,3.4c-0.3,0.9-0.7,1.7-1,2.3c-0.5,0.7-1,1.4-1.5,1.8c0.9,0.6,1.7,1.3,2.5,2.2c0.6,0.8,1.2,1.8,1.7,3" + ' ' +
          "c0.5,1.2,0.8,2.7,0.8,4.4c0,2-0.3,3.8-1,5.4c-0.7,1.6-1.7,3-3,4.1c-1.3,1.1-2.9,2-4.7,2.6c-1.9,0.6-4,0.9-6.3,0.9h-16.8V0z" + ' ' +
           "M230.2,12.5c0-1.9-1-2.8-3.1-2.8h-1.5v5.7h1.5C229.2,15.4,230.2,14.4,230.2,12.5z M227.1,31.4c3.1,0,4.7-1.2,4.7-3.6" + ' ' +
          "c0-2.4-1.6-3.6-4.7-3.6h-1.5v7.2H227.1z"}
        ), 
        React.createElement("path", {d: "M248.3,0L262,0v30.3h11.3v10.8h-25V0z"}), 
        React.createElement("path", {d: "M275.3,0l24.2,0v10.8h-11.1v4.6h10.9v10.2h-10.9v4.7H300v10.8h-24.7V0z"})
      )
    ) : (
      React.createElement("g", {fill: this.props.color, style: { opacity: this.props.opacity}}, 
        React.createElement("path", {d: "M0,0l13.9,0v41.1H0L0,0z M7.8,36.2V4.9H6.2v31.3H7.8z"}), 
        React.createElement("path", {
          d: "M18.2,0L29,0l10.7,15.8L50.4,0l10.9,0v41.1H48.1V26.3l-8.4,12.3l-8.4-12.3v14.8H18.2V0z M25.9,36.2V7.9" + ' ' +
          "L39.7,28L53.5,7.9v28.3h1.6V4.9h-1.6L39.7,25.2L25.9,4.9h-1.6v31.3H25.9z"}
        ), 
        React.createElement("path", {
          d: "M65.5,0l10.9,0L87,15.8L97.7,0l10.9,0v41.1H95.4V26.3L87,38.7l-8.4-12.3v14.8H65.5V0z M73.2,36.2V7.9" + ' ' +
          "L87,28l13.7-20.1v28.3h1.6V4.9h-1.6L87,25.2L73.2,4.9h-1.6v31.3H73.2z"}
        ), 
        React.createElement("path", {
          d: "M128.6,42.2c-2.6,0-4.9-0.3-7-1c-2.1-0.7-3.9-1.6-5.4-3c-1.5-1.3-2.6-3-3.4-5c-0.8-2-1.2-4.4-1.2-7.1V0" + ' ' +
          "l13.1,0v25.6c0,1.4,0.3,2.5,0.9,3.3c0.6,0.8,1.6,1.1,3,1.1c1.4,0,2.4-0.4,3-1.1c0.6-0.8,0.9-1.9,0.9-3.3V0l13.2,0v26.1" + ' ' +
          "c0,2.7-0.4,5.1-1.2,7.1c-0.8,2-2,3.7-3.5,5c-1.5,1.3-3.3,2.3-5.4,3C133.5,41.8,131.2,42.2,128.6,42.2z M128.6,34.8" + ' ' +
          "c-6.2,0-9.2-3-9.2-9.1V4.9h-1.6v20.8c0,3.5,0.9,6.1,2.8,7.9c1.9,1.8,4.6,2.7,8,2.7c3.5,0,6.2-0.9,8.1-2.7c1.9-1.8,2.8-4.5,2.8-7.9" + ' ' +
          "V4.9h-1.7v20.8C137.8,31.7,134.8,34.8,128.6,34.8z"}
        ), 
        React.createElement("path", {d: "M155.4,10.8h-7.6V0l28.7,0v10.8h-7.6v30.3h-13.6V10.8z M163,36.2V6.4h8.8V4.9h-19.2v1.5h8.8v29.8H163z"}), 
        React.createElement("path", {
          d: "M186.4,0l9.9,0l15.6,41.1h-12.9l-1.4-3.7h-12.5l-1.4,3.7h-12.9L186.4,0z M180,36.2l1.2-3.1h20.3l1.2,3.1" + ' ' +
          "h1.7L192.5,4.9h-2.3l-11.9,31.3H180z M191.3,6.4l9.6,25.2h-19.2L191.3,6.4z M194.1,28.4l-2.8-7.2l-2.8,7.2H194.1z"}
        ), 
        React.createElement("path", {
          d: "M212.9,0L229,0c2.1,0,3.9,0.2,5.6,0.7c1.7,0.5,3.2,1.2,4.4,2.1s2.2,2.1,2.8,3.5c0.7,1.4,1,3,1,4.8" + ' ' +
          "c0,1.3-0.2,2.4-0.5,3.4c-0.3,0.9-0.7,1.7-1,2.3c-0.5,0.7-1,1.4-1.5,1.8c0.9,0.6,1.7,1.3,2.5,2.2c0.6,0.8,1.2,1.8,1.7,3" + ' ' +
          "c0.5,1.2,0.8,2.7,0.8,4.4c0,2-0.3,3.8-1,5.4c-0.7,1.6-1.7,3-3,4.1c-1.3,1.1-2.9,2-4.7,2.6c-1.9,0.6-4,0.9-6.3,0.9h-16.8V0z" + ' ' +
           "M228,36.2c3.6,0,6.3-0.8,8-2.3c1.7-1.6,2.6-3.6,2.6-6.2c0-1.7-0.4-3-1.1-4c-0.7-1-1.5-1.8-2.3-2.4c-1-0.7-2.2-1.1-3.4-1.4" + ' ' +
          "c1-0.3,1.9-0.7,2.7-1.4c0.7-0.5,1.3-1.3,1.9-2.2s0.8-2.1,0.8-3.5c0-2.6-0.8-4.5-2.5-5.9c-1.6-1.3-3.9-2-6.7-2h-8.9v31.3H228z" + ' ' +
           "M220.7,19.1V6.4l7.3,0c2.7,0,4.6,0.6,5.8,1.8c1.2,1.2,1.8,2.7,1.8,4.6c0,1.9-0.6,3.4-1.8,4.6c-1.2,1.2-3.1,1.8-5.8,1.8H220.7z" + ' ' +
           "M220.7,34.7V20.6h7.2c1.3,0,2.5,0.1,3.5,0.4c1.1,0.3,2,0.7,2.9,1.2c0.8,0.6,1.5,1.3,1.9,2.2c0.5,0.9,0.7,2,0.7,3.2" + ' ' +
          "c0,2.5-0.8,4.3-2.5,5.4c-1.7,1.1-3.9,1.7-6.6,1.7H220.7z M230.2,12.5c0-1.9-1-2.8-3.1-2.8h-1.5v5.7h1.5" + ' ' +
          "C229.2,15.4,230.2,14.4,230.2,12.5z M227.1,31.4c3.1,0,4.7-1.2,4.7-3.6c0-2.4-1.6-3.6-4.7-3.6h-1.5v7.2H227.1z"}
        ), 
        React.createElement("path", {d: "M248.3,0L262,0v30.3h11.3v10.8h-25V0z M269.9,36.2v-1.5h-13.8V4.9h-1.6v31.3H269.9z"}), 
        React.createElement("path", {
          d: "M275.3,0l24.2,0v10.8h-11.1v4.6h10.9v10.2h-10.9v4.7H300v10.8h-24.7V0z M295.4,36.2v-1.5h-12.3V21.2h11.7" + ' ' +
          "v-1.5h-11.7V6.4h12.3V4.9h-13.9v31.3H295.4z"}
        )
      )
    );
  },
});

module.exports = Logo;

},{"react":"react"}],78:[function(require,module,exports){
var React = require('react');

var SVGSet = React.createClass({displayName: "SVGSet",
  render: function () {
    return (
      React.createElement("svg", {className: "svg", style: this.props.style, viewBox: "0 0 300 42.2"}, 
        this.props.children
      )
    );
  },
});

module.exports = SVGSet;

},{"react":"react"}],"immutable":[function(require,module,exports){
(function (global){(function (){
module.exports = global.Immutable;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"react":[function(require,module,exports){
(function (global){(function (){
module.exports = global.React;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},["/home/runner/work/immutable-js/immutable-js/pages/src/docs/src/index.js"])

//# sourceMappingURL=maps/bundle.js.map
