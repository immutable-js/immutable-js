import LazyIterable = require('./LazyIterable');
import Map = require('./Map');

class Set<T> extends LazyIterable<T, T, Set<T>> {

  // @pragma Construction

  constructor(...values: Array<T>) {
    return Set.fromArray(values);
    super();
  }

  static empty(): Set<any> {
    return __EMPTY_SET || (__EMPTY_SET = Set._make(null));
  }

  static fromArray<T>(values: Array<T>): Set<T> {
    if (values.length === 0) {
      return Set.empty();
    }
    var set: Set<T> = Set.empty().asTransient();
    values.forEach(value => {
      set = set.add(value);
    });
    return set.asPersistent();
  }

  // @pragma Access

  public length: number;

  has(value: T): boolean {
    return this._map ? this._map.has(value) : false;
  }

  // @pragma Modification

  // ES6 calls this "clear"
  empty(): Set<T> {
    if (this._ownerID) {
      this.length = 0;
      this._map = null;
      return this;
    }
    return Set.empty();
  }

  add(value: T): Set<T> {
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

  delete(value: T): Set<T> {
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

  // @pragma Composition

  merge(seq: LazyIterable<any, T, any>): Set<T> {
    var newSet = this.asTransient();
    seq.iterate(value => newSet.add(value));
    return this.isTransient() ? newSet : newSet.asPersistent();
  }

  // @pragma Mutability

  isTransient(): boolean {
    return !!this._ownerID;
  }

  asTransient(): Set<T> {
    // TODO: ensure same owner.
    return this._ownerID ? this : Set._make(this._map && this._map.asTransient(), new OwnerID());
  }

  asPersistent(): Set<T> {
    this._ownerID = undefined;
    this._map = this._map.asPersistent();
    return this;
  }

  clone(): Set<T> {
    // TODO: this doesn't appropriately clone the _map and ensure same owner.
    return Set._make(this._map.clone(), this._ownerID && new OwnerID());
  }

  // @pragma Iteration

  iterate(
    fn: (value?: T, key?: T, collection?: Set<T>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    if (!this._map) {
      return true;
    }
    var collection = this;
    return this._map.iterate(function (_, key) {
      return fn.call(thisArg, key, key, collection);
    });
  }

  // @pragma Private

  private _map: Map<T, any>;
  private _ownerID: OwnerID;

  private static _make<T>(map: Map<T, any>, ownerID?: OwnerID) {
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
var __EMPTY_SET: Set<any>;

export = Set;
