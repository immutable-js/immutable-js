import Iterable = require('./Iterable');

function invariant(condition: any, error: string): void {
  if (!condition) throw new Error(error);
}

export class Map<K, V> extends Iterable<K, V, Map<K, V>> {

  // @pragma Construction

  constructor(obj?: {[key: string]: V}) {
    super(this);
    if (!obj) {
      return Map.empty();
    }
    return <Map<K,V>>(<any>Map.fromObj(obj));
  }

  static empty(): Map<any, any> {
    return __EMPTY_MAP || (__EMPTY_MAP = Map._make(0));
  }

  static fromObj<V>(obj: {[key: string]: V}): Map<string, V> {
    var map = Map.empty().asTransient();
    for (var k in obj) if (obj.hasOwnProperty(k)) {
      map.set(k, obj[k]);
    }
    return map.asPersistent();
  }

  // @pragma Access

  public length: number;

  has(k: K): boolean {
    if (k == null || this._root == null) {
      return false;
    }
    return this._root.get(0, hashValue(k), k, <V>__SENTINEL) !== __SENTINEL;
  }

  get(k: K): V {
    if (k != null && this._root) {
      return this._root.get(0, hashValue(k), k);
    }
  }

  // @pragma Modification

  set(k: K, v: V): Map<K, V> {
    if (k == null) {
      return this;
    }
    var didAddLeaf = BoolRef();
    var newRoot = (this._root || <MNode<K, V>>__EMPTY_MNODE).set(this._ownerID, 0, hashValue(k), k, v, didAddLeaf);
    if (this._ownerID) {
      didAddLeaf.val && this.length++;
      this._root = newRoot;
      return this;
    }
    return newRoot === this._root ? this : Map._make(this.length + (didAddLeaf.val ? 1 : 0), newRoot);
  }

  delete(k: K): Map<K, V> {
    if (k == null || this._root == null) {
      return this;
    }
    var didRemoveLeaf = BoolRef();
    var newRoot = this._root.delete(this._ownerID, 0, hashValue(k), k, didRemoveLeaf);
    if (this._ownerID) {
      didRemoveLeaf.val && this.length--;
      this._root = newRoot;
      return this;
    }
    return newRoot === this._root ? this : newRoot ? Map._make(this.length - 1, newRoot) : Map.empty();
  }

  merge(map: Map<K, V>): Map<K, V> {
    var newMap = this.asTransient();
    map.iterate((value, key) => newMap.set(key, value));
    return newMap.asPersistent();
  }

  // @pragma Mutability

  isTransient(): boolean {
    return !!this._ownerID;
  }

  asTransient(): Map<K, V> {
    return this._ownerID ? this : Map._make(this.length, this._root, new OwnerID());
  }

  asPersistent(): Map<K, V> {
    this._ownerID = undefined;
    return this;
  }

  clone(): Map<K, V> {
    return Map._make(this.length, this._root, this._ownerID);
  }

  // @pragma Iteration

  iterate(
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    return this._root && this._root.iterate(this, fn, thisArg);
  }

  // @pragma Private

  private _root: MNode<K, V>;
  private _ownerID: OwnerID;

  private static _make<K, V>(length: number, root?: MNode<K, V>, ownerID?: OwnerID) {
    var map = Object.create(Map.prototype);
    map.length = length;
    map._root = root;
    map._ownerID = ownerID;
    return map;
  }
}


class OwnerID {
  constructor() {}
}


interface MNode<K, V> {
  ownerID: OwnerID;
  // TODO: separate Key and Value arrays will make all the math easier to read
  arr: Array<any>;
  get(shift: number, hash: number, key: K, not_found?: V): V;
  set(ownerID: OwnerID, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V>;
  delete(ownerID: OwnerID, shift: number, hash: number, key: K, didRemoveLeaf?: BoolRef): MNode<K, V>;
  ensureOwner(ownerID: OwnerID): MNode<K, V>;
  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean;
}


class BitmapIndexedNode<K, V> implements MNode<K, V> {

  constructor(public ownerID: OwnerID, public bitmap: number, public arr: Array<any>) {}

  get(shift: number, hash: number, key: K, not_found?: V): V {
    var bit = 1 << ((hash >>> shift) & MASK);
    if ((this.bitmap & bit) === 0) {
      return not_found;
    }
    var idx = bitmap_indexed_node_index(this.bitmap, bit);
    var key_or_nil = this.arr[2 * idx];
    var val_or_node = this.arr[2 * idx + 1];
    if (key_or_nil == null) {
      return val_or_node.get(shift + SHIFT, hash, key, not_found);
    }
    return key === key_or_nil ? val_or_node : not_found;
  }

  set(ownerID: OwnerID, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    var bit = 1 << ((hash >>> shift) & MASK);
    var idx = bitmap_indexed_node_index(this.bitmap, bit);
    if ((this.bitmap & bit) === 0) {
      didAddLeaf && (didAddLeaf.val = true);
      var n = bit_count(this.bitmap);
      if (n >= 16) { // why 16? Half of SIZE? Could we fit 32 here if we had separate storage?
        var nodes: Array<any> = [];
        var jdx = (hash >>> shift) & MASK;
        nodes[jdx] = new BitmapIndexedNode<K, V>(
          ownerID,
          1 << ((hash >>> (shift + SHIFT)) & MASK),
          [key, val]
        );
        var kvi = 0;
        for (var ii = 0; ii < SIZE; ii++) {
          if (this.bitmap & (1 << ii)) {
            nodes[ii] = this.arr[kvi] == null ?
              this.arr[kvi + 1] :
              new BitmapIndexedNode<K, V>(
                ownerID,
                1 << ((hashValue(this.arr[kvi]) >>> (shift + SHIFT)) & MASK),
                [this.arr[kvi], this.arr[kvi + 1]]
              );
            kvi += 2;
          }
        }
        return new ArrayNode<K, V>(ownerID, kvi / 2, nodes);
      }
      var editable = this.ensureOwner(ownerID);
      if (editable.arr.length == 2 * idx) {
        editable.arr.push(key, val);
      } else {
        editable.arr.splice(2 * idx, 0, key, val);
      }
      editable.bitmap |= bit;
      return editable;
    }
    var key_or_nil = this.arr[2 * idx];
    var val_or_node = this.arr[2 * idx + 1];
    var newNode: MNode<K, V>;
    if (key_or_nil == null) {
      newNode = val_or_node.set(ownerID, shift + SHIFT, hash, key, val, didAddLeaf);
      if (newNode === val_or_node) {
        return this;
      }
      return edit_and_set(this, ownerID, 2 * idx + 1, newNode);
    }
    if (key === key_or_nil) {
      if (val === val_or_node) {
        return this;
      }
      return edit_and_set(this, ownerID, 2 * idx + 1, val);
    }
    var key1hash = hashValue(key_or_nil);
    if (key1hash === hash) {
      newNode = new HashCollisionNode<K, V>(ownerID, key1hash, 2, [key_or_nil, val_or_node, key, val]);
    } else {
      newNode = (<MNode<K, V>>__EMPTY_MNODE)
        .set(ownerID, shift + SHIFT, key1hash, key_or_nil, val_or_node)
        .set(ownerID, shift + SHIFT, hash, key, val);
    }
    didAddLeaf && (didAddLeaf.val = true);
    return edit_and_set(this, ownerID, 2 * idx, null, 2 * idx + 1, newNode);
  }

  delete(ownerID: OwnerID, shift: number, hash: number, key: K, didRemoveLeaf?: BoolRef): MNode<K, V> {
    var bit = 1 << ((hash >>> shift) & MASK);
    if ((this.bitmap & bit) === 0) {
      return this;
    }
    var idx = bitmap_indexed_node_index(this.bitmap, bit);
    var key_or_nil = this.arr[2 * idx];
    var val_or_node = this.arr[2 * idx + 1];
    if (key_or_nil == null) {
      var n = val_or_node.delete(ownerID, shift + SHIFT, hash, key, didRemoveLeaf);
      if (n === val_or_node) {
        return this;
      }
      if (n != null) {
        return edit_and_set(this, ownerID, 2 * idx + 1, n);
      }
      if (this.bitmap === bit) {
        return null;
      }
      return edit_and_remove_pair(this, ownerID, bit, idx);
    }
    if (key === key_or_nil) {
      didRemoveLeaf && (didRemoveLeaf.val = true);
      return edit_and_remove_pair(this, ownerID, bit, idx);
    }
    return this;
  }

  ensureOwner(ownerID: OwnerID): BitmapIndexedNode<K, V> {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new BitmapIndexedNode<K, V>(ownerID, this.bitmap, this.arr.slice());
  }

  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    return mNodeIterate(map, this.arr, fn, thisArg);
  }
}


class ArrayNode<K, V> implements MNode<K, V> {

  constructor(public ownerID: OwnerID, public cnt: number, public arr: Array<MNode<K, V>>) {}

  get(shift: number, hash: number, key: K, not_found?: V): V {
    var idx = (hash >>> shift) & MASK;
    return this.arr[idx] ?
      this.arr[idx].get(shift + SHIFT, hash, key, not_found) :
      not_found;
  }

  set(ownerID: OwnerID, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    var idx = (hash >>> shift) & MASK;
    var node = <MNode<K, V>>this.arr[idx];
    var newNode = (node || <MNode<K, V>>__EMPTY_MNODE).set(ownerID, shift + SHIFT, hash, key, val, didAddLeaf);
    if (newNode === node) {
      return this;
    }
    var editable = this.ensureOwner(ownerID);
    editable.arr[idx] = newNode;
    if (!node) {
      editable.cnt++;
    }
    return editable;
  }

  delete(ownerID: OwnerID, shift: number, hash: number, key: K, didRemoveLeaf?: BoolRef): MNode<K, V> {
    var idx = (hash >>> shift) & MASK;
    var node = this.arr[idx];
    if (node == null) {
      return this;
    }
    var n = node.delete(ownerID, shift + SHIFT, hash, key, didRemoveLeaf);
    if (n === node) {
      return this;
    }
    if (n == null) {
      if (this.cnt <= 8) { // why 8?
        var len = 2 * (this.cnt - 1);
        var new_arr = new Array(len);
        var j = 1;
        var bitmap = 0;
        for (var i = 0; i < len; i++) {
          if (i !== idx && this.arr[i] != null) {
            new_arr[j] = this.arr[i];
            bitmap |= 1 << i;
            j += 2;
          }
        }
        return new BitmapIndexedNode<K, V>(ownerID, bitmap, new_arr);
      }
      var editable = this.ensureOwner(ownerID);
      editable.arr[idx] = n;
      editable.cnt--;
      return editable;
    }
    return edit_and_set(this, ownerID, idx, n);
  }

  ensureOwner(ownerID: OwnerID): ArrayNode<K, V> {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new ArrayNode<K, V>(ownerID, this.cnt, this.arr.slice());
  }

  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    for (var i = 0; i < this.arr.length; i++) {
      var item = this.arr[i];
      if (item && !item.iterate(map, fn, thisArg)) {
        return false;
      }
    }
    return true;
  }
}


class HashCollisionNode<K, V> implements MNode<K, V> {

  constructor(public ownerID: OwnerID, public collisionHash: number, public cnt: number, public arr: Array<any>) {}

  get(shift: number, hash: number, key: K, not_found: V): V {
    var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
    if (idx >= 0 && key === this.arr[idx]) {
      return this.arr[idx + 1];
    }
    return not_found;
  }

  set(ownerID: OwnerID, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    if (hash !== this.collisionHash) {
      return new BitmapIndexedNode<K, V>(
        ownerID,
        1 << ((this.collisionHash >>> shift) & MASK),
        [null, this]
      ).set(ownerID, shift, hash, key, val, didAddLeaf);
    }
    var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
    if (idx === -1) {
      var editable = this.ensureOwner(ownerID);
      editable.arr.push(key, val);
      editable.cnt += 1;
      didAddLeaf && (didAddLeaf.val = true);
      return editable;
    }
    if (this.arr[idx + 1] === val) {
      return this;
    }
    return edit_and_set(this, ownerID, idx + 1, val);
  }

  delete(ownerID: OwnerID, shift: number, hash: number, key: K, didRemoveLeaf?: BoolRef): MNode<K, V> {
    var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
    if (idx === -1) {
      return this;
    }
    didRemoveLeaf && (didRemoveLeaf.val = true);
    if (this.cnt === 1) {
      return null;
    }
    var editable = this.ensureOwner(ownerID);
    var earr = editable.arr;
    var arrLen = earr.length;
    if (idx < arrLen - 2) {
      earr[idx] = earr[arrLen - 2];
      earr[idx + 1] = earr[arrLen - 1];
    }
    earr.length -= 2;
    editable.cnt--;
    return editable;
  }

  ensureOwner(ownerID: OwnerID): HashCollisionNode<K, V> {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new HashCollisionNode<K, V>(ownerID, this.collisionHash, this.cnt, this.arr.slice());
  }

  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    return mNodeIterate(map, this.arr, fn, thisArg);
  }
}




interface BoolRef {
  val: boolean;
}

function BoolRef(val?: boolean): BoolRef {
  __BOOL_REF.val = val;
  return __BOOL_REF;
}

var __BOOL_REF = {val: false};




function hashValue(o: any): number {
  if (!o) { // false, 0, and null
    return 0;
  }
  if (o === true) {
    return 1;
  }
  if (o.hash instanceof Function) {
    return o.hash();
  }
  if (typeof o === 'number') {
    return Math.floor(o) % 2147483647; // 2^31-1
  }
  if (typeof o === 'string') {
    return hashString(o);
  }
  throw new Error('Unable to hash');
}

function hashString(string: string): number {
  var hash = STRING_HASH_CACHE[string];
  if (hash == null) {
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
var STRING_HASH_CACHE: {[key: string]: number} = {};








function mNodeIterate<K, V>(
  map: Map<K, V>,
  arr: Array<any>,
  fn: (value: V, key: K, collection: Map<K, V>) => any,
  thisArg: any
) {
  for (var i = 0; i < arr.length; i += 2) {
    var k = arr[i];
    if (k != null) {
      if (fn.call(thisArg, arr[i + 1], k, map) === false) {
        return false;
      }
    } else {
      var node = arr[i + 1];
      if (node && !node.iterate(map, fn, thisArg)) {
        return false;
      }
    }
  }
  return true;
}

function hash_collision_node_find_index<K>(arr: Array<any>, cnt: number, key: K): number {
  var lim = 2 * cnt;
  for (var i = 0; i < lim; i += 2) {
    if (key === arr[i]) {
      return i;
    }
  }
  return -1;
}

function bitmap_indexed_node_index(bitmap: number, bit: number): number {
  return bit_count(bitmap & (bit - 1));
}

// Hamming weight
function bit_count(n: number): number {
  n -= (n >> 1) & 0x55555555;
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

function edit_and_set<K, V, T>(node: MNode<K, V>, ownerID: OwnerID, i: number, a: T, j?: number, b?: T): MNode<K, V> {
  var editable = node.ensureOwner(ownerID);
  editable.arr[i] = a;
  if (j != null) {
    editable.arr[j] = b;
  }
  return editable;
}

function edit_and_remove_pair<K, V>(node: BitmapIndexedNode<K, V>, ownerID: OwnerID, bit: number, i: number): BitmapIndexedNode<K, V> {
  if (this.bitmap === bit) {
    return null;
  }
  var editable = node.ensureOwner(ownerID);
  var earr = editable.arr;
  editable.bitmap ^= bit;
  earr.splice(2 * i, 2);
  return editable;
}


var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_MNODE: MNode<any, any> = new BitmapIndexedNode(null, 0, []);
var __EMPTY_MAP: Map<any, any>;
