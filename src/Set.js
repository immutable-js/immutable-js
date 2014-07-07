var Sequence = require('./Sequence').Sequence;
var IndexedSequence = require('./Sequence').IndexedSequence;


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
      set = set.add(values[ii]);
    }
    return set.asPersistent();
  }

  toString() {
    return this.__toString('Set {', '}');
  }

  // @pragma Access

  has(value) {
    return this._map ? this._map.has(value) : false;
  }

  // @pragma Modification

  clear() {
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
      // Use Late Binding here to ensure no circular dependency.
      newMap = require('./Map').empty();
      if (this.isTransient()) {
        newMap = newMap.asTransient();
      }
    }
    newMap = newMap.set(value, null);
    if (this._ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : Set._make(newMap);
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
      this._map = this.length === 0 ? null : newMap;
      return this;
    }
    return newMap.length ? Set._make(newMap) : Set.empty();
  }

  // @pragma Composition

  merge(seq) {
    if (seq == null) {
      return this;
    }
    if (!seq.forEach) {
      seq = Sequence(seq);
    }
    var newSet = this.asTransient();
    seq.forEach(value => newSet.add(value));
    return this.isTransient() ? newSet : newSet.asPersistent();
  }

  // @pragma Mutability

  isTransient() {
    return !!this._ownerID;
  }

  asTransient() {
    // TODO: ensure Map has same owner? Does it matter?
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

  toSet() {
    // Note: identical impl to Map.toMap
    return this.isTransient() ? this.clone().asPersistent() : this;
  }

  __deepEquals(other) {
    return !(this._map || other._map) || this._map.equals(other._map);
  }

  __iterate(fn) {
    var collection = this;
    return this._map ? this._map.__iterate((_, k) => fn(k, k, collection)) : 0;
  }

  __reverseIterate(fn) {
    var collection = this;
    return this._map ? this._map.__reverseIterate((_, k) => fn(k, k, collection)) : 0;
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

Set.prototype.toJS = Sequence.prototype.toArray;

Set.prototype.__toStringMapper = IndexedSequence.prototype.__toStringMapper;


class OwnerID {
  constructor() {}
}

var __EMPTY_SET;

module.exports = Set;
