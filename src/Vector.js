var IndexedSequence = require('./IndexedSequence');


function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

class Vector extends IndexedSequence {

  // @pragma Construction

  constructor(...values) {
    return Vector.fromArray(values);
    super();
  }

  static empty() {
    return __EMPTY_PVECT || (__EMPTY_PVECT =
      Vector._make(0, 0, SHIFT, __EMPTY_VNODE, __EMPTY_VNODE)
    );
  }

  static transientWithSize(size) {
    var vect = Vector.empty().asTransient();
    if (size) {
      vect.length = vect._size = size;
    }
    return vect;
  }

  static fromArray(values) {
    if (values.length === 0) {
      return Vector.empty();
    }
    if (values.length > 0 && values.length < SIZE) {
      return Vector._make(0, values.length, SHIFT, __EMPTY_VNODE, new VNode(null, values.slice()));
    }
    return Vector.transientWithSize(values.length).merge(values).asPersistent();
  }

  toString() {
    return this.__toString('Vector [', ']');
  }

  // @pragma Access

  has(index) {
    return this.get(index, __SENTINEL) !== __SENTINEL;
  }

  get(index, undefinedValue) {
    index = rawIndex(index, this._origin);
    if (index >= this._size) {
      return undefinedValue;
    }
    var node = this._nodeFor(index);
    var property = index & MASK;
    return node && node.array.hasOwnProperty(property) ? node.array[property] : undefinedValue;
  }

  getIn(indexPath, pathOffset) {
    pathOffset = pathOffset || 0;
    var nested = this.get(indexPath[pathOffset]);
    if (pathOffset === indexPath.length - 1) {
      return nested;
    }
    if (nested && nested.getIn) {
      return nested.getIn(indexPath, pathOffset + 1);
    }
  }

  first(predicate, context) {
    return predicate ? super.first(predicate, context) : this.get(0);
  }

  last(predicate, context) {
    return predicate ? super.last(predicate, context) : this.get(this.length ? this.length - 1 : 0);
  }

  equals(other) {
    if (this === other) {
      return true;
    }
    if (!(other instanceof Vector)) { // TODO: after dropping TS, check prototype ===.
      return false;
    }
    if (this.length !== other.length) {
      return false;
    }
    var is = require('./Persistent').is;
    var otherIterator = other.__iterator__();
    return this.every((v, k) => {
      var otherKV = otherIterator.next();
      return k === otherKV[0] && is(v, otherKV[1]);
    });
  }

  // @pragma Modification

  // ES6 Map calls this "clear"
  empty() {
    if (this._ownerID) {
      this.length = this._origin = this._size = 0;
      this._level = SHIFT;
      this._root = this._tail = __EMPTY_VNODE;
      return this;
    }
    return Vector.empty();
  }

  set(index, value) {
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
  }

  setIn(keyPath, v, pathOffset) {
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
  }

  push(/*...values*/) {
    if (arguments.length === 1) {
      return this.set(this.length, arguments[0]);
    }
    var vec = this.asTransient();
    for (var ii = 0; ii < arguments.length; ii++) {
      vec = vec.set(vec.length, arguments[ii]);
    }
    return this.isTransient() ? vec : vec.asPersistent();
  }

  pop() {
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
  }

  delete(index) {
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
  }

  deleteIn(keyPath, pathOffset) {
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
  }

  unshift(/*...values*/) {
    var values = arguments;
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
  }

  shift() {
    return this.slice(1);
  }

  // @pragma Composition

  merge(seq) {
    var newVect = this.asTransient();
    seq.forEach((value, index) => newVect.set(index, value));
    return this.isTransient() ? newVect : newVect.asPersistent();
  }

  concat(/*...values*/) {
    var vector = this.asTransient();
    for (var ii = 0; ii < arguments.length; ii++) {
      var value = arguments[ii];
      if (value && vector.length === 0 && !this.isTransient() && value instanceof Vector) {
        vector = value.asTransient();
      } else if (value && typeof value.forEach === 'function') {
        var offset = vector.length;
        if (value.length) {
          vector._size += value.length;
          vector.length += value.length;
        }
        if (typeof value.values === 'function' && !(value instanceof IndexedSequence)) {
          value = value.values();
        }
        value.forEach((value, index) => {
          vector.set((typeof index === 'number' ? index : 0) + offset, value);
        });
      } else {
        vector.push(value);
      }
    }
    return this.isTransient() ? vector : vector.asPersistent();
  }

  slice(begin, end) {
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
  }

  splice(index, removeNum/*, ...values*/) {
    return this.slice(0, index).concat(
      arguments.length > 2 ? Vector.fromArray(Array.prototype.slice.call(arguments, 2)) : null,
      this.slice(index + removeNum)
    );
  }

  // @pragma Mutability

  isTransient() {
    return !!this._ownerID;
  }

  asTransient() {
    if (this._ownerID) {
      return this;
    }
    var vect = this.clone();
    vect._ownerID = new OwnerID();
    return vect;
  }

  asPersistent() {
    this._ownerID = undefined;
    return this;
  }

  clone() {
    return Vector._make(this._origin, this._size, this._level, this._root, this._tail, this._ownerID && new OwnerID());
  }

  // @pragma Iteration

  __iterator__() {
    return new VectorIterator(
      this, this._origin, this._size, this._level, this._root, this._tail
    );
  }

  __iterate(fn, reverseIndices) {
    var tailOffset = getTailOffset(this._size);
    return (
      this._root.iterate(this, this._level, -this._origin, tailOffset - this._origin, fn, reverseIndices) &&
      this._tail.iterate(this, 0, tailOffset - this._origin, this._size - this._origin, fn, reverseIndices)
    );
  }

  __reverseIterate(fn, maintainIndices) {
    var tailOffset = getTailOffset(this._size);
    return (
      this._tail.reverseIterate(this, 0, tailOffset - this._origin, this._size - this._origin, fn, maintainIndices) &&
      this._root.reverseIterate(this, this._level, -this._origin, tailOffset - this._origin, fn, maintainIndices)
    );
  }

  // @pragma Private

  static _make(origin, size, level, root, tail, ownerID) {
    var vect = Object.create(Vector.prototype);
    vect.length = size - origin;
    vect._origin = origin;
    vect._size = size;
    vect._level = level;
    vect._root = root;
    vect._tail = tail;
    vect._ownerID = ownerID;
    return vect;
  }

  _nodeFor(rawIndex) {
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
  }
}

function rawIndex(index, origin) {
  invariant(index >= 0, 'Index out of bounds');
  return index + origin;
}

function getTailOffset(size) {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}

class OwnerID {
  constructor() {}
}

class VNode {
  constructor(ownerID, array) {
    this.ownerID = ownerID;
    this.array = array;
  }

  pop(ownerID, length, level) {
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
  }

  ensureOwner(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new VNode(ownerID, this.array.slice());
  }

  iterate(vector, level, offset, max, fn, reverseIndices) {
    // Note using every() gets us a speed-up of 2x on modern JS VMs, but means
    // we cannot support IE8 without polyfill.
    if (level === 0) {
      return this.array.every((value, rawIndex) => {
        var index = rawIndex + offset;
        if (reverseIndices) {
          index = vector.length - 1 - index;
        }
        return index < 0 || index >= max || fn(value, index, vector) !== false;
      });
    }
    var step = 1 << level;
    var newLevel = level - SHIFT;
    return this.array.every((newNode, levelIndex) => {
      var newOffset = offset + levelIndex * step;
      return newOffset >= max || newOffset + step <= 0 || newNode.iterate(vector, newLevel, newOffset, max, fn, reverseIndices);
    });
  }

  reverseIterate(vector, level, offset, max, fn, maintainIndices) {
    if (level === 0) {
      for (var rawIndex = this.array.length - 1; rawIndex >= 0; rawIndex--) {
        if (this.array.hasOwnProperty(rawIndex)) {
          var index = rawIndex + offset;
          if (!maintainIndices) {
            index = vector.length - 1 - index;
          }
          if (index >= 0 && index < max && fn(this.array[rawIndex], index, vector) === false) {
            return false;
          }
        }
      }
    } else {
      var step = 1 << level;
      var newLevel = level - SHIFT;
      for (var levelIndex = this.array.length - 1; levelIndex >= 0; levelIndex--) {
        var newOffset = offset + levelIndex * step;
        if (newOffset < max &&
            newOffset + step > 0 &&
            this.array.hasOwnProperty(levelIndex) &&
            !this.array[levelIndex].reverseIterate(vector, newLevel, newOffset, max, fn, maintainIndices)) {
          return false;
        }
      }
    }
    return true;
  }
}

class VectorIterator {

  constructor(vector, origin, size, level, root, tail) {
    var tailOffset = getTailOffset(size);
    this._stack = {
      node: root.array,
      level: level,
      offset: -origin,
      max: tailOffset - origin,
      __prev: {
        node: tail.array,
        level: 0,
        offset: tailOffset - origin,
        max: size - origin
      }
    };
  }

  next() /*(number,T)*/ {
    var stack = this._stack;
    iteration: while (stack) {
      if (stack.level === 0) {
        stack.rawIndex || (stack.rawIndex = 0);
        while (stack.rawIndex < stack.node.length) {
          var index = stack.rawIndex + stack.offset;
          if (index >= 0 && index < stack.max && stack.node.hasOwnProperty(stack.rawIndex)) {
            var value = stack.node[stack.rawIndex];
            stack.rawIndex++;
            return [index, value];
          } else {
            stack.rawIndex++;
          }
        }
      } else {
        var step = 1 << stack.level;
        stack.levelIndex || (stack.levelIndex = 0);
        while (stack.levelIndex < stack.node.length) {
          var newOffset = stack.offset + stack.levelIndex * step;
          if (newOffset + step > 0 && newOffset < stack.max && stack.node.hasOwnProperty(stack.levelIndex)) {
            var newNode = stack.node[stack.levelIndex].array;
            stack.levelIndex++;
            stack = this._stack = {
              node: newNode,
              level: stack.level - SHIFT,
              offset: newOffset,
              max: stack.max,
              __prev: stack
            };
            continue iteration;
          } else {
            stack.levelIndex++;
          }
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    if (global.StopIteration) {
      throw global.StopIteration;
    }
  }
}


var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_PVECT;
var __EMPTY_VNODE = new VNode(null, []);

module.exports = Vector;
