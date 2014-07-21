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
    return Set.empty().withMutations(set => {
      for (var ii = 0; ii < values.length; ii++) {
        set.add(values[ii]);
      }
    });
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
      newMap = require('./Map').empty().__ensureOwner(this._ownerID);
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
    if (newMap.length === 0) {
      return this.clear();
    }
    if (this._ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : Set._make(newMap);
  }

  // @pragma Composition

  merge(seq) {
    if (seq == null) {
      return this;
    }
    return this.withMutations(set => {
      Sequence(seq).forEach(value => set.add(value))
    });
  }

  // @pragma Mutability

  withMutations(fn) {
    // Note: same impl as Map
    var mutable = this.__ensureOwner(this._ownerID || new OwnerID());
    fn(mutable);
    return mutable.__ensureOwner(this._ownerID);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this._ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this._ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return Set._make(newMap, ownerID);
  }

  // @pragma Iteration

  toSet() {
    // Note: identical impl to Map.toMap
    return this;
  }

  cacheResult() {
    return this;
  }

  __deepEquals(other) {
    return !(this._map || other._map) || this._map.equals(other._map);
  }

  __iterate(fn, reverse) {
    var collection = this;
    return this._map ? this._map.__iterate((_, k) => fn(k, k, collection), reverse) : 0;
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
