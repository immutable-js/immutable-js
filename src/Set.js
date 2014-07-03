var Sequence = require('./Sequence');
var Map = require('./Map');


class Set extends Sequence {

  // @pragma Construction

  constructor(/*...values*/) {
    return Set.fromArray(arguments);
  }

  static empty() {
    return __EMPTY_SET || (__EMPTY_SET = Set._make());
  }

  static fromArray(values) {
    if (values.length === 0) {
      return Set.empty();
    }
    var set = Set.empty().asTransient();
    for (var ii = 0; ii < values.length; ii++) {
      set.add(values[ii]);
    }
    return set.asPersistent();
  }

  toString() {
    return this.__toString('Set {', '}');
  }

  __toStringMapper(v) {
    return typeof v === 'string' ? JSON.stringify(v) : v;
  }

  // @pragma Access

  has(value) {
    return this._map ? this._map.has(value) : false;
  }

  // @pragma Modification

  // ES6 calls this "clear"
  empty() {
    if (this._ownerID) {
      this.length = 0;
      this._map = null;
      return this;
    }
    return Set.empty();
  }

  add(value) {
    if (value == null) {
      return this;
    }
    var newMap = this._map;
    if (!newMap) {
      newMap = Map.empty();
      if (this.isTransient()) {
        newMap = newMap.asTransient();
      }
    }
    newMap = newMap.set(value, null);
    if (newMap === this._map) {
      return this;
    }
    if (this._ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return Set._make(newMap);
  }

  delete(value) {
    if (value == null || this._map == null) {
      return this;
    }
    var newMap = this._map.delete(value);
    if (newMap === this._map) {
      return this;
    }
    if (this._ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap.length ? Set._make(newMap) : Set.empty();
  }

  equals(other) {
    if (this === other) {
      return true;
    }
    if (other instanceof Set) {
      return this._map.equals(other._map);
    }
    return false;
  }

  // @pragma Composition

  merge(seq) {
    var newSet = this.asTransient();
    seq.__iterate(value => newSet.add(value));
    return this.isTransient() ? newSet : newSet.asPersistent();
  }

  // @pragma Mutability

  isTransient() {
    return !!this._ownerID;
  }

  asTransient() {
    // TODO: ensure same owner.
    return this._ownerID ? this : Set._make(this._map && this._map.asTransient(), new OwnerID());
  }

  asPersistent() {
    this._ownerID = undefined;
    this._map = this._map.asPersistent();
    return this;
  }

  clone() {
    // TODO: this doesn't appropriately clone the _map and ensure same owner.
    return Set._make(this._map.clone(), this._ownerID && new OwnerID());
  }

  // @pragma Iteration

  __iterate(fn) {
    if (!this._map) {
      return true;
    }
    var collection = this;
    return this._map.__iterate((_, k) => fn(k, k, collection));
  }

  __reverseIterate(fn) {
    if (!this._map) {
      return true;
    }
    var collection = this;
    return this._map.__reverseIterate((_, k) => fn(k, k, collection));
  }

  // @pragma Private

  static _make(map, ownerID) {
    var set = Object.create(Set.prototype);
    set.length = map ? map.length : 0;
    set._map = map;
    set._ownerID = ownerID;
    return set;
  }
}

class OwnerID {
  constructor() {}
}

var __SENTINEL = {};
var __EMPTY_SET;

module.exports = Set;
