var IndexedSequence = require('./Sequence').IndexedSequence;


function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

class Vector extends IndexedSequence {

  // @pragma Construction

  constructor(...values) {
    return Vector.fromArray(values);
  }

  static empty() {
    return __EMPTY_VECT || (__EMPTY_VECT =
      Vector._make(0, 0, SHIFT, __EMPTY_VNODE, __EMPTY_VNODE)
    );
  }

  static fromArray(values) {
    if (values.length === 0) {
      return Vector.empty();
    }
    if (values.length > 0 && values.length < SIZE) {
      return Vector._make(0, values.length, SHIFT, __EMPTY_VNODE, new VNode(values.slice()));
    }
    return Vector.empty().asTransient().merge(values).setLength(values.length).asPersistent();
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

  // @pragma Modification

  clear() {
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
    var node, level, idx, newSize, newRoot, newTail;

    var maskedIndex = index & MASK;

    // Overflow's tail, merge the tail and make a new one.
    if (index >= tailOffset + SIZE) {
      // Tail might require creating a higher root.
      newRoot = this._root;
      var newLevel = this._level;
      while (tailOffset >= 1 << (newLevel + SHIFT)) {
        newRoot = new VNode([newRoot], this._ownerID);
        newLevel += SHIFT;
      }
      if (newRoot === this._root) {
        newRoot = newRoot.ensureOwner(this._ownerID);
      }

      // Merge Tail into tree.
      node = newRoot;
      for (level = newLevel; level > SHIFT; level -= SHIFT) {
        idx = (tailOffset >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this._ownerID) : new VNode([], this._ownerID);
      }
      node.array[(tailOffset >>> SHIFT) & MASK] = this._tail;

      // Create new tail with set index.
      newTail = new VNode([], this._ownerID);
      newTail.array[maskedIndex] = value;
      newSize = index + 1;
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

    if (this.get(index - this._origin, __SENTINEL) === value) {
      return this;
    }

    // Fits within tail.
    if (index >= tailOffset) {
      newTail = this._tail.ensureOwner(this._ownerID);
      newTail.array[index & MASK] = value;
      newSize = index >= this._size ? index + 1 : this._size;
      if (this._ownerID) {
        this.length = newSize - this._origin;
        this._size = newSize;
        this._tail = newTail;
        return this;
      }
      return Vector._make(this._origin, newSize, this._level, this._root, newTail);
    }

    // Fits within existing tree.
    newRoot = this._root.ensureOwner(this._ownerID);
    node = newRoot;
    for (level = this._level; level > 0; level -= SHIFT) {
      idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this._ownerID) : new VNode([], this._ownerID);
    }
    node.array[maskedIndex] = value;
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
    return this.setRange(0, -1);
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
    var newTail = this._tail;
    var owner = this._ownerID || new OwnerID();
    var node;

    while (newOrigin < 0) {
      node = new VNode([], owner);
      if (newRoot.array.length) {
        node.array[1] = newRoot;
      }
      newOrigin += 1 << newLevel;
      newSize += 1 << newLevel;
      newLevel += SHIFT;
      newRoot = node;
    }

    var newTailOffset = getTailOffset(newSize);

    // Necessary if we ever write into the root.
    if (newRoot === this._root && newOrigin < newTailOffset) {
      newRoot = newRoot.ensureOwner(owner);
    }

    // Only necessary if we ever write into the tail.
    if (newOrigin + values.length >= newTailOffset) {
      newTail = newTail.ensureOwner(owner);
    }

    for (var ii = 0; ii < values.length; ii++) {
      var index = newOrigin + ii;
      if (index >= newTailOffset) {
        // Fits within tail.
        node = newTail;
      } else {
        // Fits within existing tree.
        node = newRoot;
        for (var level = newLevel; level > 0; level -= SHIFT) {
          var idx = (index >>> level) & MASK;
          node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(owner) : new VNode([], owner);
        }
      }
      node.array[index & MASK] = values[ii];
    }

    if (this._ownerID) {
      this.length = newSize - newOrigin;
      this._origin = newOrigin;
      this._size = newSize;
      this._level = newLevel;
      this._root = newRoot;
      this._tail = newTail;
      return this;
    }
    return Vector._make(newOrigin, newSize, newLevel, newRoot, newTail);
  }

  shift() {
    return this.setRange(1);
  }

  // @pragma Composition

  merge(seq) {
    if (!seq || !seq.forEach) {
      return this;
    }
    var newVect = this.asTransient();
    seq.forEach((value, index) => {
      newVect = newVect.set(index, value)
    });
    return this.isTransient() ? newVect : newVect.asPersistent();
  }

  setRange(begin, end) {
    var owner = this._ownerID || new OwnerID();
    var oldOrigin = this._origin;
    var oldSize = this._size;
    var newOrigin = begin < 0 ? Math.max(oldOrigin, oldSize + begin) : Math.min(oldSize, oldOrigin + begin);
    var newSize = end == null ? oldSize : end < 0 ? Math.max(oldOrigin, oldSize + end) : oldOrigin + end;
    if (newOrigin === oldOrigin && newSize === oldSize) {
      return this;
    }

    if (newOrigin >= newSize) {
      return this.clear();
    }

    var oldTailOffset = getTailOffset(oldSize);
    var newTailOffset = getTailOffset(newSize);

    var newLevel = this._level;
    var newRoot = this._root;
    var newTail = newTailOffset < oldTailOffset ?
      this._nodeFor(newSize) :
      newTailOffset > oldTailOffset ? new VNode([], owner) : this._tail;

    if (newTailOffset > oldTailOffset && newOrigin < oldSize && this._tail.array.length) {
      // Tail might require creating a higher root.
      while (oldTailOffset >= 1 << (newLevel + SHIFT)) {
        newRoot = new VNode([newRoot], this._ownerID);
        newLevel += SHIFT;
      }
      if (newRoot === this._root) {
        newRoot = newRoot.ensureOwner(this._ownerID);
      }

      // Merge Tail into tree.
      var node = newRoot;
      for (var level = this._level; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(owner) : new VNode([], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = this._tail;
    }

    if (newSize < oldSize) {
      newTail = newTail.removeAfter(owner, 0, newSize);
    }

    if (newOrigin >= newTailOffset) {
      newOrigin -= newTailOffset;
      newSize -= newTailOffset;
      newLevel = SHIFT;
      newRoot = __EMPTY_VNODE;
      newTail = newTail.removeBefore(owner, 0, newOrigin);
    } else if (newOrigin > oldOrigin || newSize < oldTailOffset) {
      var beginIndex, endIndex;
      var offset = 0;
      do {
        beginIndex = ((newOrigin) >>> newLevel) & MASK;
        endIndex = ((newTailOffset - 1) >>> newLevel) & MASK;
        if (beginIndex === endIndex) {
          offset += 1 << newLevel;
          newLevel -= SHIFT;
          newRoot = newRoot.array[beginIndex];
        }
      } while (beginIndex === endIndex);
      if (newOrigin !== oldOrigin) {
        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offset);
      }
      if (newTailOffset !== oldTailOffset) {
        newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offset);
      }
      newOrigin -= offset;
      newSize -= offset;
    }

    if (this._ownerID) {
      this.length = newSize - newOrigin;
      this._origin = newOrigin;
      this._size = newSize;
      this._level = newLevel;
      this._root = newRoot;
      this._tail = newTail;
      return this;
    }
    return Vector._make(newOrigin, newSize, newLevel, newRoot, newTail);
  }

  setLength(length) {
    return this.setRange(0, length);
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

  toVector() {
    // Note: identical impl to Map.toMap
    return this.isTransient() ? this.clone().asPersistent() : this;
  }

  first(predicate, context) {
    return predicate ? super.first(predicate, context) : this.get(0);
  }

  last(predicate, context) {
    return predicate ? super.last(predicate, context) : this.get(this.length ? this.length - 1 : 0);
  }

  cacheResult() {
    return this;
  }

  __deepEquals(other) {
    var is = require('./Persistent').is;
    var iterator = this.__iterator__();
    return other.every((v, k) => {
      var entry = iterator.next();
      return k === entry[0] && is(v, entry[1]);
    });
  }

  __iterator__() {
    return new VectorIterator(
      this, this._origin, this._size, this._level, this._root, this._tail
    );
  }

  __iterate(fn, reverse, flipIndices) {
    var vector = this;
    var lastIndex = 0;
    var maxIndex = vector.length - 1;
    flipIndices ^= reverse;
    var eachFn = (value, ii) => {
      if (fn(value, flipIndices ? maxIndex - ii : ii, vector) === false) {
        return false;
      } else {
        lastIndex = ii;
        return true;
      }
    };
    var didComplete;
    var tailOffset = getTailOffset(this._size);
    if (reverse) {
      didComplete =
        this._tail.iterate(0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse) &&
        this._root.iterate(this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
    } else {
      didComplete =
        this._root.iterate(this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) &&
        this._tail.iterate(0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse);
    }
    return (didComplete ? maxIndex : reverse ? maxIndex - lastIndex : lastIndex) + 1;
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
  constructor(array, ownerID) {
    this.array = array;
    this.ownerID = ownerID;
  }

  removeBefore(ownerID, level, origin) {
    if (origin === 1 << level || this.array.length === 0) {
      return this;
    }
    var originIndex = ((origin) >>> level) & MASK;
    if (originIndex >= this.array.length) {
      return new VNode([], ownerID);
    }
    var removingFirst = originIndex === 0;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[originIndex];
      newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, origin);
      if (newChild === oldChild && removingFirst) {
        return this;
      }
    }
    if (removingFirst && !newChild) {
      return this;
    }
    var editable = this.ensureOwner();
    if (!removingFirst) {
      for (var ii = 0; ii < originIndex; ii++) {
        delete editable.array[ii];
      }
    }
    if (newChild) {
      editable.array[originIndex] = newChild;
    }
    return editable;
  }

  removeAfter(ownerID, level, size) {
    if (size === 1 << level || this.array.length === 0) {
      return this;
    }
    var sizeIndex = ((size - 1) >>> level) & MASK;
    if (sizeIndex >= this.array.length) {
      return this;
    }
    var removingLast = sizeIndex === this.array.length - 1;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[sizeIndex];
      newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, size);
      if (newChild === oldChild && removingLast) {
        return this;
      }
    }
    if (removingLast && !newChild) {
      return this;
    }
    var editable = this.ensureOwner();
    if (!removingLast) {
      editable.array.length = sizeIndex + 1;
    }
    if (newChild) {
      editable.array[sizeIndex] = newChild;
    }
    return editable;
  }

  ensureOwner(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new VNode(this.array.slice(), ownerID);
  }

  iterate(level, offset, max, fn, reverse) {
    // Note using every() gets us a speed-up of 2x on modern JS VMs, but means
    // we cannot support IE8 without polyfill.
    if (level === 0) {
      if (reverse) {
        for (var revRawIndex = this.array.length - 1; revRawIndex >= 0; revRawIndex--) {
          if (this.array.hasOwnProperty(revRawIndex)) {
            var index = revRawIndex + offset;
            if (index >= 0 && index < max && fn(this.array[revRawIndex], index) === false) {
              return false;
            }
          }
        }
        return true;
      } else {
        return this.array.every((value, rawIndex) => {
          var index = rawIndex + offset;
          return index < 0 || index >= max || fn(value, index) !== false;
        });
      }
    }
    var step = 1 << level;
    var newLevel = level - SHIFT;
    if (reverse) {
      for (var revLevelIndex = this.array.length - 1; revLevelIndex >= 0; revLevelIndex--) {
        var newOffset = offset + revLevelIndex * step;
        if (newOffset < max && newOffset + step > 0 &&
            this.array.hasOwnProperty(revLevelIndex) &&
            !this.array[revLevelIndex].iterate(newLevel, newOffset, max, fn, reverse)) {
          return false;
        }
      }
      return true;
    } else {
      return this.array.every((newNode, levelIndex) => {
        var newOffset = offset + levelIndex * step;
        return newOffset >= max || newOffset + step <= 0 || newNode.iterate(newLevel, newOffset, max, fn, reverse);
      });
    }
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
var __EMPTY_VECT;
var __EMPTY_VNODE = new VNode([]);

module.exports = Vector;
