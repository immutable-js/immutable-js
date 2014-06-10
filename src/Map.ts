import Iterable = require('./Iterable');

function invariant(condition: any, error: string): void {
  if (!condition) throw new Error(error);
}

export class Map<K, V> extends Iterable<K, V, Map<K, V>> {

  // @pragma Construction

  constructor(obj: {[key: string]: V}) {
    super(this);
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
    var didAddLeaf = new BoolRef();
    var newRoot = this._root || <MNode<K, V>>__EMPTY_MNODE;
    if (this._editRef) {
      this._root = newRoot.setTransient(this._editRef, 0, hashValue(k), k, v, didAddLeaf);
      if (didAddLeaf.val) {
        this.length++;
      }
      return this;
    } else {
      newRoot = newRoot.set(0, hashValue(k), k, v, didAddLeaf);
      return newRoot === this._root ? this : Map._make(this.length + (didAddLeaf.val ? 1 : 0), newRoot);
    }
  }

  delete(k: K): Map<K, V> {
    if (k == null || this._root == null) {
      return this;
    }
    if (this._editRef) {
      var didRemoveLeaf = new BoolRef();
      this._root = this._root.deleteTransient(this._editRef, 0, hashValue(k), k, didRemoveLeaf);
      if (didRemoveLeaf.val) {
        this.length--;
      }
      return this;
    } else {
      var newRoot = this._root.delete(0, hashValue(k), k);
      return newRoot === this._root ? this._root : Map._make(this.length - 1, newRoot);
    }
  }

  merge(map: Map<K, V>): Map<K, V> {
    var newMap = this.asTransient();
    map.iterate((value, key) => newMap.set(key, value));
    return newMap.asPersistent();
  }

  // @pragma Mutability

  isTransient(): boolean {
    return !!this._editRef;
  }

  asTransient(): Map<K, V> {
    return this._editRef ? this : Map._make(this.length, this._root, new EditRef());
  }

  asPersistent(): Map<K, V> {
    this._editRef = null;
    return this;
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
  private _editRef: EditRef;

  private static _make<K, V>(length: number, root?: MNode<K, V>, editRef?: EditRef) {
    var map = Object.create(Map.prototype);
    map.length = length;
    map._root = root;
    map._editRef = editRef;
    return map;
  }
}


class EditRef {
  constructor() {}
}

class BoolRef {
  constructor(public val?: boolean) {}
}


interface MNode<K, V> {
  editRef: EditRef;
  arr: Array<any>;
  get(shift: number, hash: number, key: K, not_found?: V): V;
  set(shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V>;
  setTransient(editRef: EditRef, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V>;
  delete(shift: number, hash: number, key: K): MNode<K, V>;
  deleteTransient(editRef: EditRef, shift: number, hash: number, key: K, didRemoveLeaf: BoolRef): MNode<K, V>;
  ensureEditable(editRef: EditRef): MNode<K, V>;
  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean;
}


class BitmapIndexedNode<K, V> implements MNode<K, V> {

  constructor(public editRef: EditRef, public bitmap: number, public arr: Array<any>) {}

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

  delete(shift: number, hash: number, key: K): MNode<K, V> {
    var bit = 1 << ((hash >>> shift) & MASK);
    if ((this.bitmap & bit) === 0) {
      return this;
    }
    var idx = bitmap_indexed_node_index(this.bitmap, bit);
    var key_or_nil = this.arr[2 * idx];
    var val_or_node = this.arr[2 * idx + 1];
    if (key_or_nil == null) {
      var n = val_or_node.delete(shift + SHIFT, hash, key);
      if (n === val_or_node) {
        return this;
      }
      if (n != null) {
        return new BitmapIndexedNode<K, V>(null, this.bitmap, clone_and_set(this.arr, 2 * idx + 1, n));
      }
      if (this.bitmap === bit) {
        return null;
      }
      return new BitmapIndexedNode<K, V>(null, this.bitmap ^ bit, remove_pair(this.arr, idx));
    }
    return key === key_or_nil ? new BitmapIndexedNode<K, V>(null, this.bitmap ^ bit, remove_pair(this.arr, idx)) : this;
  }

  deleteTransient(editRef: EditRef, shift: number, hash: number, key: K, didRemoveLeaf: BoolRef): MNode<K, V> {
    var bit = 1 << ((hash >>> shift) & MASK);
    if ((this.bitmap & bit) === 0) {
      return this;
    }
    var idx = bitmap_indexed_node_index(this.bitmap, bit);
    var key_or_nil = this.arr[2 * idx];
    var val_or_node = this.arr[2 * idx + 1];
    if (key_or_nil == null) {
      var n = val_or_node.deleteTransient(editRef, shift + SHIFT, hash, key, didRemoveLeaf);
      if (n === val_or_node) {
        return this;
      }
      if (n != null) {
        return edit_and_set(this, editRef, 2 * idx + 1, n);
      }
      if (this.bitmap === bit) {
        return null;
      }
      return this.edit_and_remove_pair(editRef, bit, idx);
    }
    if (key === key_or_nil) {
      didRemoveLeaf.val = true;
      return this.edit_and_remove_pair(editRef, bit, idx);
    }
    return this;
  }

  set(shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    var bit = 1 << ((hash >>> shift) & MASK);
    var idx = bitmap_indexed_node_index(this.bitmap, bit);
    if ((this.bitmap & bit) === 0) {
      var n = bit_count(this.bitmap);
      if (n >= 16) { // why 16? because it's half of 32?
        var nodes = new Array(SIZE);
        var jdx = (hash >>> shift) & MASK;
        nodes[jdx] = (<MNode<K, V>>__EMPTY_MNODE).set(shift + SHIFT, hash, key, val, didAddLeaf);
        var kvi = 0;
        for (var ii = 0; ii < SIZE; ii++) {
          if (((this.bitmap >>> ii) & 1) === 1) {
            nodes[ii] =
              this.arr[kvi] != null ?
              (<MNode<K, V>>__EMPTY_MNODE).set(
                shift + SHIFT,
                hashValue(this.arr[kvi]),
                this.arr[kvi],
                this.arr[kvi + 1],
                didAddLeaf
              ) :
              this.arr[kvi + 1];
            kvi += 2;
          }
        }
        return new ArrayNode<K, V>(null, n + 1, nodes);
      }
      var new_arr = new Array(2 * (n + 1));
      array_copy(this.arr, 0, new_arr, 0, 2 * idx);
      new_arr[2 * idx] = key;
      new_arr[2 * idx + 1] = val;
      array_copy(this.arr, 2 * idx, new_arr, 2 * (idx + 1), 2 * (n - idx));
      didAddLeaf && (didAddLeaf.val = true);
      return new BitmapIndexedNode<K, V>(null, this.bitmap | bit, new_arr);
    }
    var key_or_nil = this.arr[2 * idx];
    var val_or_node = this.arr[2 * idx + 1];
    var newNode: MNode<K, V>;
    if (key_or_nil == null) {
      newNode = val_or_node.set(shift + SHIFT, hash, key, val, didAddLeaf);
      if (newNode === val_or_node) {
        return this;
      }
      return new BitmapIndexedNode<K, V>(null, this.bitmap, clone_and_set(this.arr, 2 * idx + 1, newNode));
    }
    if (key === key_or_nil) {
      if (val === val_or_node) {
        return this;
      }
      return new BitmapIndexedNode<K, V>(null, this.bitmap, clone_and_set(this.arr, 2 * idx + 1, val));
    }
    didAddLeaf && (didAddLeaf.val = true);
    var key1hash = hashValue(key_or_nil);
    if (key1hash === hash) {
      newNode = new HashCollisionNode<K, V>(null, key1hash, 2, [key_or_nil, val_or_node, key, val]);
    } else {
      // TODO, setTransient?
      newNode = (<MNode<K, V>>__EMPTY_MNODE)
        .set(shift, key1hash, key_or_nil, val_or_node)
        .set(shift, hash, key, val);
    }
    return new BitmapIndexedNode<K, V>(null, this.bitmap, clone_and_set(this.arr, 2 * idx, null, 2 * idx + 1, newNode));
  }

  setTransient(editRef: EditRef, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    var bit = 1 << ((hash >>> shift) & MASK);
    var idx = bitmap_indexed_node_index(this.bitmap, bit);
    if ((this.bitmap & bit) === 0) {
      var n = bit_count(this.bitmap);
      if (2 * n < this.arr.length) {
        var editable = this.ensureEditable(editRef);
        var earr: Array<any> = editable.arr;
        didAddLeaf && (didAddLeaf.val = true);
        array_copy(earr, 2 * idx, earr, 2 * (idx + 1), 2 * (n - idx));
        earr[2 * idx] = key;
        earr[2 * idx + 1] = val;
        editable.bitmap |= bit;
        return editable;
      }
      if (n >= 16) { // why 16?
        var nodes = new Array(SIZE);
        var jdx = (hash >>> shift) & MASK;
        nodes[jdx] = (<MNode<K, V>>__EMPTY_MNODE).setTransient(editRef, shift + SHIFT, hash, key, val, didAddLeaf);
        var kvi = 0;
        for (var ii = 0; ii < SIZE; ii++) {
          if (((this.bitmap >>> ii) & 1) === 1) {
            nodes[ii] =
              this.arr[kvi] != null ?
              (<MNode<K, V>>__EMPTY_MNODE).setTransient(
                editRef,
                shift + SHIFT,
                hashValue(this.arr[kvi]),
                this.arr[kvi],
                this.arr[kvi + 1],
                didAddLeaf
              ) :
              this.arr[kvi + 1];
            kvi += 2;
          }
        }
        return new ArrayNode<K, V>(editRef, n + 1, nodes);
      }
      var new_arr = new Array(2 * (n + 4));
      array_copy(this.arr, 0, new_arr, 0, 2 * idx);
      new_arr[2 * idx] = key;
      new_arr[2 * idx + 1] = val;
      array_copy(this.arr, 2 * idx, new_arr, 2 * (idx + 1), 2 * (n - idx));
      didAddLeaf && (didAddLeaf.val = true);
      var editable = this.ensureEditable(editRef);
      editable.arr = new_arr;
      editable.bitmap |= bit;
      return editable;
    }
    var key_or_nil = this.arr[2 * idx];
    var val_or_node = this.arr[2 * idx + 1];
    var newNode: MNode<K, V>;
    if (key_or_nil == null) {
      newNode = val_or_node.setTransient(editRef, shift + SHIFT, hash, key, val, didAddLeaf);
      if (newNode === val_or_node) {
        return this;
      }
      return edit_and_set(this, editRef, 2 * idx + 1, newNode);
    }
    if (key === key_or_nil) {
      if (val === val_or_node) {
        return this;
      }
      return edit_and_set(this, editRef, 2 * idx + 1, val);
    }
    didAddLeaf && (didAddLeaf.val = true);
    var key1hash = hashValue(key_or_nil);
    if (key1hash === hash) {
      newNode = new HashCollisionNode<K, V>(null, key1hash, 2, [key_or_nil, val_or_node, key, val]);
    } else {
      newNode = (<MNode<K, V>>__EMPTY_MNODE)
        .setTransient(editRef, shift + SHIFT, key1hash, key_or_nil, val_or_node)
        .setTransient(editRef, shift + SHIFT, hash, key, val);
    }
    return edit_and_set(this, editRef, 2 * idx, null, 2 * idx + 1, newNode);
  }

  ensureEditable(editRef: EditRef): BitmapIndexedNode<K, V> {
    if (editRef === this.editRef) {
      return this;
    }
    var n = bit_count(this.bitmap);
    var newArr = new Array(n < 0 ? 4 : 2 * (n + 1));
    array_copy(this.arr, 0, newArr, 0, 2 * n);
    return new BitmapIndexedNode<K, V>(editRef, this.bitmap, newArr);
  }

  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    return mNodeIterate(map, this.arr, fn, thisArg);
  }

  // TODO: maybe inlineable?
  edit_and_remove_pair(editRef: EditRef, bit: number, i: number): MNode<K, V> {
    if (this.bitmap === bit) {
      return null;
    }
    var editable = this.ensureEditable(editRef);
    var earr = editable.arr;
    var len = earr.length;
    editable.bitmap = bit ^ editable.bitmap;
    array_copy(earr, 2 * (i + 1), earr, 2 * i, len - (2 * (i + 1)));
    earr[len - 2] = null;
    earr[len - 1] = null;
    return editable;
  }
}


class ArrayNode<K, V> implements MNode<K, V> {

  constructor(public editRef: EditRef, public cnt: number, public arr: Array<MNode<K, V>>) {}

  get(shift: number, hash: number, key: K, not_found?: V): V {
    var idx = (hash >>> shift) & MASK;
    return this.arr[idx] ?
      this.arr[idx].get(shift + SHIFT, hash, key, not_found) :
      not_found;
  }

  delete(shift: number, hash: number, key: K): MNode<K, V> {
    var idx = (hash >>> shift) & MASK;
    var node = this.arr[idx];
    if (node == null) {
      return this;
    }
    var n = node.delete(shift + SHIFT, hash, key);
    if (n === node) {
      return this;
    }
    if (n == null) {
      if (this.cnt <= 8) {
        return pack_array_node(this, null, idx);
      }
      return new ArrayNode<K, V>(null, this.cnt - 1, clone_and_set(this.arr, idx, n));
    }
    return new ArrayNode<K, V>(null, this.cnt, clone_and_set(this.arr, idx, n));
  }

  deleteTransient(editRef: EditRef, shift: number, hash: number, key: K, didRemoveLeaf: BoolRef): MNode<K, V> {
    var idx = (hash >>> shift) & MASK;
    var node = this.arr[idx];
    if (node == null) {
      return this;
    }
    var n = node.deleteTransient(editRef, shift + SHIFT, hash, key, didRemoveLeaf);
    if (n === node) {
      return this;
    }
    if (n == null) {
      if (this.cnt <= 8) {
        return pack_array_node(this, editRef, idx);
      }
      var editable = this.ensureEditable(editRef);
      editable.arr[idx] = n;
      editable.cnt--;
      return editable;
    }
    return edit_and_set(this, editRef, idx, n);
  }

  set(shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    var idx = (hash >>> shift) & MASK;
    var node = <MNode<K, V>>this.arr[idx];
    var newNode = (node || <MNode<K, V>>__EMPTY_MNODE).set(shift + SHIFT, hash, key, val, didAddLeaf);
    if (newNode === node) {
      return this;
    }
    var newCount = this.cnt + (node ? 1 : 0);
    return new ArrayNode<K, V>(null, newCount, clone_and_set(this.arr, idx, newNode));
  }

  setTransient(editRef: EditRef, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    var idx = (hash >>> shift) & MASK;
    var node = <MNode<K, V>>this.arr[idx];
    var newNode = (node || <MNode<K, V>>__EMPTY_MNODE).setTransient(editRef, shift + SHIFT, hash, key, val, didAddLeaf);
    if (newNode === node) {
      return this;
    }
    var editable = this.ensureEditable(editRef);
    editable.arr[idx] = newNode;
    if (node == null) {
      editable.cnt++;
    }
    return editable;
  }

  ensureEditable(editRef: EditRef): ArrayNode<K, V> {
    if (editRef === this.editRef) {
      return this;
    }
    return new ArrayNode<K, V>(editRef, this.cnt, aclone(this.arr));
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

  constructor(public editRef: EditRef, public collisionHash: number, public cnt: number, public arr: Array<any>) {}

  get(shift: number, hash: number, key: K, not_found: V): V {
    var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
    if (idx >= 0 && key === this.arr[idx]) {
      return this.arr[idx + 1];
    }
    return not_found;
  }

  delete(shift: number, hash: number, key: K): MNode<K, V> {
    var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
    if (idx === -1) {
      return this;
    }
    if (this.cnt === 1) {
      return null;
    }
    // Note: can idx ever be odd?
    return new HashCollisionNode<K, V>(null, this.collisionHash, this.cnt - 1, remove_pair(this.arr, Math.floor(idx / 2)));
  }

  deleteTransient(editRef: EditRef, shift: number, hash: number, key: K, didRemoveLeaf: BoolRef): MNode<K, V> {
    var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
    if (idx === -1) {
      return this;
    }
    didRemoveLeaf.val = true;
    if (this.cnt === 1) {
      return null;
    }
    var editable = this.ensureEditable(editRef);
    var earr = editable.arr;
    earr[idx] = earr[2 * this.cnt - 2];
    earr[idx + 1] = earr[2 * this.cnt - 1];
    earr[2 * this.cnt - 1] = null;
    earr[2 * this.cnt - 2] = null;
    editable.cnt--;
    return editable;
  }

  set(shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    if (hash !== this.collisionHash) {
      return new BitmapIndexedNode<K, V>(
        null,
        1 << ((this.collisionHash >>> shift) & MASK),
        [null, this]
      ).set(shift, hash, key, val, didAddLeaf);
    }
    var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
    if (idx === -1) {
      var len = 2 * this.cnt;
      var new_arr = new Array(len + 2);
      array_copy(this.arr, 0, new_arr, 0, len);
      new_arr[len] = key;
      new_arr[len + 1] = val;
      didAddLeaf && (didAddLeaf.val = true);
      return new HashCollisionNode<K, V>(null, this.collisionHash, this.cnt + 1, new_arr);
    }
    if (this.arr[idx] === val) {
      return this;
    }
    return new HashCollisionNode<K, V>(null, this.collisionHash, this.cnt, clone_and_set(this.arr, idx + 1, val));
  }

  setTransient(editRef: EditRef, shift: number, hash: number, key: K, val: V, didAddLeaf?: BoolRef): MNode<K, V> {
    if (hash !== this.collisionHash) {
      return new BitmapIndexedNode<K, V>(
        editRef,
        1 << ((this.collisionHash >>> shift) & MASK),
        [null, this, null, null]
      ).setTransient(editRef, shift, hash, key, val, didAddLeaf);
    }
    var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
    if (idx === -1) {
      if (this.arr.length > 2 * this.cnt) {
        var editable = this.ensureEditable(editRef);
        editable.arr[2 * this.cnt] = key;
        editable.arr[2 * this.cnt + 1] = val;
        didAddLeaf && (didAddLeaf.val = true);
        editable.cnt += 1;
        return editable;
      }
      var len = this.arr.length;
      var new_arr = new Array(len + 2);
      array_copy(this.arr, 0, new_arr, 0, len);
      new_arr[len] = key;
      new_arr[len + 1] = val;
      didAddLeaf && (didAddLeaf.val = true);
      if (editRef === this.editRef) {
        this.cnt++;
        this.arr = new_arr;
        return this;
      }
      return new HashCollisionNode<K, V>(this.editRef, this.collisionHash, this.cnt + 1, new_arr);
    }
    if (this.arr[idx + 1] === val) {
      return this;
    }
    return edit_and_set(this, editRef, idx + 1, val);
  }

  ensureEditable(editRef: EditRef): HashCollisionNode<K, V> {
    if (editRef === this.editRef) {
      return this;
    }
    var new_arr = new Array(2 * (this.cnt + 1));
    array_copy(this.arr, 0, new_arr, 0, 2 * this.cnt);
    return new HashCollisionNode<K, V>(editRef, this.collisionHash, this.cnt, new_arr);
  }

  iterate(
    map: Map<K, V>,
    fn: (value: V, key: K, collection: Map<K, V>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    return mNodeIterate(map, this.arr, fn, thisArg);
  }
}








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

function remove_pair<T>(arr: Array<T>, i: number): Array<T> {
  var newArr = new Array(arr.length - 2);
  array_copy(arr, 0, newArr, 0, 2 * i);
  array_copy(arr, 2 * (i + 1), newArr, 2 * i, newArr.length - 2 * i);
  return newArr;
}

// TODO: inline
function clone_and_set<V>(arr: Array<V>, i: number, a: V, j?: number, b?: V): Array<V> {
  var newArr = aclone(arr);
  newArr[i] = a;
  if (j != null) {
    newArr[j] = b;
  }
  return newArr;
}

// TODO: inline
function edit_and_set<K, V, T>(inode: MNode<K, V>, editRef: EditRef, i: number, a: T, j?: number, b?: T): MNode<K, V> {
  var editable = inode.ensureEditable(editRef);
  editable.arr[i] = a;
  if (j != null) {
    editable.arr[j] = b;
  }
  return editable;
}

function aclone<T>(arr: Array<T>): Array<T> {
  var newArr = arr.slice();
  newArr.length = arr.length;
  return newArr;
}

function array_copy<T>(from: Array<T>, i: number, to: Array<T>, j: number, len: number): void {
  for (var ii = 0; ii < len; ii++) {
    to[j + ii] = from[i + ii];
  }
}

function pack_array_node<K, V>(array_node: ArrayNode<K, V>, editRef: EditRef, idx: number): BitmapIndexedNode<K, V> {
  var arr = array_node.arr;
  var len = 2 * (array_node.cnt - 1);
  var new_arr = new Array(len);
  var j = 1;
  var bitmap = 0;
  for (var i = 0; i < len; i++) {
    if (i !== idx && arr[i] != null) {
      new_arr[j] = arr[i];
      bitmap |= 1 << i;
      j += 2;
    }
  }
  return new BitmapIndexedNode<K, V>(editRef, bitmap, new_arr);
}






var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_MNODE: MNode<any, any> = new BitmapIndexedNode(null, 0, []);
var __EMPTY_MAP: Map<any, any>;
