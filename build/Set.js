var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var LazyIterable = require('./LazyIterable');
var Map = require('./Map');

var Set = (function (_super) {
    __extends(Set, _super);
    // @pragma Construction
    function Set() {
        var values = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            values[_i] = arguments[_i + 0];
        }
        return Set.fromArray(values);
        _super.call(this);
    }
    Set.empty = function () {
        return __EMPTY_SET || (__EMPTY_SET = Set._make(null));
    };

    Set.fromArray = function (values) {
        if (values.length === 0) {
            return Set.empty();
        }
        var set = Set.empty().asTransient();
        values.forEach(function (value) {
            set = set.add(value);
        });
        return set.asPersistent();
    };

    Set.prototype.has = function (value) {
        return this._map ? this._map.has(value) : false;
    };

    // @pragma Modification
    // ES6 calls this "clear"
    Set.prototype.empty = function () {
        if (this._ownerID) {
            this.length = 0;
            this._map = null;
            return this;
        }
        return Set.empty();
    };

    Set.prototype.add = function (value) {
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
    };

    Set.prototype.delete = function (value) {
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
    };

    // @pragma Composition
    Set.prototype.merge = function (seq) {
        var newSet = this.asTransient();
        seq.iterate(function (value) {
            return newSet.add(value);
        });
        return this.isTransient() ? newSet : newSet.asPersistent();
    };

    // @pragma Mutability
    Set.prototype.isTransient = function () {
        return !!this._ownerID;
    };

    Set.prototype.asTransient = function () {
        // TODO: ensure same owner.
        return this._ownerID ? this : Set._make(this._map && this._map.asTransient(), new OwnerID());
    };

    Set.prototype.asPersistent = function () {
        this._ownerID = undefined;
        this._map = this._map.asPersistent();
        return this;
    };

    Set.prototype.clone = function () {
        // TODO: this doesn't appropriately clone the _map and ensure same owner.
        return Set._make(this._map.clone(), this._ownerID && new OwnerID());
    };

    // @pragma Iteration
    Set.prototype.iterate = function (fn, thisArg) {
        if (!this._map) {
            return true;
        }
        var collection = this;
        return this._map.iterate(function (_, key) {
            return fn.call(thisArg, key, key, collection);
        });
    };

    Set._make = function (map, ownerID) {
        var set = Object.create(Set.prototype);
        set.length = map ? map.length : 0;
        set._map = map;
        set._ownerID = ownerID;
        return set;
    };
    return Set;
})(LazyIterable);

var OwnerID = (function () {
    function OwnerID() {
    }
    return OwnerID;
})();

var __SENTINEL = {};
var __EMPTY_SET;

module.exports = Set;
//# sourceMappingURL=Set.js.map
