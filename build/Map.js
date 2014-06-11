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
        var didAddLeaf = new BoolRef();
        var newRoot = (this._root || __EMPTY_MNODE).set(this._editRef, 0, hashValue(k), k, v, didAddLeaf);
        if (this._editRef) {
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
        var didRemoveLeaf = new BoolRef();
        var newRoot = this._root.delete(this._editRef, 0, hashValue(k), k, didRemoveLeaf);
        if (this._editRef) {
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
        return !!this._editRef;
    };

    Map.prototype.asTransient = function () {
        return this._editRef ? this : Map._make(this.length, this._root, new EditRef());
    };

    Map.prototype.asPersistent = function () {
        this._editRef = undefined;
        return this;
    };

    // @pragma Iteration
    Map.prototype.iterate = function (fn, thisArg) {
        return this._root && this._root.iterate(this, fn, thisArg);
    };

    Map._make = function (length, root, editRef) {
        var map = Object.create(Map.prototype);
        map.length = length;
        map._root = root;
        map._editRef = editRef;
        return map;
    };
    return Map;
})(Iterable);
exports.Map = Map;

var EditRef = (function () {
    function EditRef() {
    }
    return EditRef;
})();

var BoolRef = (function () {
    function BoolRef(val) {
        this.val = val;
    }
    return BoolRef;
})();

var BitmapIndexedNode = (function () {
    function BitmapIndexedNode(editRef, bitmap, arr) {
        this.editRef = editRef;
        this.bitmap = bitmap;
        this.arr = arr;
    }
    BitmapIndexedNode.prototype.get = function (shift, hash, key, not_found) {
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
    };

    BitmapIndexedNode.prototype.set = function (editRef, shift, hash, key, val, didAddLeaf) {
        var bit = 1 << ((hash >>> shift) & MASK);
        var idx = bitmap_indexed_node_index(this.bitmap, bit);
        if ((this.bitmap & bit) === 0) {
            didAddLeaf && (didAddLeaf.val = true);
            var n = bit_count(this.bitmap);
            if (n >= 16) {
                return unpack_array_node(this, editRef, shift, hash, key, val);
            }
            var editable = this.ensureEditable(editRef);
            if (editable.arr.length == 2 * idx) {
                editable.arr.push(key, val);
            } else {
                editable.arr.splice(2 * idx, 0, key, val);
            }
            editable.bitmap |= bit;
            return editable;
        }
        var key_or_nil = this.arr[2 * idx];
        var val_or_node = this.arr[2 * idx + 1];
        var newNode;
        if (key_or_nil == null) {
            newNode = val_or_node.set(editRef, shift + SHIFT, hash, key, val, didAddLeaf);
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
        var key1hash = hashValue(key_or_nil);
        if (key1hash === hash) {
            newNode = new HashCollisionNode(editRef, key1hash, 2, [key_or_nil, val_or_node, key, val]);
        } else {
            newNode = __EMPTY_MNODE.set(editRef, shift + SHIFT, key1hash, key_or_nil, val_or_node).set(editRef, shift + SHIFT, hash, key, val);
        }
        didAddLeaf && (didAddLeaf.val = true);
        return edit_and_set(this, editRef, 2 * idx, null, 2 * idx + 1, newNode);
    };

    BitmapIndexedNode.prototype.delete = function (editRef, shift, hash, key, didRemoveLeaf) {
        var bit = 1 << ((hash >>> shift) & MASK);
        if ((this.bitmap & bit) === 0) {
            return this;
        }
        var idx = bitmap_indexed_node_index(this.bitmap, bit);
        var key_or_nil = this.arr[2 * idx];
        var val_or_node = this.arr[2 * idx + 1];
        if (key_or_nil == null) {
            var n = val_or_node.delete(editRef, shift + SHIFT, hash, key, didRemoveLeaf);
            if (n === val_or_node) {
                return this;
            }
            if (n != null) {
                return edit_and_set(this, editRef, 2 * idx + 1, n);
            }
            if (this.bitmap === bit) {
                return null;
            }
            return edit_and_remove_pair(this, editRef, bit, idx);
        }
        if (key === key_or_nil) {
            didRemoveLeaf && (didRemoveLeaf.val = true);
            return edit_and_remove_pair(this, editRef, bit, idx);
        }
        return this;
    };

    BitmapIndexedNode.prototype.ensureEditable = function (editRef) {
        if (editRef && editRef === this.editRef) {
            return this;
        }
        return new BitmapIndexedNode(editRef, this.bitmap, this.arr.slice());
    };

    BitmapIndexedNode.prototype.iterate = function (map, fn, thisArg) {
        return mNodeIterate(map, this.arr, fn, thisArg);
    };
    return BitmapIndexedNode;
})();

var ArrayNode = (function () {
    function ArrayNode(editRef, cnt, arr) {
        this.editRef = editRef;
        this.cnt = cnt;
        this.arr = arr;
    }
    ArrayNode.prototype.get = function (shift, hash, key, not_found) {
        var idx = (hash >>> shift) & MASK;
        return this.arr[idx] ? this.arr[idx].get(shift + SHIFT, hash, key, not_found) : not_found;
    };

    ArrayNode.prototype.set = function (editRef, shift, hash, key, val, didAddLeaf) {
        var idx = (hash >>> shift) & MASK;
        var node = this.arr[idx];
        var newNode = (node || __EMPTY_MNODE).set(editRef, shift + SHIFT, hash, key, val, didAddLeaf);
        if (newNode === node) {
            return this;
        }
        var editable = this.ensureEditable(editRef);
        editable.arr[idx] = newNode;
        if (!node) {
            editable.cnt++;
        }
        return editable;
    };

    ArrayNode.prototype.delete = function (editRef, shift, hash, key, didRemoveLeaf) {
        var idx = (hash >>> shift) & MASK;
        var node = this.arr[idx];
        if (node == null) {
            return this;
        }
        var n = node.delete(editRef, shift + SHIFT, hash, key, didRemoveLeaf);
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
    };

    ArrayNode.prototype.ensureEditable = function (editRef) {
        if (editRef && editRef === this.editRef) {
            return this;
        }
        return new ArrayNode(editRef, this.cnt, this.arr.slice());
    };

    ArrayNode.prototype.iterate = function (map, fn, thisArg) {
        for (var i = 0; i < this.arr.length; i++) {
            var item = this.arr[i];
            if (item && !item.iterate(map, fn, thisArg)) {
                return false;
            }
        }
        return true;
    };
    return ArrayNode;
})();

var HashCollisionNode = (function () {
    function HashCollisionNode(editRef, collisionHash, cnt, arr) {
        this.editRef = editRef;
        this.collisionHash = collisionHash;
        this.cnt = cnt;
        this.arr = arr;
    }
    HashCollisionNode.prototype.get = function (shift, hash, key, not_found) {
        var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
        if (idx >= 0 && key === this.arr[idx]) {
            return this.arr[idx + 1];
        }
        return not_found;
    };

    HashCollisionNode.prototype.set = function (editRef, shift, hash, key, val, didAddLeaf) {
        if (hash !== this.collisionHash) {
            return new BitmapIndexedNode(editRef, 1 << ((this.collisionHash >>> shift) & MASK), [null, this]).set(editRef, shift, hash, key, val, didAddLeaf);
        }
        var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
        if (idx === -1) {
            var editable = this.ensureEditable(editRef);
            editable.arr.push(key, val);
            editable.cnt += 1;
            didAddLeaf && (didAddLeaf.val = true);
            return editable;
        }
        if (this.arr[idx + 1] === val) {
            return this;
        }
        return edit_and_set(this, editRef, idx + 1, val);
    };

    HashCollisionNode.prototype.delete = function (editRef, shift, hash, key, didRemoveLeaf) {
        var idx = hash_collision_node_find_index(this.arr, this.cnt, key);
        if (idx === -1) {
            return this;
        }
        didRemoveLeaf && (didRemoveLeaf.val = true);
        if (this.cnt === 1) {
            return null;
        }
        var editable = this.ensureEditable(editRef);
        var earr = editable.arr;
        var arrLen = earr.length;
        if (idx < arrLen - 2) {
            earr[idx] = earr[arrLen - 2];
            earr[idx + 1] = earr[arrLen - 1];
        }
        earr.length -= 2;
        editable.cnt--;
        return editable;
    };

    HashCollisionNode.prototype.ensureEditable = function (editRef) {
        if (editRef && editRef === this.editRef) {
            return this;
        }
        return new HashCollisionNode(editRef, this.collisionHash, this.cnt, this.arr.slice());
    };

    HashCollisionNode.prototype.iterate = function (map, fn, thisArg) {
        return mNodeIterate(map, this.arr, fn, thisArg);
    };
    return HashCollisionNode;
})();

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

function mNodeIterate(map, arr, fn, thisArg) {
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

function hash_collision_node_find_index(arr, cnt, key) {
    var lim = 2 * cnt;
    for (var i = 0; i < lim; i += 2) {
        if (key === arr[i]) {
            return i;
        }
    }
    return -1;
}

function bitmap_indexed_node_index(bitmap, bit) {
    return bit_count(bitmap & (bit - 1));
}

// Hamming weight
function bit_count(n) {
    n -= (n >> 1) & 0x55555555;
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

// TODO: inline
function edit_and_set(node, editRef, i, a, j, b) {
    var editable = node.ensureEditable(editRef);
    editable.arr[i] = a;
    if (j != null) {
        editable.arr[j] = b;
    }
    return editable;
}

function edit_and_remove_pair(node, editRef, bit, i) {
    if (this.bitmap === bit) {
        return null;
    }
    var editable = node.ensureEditable(editRef);
    var earr = editable.arr;
    editable.bitmap ^= bit;
    earr.splice(2 * i, 2);
    return editable;
}

function pack_array_node(array_node, editRef, idx) {
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
    return new BitmapIndexedNode(editRef, bitmap, new_arr);
}

function unpack_array_node(node, editRef, shift, hash, key, val) {
    var nodes = [];
    var jdx = (hash >>> shift) & MASK;
    nodes[jdx] = new BitmapIndexedNode(editRef, 1 << ((hash >>> (shift + SHIFT)) & MASK), [key, val]);
    var kvi = 0;
    for (var ii = 0; ii < SIZE; ii++) {
        if (node.bitmap & (1 << ii)) {
            nodes[ii] = node.arr[kvi] == null ? node.arr[kvi + 1] : new BitmapIndexedNode(editRef, 1 << ((hashValue(node.arr[kvi]) >>> (shift + SHIFT)) & MASK), [node.arr[kvi], node.arr[kvi + 1]]);
            kvi += 2;
        }
    }
    return new ArrayNode(editRef, kvi / 2, nodes);
}

var SHIFT = 5;
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_MNODE = new BitmapIndexedNode(null, 0, []);
var __EMPTY_MAP;
//# sourceMappingURL=Map.js.map
