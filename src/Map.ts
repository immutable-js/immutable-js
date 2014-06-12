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
    return __EMPTY_MAP || (__EMPTY_MAP = Map._make(0, null));
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

  empty(): Map<K, V> {
    if (this._ownerID) {
      this.length = 0;
      this._root = null;
      return this;
    }
    return Map.empty();
  }

  set(k: K, v: V): Map<K, V> {
    if (k == null) {
      return this;
    }
    var newLength = this.length;
    var newRoot: MNode<K, V>;
    if (this._root) {
      var didAddLeaf = BoolRef();
      newRoot = this._root.set(this._ownerID, 0, hashValue(k), k, v, didAddLeaf);
      didAddLeaf.value && newLength++;
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
      didRemoveLeaf.value && this.length--;
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

  private static _make<K, V>(length: number, root: MNode<K, V>, ownerID?: OwnerID) {
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
  get(shift: number, hash: number, key: K, notFound?: V): V;
  set(ownerID: OwnerID, shift: number, hash: number, key: K, value: V, didAddLeaf?: BoolRef): MNode<K, V>;
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
  return new BitmapIndexedNode<K, V>(ownerID, 1 << idx, keys, values);
}


class BitmapIndexedNode<K, V> implements MNode<K, V> {

  constructor(public ownerID: OwnerID, public bitmap: number, public keys: Array<any>, public values: Array<any>) {}

  get(shift: number, hash: number, key: K, notFound?: V): V {
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

  set(ownerID: OwnerID, shift: number, hash: number, key: K, value: V, didAddLeaf?: BoolRef): MNode<K, V> {
    var idx = (hash >>> shift) & MASK;
    var bit = 1 << idx;
    if ((this.bitmap & bit) === 0) {
      didAddLeaf && (didAddLeaf.value = true);
      var editable = this.ensureOwner(ownerID);
      editable.keys[idx] = key;
      editable.values[idx] = value;
      editable.bitmap |= bit;
      return editable;
    }
    var keyOrNull = this.keys[idx];
    var valueOrNode = this.values[idx];
    var newNode: MNode<K, V>;
    if (keyOrNull == null) {
      newNode = valueOrNode.set(ownerID, shift + SHIFT, hash, key, value, didAddLeaf);
      if (newNode === valueOrNode) {
        return this;
      }
      var editable = this.ensureOwner(ownerID);
      editable.values[idx] = newNode;
      return editable;
    }
    if (key === keyOrNull) {
      if (value === valueOrNode) {
        return this;
      }
      var editable = this.ensureOwner(ownerID);
      editable.values[idx] = value;
      return editable;
    }
    var originalHash = hashValue(keyOrNull);
    if (hash === originalHash) {
      newNode = new HashCollisionNode<K, V>(ownerID, hash, [keyOrNull, key], [valueOrNode, value]);
    } else {
      newNode = makeNode<K, V>(ownerID, shift + SHIFT, originalHash, keyOrNull, valueOrNode)
        .set(ownerID, shift + SHIFT, hash, key, value);
    }
    didAddLeaf && (didAddLeaf.value = true);
    var editable = this.ensureOwner(ownerID);
    delete editable.keys[idx];
    editable.values[idx] = newNode;
    return editable;
  }

  delete(ownerID: OwnerID, shift: number, hash: number, key: K, didRemoveLeaf?: BoolRef): MNode<K, V> {
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
        var editable = this.ensureOwner(ownerID);
        editable.values[idx] = newNode;
        return editable;
      }
    } else {
      didRemoveLeaf && (didRemoveLeaf.value = true);
    }
    if (this.bitmap === bit) {
      return null;
    }
    var editable = this.ensureOwner(ownerID);
    delete editable.keys[idx];
    delete editable.values[idx];
    editable.bitmap ^= bit;
    return editable;
  }

  ensureOwner(ownerID: OwnerID): BitmapIndexedNode<K, V> {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new BitmapIndexedNode<K, V>(ownerID, this.bitmap, this.keys.slice(), this.values.slice());
  }

  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    for (var ii = 0; ii < this.values.length; ii++) {
      var key = this.keys[ii];
      var valueOrNode = this.values[ii];
      if (key != null) {
        if (fn.call(thisArg, valueOrNode, key, map) === false) {
          return false;
        }
      } else if (valueOrNode && !valueOrNode.iterate(map, fn, thisArg)) {
        return false;
      }
    }
    return true;
  }
}


class HashCollisionNode<K, V> implements MNode<K, V> {

  constructor(public ownerID: OwnerID, public collisionHash: number, public keys: Array<K>, public values: Array<V>) {}

  get(shift: number, hash: number, key: K, notFound: V): V {
    var idx = this.keys.indexOf(key);
    return idx === -1 ? notFound : this.values[idx];
  }

  set(ownerID: OwnerID, shift: number, hash: number, key: K, value: V, didAddLeaf?: BoolRef): MNode<K, V> {
    if (hash !== this.collisionHash) {
      didAddLeaf && (didAddLeaf.value = true);
      return makeNode<K, V>(ownerID, shift, hash, null, this)
        .set(ownerID, shift, hash, key, value);
    }
    var idx = this.keys.indexOf(key);
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

  delete(ownerID: OwnerID, shift: number, hash: number, key: K, didRemoveLeaf?: BoolRef): MNode<K, V> {
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
  value: boolean;
}

function BoolRef(value?: boolean): BoolRef {
  __BOOL_REF.value = value;
  return __BOOL_REF;
}

var __BOOL_REF = {value: false};




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
