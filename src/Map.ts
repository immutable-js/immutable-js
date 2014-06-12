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
    var newLength = this.length;
    var newRoot: MNode<K, V>;
    if (this._root) {
      var didAddLeaf = BoolRef();
      newRoot = this._root.set(this._ownerID, 0, hashValue(k), k, v, didAddLeaf);
      didAddLeaf.val && newLength++;
    } else {
      newLength++;
      newRoot = makeNode<K, V>(this._ownerID, 0, hashValue(k), k, v);
    }
    if (this._ownerID) {
      this.length = newLength;
      this._root = newRoot;
      return this;
    }
    return newRoot === this._root ? this : Map._make(newLength, newRoot);
  }

  delete(k: K): Map<K, V> {
    if (k == null || this._root == null) {
      return this;
    }
    if (this._ownerID) {
      var didRemoveLeaf = BoolRef();
      this._root = this._root.delete(this._ownerID, 0, hashValue(k), k, didRemoveLeaf);
      didRemoveLeaf.val && this.length--;
      return this;
    }
    var newRoot = this._root.delete(this._ownerID, 0, hashValue(k), k);
    return !newRoot ? Map.empty() : newRoot === this._root ? this : Map._make(this.length - 1, newRoot);
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
    return Map._make(this.length, this._root, this._ownerID && new OwnerID());
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


function makeNode<K, V>(ownerID: OwnerID, shift: number, hash: number, key: K, valOrNode: any): BitmapIndexedNode<K, V> {
  var idx = (hash >>> shift) & MASK;
  var keys: Array<any> = [];
  var values: Array<any> = [];
  values[idx] = valOrNode;
  key != null && (keys[idx] = key);
  return new BitmapIndexedNode<K, V>(ownerID, 1 << idx, 1, keys, values);
}


class BitmapIndexedNode<K, V> implements MNode<K, V> {

  constructor(public ownerID: OwnerID, public bitmap: number, public cnt: number, public keys: Array<any>, public values: Array<any>) {}

  get(shift: number, hash: number, key: K, not_found?: V): V {
    var idx = (hash >>> shift) & MASK;
    if ((this.bitmap & (1 << idx)) === 0) {
      return not_found;
    }
    var key_or_nil = this.keys[idx];
    var val_or_node = this.values[idx];
    if (key_or_nil == null) {
      return val_or_node.get(shift + SHIFT, hash, key, not_found);
    }
    return key === key_or_nil ? val_or_node : not_found;
  }

  set(ownerID: OwnerID, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    var idx = (hash >>> shift) & MASK;
    var bit = 1 << idx;
    if ((this.bitmap & bit) === 0) {
      didAddLeaf && (didAddLeaf.val = true);
      var editable = this.ensureOwner(ownerID);
      editable.keys[idx] = key;
      editable.values[idx] = val;
      editable.bitmap |= bit;
      editable.cnt++;
      return editable;
    }
    var key_or_nil = this.keys[idx];
    var val_or_node = this.values[idx];
    var newNode: MNode<K, V>;
    if (key_or_nil == null) {
      newNode = val_or_node.set(ownerID, shift + SHIFT, hash, key, val, didAddLeaf);
      if (newNode === val_or_node) {
        return this;
      }
      var editable = this.ensureOwner(ownerID);
      editable.values[idx] = newNode;
      return editable;
    }
    if (key === key_or_nil) {
      if (val === val_or_node) {
        return this;
      }
      var editable = this.ensureOwner(ownerID);
      editable.values[idx] = val;
      return editable;
    }
    var key1hash = hashValue(key_or_nil);
    if (key1hash === hash) {
      newNode = new HashCollisionNode<K, V>(ownerID, hash, [key_or_nil, key], [val_or_node, val]);
    } else {
      newNode = makeNode<K, V>(ownerID, shift + SHIFT, key1hash, key_or_nil, val_or_node)
        .set(ownerID, shift + SHIFT, hash, key, val);
    }
    didAddLeaf && (didAddLeaf.val = true);
    var editable = this.ensureOwner(ownerID);
    delete editable.keys[idx];
    editable.values[idx] = newNode;
    return editable;
  }

  delete(ownerID: OwnerID, shift: number, hash: number, key: K, didRemoveLeaf?: BoolRef): MNode<K, V> {
    var idx = (hash >>> shift) & MASK;
    var bit = 1 << idx;
    var key_or_nil = this.keys[idx];
    if ((this.bitmap & bit) === 0 || (key_or_nil != null && key !== key_or_nil)) {
      return this;
    }
    if (key_or_nil == null) {
      var node = this.values[idx];
      var newNode = node.delete(ownerID, shift + SHIFT, hash, key, didRemoveLeaf);
      if (newNode === node) {
        return this;
      }
      if (newNode) {
        var editable = this.ensureOwner(ownerID);
        editable.values[idx] = newNode;
        return editable;
      }
    } else {
      didRemoveLeaf && (didRemoveLeaf.val = true);
    }
    if (this.cnt === 1) {
      return null;
    }
    var editable = this.ensureOwner(ownerID);
    // Technically, since we always check the bitmap first,
    // we don't need to delete these, but doing so frees up memory.
    delete editable.keys[idx];
    delete editable.values[idx];
    editable.bitmap ^= bit;
    editable.cnt--;
    return editable;
  }

  ensureOwner(ownerID: OwnerID): BitmapIndexedNode<K, V> {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new BitmapIndexedNode<K, V>(ownerID, this.bitmap, this.cnt, this.keys.slice(), this.values.slice());
  }

  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    for (var ii = 0; ii < this.values.length; ii++) {
      if (this.bitmap & (1 << ii)) {
        var key = this.keys[ii];
        if (key != null) {
          if (fn.call(thisArg, this.values[ii], key, map) === false) {
            return false;
          }
        } else if (!this.values[ii].iterate(map, fn, thisArg)) {
          return false;
        }
      }
    }
    return true;
  }
}


class HashCollisionNode<K, V> implements MNode<K, V> {

  constructor(public ownerID: OwnerID, public collisionHash: number, public keys: Array<K>, public values: Array<V>) {}

  get(shift: number, hash: number, key: K, not_found: V): V {
    var idx = this.keys.indexOf(key);
    return idx === -1 ? not_found : this.values[idx];
  }

  set(ownerID: OwnerID, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    if (hash !== this.collisionHash) {
      didAddLeaf && (didAddLeaf.val = true);
      return makeNode<K, V>(ownerID, shift, hash, null, this)
        .set(ownerID, shift, hash, key, val);
    }
    var idx = this.keys.indexOf(key);
    if (idx >= 0 && this.values[idx] === val) {
      return this;
    }
    var editable = this.ensureOwner(ownerID);
    if (idx === -1) {
      editable.keys.push(key);
      editable.values.push(val);
      didAddLeaf && (didAddLeaf.val = true);
    } else {
      editable.values[idx] = val;
    }
    return editable;
  }

  delete(ownerID: OwnerID, shift: number, hash: number, key: K, didRemoveLeaf?: BoolRef): MNode<K, V> {
    var idx = this.keys.indexOf(key);
    if (idx === -1) {
      return this;
    }
    didRemoveLeaf && (didRemoveLeaf.val = true);
    if (this.values.length > 1) {
      var editable = this.ensureOwner(ownerID);
      editable.keys[idx] = editable.keys.pop();
      editable.values[idx] = editable.values.pop();
      return editable;
    }
  }

  ensureOwner(ownerID: OwnerID): HashCollisionNode<K, V> {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new HashCollisionNode<K, V>(ownerID, this.collisionHash, this.keys.slice(), this.values.slice());
  }

  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    for (var ii = 0; ii < this.values.length; ii++) {
      if (fn.call(thisArg, this.values[ii], this.keys[ii], map) === false) {
        return false;
      }
    }
    return true;
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


var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_MAP: Map<any, any>;
