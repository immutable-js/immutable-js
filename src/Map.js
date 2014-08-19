/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Sequence"
import "is"
import "invariant"
import "Cursor"
import "TrieUtils"
/* global Sequence, is, invariant, Cursor,
          SIZE, SHIFT, MASK, NOT_SET, OwnerID */
/* exported Map, MapPrototype */


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
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }

  toString() {
    return this.__toString('Map {', '}');
  }

  // @pragma Access

  get(k, notSetValue) {
    return this._root ?
      this._root.get(0, hashValue(k), k, notSetValue) :
      notSetValue;
  }

  // @pragma Modification

  set(k, v) {
    return updateMap(this, k, v);
  }

  delete(k) {
    return updateMap(this, k, NOT_SET);
  }

  update(k, updater) {
    return this.set(k, updater(this.get(k)));
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
    if (!keyPath || keyPath.length === 0) {
      return updater(this);
    }
    return updateInDeepMap(this, keyPath, updater, 0);
  }

  cursor(keyPath, onChange) {
    if (!onChange && typeof keyPath === 'function') {
      onChange = keyPath;
      keyPath = null;
    }
    if (keyPath && !Array.isArray(keyPath)) {
      keyPath = [keyPath];
    }
    return new Cursor(this, keyPath, onChange);
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

  __iterate(fn, reverse) {
    var map = this;
    if (!map._root) {
      return 0;
    }
    var iterations = 0;
    this._root.iterate(entry => {
      if (fn(entry[1], entry[0], map) === false) {
        return false;
      }
      iterations++;
    }, reverse);
    return iterations;
  }

  __deepEqual(other) {
    // Using NOT_SET here ensures that a missing key is not interpretted as an
    // existing key set to be null/undefined.
    var self = this;
    return other.every((v, k) => is(self.get(k, NOT_SET), v));
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return makeMap(this.length, this._root, ownerID);
  }
}

var MapPrototype = Map.prototype;
Map.from = Map;


class BitmapIndexedNode {

  constructor(ownerID, bitmap, nodes) {
    this.ownerID = ownerID;
    this.bitmap = bitmap;
    this.nodes = nodes;
  }

  get(shift, hash, key, notSetValue) {
    var bit = (1 << ((hash >>> shift) & MASK));
    var map = this.bitmap;
    return (map & bit) === 0 ? notSetValue :
      this.nodes[popCount(map & (bit - 1))].get(shift + SHIFT, hash, key, notSetValue);
  }

  update(ownerID, shift, hash, key, value, didChangeLength) {
    var hashFrag = (hash >>> shift) & MASK;
    var bit = 1 << hashFrag;
    var map = this.bitmap;
    var exists = (map & bit) !== 0;

    if (!exists && value === NOT_SET) {
      return this;
    }

    var idx = popCount(map & (bit - 1));
    var nodes = this.nodes;
    var node = exists ? nodes[idx] : null;
    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeLength);

    if (newNode === node) {
      return this;
    }

    if (!exists && newNode && nodes.length >= MAX_BITMAP_SIZE) {
      var count = 0;
      var newNodes = [];
      for (var ii = 0; map !== 0; ii++, map >>>= 1) {
        if (map & 1) {
          newNodes[ii] = nodes[count++];
        }
      }
      newNodes[hashFrag] = newNode;
      return new ArrayNode(ownerID, count + 1, newNodes);
    }

    if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
      return nodes[idx ^ 1];
    }

    if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
      return newNode;
    }

    var editable = this.ensureOwner(ownerID);

    if (exists) {
      if (newNode) {
        editable.nodes[idx] = newNode;
      } else {
        editable.nodes.splice(idx, 1);
        editable.bitmap ^= bit;
      }
    } else {
      editable.nodes.splice(idx, 0, newNode);
      editable.bitmap |= bit;
    }

    return editable;
  }

  ensureOwner(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new BitmapIndexedNode(ownerID, this.bitmap, this.nodes.slice());
  }

  iterate(fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      if (nodes[reverse ? maxIndex - ii : ii].iterate(fn, reverse) === false) {
        return false;
      }
    }
  }
}

class ArrayNode {

  constructor(ownerID, count, nodes) {
    this.ownerID = ownerID;
    this.count = count;
    this.nodes = nodes;
  }

  get(shift, hash, key, notSetValue) {
    var idx = (hash >>> shift) & MASK;
    var node = this.nodes[idx];
    return node ? node.get(shift + SHIFT, hash, key, notSetValue) : notSetValue;
  }

  update(ownerID, shift, hash, key, value, didChangeLength) {
    var idx = (hash >>> shift) & MASK;
    var deleted = value === NOT_SET;
    var nodes = this.nodes;
    var node = nodes[idx];

    if (deleted && !node) {
      return this;
    }

    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeLength);
    if (newNode === node) {
      return this;
    }

    var newCount = this.count;
    if (!node) {
      newCount++;
    } else if (!newNode) {
      newCount--;
      if (newCount <= MIN_ARRAY_SIZE) {
        var packedNodes = [];
        var bitmap = 0;
        for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
          var nodeII = nodes[ii];
          if (ii !== idx && nodeII) {
            packedNodes.push(nodeII);
            bitmap |= bit;
          }
        }
        return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
      }
    }

    if (ownerID && ownerID === this.ownerID) {
      this.count = newCount;
      this.nodes[idx] = newNode;
      return this;
    }

    var newNodes = nodes.slice();
    newNodes[idx] = newNode;
    return new ArrayNode(ownerID, newCount, newNodes);
  }

  iterate(fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  }
}

class HashCollisionNode {

  constructor(ownerID, hash, entries) {
    this.ownerID = ownerID;
    this.hash = hash;
    this.entries = entries;
  }

  get(shift, hash, key, notSetValue) {
    var entries = this.entries;
    for (var ii = 0, len = entries.length; ii < len; ii++) {
      if (key === entries[ii][0]) {
        return entries[ii][1];
      }
    }
    return notSetValue;
  }

  update(ownerID, shift, hash, key, value, didChangeLength) {
    var deleted = value === NOT_SET;
    var editable;

    if (hash !== this.hash) {
      if (deleted) {
        return this;
      }
      didChangeLength && (didChangeLength.value = true);
      return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
    }

    var entries = this.entries;
    for (var ii = 0, len = entries.length; ii < len; ii++) {
      if (key === entries[ii][0]) {
        deleted && didChangeLength && (didChangeLength.value = true);
        if (deleted && len === 2) {
          return new ValueNode(ownerID, this.hash, entries[ii]);
        }
        editable = this.ensureOwner(ownerID);
        if (deleted) {
          ii === len - 1 ? editable.entries.pop() : (editable.entries[ii] = editable.entries.pop());
        } else {
          editable.entries[ii] = [key, value];
        }
        return editable;
      }
    }

    if (deleted) {
      return this;
    }

    didChangeLength && (didChangeLength.value = true);
    editable = this.ensureOwner(ownerID);
    editable.push([key, value]);
    return editable;
  }

  ensureOwner(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new HashCollisionNode(ownerID, this.hash, this.entries.slice());
  }

  iterate(fn, reverse) {
    var entries = this.entries;
    var maxIndex = entries.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  }
}

class ValueNode {

  constructor(ownerID, hash, entry) {
    this.ownerID = ownerID;
    this.hash = hash;
    this.entry = entry;
  }

  get(shift, hash, key, notSetValue) {
    return key === this.entry[0] ? this.entry[1] : notSetValue;
  }

  update(ownerID, shift, hash, key, value, didChangeLength) {
    var keyMatch = key === this.entry[0];
    if (value === NOT_SET) {
      keyMatch && didChangeLength && (didChangeLength.value = true);
      return keyMatch ? null : this;
    }

    if (keyMatch) {
      if (value === this.entry[1]) {
        return this;
      }
      if (ownerID && ownerID === this.ownerID) {
        this.entry[1] = value;
        return this;
      }
      return new ValueNode(ownerID, hash, [key, value]);
    }

    didChangeLength && (didChangeLength.value = true);
    return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
  }

  iterate(fn) {
    return fn(this.entry);
  }
}

var BOOL_REF = {value: false};
function BoolRef(value) {
  BOOL_REF.value = value;
  return BOOL_REF;
}

function makeMap(length, root, ownerID) {
  var map = Object.create(MapPrototype);
  map.length = length;
  map._root = root;
  map.__ownerID = ownerID;
  return map;
}

function updateMap(map, k, v) {
  var didChangeLength = BoolRef();
  var newRoot = updateNode(map._root, map.__ownerID, 0, hashValue(k), k, v, didChangeLength);
  var newLength = map.length + (didChangeLength.value ? v === NOT_SET ? -1 : 1 : 0);
  if (map.__ownerID) {
    map.length = newLength;
    map._root = newRoot;
    return map;
  }
  return newRoot ? newRoot === map._root ? map : makeMap(newLength, newRoot) : Map.empty();
}

function updateNode(node, ownerID, shift, hash, key, value, didChangeLength) {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    didChangeLength && (didChangeLength.value = true);
    return new ValueNode(ownerID, hash, [key, value]);
  }
  return node.update(ownerID, shift, hash, key, value, didChangeLength);
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
  var nodes = idx1 === idx2 ?
    [mergeIntoNode(node, ownerID, shift + SHIFT, hash, entry)] :
    ((newNode = new ValueNode(ownerID, hash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);

  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
}

function mergeIntoMapWith(map, merger, iterables) {
  var seqs = [];
  for (var ii = 0; ii < iterables.length; ii++) {
    var seq = iterables[ii];
    seq && seqs.push(
      Array.isArray(seq) ? Sequence(seq).fromEntries() : Sequence(seq)
    );
  }
  return mergeIntoCollectionWith(map, merger, seqs);
}

function deepMerger(merger) {
  return (existing, value) =>
    existing && existing.mergeDeepWith ?
      existing.mergeDeepWith(merger, value) :
      merger ? merger(existing, value) : value;
}

function mergeIntoCollectionWith(collection, merger, seqs) {
  if (seqs.length === 0) {
    return collection;
  }
  return collection.withMutations(collection => {
    var mergeIntoMap = merger ?
      (value, key) => {
        var existing = collection.get(key, NOT_SET);
        collection.set(
          key, existing === NOT_SET ? value : merger(existing, value)
        );
      } :
      (value, key) => {
        collection.set(key, value);
      }
    for (var ii = 0; ii < seqs.length; ii++) {
      seqs[ii].forEach(mergeIntoMap);
    }
  });
}

function updateInDeepMap(collection, keyPath, updater, pathOffset) {
  var key = keyPath[pathOffset];
  var nested = collection.get ? collection.get(key, NOT_SET) : NOT_SET;
  if (nested === NOT_SET) {
    nested = Map.empty();
  }
  invariant(collection.set, 'updateIn with invalid keyPath');
  return collection.set(
    key,
    ++pathOffset === keyPath.length ?
      updater(nested) :
      updateInDeepMap(nested, keyPath, updater, pathOffset)
  );
}

function popCount(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x = x + (x >> 8);
  x = x + (x >> 16);
  return x & 0x7f;
}

function hashValue(o) {
  if (!o) { // false, 0, and null
    return 0;
  }
  if (o === true) {
    return 1;
  }
  var type = typeof o;
  if (type === 'number') {
    if ((o | 0) === o) {
      return o % HASH_MAX_VAL;
    }
    o = '' + o;
    type = 'string';
  }
  if (type === 'string') {
    return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
  }
  if (o.hashCode && typeof o.hashCode === 'function') {
    return o.hashCode();
  }
  throw new Error('Unable to hash: ' + o);
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

// http://jsperf.com/hashing-strings
function hashString(string) {
  // This is the hash from JVM
  // The hash code for a string is computed as
  // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
  // where s[i] is the ith character of the string and n is the length of
  // the string. We mod the result to make it between 0 (inclusive) and 2^32
  // (exclusive).
  var hash = 0;
  for (var ii = 0; ii < string.length; ii++) {
    hash = (31 * hash + string.charCodeAt(ii));
  }
  return hash % HASH_MAX_VAL;
}

var HASH_MAX_VAL = 0x100000000; // 2^32
var STRING_HASH_CACHE_MIN_STRLEN = 16;
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var STRING_HASH_CACHE = {};

var MAX_BITMAP_SIZE = SIZE / 2;
var MIN_ARRAY_SIZE = SIZE / 4;

var EMPTY_MAP;
