var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Iterable = require('./Iterable');

function invariant(condition, error) {
    if (!condition)
        throw new Error(error);
}

var Map = (function (_super) {
    __extends(Map, _super);
    // @pragma Construction
    function Map(obj) {
        if (!obj) {
            return Map.empty();
        }
        return Map.fromObj(obj);
        _super.call(this);
    }
    Map.empty = function () {
        return __EMPTY_MAP || (__EMPTY_MAP = Map._make(0, null));
    };

    Map.fromObj = function (obj) {
        var map = Map.empty().asTransient();
        for (var k in obj)
            if (obj.hasOwnProperty(k)) {
                map.set(k, obj[k]);
            }
        return map.asPersistent();
    };

    Map.prototype.has = function (k) {
        if (k == null || this._root == null) {
            return false;
        }
        return this._root.get(0, hashValue(k), k, __SENTINEL) !== __SENTINEL;
    };

    Map.prototype.get = function (k) {
        if (k != null && this._root) {
            return this._root.get(0, hashValue(k), k);
        }
    };

    // @pragma Modification
    Map.prototype.empty = function () {
        if (this._ownerID) {
            this.length = 0;
            this._root = null;
            return this;
        }
        return Map.empty();
    };

    Map.prototype.set = function (k, v) {
        if (k == null) {
            return this;
        }
        var newLength = this.length;
        var newRoot;
        if (this._root) {
            var didAddLeaf = BoolRef();
            newRoot = this._root.set(this._ownerID, 0, hashValue(k), k, v, didAddLeaf);
            didAddLeaf.value && newLength++;
        } else {
            newLength++;
            newRoot = makeNode(this._ownerID, 0, hashValue(k), k, v);
        }
        if (this._ownerID) {
            this.length = newLength;
            this._root = newRoot;
            return this;
        }
        return newRoot === this._root ? this : Map._make(newLength, newRoot);
    };

    Map.prototype.delete = function (k) {
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
    };

    // @pragma Composition
    Map.prototype.merge = function (map) {
        var newMap = this.asTransient();
        map.iterate(function (value, key) {
            return newMap.set(key, value);
        });
        return newMap.asPersistent();
    };

    // @pragma Mutability
    Map.prototype.isTransient = function () {
        return !!this._ownerID;
    };

    Map.prototype.asTransient = function () {
        return this._ownerID ? this : Map._make(this.length, this._root, new OwnerID());
    };

    Map.prototype.asPersistent = function () {
        this._ownerID = undefined;
        return this;
    };

    Map.prototype.clone = function () {
        return Map._make(this.length, this._root, this._ownerID && new OwnerID());
    };

    // @pragma Iteration
    Map.prototype.iterate = function (fn, thisArg) {
        return this._root && this._root.iterate(this, fn, thisArg);
    };

    Map._make = function (length, root, ownerID) {
        var map = Object.create(Map.prototype);
        map.length = length;
        map._root = root;
        map._ownerID = ownerID;
        return map;
    };
    return Map;
})(Iterable);

var OwnerID = (function () {
    function OwnerID() {
    }
    return OwnerID;
})();

function makeNode(ownerID, shift, hash, key, valOrNode) {
    var idx = (hash >>> shift) & MASK;
    var keys = [];
    var values = [];
    values[idx] = valOrNode;
    key != null && (keys[idx] = key);
    return new BitmapIndexedNode(ownerID, 1 << idx, keys, values);
}

var BitmapIndexedNode = (function () {
    function BitmapIndexedNode(ownerID, bitmap, keys, values) {
        this.ownerID = ownerID;
        this.bitmap = bitmap;
        this.keys = keys;
        this.values = values;
    }
    BitmapIndexedNode.prototype.get = function (shift, hash, key, notFound) {
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
    };

    BitmapIndexedNode.prototype.set = function (ownerID, shift, hash, key, value, didAddLeaf) {
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
        var newNode;
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
            newNode = new HashCollisionNode(ownerID, hash, [keyOrNull, key], [valueOrNode, value]);
        } else {
            newNode = makeNode(ownerID, shift + SHIFT, originalHash, keyOrNull, valueOrNode).set(ownerID, shift + SHIFT, hash, key, value);
        }
        didAddLeaf && (didAddLeaf.value = true);
        var editable = this.ensureOwner(ownerID);
        delete editable.keys[idx];
        editable.values[idx] = newNode;
        return editable;
    };

    BitmapIndexedNode.prototype.delete = function (ownerID, shift, hash, key, didRemoveLeaf) {
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
    };

    BitmapIndexedNode.prototype.ensureOwner = function (ownerID) {
        if (ownerID && ownerID === this.ownerID) {
            return this;
        }
        return new BitmapIndexedNode(ownerID, this.bitmap, this.keys.slice(), this.values.slice());
    };

    BitmapIndexedNode.prototype.iterate = function (map, fn, thisArg) {
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
    };
    return BitmapIndexedNode;
})();

var HashCollisionNode = (function () {
    function HashCollisionNode(ownerID, collisionHash, keys, values) {
        this.ownerID = ownerID;
        this.collisionHash = collisionHash;
        this.keys = keys;
        this.values = values;
    }
    HashCollisionNode.prototype.get = function (shift, hash, key, notFound) {
        var idx = this.keys.indexOf(key);
        return idx === -1 ? notFound : this.values[idx];
    };

    HashCollisionNode.prototype.set = function (ownerID, shift, hash, key, value, didAddLeaf) {
        if (hash !== this.collisionHash) {
            didAddLeaf && (didAddLeaf.value = true);
            return makeNode(ownerID, shift, hash, null, this).set(ownerID, shift, hash, key, value);
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
    };

    HashCollisionNode.prototype.delete = function (ownerID, shift, hash, key, didRemoveLeaf) {
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
    };

    HashCollisionNode.prototype.ensureOwner = function (ownerID) {
        if (ownerID && ownerID === this.ownerID) {
            return this;
        }
        return new HashCollisionNode(ownerID, this.collisionHash, this.keys.slice(), this.values.slice());
    };

    HashCollisionNode.prototype.iterate = function (map, fn, thisArg) {
        for (var ii = 0; ii < this.values.length; ii++) {
            if (fn.call(thisArg, this.values[ii], this.keys[ii], map) === false) {
                return false;
            }
        }
        return true;
    };
    return HashCollisionNode;
})();

function BoolRef(value) {
    __BOOL_REF.value = value;
    return __BOOL_REF;
}

var __BOOL_REF = { value: false };

function hashValue(o) {
    if (!o) {
        return 0;
    }
    if (o === true) {
        return 1;
    }
    if (o.hash instanceof Function) {
        return o.hash();
    }
    if (typeof o === 'number') {
        return Math.floor(o) % 2147483647;
    }
    if (typeof o === 'string') {
        return hashString(o);
    }
    throw new Error('Unable to hash');
}

function hashString(string) {
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

var STRING_HASH_MAX_VAL = 0x100000000;
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var STRING_HASH_CACHE = {};

var SHIFT = 5;
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_MAP;

module.exports = Map;
//# sourceMappingURL=Map.js.map
