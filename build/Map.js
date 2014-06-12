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
        _super.call(this, this);
        if (!obj) {
            return Map.empty();
        }
        return Map.fromObj(obj);
    }
    Map.empty = function () {
        return __EMPTY_MAP || (__EMPTY_MAP = Map._make(0));
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
    Map.prototype.set = function (k, v) {
        if (k == null) {
            return this;
        }
        var didAddLeaf = BoolRef();
        var newRoot = (this._root || __EMPTY_MNODE).set(this._ownerID, 0, hashValue(k), k, v, didAddLeaf);
        if (this._ownerID) {
            didAddLeaf.val && this.length++;
            this._root = newRoot;
            return this;
        }
        return newRoot === this._root ? this : Map._make(this.length + (didAddLeaf.val ? 1 : 0), newRoot);
    };

    Map.prototype.delete = function (k) {
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
    };

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
        return Map._make(this.length, this._root, this._ownerID);
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
exports.Map = Map;

var OwnerID = (function () {
    function OwnerID() {
    }
    return OwnerID;
})();

var BitmapIndexedNode = (function () {
    function BitmapIndexedNode(ownerID, bitmap, cnt, keys, values) {
        this.ownerID = ownerID;
        this.bitmap = bitmap;
        this.cnt = cnt;
        this.keys = keys;
        this.values = values;
    }
    BitmapIndexedNode.prototype.get = function (shift, hash, key, not_found) {
        var idx = (hash >>> shift) & MASK;
        var bit = 1 << idx;
        if ((this.bitmap & bit) === 0) {
            return not_found;
        }
        var key_or_nil = this.keys[idx];
        var val_or_node = this.values[idx];
        if (key_or_nil == null) {
            return val_or_node.get(shift + SHIFT, hash, key, not_found);
        }
        return key === key_or_nil ? val_or_node : not_found;
    };

    BitmapIndexedNode.prototype.set = function (ownerID, shift, hash, key, val, didAddLeaf) {
        var idx = (hash >>> shift) & MASK;
        var bit = 1 << idx;
        if ((this.bitmap & bit) === 0) {
            didAddLeaf && (didAddLeaf.val = true);

            // It's not entirely clear what we get by creating an array node here. Space savings?
            if (this.cnt >= 16) {
                var nodes = [];
                for (var ii = 0; ii < this.values.length; ii++) {
                    if (this.bitmap & (1 << ii)) {
                        nodes[ii] = this.keys[ii] == null ? this.values[ii] : __EMPTY_MNODE.set(ownerID, shift + SHIFT, hashValue(this.keys[ii]), this.keys[ii], this.values[ii]);
                    }
                }
                nodes[idx] = __EMPTY_MNODE.set(ownerID, shift + SHIFT, hash, key, val);
                return new ArrayNode(ownerID, this.cnt + 1, nodes);
            }
            var editable = this.ensureOwner(ownerID);
            editable.keys[idx] = key;
            editable.values[idx] = val;
            editable.bitmap |= bit;
            editable.cnt++;
            return editable;
        }
        var key_or_nil = this.keys[idx];
        var val_or_node = this.values[idx];
        var newNode;
        if (key_or_nil == null) {
            newNode = val_or_node.set(ownerID, shift + SHIFT, hash, key, val, didAddLeaf);
            if (newNode === val_or_node) {
                return this;
            }
            return edit_and_set(this, ownerID, idx, newNode);
        }
        if (key === key_or_nil) {
            if (val === val_or_node) {
                return this;
            }
            return edit_and_set(this, ownerID, idx, val);
        }
        var key1hash = hashValue(key_or_nil);
        if (key1hash === hash) {
            newNode = new HashCollisionNode(ownerID, hash, [key_or_nil, key], [val_or_node, val]);
        } else {
            newNode = __EMPTY_MNODE.set(ownerID, shift + SHIFT, key1hash, key_or_nil, val_or_node).set(ownerID, shift + SHIFT, hash, key, val);
        }
        didAddLeaf && (didAddLeaf.val = true);
        var editable = this.ensureOwner(ownerID);
        delete editable.keys[idx];
        editable.values[idx] = newNode;
        return editable;
    };

    BitmapIndexedNode.prototype.delete = function (ownerID, shift, hash, key, didRemoveLeaf) {
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
                return edit_and_set(this, ownerID, idx, newNode);
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
    };

    BitmapIndexedNode.prototype.ensureOwner = function (ownerID) {
        if (ownerID && ownerID === this.ownerID) {
            return this;
        }
        return new BitmapIndexedNode(ownerID, this.bitmap, this.cnt, this.keys.slice(), this.values.slice());
    };

    BitmapIndexedNode.prototype.iterate = function (map, fn, thisArg) {
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
    };
    return BitmapIndexedNode;
})();

var ArrayNode = (function () {
    function ArrayNode(ownerID, cnt, arr) {
        this.ownerID = ownerID;
        this.cnt = cnt;
        this.arr = arr;
    }
    ArrayNode.prototype.get = function (shift, hash, key, not_found) {
        var idx = (hash >>> shift) & MASK;
        return this.arr[idx] ? this.arr[idx].get(shift + SHIFT, hash, key, not_found) : not_found;
    };

    ArrayNode.prototype.set = function (ownerID, shift, hash, key, val, didAddLeaf) {
        var idx = (hash >>> shift) & MASK;
        var node = this.arr[idx];
        var newNode = (node || __EMPTY_MNODE).set(ownerID, shift + SHIFT, hash, key, val, didAddLeaf);
        if (newNode === node) {
            return this;
        }
        var editable = this.ensureOwner(ownerID);
        editable.arr[idx] = newNode;
        if (!node) {
            editable.cnt++;
        }
        return editable;
    };

    ArrayNode.prototype.delete = function (ownerID, shift, hash, key, didRemoveLeaf) {
        var idx = (hash >>> shift) & MASK;
        var node = this.arr[idx];
        if (node == null) {
            return this;
        }
        var newNode = node.delete(ownerID, shift + SHIFT, hash, key, didRemoveLeaf);

        // TODO: how necessary is this? The bitmap indexed node seems to pretend to save memory,
        // and subsequent sets could skip this level of indirection,
        // but otherwise this isn't really all that helpful.
        if (!newNode && this.cnt <= 8) {
            var values = [];
            var bitmap = 0;
            for (var ii = 0; ii < this.arr.length; ii++) {
                if (ii !== idx && this.arr[ii]) {
                    values[ii] = this.arr[ii];
                    bitmap |= 1 << ii;
                }
            }
            return new BitmapIndexedNode(ownerID, bitmap, this.cnt - 1, [], values);
        }
        if (newNode === node) {
            return this;
        }
        var editable = this.ensureOwner(ownerID);
        editable.arr[idx] = newNode;
        if (!newNode) {
            editable.cnt--;
        }
        return editable;
    };

    ArrayNode.prototype.ensureOwner = function (ownerID) {
        if (ownerID && ownerID === this.ownerID) {
            return this;
        }
        return new ArrayNode(ownerID, this.cnt, this.arr.slice());
    };

    ArrayNode.prototype.iterate = function (map, fn, thisArg) {
        for (var ii = 0; ii < this.arr.length; ii++) {
            var node = this.arr[ii];
            if (node && !node.iterate(map, fn, thisArg)) {
                return false;
            }
        }
        return true;
    };
    return ArrayNode;
})();

var HashCollisionNode = (function () {
    function HashCollisionNode(ownerID, collisionHash, keys, values) {
        this.ownerID = ownerID;
        this.collisionHash = collisionHash;
        this.keys = keys;
        this.values = values;
    }
    HashCollisionNode.prototype.get = function (shift, hash, key, not_found) {
        var idx = this.keys.indexOf(key);
        return idx === -1 ? not_found : this.values[idx];
    };

    HashCollisionNode.prototype.set = function (ownerID, shift, hash, key, val, didAddLeaf) {
        if (hash !== this.collisionHash) {
            didAddLeaf && (didAddLeaf.val = true);
            var bitmapIdx = (this.collisionHash >>> shift) & MASK;
            var bitmapValues = [];
            bitmapValues[bitmapIdx] = this;
            return new BitmapIndexedNode(ownerID, 1 << bitmapIdx, 1, [], bitmapValues).set(ownerID, shift, hash, key, val);
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
    };

    HashCollisionNode.prototype.delete = function (ownerID, shift, hash, key, didRemoveLeaf) {
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

function BoolRef(val) {
    __BOOL_REF.val = val;
    return __BOOL_REF;
}

var __BOOL_REF = { val: false };

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

function edit_and_set(node, ownerID, i, a) {
    var editable = node.ensureOwner(ownerID);
    editable.values[i] = a;
    return editable;
}

var SHIFT = 5;
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_MNODE = new BitmapIndexedNode(null, 0, 0, [], []);
var __EMPTY_MAP;
//# sourceMappingURL=Map.js.map
