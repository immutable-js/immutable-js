var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OrderedLazyIterable = require('./OrderedLazyIterable');

function invariant(condition, error) {
    if (!condition)
        throw new Error(error);
}

var Vector = (function (_super) {
    __extends(Vector, _super);
    // @pragma Construction
    function Vector() {
        var values = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            values[_i] = arguments[_i + 0];
        }
        return Vector.fromArray(values);
        _super.call(this);
    }
    Vector.empty = function () {
        return __EMPTY_PVECT || (__EMPTY_PVECT = Vector._make(0, 0, SHIFT, __EMPTY_VNODE, __EMPTY_VNODE));
    };

    Vector.fromArray = function (values) {
        if (values.length === 0) {
            return Vector.empty();
        }
        if (values.length > 0 && values.length < SIZE) {
            return Vector._make(0, values.length, SHIFT, __EMPTY_VNODE, new VNode(null, values.slice()));
        }
        var vect = Vector.empty().asTransient();
        values.forEach(function (value, index) {
            vect = vect.set(index, value);
        });
        return vect.asPersistent();
    };

    // TODO: generalize and apply to Set and Map
    Vector.prototype.toString = function () {
        var string = '[ ';
        for (var ii = 0; ii < this.length; ii++) {
            var value = this.get(ii, __SENTINEL);
            if (value === __SENTINEL) {
                // TODO: handle string case to properly wrap in "
                string += value;
            }
            if (ii < this.length - 1) {
                string += ', ';
            }
        }
        string += ' ]';
    };

    Vector.prototype.has = function (index) {
        return this.get(index, __SENTINEL) !== __SENTINEL;
    };

    Vector.prototype.get = function (index, undefinedValue) {
        index = rawIndex(index, this._origin);
        if (index >= this._size) {
            return undefinedValue;
        }
        var node = this._nodeFor(index);
        var property = index & MASK;
        return node && node.array.hasOwnProperty(property) ? node.array[property] : undefinedValue;
    };

    Vector.prototype.getIn = function (indexPath, pathOffset) {
        pathOffset = pathOffset || 0;
        var nested = this.get(indexPath[pathOffset]);
        if (pathOffset === indexPath.length - 1) {
            return nested;
        }
        if (nested && nested.getIn) {
            return nested.getIn(indexPath, pathOffset + 1);
        }
    };

    Vector.prototype.first = function () {
        if (this.length > 0) {
            return this.get(0);
        }
    };

    Vector.prototype.last = function () {
        if (this.length > 0) {
            return this.get(this.length - 1);
        }
    };

    // @pragma Modification
    // ES6 Map calls this "clear"
    Vector.prototype.empty = function () {
        if (this._ownerID) {
            this.length = this._origin = this._size = 0;
            this._level = SHIFT;
            this._root = this._tail = __EMPTY_VNODE;
            return this;
        }
        return Vector.empty();
    };

    Vector.prototype.set = function (index, value) {
        index = rawIndex(index, this._origin);
        var tailOffset = getTailOffset(this._size);

        // Overflow's tail, merge the tail and make a new one.
        if (index >= tailOffset + SIZE) {
            // Tail might require creating a higher root.
            var newRoot = this._root;
            var newLevel = this._level;
            while (tailOffset > 1 << (newLevel + SHIFT)) {
                newRoot = new VNode(this._ownerID, [newRoot]);
                newLevel += SHIFT;
            }
            if (newRoot === this._root) {
                newRoot = newRoot.ensureOwner(this._ownerID);
            }

            // Merge Tail into tree.
            var node = newRoot;
            for (var level = newLevel; level > SHIFT; level -= SHIFT) {
                var idx = (tailOffset >>> level) & MASK;
                node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this._ownerID) : new VNode(this._origin, []);
            }
            node.array[(tailOffset >>> SHIFT) & MASK] = this._tail;

            // Create new tail with set index.
            var newTail = new VNode(this._ownerID, []);
            newTail.array[index & MASK] = value;
            var newSize = index + 1;
            if (this._ownerID) {
                this.length = newSize - this._origin;
                this._size = newSize;
                this._level = newLevel;
                this._root = newRoot;
                this._tail = newTail;
                return this;
            }
            return Vector._make(this._origin, newSize, newLevel, newRoot, newTail);
        }

        // Fits within tail.
        if (index >= tailOffset) {
            var newTail = this._tail.ensureOwner(this._ownerID);
            newTail.array[index & MASK] = value;
            var newSize = index >= this._size ? index + 1 : this._size;
            if (this._ownerID) {
                this.length = newSize - this._origin;
                this._size = newSize;
                this._tail = newTail;
                return this;
            }
            return Vector._make(this._origin, newSize, this._level, this._root, newTail);
        }

        // Fits within existing tree.
        var newRoot = this._root.ensureOwner(this._ownerID);
        var node = newRoot;
        for (var level = this._level; level > 0; level -= SHIFT) {
            var idx = (index >>> level) & MASK;
            node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this._ownerID) : new VNode(this._ownerID, []);
        }
        node.array[index & MASK] = value;
        if (this._ownerID) {
            this._root = newRoot;
            return this;
        }
        return Vector._make(this._origin, this._size, this._level, newRoot, this._tail);
    };

    Vector.prototype.setIn = function (keyPath, v, pathOffset) {
        pathOffset = pathOffset || 0;
        if (pathOffset === keyPath.length - 1) {
            return this.set(keyPath[pathOffset], v);
        }
        var k = keyPath[pathOffset];
        var nested = this.get(k, __SENTINEL);
        if (nested === __SENTINEL || !nested.setIn) {
            if (typeof k === 'number') {
                nested = Vector.empty();
            } else {
                nested = require('./Map').empty();
            }
        }
        return this.set(k, nested.setIn(keyPath, v, pathOffset + 1));
    };

    Vector.prototype.push = function () {
        var values = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            values[_i] = arguments[_i + 0];
        }
        if (values.length === 1) {
            return this.set(this.length, values[0]);
        }
        var vec = this.asTransient();
        for (var ii = 0; ii < values.length; ii++) {
            vec = vec.set(vec.length, values[ii]);
        }
        return this.isTransient() ? vec : vec.asPersistent();
    };

    Vector.prototype.pop = function () {
        var newSize = this._size - 1;

        if (newSize <= this._origin) {
            return this.empty();
        }

        if (this._ownerID) {
            this.length--;
            this._size--;
        }

        // Fits within tail.
        if (newSize > getTailOffset(this._size)) {
            var newTail = this._tail.ensureOwner(this._ownerID);
            newTail.array.pop();
            if (this._ownerID) {
                this._tail = newTail;
                return this;
            }
            return Vector._make(this._origin, newSize, this._level, this._root, newTail);
        }

        var newRoot = this._root.pop(this._ownerID, this._size, this._level) || __EMPTY_VNODE;
        var newTail = this._nodeFor(newSize - 1);
        if (this._ownerID) {
            this._root = newRoot;
            this._tail = newTail;
            return this;
        }
        return Vector._make(this._origin, newSize, this._level, newRoot, newTail);
    };

    Vector.prototype.delete = function (index) {
        index = rawIndex(index, this._origin);
        var tailOffset = getTailOffset(this._size);

        // Out of bounds, no-op.
        if (!this.has(index)) {
            return this;
        }

        // Delete within tail.
        if (index >= tailOffset) {
            var newTail = this._tail.ensureOwner(this._ownerID);
            delete newTail.array[index & MASK];
            if (this._ownerID) {
                this._tail = newTail;
                return this;
            }
            return Vector._make(this._origin, this._size, this._level, this._root, newTail);
        }

        // Fits within existing tree.
        var newRoot = this._root.ensureOwner(this._ownerID);
        var node = newRoot;
        for (var level = this._level; level > 0; level -= SHIFT) {
            var idx = (index >>> level) & MASK;
            node = node.array[idx] = node.array[idx].ensureOwner(this._ownerID);
        }
        delete node.array[index & MASK];
        if (this._ownerID) {
            this._root = newRoot;
            return this;
        }
        return Vector._make(this._origin, this._size, this._level, newRoot, this._tail);
    };

    Vector.prototype.deleteIn = function (keyPath, pathOffset) {
        pathOffset = pathOffset || 0;
        if (pathOffset === keyPath.length - 1) {
            return this.delete(keyPath[pathOffset]);
        }
        var k = keyPath[pathOffset];
        var nested = this.get(k);
        if (!nested || !nested.deleteIn) {
            return this;
        }
        return this.set(k, nested.deleteIn(keyPath, pathOffset + 1));
    };

    Vector.prototype.unshift = function () {
        var values = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            values[_i] = arguments[_i + 0];
        }
        var newOrigin = this._origin - values.length;
        var newSize = this._size;
        var newLevel = this._level;
        var newRoot = this._root;

        while (newOrigin < 0) {
            var node = new VNode(this._ownerID, []);
            node.array[1] = newRoot;
            newOrigin += 1 << newLevel;
            newSize += 1 << newLevel;
            newLevel += SHIFT;
            newRoot = node;
        }

        if (newRoot === this._root) {
            newRoot = this._root.ensureOwner(this._ownerID);
        }

        var tempOwner = this._ownerID || new OwnerID();
        for (var ii = 0; ii < values.length; ii++) {
            var index = newOrigin + ii;
            var node = newRoot;
            for (var level = newLevel; level > 0; level -= SHIFT) {
                var idx = (index >>> level) & MASK;
                node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(tempOwner) : new VNode(tempOwner, []);
            }
            node.array[index & MASK] = values[ii];
        }

        if (this._ownerID) {
            this.length = newSize - newOrigin;
            this._origin = newOrigin;
            this._size = newSize;
            this._level = newLevel;
            this._root = newRoot;
            return this;
        }
        return Vector._make(newOrigin, newSize, newLevel, newRoot, this._tail);
    };

    Vector.prototype.shift = function () {
        return this.slice(1);
    };

    // @pragma Composition
    Vector.prototype.merge = function (seq) {
        var newVect = this.asTransient();
        seq.iterate(function (value, index) {
            return newVect.set(index, value);
        });
        return this.isTransient() ? newVect : newVect.asPersistent();
    };

    Vector.prototype.concat = function () {
        var vectors = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            vectors[_i] = arguments[_i + 0];
        }
        var vector = this.asTransient();
        for (var ii = 0; ii < vectors.length; ii++) {
            if (vectors[ii].length > 0) {
                if (vector.length === 0 && !this.isTransient()) {
                    vector = vectors[ii].asTransient();
                } else {
                    var offset = vector.length;
                    vector.length += vectors[ii].length;
                    vectors[ii].iterate(function (value, index) {
                        return vector.set(index + offset, value);
                    });
                }
            }
        }
        return this.isTransient() ? vector : vector.asPersistent();
    };

    Vector.prototype.slice = function (begin, end) {
        var newOrigin = begin < 0 ? Math.max(this._origin, this._size + begin) : Math.min(this._size, this._origin + begin);
        var newSize = end == null ? this._size : end < 0 ? Math.max(this._origin, this._size + end) : Math.min(this._size, this._origin + end);
        if (newOrigin >= newSize) {
            return this.empty();
        }
        var newTail = newSize === this._size ? this._tail : this._nodeFor(newSize) || new VNode(this._ownerID, []);

        // TODO: should also calculate a new root and garbage collect?
        // This would be a tradeoff between memory footprint and perf.
        // I still expect better performance than Array.slice(), so it's probably worth freeing memory.
        if (this._ownerID) {
            this.length = newSize - newOrigin;
            this._origin = newOrigin;
            this._size = newSize;
            this._tail = newTail;
            return this;
        }
        return Vector._make(newOrigin, newSize, this._level, this._root, newTail);
    };

    Vector.prototype.splice = function (index, removeNum) {
        var values = [];
        for (var _i = 0; _i < (arguments.length - 2); _i++) {
            values[_i] = arguments[_i + 2];
        }
        return this.slice(0, index).concat(Vector.fromArray(values), this.slice(index + removeNum));
    };

    // @pragma Mutability
    Vector.prototype.isTransient = function () {
        return !!this._ownerID;
    };

    Vector.prototype.asTransient = function () {
        if (this._ownerID) {
            return this;
        }
        var vect = this.clone();
        vect._ownerID = new OwnerID();
        return vect;
    };

    Vector.prototype.asPersistent = function () {
        this._ownerID = undefined;
        return this;
    };

    Vector.prototype.clone = function () {
        return Vector._make(this._origin, this._size, this._level, this._root, this._tail, this._ownerID && new OwnerID());
    };

    // @pragma Iteration
    Vector.prototype.iterate = function (fn, thisArg) {
        var tailOffset = getTailOffset(this._size);
        return (this._root.iterate(this, this._level, -this._origin, tailOffset - this._origin, fn, thisArg) && this._tail.iterate(this, 0, tailOffset - this._origin, this._size - this._origin, fn, thisArg));
    };

    Vector.prototype.reverseIterate = function (fn, thisArg, maintainIndices) {
        var tailOffset = getTailOffset(this._size);
        return (this._tail.reverseIterate(this, 0, tailOffset - this._origin, this._size - this._origin, fn, thisArg, maintainIndices) && this._root.reverseIterate(this, this._level, -this._origin, tailOffset - this._origin, fn, thisArg, maintainIndices));
    };

    // Override - set correct length before returning
    Vector.prototype.toArray = function () {
        var array = _super.prototype.toArray.call(this);
        array.length = this.length;
        return array;
    };

    Vector._make = function (origin, size, level, root, tail, ownerID) {
        var vect = Object.create(Vector.prototype);
        vect.length = size - origin;
        vect._origin = origin;
        vect._size = size;
        vect._level = level;
        vect._root = root;
        vect._tail = tail;
        vect._ownerID = ownerID;
        return vect;
    };

    Vector.prototype._nodeFor = function (rawIndex) {
        if (rawIndex >= getTailOffset(this._size)) {
            return this._tail;
        }
        if (rawIndex < 1 << (this._level + SHIFT)) {
            var node = this._root;
            var level = this._level;
            while (node && level > 0) {
                node = node.array[(rawIndex >>> level) & MASK];
                level -= SHIFT;
            }
            return node;
        }
    };
    return Vector;
})(OrderedLazyIterable);

function rawIndex(index, origin) {
    invariant(index >= 0, 'Index out of bounds');
    return index + origin;
}

function getTailOffset(size) {
    return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}

var OwnerID = (function () {
    function OwnerID() {
    }
    return OwnerID;
})();

var VNode = (function () {
    function VNode(ownerID, array) {
        this.ownerID = ownerID;
        this.array = array;
    }
    VNode.prototype.pop = function (ownerID, length, level) {
        var idx = ((length - 1) >>> level) & MASK;
        if (level > SHIFT) {
            var newChild = this.array[idx].pop(ownerID, length, level - SHIFT);
            if (newChild || idx) {
                var editable = this.ensureOwner(ownerID);
                if (newChild) {
                    editable.array[idx] = newChild;
                } else {
                    delete editable.array[idx];
                }
                return editable;
            }
        } else if (idx !== 0) {
            var editable = this.ensureOwner(ownerID);
            delete editable.array[idx];
            return editable;
        }
    };

    VNode.prototype.ensureOwner = function (ownerID) {
        if (ownerID && ownerID === this.ownerID) {
            return this;
        }
        return new VNode(ownerID, this.array.slice());
    };

    VNode.prototype.iterate = function (vector, level, offset, max, fn, thisArg, reverseIndices) {
        // Note using every() gets us a speed-up of 2x on modern JS VMs, but means
        // we cannot support IE8 without polyfill.
        if (level === 0) {
            return this.array.every(function (value, rawIndex) {
                var index = rawIndex + offset;
                if (reverseIndices) {
                    index = vector.length - 1 - index;
                }
                return index < 0 || index >= max || fn.call(thisArg, value, index, vector) !== false;
            });
        }
        var step = 1 << level;
        var newLevel = level - SHIFT;
        return this.array.every(function (newNode, levelIndex) {
            var newOffset = offset + levelIndex * step;
            return newOffset >= max || newOffset + step <= 0 || newNode.iterate(vector, newLevel, newOffset, max, fn, thisArg);
        });
    };

    VNode.prototype.reverseIterate = function (vector, level, offset, max, fn, thisArg, maintainIndices) {
        if (level === 0) {
            for (var rawIndex = this.array.length - 1; rawIndex >= 0; rawIndex--) {
                if (this.array.hasOwnProperty(rawIndex)) {
                    var index = rawIndex + offset;
                    if (!maintainIndices) {
                        index = vector.length - 1 - index;
                    }
                    if (index >= 0 && index < max && fn.call(thisArg, this.array[rawIndex], index, vector) === false) {
                        return false;
                    }
                }
            }
        } else {
            var step = 1 << level;
            var newLevel = level - SHIFT;
            for (var levelIndex = this.array.length - 1; levelIndex >= 0; levelIndex--) {
                if (this.array.hasOwnProperty(levelIndex)) {
                    var newOffset = offset + levelIndex * step;
                    if (newOffset < max && newOffset + step > 0 && !this.array[levelIndex].reverseIterate(vector, newLevel, newOffset, max, fn, thisArg)) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    return VNode;
})();

var SHIFT = 5;
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_PVECT;
var __EMPTY_VNODE = new VNode(null, []);

module.exports = Vector;
//# sourceMappingURL=Vector.js.map
