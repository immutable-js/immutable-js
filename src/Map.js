/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

var Sequence = require('./Sequence').Sequence;


class Map extends Sequence {

  // @pragma Construction

  constructor(sequence) {
    if (sequence && sequence.constructor === Map) {
      return sequence;
    }
    if (!sequence || sequence.length === 0) {
      return Map.empty();
    }
    return Map.empty().merge(sequence);
  }

  static empty() {
    return __EMPTY_MAP || (__EMPTY_MAP = Map._make(0));
  }

  toString() {
    return this.__toString('Map {', '}');
  }

  // @pragma Access

  get(k, undefinedValue) {
    if (k == null || this._root == null) {
      return undefinedValue;
    }
    return this._root.get(0, hashValue(k), k, undefinedValue);
  }

  // @pragma Modification

  set(k, v) {
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
    return newRoot === this._root ? this : Map._make(newLength, newRoot);
  }

  delete(k) {
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
    return !newRoot ? Map.empty() : newRoot === this._root ? this : Map._make(this.length - 1, newRoot);
  }

  clear() {
    if (this.__ownerID) {
      this.length = 0;
      this._root = null;
      return this;
    }
    return Map.empty();
  }

  // @pragma Composition

  merge(/*...seqs*/) {
    return mergeIntoMapWith(this, null, arguments);
  }

  mergeWith(merger, ...seqs) {
    return mergeIntoMapWith(this, merger, seqs);
  }

  mergeDeep(/*...seqs*/) {
    return mergeIntoMapWith(this, deepMerger(null), arguments);
  }

  mergeDeepWith(merger, ...seqs) {
    return mergeIntoMapWith(this, deepMerger(merger), seqs);
  }

  updateIn(keyPath, updater) {
    return updateInDeepMap(this, keyPath, updater, 0);
  }

  // @pragma Mutability

  withMutations(fn) {
    var mutable = this.asMutable();
    fn(mutable);
    return mutable.__ensureOwner(this.__ownerID);
  }

  asMutable() {
    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
  }

  asImmutable() {
    return this.__ensureOwner();
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return Map._make(this.length, this._root, ownerID);
  }

  // @pragma Iteration

  __deepEqual(other) {
    var is = require('./Immutable').is;
    // Using Sentinel here ensures that a missing key is not interpretted as an
    // existing key set to be null.
    var self = this;
    return other.every((v, k) => is(self.get(k, __SENTINEL), v));
  }

  __iterate(fn, reverse) {
    return this._root ? this._root.iterate(this, fn, reverse) : 0;
  }

  // @pragma Private

  static _make(length, root, ownerID) {
    var map = Object.create(Map.prototype);
    map.length = length;
    map._root = root;
    map.__ownerID = ownerID;
    return map;
  }
}

Map.from = Map;


class OwnerID {
  constructor() {}
}


class BitmapIndexedNode {

  constructor(ownerID, bitmap, keys, values) {
    this.ownerID = ownerID;
    this.bitmap = bitmap;
    this.keys = keys;
    this.values = values;
  }

  get(shift, hash, key, notFound) {
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
  }

  set(ownerID, shift, hash, key, value, didAddLeaf) {
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
      newNode = makeNode(ownerID, shift + SHIFT, originalHash, keyOrNull, valueOrNode)
        .set(ownerID, shift + SHIFT, hash, key, value);
    }
    didAddLeaf && (didAddLeaf.value = true);
    editable = this.ensureOwner(ownerID);
    delete editable.keys[idx];
    editable.values[idx] = newNode;
    return editable;
  }

  delete(ownerID, shift, hash, key, didRemoveLeaf) {
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
  }

  ensureOwner(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new BitmapIndexedNode(ownerID, this.bitmap, this.keys.slice(), this.values.slice());
  }

  iterate(map, fn, reverse) {
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
}


class HashCollisionNode {

  constructor(ownerID, collisionHash, keys, values) {
    this.ownerID = ownerID;
    this.collisionHash = collisionHash;
    this.keys = keys;
    this.values = values;
  }

  get(shift, hash, key, notFound) {
    var idx = Sequence(this.keys).indexOf(key);
    return idx === -1 ? notFound : this.values[idx];
  }

  set(ownerID, shift, hash, key, value, didAddLeaf) {
    if (hash !== this.collisionHash) {
      didAddLeaf && (didAddLeaf.value = true);
      return makeNode(ownerID, shift, hash, null, this)
        .set(ownerID, shift, hash, key, value);
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
  }

  delete(ownerID, shift, hash, key, didRemoveLeaf) {
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
  }

  ensureOwner(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new HashCollisionNode(ownerID, this.collisionHash, this.keys.slice(), this.values.slice());
  }

  iterate(map, fn, reverse) {
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
}


function makeNode(ownerID, shift, hash, key, valOrNode) {
  var idx = (hash >>> shift) & MASK;
  var keys = [];
  var values = [];
  values[idx] = valOrNode;
  key != null && (keys[idx] = key);
  return new BitmapIndexedNode(ownerID, 1 << idx, keys, values);
}

function deepMerger(merger) {
  return (existing, value) =>
    existing && existing.mergeDeepWith ?
      existing.mergeDeepWith(merger, value) :
      merger ? merger(existing, value) : value;
}

function mergeIntoMapWith(map, merger, seqs) {
  if (seqs.length === 0) {
    return map;
  }
  return map.withMutations(map => {
    for (var ii = 0; ii < seqs.length; ii++) {
      var seq = seqs[ii];
      if (seq) {
        seq = seq.forEach ? seq : Sequence(seq);
        seq.forEach(
          merger ?
          (value, key) => {
            var existing = map.get(key, __SENTINEL);
            map.set(key, existing === __SENTINEL ? value : merger(existing, value));
          } :
          (value, key) => {
            map.set(key, value);
          }
        );
      }
    }
  });
}

function updateInDeepMap(collection, keyPath, updater, pathOffset) {
  var key = keyPath[pathOffset];
  var nested = collection.get ? collection.get(key, __SENTINEL) : __SENTINEL;
  if (nested === __SENTINEL) {
    return collection;
  }
  return collection.set ? collection.set(
    key,
    pathOffset === keyPath.length - 1 ?
      updater(nested) :
      updateInDeepMap(nested, keyPath, updater, pathOffset + 1)
  ) : collection;
}

var __BOOL_REF = {value: false};
function BoolRef(value) {
  __BOOL_REF.value = value;
  return __BOOL_REF;
}

function hashValue(o) {
  if (!o) { // false, 0, and null
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
    return Math.floor(o) % 2147483647; // 2^31-1
  }
  if (type === 'string') {
    return hashString(o);
  }
  throw new Error('Unable to hash');
}

// http://jsperf.com/string-hash-to-int
function hashString(string) {
  var hash = STRING_HASH_CACHE[string];
  if (hash == null) {
    // This is the hash from JVM
    // The hash code for a string is computed as
    // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
    // where s[i] is the ith character of the string and n is the length of
    // the string. We mod the result to make it between 0 (inclusive) and 2^32
    // (exclusive).
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


var STRING_HASH_MAX_VAL = 0x100000000; // 2^32
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var STRING_HASH_CACHE = {};


var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_MAP;

module.exports = Map;
