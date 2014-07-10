var IndexedSequence = require('./Sequence').IndexedSequence;


function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){Vector[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;Vector.prototype=Object.create(____SuperProtoOfIndexedSequence);Vector.prototype.constructor=Vector;Vector.__superConstructor__=IndexedSequence;

  // @pragma Construction

  function Vector() {"use strict";var values=Array.prototype.slice.call(arguments,0);
    return Vector.fromArray(values);
  }

  Vector.empty=function() {"use strict";
    return __EMPTY_VECT || (__EMPTY_VECT =
      Vector.$Vector_make(0, 0, SHIFT, __EMPTY_VNODE, __EMPTY_VNODE)
    );
  };

  Vector.fromArray=function(values) {"use strict";
    if (values.length === 0) {
      return Vector.empty();
    }
    if (values.length > 0 && values.length < SIZE) {
      return Vector.$Vector_make(0, values.length, SHIFT, __EMPTY_VNODE, new VNode(values.slice()));
    }
    return Vector.empty().asTransient().merge(values).setLength(values.length).asPersistent();
  };

  Vector.prototype.toString=function() {"use strict";
    return this.__toString('Vector [', ']');
  };

  // @pragma Access

  Vector.prototype.has=function(index) {"use strict";
    return this.get(index, __SENTINEL) !== __SENTINEL;
  };

  Vector.prototype.get=function(index, undefinedValue) {"use strict";
    index = rawIndex(index, this.$Vector_origin);
    if (index >= this.$Vector_size) {
      return undefinedValue;
    }
    var node = this.$Vector_nodeFor(index);
    var property = index & MASK;
    return node && node.array.hasOwnProperty(property) ? node.array[property] : undefinedValue;
  };

  Vector.prototype.getIn=function(indexPath, pathOffset) {"use strict";
    pathOffset = pathOffset || 0;
    var nested = this.get(indexPath[pathOffset]);
    if (pathOffset === indexPath.length - 1) {
      return nested;
    }
    if (nested && nested.getIn) {
      return nested.getIn(indexPath, pathOffset + 1);
    }
  };

  // @pragma Modification

  Vector.prototype.clear=function() {"use strict";
    if (this.$Vector_ownerID) {
      this.length = this.$Vector_origin = this.$Vector_size = 0;
      this.$Vector_level = SHIFT;
      this.$Vector_root = this.$Vector_tail = __EMPTY_VNODE;
      return this;
    }
    return Vector.empty();
  };

  Vector.prototype.set=function(index, value) {"use strict";
    index = rawIndex(index, this.$Vector_origin);
    var tailOffset = getTailOffset(this.$Vector_size);
    var node, level, idx, newSize, newRoot, newTail;

    var maskedIndex = index & MASK;

    // Overflow's tail, merge the tail and make a new one.
    if (index >= tailOffset + SIZE) {
      // Tail might require creating a higher root.
      newRoot = this.$Vector_root;
      var newLevel = this.$Vector_level;
      while (tailOffset >= 1 << (newLevel + SHIFT)) {
        newRoot = new VNode([newRoot], this.$Vector_ownerID);
        newLevel += SHIFT;
      }
      if (newRoot === this.$Vector_root) {
        newRoot = newRoot.ensureOwner(this.$Vector_ownerID);
      }

      // Merge Tail into tree.
      node = newRoot;
      for (level = newLevel; level > SHIFT; level -= SHIFT) {
        idx = (tailOffset >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this.$Vector_ownerID) : new VNode([], this.$Vector_ownerID);
      }
      node.array[(tailOffset >>> SHIFT) & MASK] = this.$Vector_tail;

      // Create new tail with set index.
      newTail = new VNode([], this.$Vector_ownerID);
      newTail.array[maskedIndex] = value;
      newSize = index + 1;
      if (this.$Vector_ownerID) {
        this.length = newSize - this.$Vector_origin;
        this.$Vector_size = newSize;
        this.$Vector_level = newLevel;
        this.$Vector_root = newRoot;
        this.$Vector_tail = newTail;
        return this;
      }
      return Vector.$Vector_make(this.$Vector_origin, newSize, newLevel, newRoot, newTail);
    }

    if (this.get(index - this.$Vector_origin, __SENTINEL) === value) {
      return this;
    }

    // Fits within tail.
    if (index >= tailOffset) {
      newTail = this.$Vector_tail.ensureOwner(this.$Vector_ownerID);
      newTail.array[index & MASK] = value;
      newSize = index >= this.$Vector_size ? index + 1 : this.$Vector_size;
      if (this.$Vector_ownerID) {
        this.length = newSize - this.$Vector_origin;
        this.$Vector_size = newSize;
        this.$Vector_tail = newTail;
        return this;
      }
      return Vector.$Vector_make(this.$Vector_origin, newSize, this.$Vector_level, this.$Vector_root, newTail);
    }

    // Fits within existing tree.
    newRoot = this.$Vector_root.ensureOwner(this.$Vector_ownerID);
    node = newRoot;
    for (level = this.$Vector_level; level > 0; level -= SHIFT) {
      idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this.$Vector_ownerID) : new VNode([], this.$Vector_ownerID);
    }
    node.array[maskedIndex] = value;
    if (this.$Vector_ownerID) {
      this.$Vector_root = newRoot;
      return this;
    }
    return Vector.$Vector_make(this.$Vector_origin, this.$Vector_size, this.$Vector_level, newRoot, this.$Vector_tail);
  };

  Vector.prototype.setIn=function(keyPath, v, pathOffset) {"use strict";
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

  Vector.prototype.push=function() {"use strict";
    if (arguments.length === 1) {
      return this.set(this.length, arguments[0]);
    }
    var vec = this.asTransient();
    for (var ii = 0; ii < arguments.length; ii++) {
      vec = vec.set(vec.length, arguments[ii]);
    }
    return this.isTransient() ? vec : vec.asPersistent();
  };

  Vector.prototype.pop=function() {"use strict";
    return this.setRange(0, -1);
  };

  Vector.prototype.delete=function(index) {"use strict";
    index = rawIndex(index, this.$Vector_origin);
    var tailOffset = getTailOffset(this.$Vector_size);

    // Out of bounds, no-op.
    if (!this.has(index)) {
      return this;
    }

    // Delete within tail.
    if (index >= tailOffset) {
      var newTail = this.$Vector_tail.ensureOwner(this.$Vector_ownerID);
      delete newTail.array[index & MASK];
      if (this.$Vector_ownerID) {
        this.$Vector_tail = newTail;
        return this;
      }
      return Vector.$Vector_make(this.$Vector_origin, this.$Vector_size, this.$Vector_level, this.$Vector_root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this.$Vector_root.ensureOwner(this.$Vector_ownerID);
    var node = newRoot;
    for (var level = this.$Vector_level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx].ensureOwner(this.$Vector_ownerID);
    }
    delete node.array[index & MASK];
    if (this.$Vector_ownerID) {
      this.$Vector_root = newRoot;
      return this;
    }
    return Vector.$Vector_make(this.$Vector_origin, this.$Vector_size, this.$Vector_level, newRoot, this.$Vector_tail);
  };

  Vector.prototype.deleteIn=function(keyPath, pathOffset) {"use strict";
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

  Vector.prototype.unshift=function() {"use strict";
    var values = arguments;
    var newOrigin = this.$Vector_origin - values.length;
    var newSize = this.$Vector_size;
    var newLevel = this.$Vector_level;
    var newRoot = this.$Vector_root;
    var newTail = this.$Vector_tail;
    var owner = this.$Vector_ownerID || new OwnerID();
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
    if (newRoot === this.$Vector_root && newOrigin < newTailOffset) {
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

    if (this.$Vector_ownerID) {
      this.length = newSize - newOrigin;
      this.$Vector_origin = newOrigin;
      this.$Vector_size = newSize;
      this.$Vector_level = newLevel;
      this.$Vector_root = newRoot;
      this.$Vector_tail = newTail;
      return this;
    }
    return Vector.$Vector_make(newOrigin, newSize, newLevel, newRoot, newTail);
  };

  Vector.prototype.shift=function() {"use strict";
    return this.setRange(1);
  };

  // @pragma Composition

  Vector.prototype.merge=function(seq) {"use strict";
    if (!seq || !seq.forEach) {
      return this;
    }
    var newVect = this.asTransient();
    seq.forEach(function(value, index)  {
      newVect = newVect.set(index, value)
    });
    return this.isTransient() ? newVect : newVect.asPersistent();
  };

  Vector.prototype.setRange=function(begin, end) {"use strict";
    var owner = this.$Vector_ownerID || new OwnerID();
    var oldOrigin = this.$Vector_origin;
    var oldSize = this.$Vector_size;
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

    var newLevel = this.$Vector_level;
    var newRoot = this.$Vector_root;
    var newTail = newTailOffset < oldTailOffset ?
      this.$Vector_nodeFor(newSize) :
      newTailOffset > oldTailOffset ? new VNode([], owner) : this.$Vector_tail;

    if (newTailOffset > oldTailOffset && newOrigin < oldSize && this.$Vector_tail.array.length) {
      // Tail might require creating a higher root.
      while (oldTailOffset >= 1 << (newLevel + SHIFT)) {
        newRoot = new VNode([newRoot], this.$Vector_ownerID);
        newLevel += SHIFT;
      }
      if (newRoot === this.$Vector_root) {
        newRoot = newRoot.ensureOwner(this.$Vector_ownerID);
      }

      // Merge Tail into tree.
      var node = newRoot;
      for (var level = this.$Vector_level; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(owner) : new VNode([], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = this.$Vector_tail;
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

    if (this.$Vector_ownerID) {
      this.length = newSize - newOrigin;
      this.$Vector_origin = newOrigin;
      this.$Vector_size = newSize;
      this.$Vector_level = newLevel;
      this.$Vector_root = newRoot;
      this.$Vector_tail = newTail;
      return this;
    }
    return Vector.$Vector_make(newOrigin, newSize, newLevel, newRoot, newTail);
  };

  Vector.prototype.setLength=function(length) {"use strict";
    return this.setRange(0, length);
  };

  // @pragma Mutability

  Vector.prototype.isTransient=function() {"use strict";
    return !!this.$Vector_ownerID;
  };

  Vector.prototype.asTransient=function() {"use strict";
    if (this.$Vector_ownerID) {
      return this;
    }
    var vect = this.clone();
    vect.$Vector_ownerID = new OwnerID();
    return vect;
  };

  Vector.prototype.asPersistent=function() {"use strict";
    this.$Vector_ownerID = undefined;
    return this;
  };

  Vector.prototype.clone=function() {"use strict";
    return Vector.$Vector_make(this.$Vector_origin, this.$Vector_size, this.$Vector_level, this.$Vector_root, this.$Vector_tail, this.$Vector_ownerID && new OwnerID());
  };

  // @pragma Iteration

  Vector.prototype.toVector=function() {"use strict";
    // Note: identical impl to Map.toMap
    return this.isTransient() ? this.clone().asPersistent() : this;
  };

  Vector.prototype.first=function(predicate, context) {"use strict";
    return predicate ? ____SuperProtoOfIndexedSequence.first.call(this,predicate, context) : this.get(0);
  };

  Vector.prototype.last=function(predicate, context) {"use strict";
    return predicate ? ____SuperProtoOfIndexedSequence.last.call(this,predicate, context) : this.get(this.length ? this.length - 1 : 0);
  };

  Vector.prototype.cacheResult=function() {"use strict";
    return this;
  };

  Vector.prototype.__deepEquals=function(other) {"use strict";
    var is = require('./Persistent').is;
    var iterator = this.__iterator__();
    return other.every(function(v, k)  {
      var entry = iterator.next();
      return k === entry[0] && is(v, entry[1]);
    });
  };

  Vector.prototype.__iterator__=function() {"use strict";
    return new VectorIterator(
      this, this.$Vector_origin, this.$Vector_size, this.$Vector_level, this.$Vector_root, this.$Vector_tail
    );
  };

  Vector.prototype.__iterate=function(fn, reverse, flipIndices) {"use strict";
    var vector = this;
    var lastIndex = 0;
    var maxIndex = vector.length - 1;
    flipIndices ^= reverse;
    var eachFn = function(value, ii)  {
      if (fn(value, flipIndices ? maxIndex - ii : ii, vector) === false) {
        return false;
      } else {
        lastIndex = ii;
        return true;
      }
    };
    var didComplete;
    var tailOffset = getTailOffset(this.$Vector_size);
    if (reverse) {
      didComplete =
        this.$Vector_tail.iterate(0, tailOffset - this.$Vector_origin, this.$Vector_size - this.$Vector_origin, eachFn, reverse) &&
        this.$Vector_root.iterate(this.$Vector_level, -this.$Vector_origin, tailOffset - this.$Vector_origin, eachFn, reverse);
    } else {
      didComplete =
        this.$Vector_root.iterate(this.$Vector_level, -this.$Vector_origin, tailOffset - this.$Vector_origin, eachFn, reverse) &&
        this.$Vector_tail.iterate(0, tailOffset - this.$Vector_origin, this.$Vector_size - this.$Vector_origin, eachFn, reverse);
    }
    return (didComplete ? maxIndex : reverse ? maxIndex - lastIndex : lastIndex) + 1;
  };

  // @pragma Private

  Vector.$Vector_make=function(origin, size, level, root, tail, ownerID) {"use strict";
    var vect = Object.create(Vector.prototype);
    vect.length = size - origin;
    vect.$Vector_origin = origin;
    vect.$Vector_size = size;
    vect.$Vector_level = level;
    vect.$Vector_root = root;
    vect.$Vector_tail = tail;
    vect.$Vector_ownerID = ownerID;
    return vect;
  };

  Vector.prototype.$Vector_nodeFor=function(rawIndex) {"use strict";
    if (rawIndex >= getTailOffset(this.$Vector_size)) {
      return this.$Vector_tail;
    }
    if (rawIndex < 1 << (this.$Vector_level + SHIFT)) {
      var node = this.$Vector_root;
      var level = this.$Vector_level;
      while (node && level > 0) {
        node = node.array[(rawIndex >>> level) & MASK];
        level -= SHIFT;
      }
      return node;
    }
  };


function rawIndex(index, origin) {
  invariant(index >= 0, 'Index out of bounds');
  return index + origin;
}

function getTailOffset(size) {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}


  function OwnerID() {"use strict";}



  function VNode(array, ownerID) {"use strict";
    this.array = array;
    this.ownerID = ownerID;
  }

  VNode.prototype.removeBefore=function(ownerID, level, origin) {"use strict";
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
  };

  VNode.prototype.removeAfter=function(ownerID, level, size) {"use strict";
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
  };

  VNode.prototype.ensureOwner=function(ownerID) {"use strict";
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new VNode(this.array.slice(), ownerID);
  };

  VNode.prototype.iterate=function(level, offset, max, fn, reverse) {"use strict";
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
        return this.array.every(function(value, rawIndex)  {
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
      return this.array.every(function(newNode, levelIndex)  {
        var newOffset = offset + levelIndex * step;
        return newOffset >= max || newOffset + step <= 0 || newNode.iterate(newLevel, newOffset, max, fn, reverse);
      });
    }
  };




  function VectorIterator(vector, origin, size, level, root, tail) {"use strict";
    var tailOffset = getTailOffset(size);
    this.$VectorIterator_stack = {
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

  VectorIterator.prototype.next=function()  {"use strict";
    var stack = this.$VectorIterator_stack;
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
            stack = this.$VectorIterator_stack = {
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
      stack = this.$VectorIterator_stack = this.$VectorIterator_stack.__prev;
    }
    if (global.StopIteration) {
      throw global.StopIteration;
    }
  };



var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_VECT;
var __EMPTY_VNODE = new VNode([]);

module.exports = Vector;
