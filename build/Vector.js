var LazyIndexedSequence = require('./LazyIndexedSequence');


function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

for(var LazyIndexedSequence____Key in LazyIndexedSequence){if(LazyIndexedSequence.hasOwnProperty(LazyIndexedSequence____Key)){Vector[LazyIndexedSequence____Key]=LazyIndexedSequence[LazyIndexedSequence____Key];}}var ____SuperProtoOfLazyIndexedSequence=LazyIndexedSequence===null?null:LazyIndexedSequence.prototype;Vector.prototype=Object.create(____SuperProtoOfLazyIndexedSequence);Vector.prototype.constructor=Vector;Vector.__superConstructor__=LazyIndexedSequence;

  // @pragma Construction

  function Vector() {"use strict";var values=Array.prototype.slice.call(arguments,0);
    return Vector.fromArray(values);
    LazyIndexedSequence.call(this);
  }

  Vector.empty=function() {"use strict";
    return __EMPTY_PVECT || (__EMPTY_PVECT =
      Vector.$Vector_make(0, 0, SHIFT, __EMPTY_VNODE, __EMPTY_VNODE)
    );
  };

  Vector.fromArray=function(values) {"use strict";
    if (values.length === 0) {
      return Vector.empty();
    }
    if (values.length > 0 && values.length < SIZE) {
      return Vector.$Vector_make(0, values.length, SHIFT, __EMPTY_VNODE, new VNode(null, values.slice()));
    }
    var vect = Vector.empty().asTransient();
    values.forEach(function(value, index)  {
      vect = vect.set(index, value);
    });
    return vect.asPersistent();
  };

  // TODO: generalize and apply to Set and Map
  Vector.prototype.toString=function() {"use strict";
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

  Vector.prototype.first=function() {"use strict";
    if (this.length > 0) {
      return this.get(0);
    }
  };

  Vector.prototype.last=function() {"use strict";
    if (this.length > 0) {
      return this.get(this.length - 1);
    }
  };

  Vector.prototype.equals=function(other) {"use strict";
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
    return this.every(function(v, k)  {
      var otherKV = otherIterator.next();
      return k === otherKV[0] && is(v, otherKV[1]);
    });
  };

  // @pragma Modification

  // ES6 Map calls this "clear"
  Vector.prototype.empty=function() {"use strict";
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

    // Overflow's tail, merge the tail and make a new one.
    if (index >= tailOffset + SIZE) {
      // Tail might require creating a higher root.
      var newRoot = this.$Vector_root;
      var newLevel = this.$Vector_level;
      while (tailOffset > 1 << (newLevel + SHIFT)) {
        newRoot = new VNode(this.$Vector_ownerID, [newRoot]);
        newLevel += SHIFT;
      }
      if (newRoot === this.$Vector_root) {
        newRoot = newRoot.ensureOwner(this.$Vector_ownerID);
      }

      // Merge Tail into tree.
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (tailOffset >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this.$Vector_ownerID) : new VNode(this.$Vector_origin, []);
      }
      node.array[(tailOffset >>> SHIFT) & MASK] = this.$Vector_tail;

      // Create new tail with set index.
      var newTail = new VNode(this.$Vector_ownerID, []);
      newTail.array[index & MASK] = value;
      var newSize = index + 1;
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

    // Fits within tail.
    if (index >= tailOffset) {
      var newTail = this.$Vector_tail.ensureOwner(this.$Vector_ownerID);
      newTail.array[index & MASK] = value;
      var newSize = index >= this.$Vector_size ? index + 1 : this.$Vector_size;
      if (this.$Vector_ownerID) {
        this.length = newSize - this.$Vector_origin;
        this.$Vector_size = newSize;
        this.$Vector_tail = newTail;
        return this;
      }
      return Vector.$Vector_make(this.$Vector_origin, newSize, this.$Vector_level, this.$Vector_root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this.$Vector_root.ensureOwner(this.$Vector_ownerID);
    var node = newRoot;
    for (var level = this.$Vector_level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this.$Vector_ownerID) : new VNode(this.$Vector_ownerID, []);
    }
    node.array[index & MASK] = value;
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
    var newSize = this.$Vector_size - 1;

    if (newSize <= this.$Vector_origin) {
      return this.empty();
    }

    if (this.$Vector_ownerID) {
      this.length--;
      this.$Vector_size--;
    }

    // Fits within tail.
    if (newSize > getTailOffset(this.$Vector_size)) {
      var newTail = this.$Vector_tail.ensureOwner(this.$Vector_ownerID);
      newTail.array.pop();
      if (this.$Vector_ownerID) {
        this.$Vector_tail = newTail;
        return this;
      }
      return Vector.$Vector_make(this.$Vector_origin, newSize, this.$Vector_level, this.$Vector_root, newTail);
    }

    var newRoot = this.$Vector_root.pop(this.$Vector_ownerID, this.$Vector_size, this.$Vector_level) || __EMPTY_VNODE;
    var newTail = this.$Vector_nodeFor(newSize - 1);
    if (this.$Vector_ownerID) {
      this.$Vector_root = newRoot;
      this.$Vector_tail = newTail;
      return this;
    }
    return Vector.$Vector_make(this.$Vector_origin, newSize, this.$Vector_level, newRoot, newTail);
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

    while (newOrigin < 0) {
      var node = new VNode(this.$Vector_ownerID, []);
      node.array[1] = newRoot;
      newOrigin += 1 << newLevel;
      newSize += 1 << newLevel;
      newLevel += SHIFT;
      newRoot = node;
    }

    if (newRoot === this.$Vector_root) {
      newRoot = this.$Vector_root.ensureOwner(this.$Vector_ownerID);
    }

    var tempOwner = this.$Vector_ownerID || new OwnerID();
    for (var ii = 0; ii < values.length; ii++) {
      var index = newOrigin + ii;
      var node = newRoot;
      for (var level = newLevel; level > 0; level -= SHIFT) {
        var idx = (index >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(tempOwner) : new VNode(tempOwner, []);
      }
      node.array[index & MASK] = values[ii];
    }

    if (this.$Vector_ownerID) {
      this.length = newSize - newOrigin;
      this.$Vector_origin = newOrigin;
      this.$Vector_size = newSize;
      this.$Vector_level = newLevel;
      this.$Vector_root = newRoot;
      return this;
    }
    return Vector.$Vector_make(newOrigin, newSize, newLevel, newRoot, this.$Vector_tail);
  };

  Vector.prototype.shift=function() {"use strict";
    return this.slice(1);
  };

  // @pragma Composition

  Vector.prototype.merge=function(seq) {"use strict";
    var newVect = this.asTransient();
    seq.__iterate(function(value, index)  {return newVect.set(index, value);});
    return this.isTransient() ? newVect : newVect.asPersistent();
  };

  Vector.prototype.concat=function() {"use strict";
    var vector = this.asTransient();
    for (var ii = 0; ii < arguments.length; ii++) {
      if (arguments[ii] && arguments[ii].length > 0) {
        if (vector.length === 0 && !this.isTransient()) {
          vector = vectors[ii].asTransient();
        } else {
          var offset = vector.length;
          vector.length += vectors[ii].length;
          vectors[ii].__iterate(function(value, index)  {return vector.set(index + offset, value);});
        }
      }
    }
    return this.isTransient() ? vector : vector.asPersistent();
  };

  Vector.prototype.slice=function(begin, end) {"use strict";
    var newOrigin = begin < 0 ? Math.max(this.$Vector_origin, this.$Vector_size + begin) : Math.min(this.$Vector_size, this.$Vector_origin + begin);
    var newSize = end == null ? this.$Vector_size : end < 0 ? Math.max(this.$Vector_origin, this.$Vector_size + end) : Math.min(this.$Vector_size, this.$Vector_origin + end);
    if (newOrigin >= newSize) {
      return this.empty();
    }
    var newTail = newSize === this.$Vector_size ? this.$Vector_tail : this.$Vector_nodeFor(newSize) || new VNode(this.$Vector_ownerID, []);
    // TODO: should also calculate a new root and garbage collect?
    // This would be a tradeoff between memory footprint and perf.
    // I still expect better performance than Array.slice(), so it's probably worth freeing memory.
    if (this.$Vector_ownerID) {
      this.length = newSize - newOrigin;
      this.$Vector_origin = newOrigin;
      this.$Vector_size = newSize;
      this.$Vector_tail = newTail;
      return this;
    }
    return Vector.$Vector_make(newOrigin, newSize, this.$Vector_level, this.$Vector_root, newTail);
  };

  Vector.prototype.splice=function(index, removeNum)  {"use strict";
    return this.slice(0, index).concat(
      arguments.length > 2 ? Vector.fromArray(Array.prototype.slice.call(arguments, 2)) : null,
      this.slice(index + removeNum)
    );
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

  // TODO: add __iterator__ after dropping TS
  // TODO: add to .d.ts
  Vector.prototype.__iterator__=function() {"use strict";
    return new VectorIterator(
      this, this.$Vector_origin, this.$Vector_size, this.$Vector_level, this.$Vector_root, this.$Vector_tail
    );
  };

  Vector.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    var tailOffset = getTailOffset(this.$Vector_size);
    return (
      this.$Vector_root.iterate(this, this.$Vector_level, -this.$Vector_origin, tailOffset - this.$Vector_origin, fn, reverseIndices) &&
      this.$Vector_tail.iterate(this, 0, tailOffset - this.$Vector_origin, this.$Vector_size - this.$Vector_origin, fn, reverseIndices)
    );
  };

  Vector.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    var tailOffset = getTailOffset(this.$Vector_size);
    return (
      this.$Vector_tail.reverseIterate(this, 0, tailOffset - this.$Vector_origin, this.$Vector_size - this.$Vector_origin, fn, maintainIndices) &&
      this.$Vector_root.reverseIterate(this, this.$Vector_level, -this.$Vector_origin, tailOffset - this.$Vector_origin, fn, maintainIndices)
    );
  };

  // Override - set correct length before returning
  Vector.prototype.toArray=function() {"use strict";
    var array = ____SuperProtoOfLazyIndexedSequence.toArray.call(this);
    array.length = this.length;
    return array;
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



  function VNode(ownerID, array) {"use strict";
    this.ownerID = ownerID;
    this.array = array;
  }

  VNode.prototype.pop=function(ownerID, length, level) {"use strict";
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

  VNode.prototype.ensureOwner=function(ownerID) {"use strict";
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new VNode(ownerID, this.array.slice());
  };

  VNode.prototype.iterate=function(vector, level, offset, max, fn, reverseIndices) {"use strict";
    // Note using every() gets us a speed-up of 2x on modern JS VMs, but means
    // we cannot support IE8 without polyfill.
    if (level === 0) {
      return this.array.every(function(value, rawIndex)  {
        var index = rawIndex + offset;
        if (reverseIndices) {
          index = vector.length - 1 - index;
        }
        return index < 0 || index >= max || fn(value, index, vector) !== false;
      });
    }
    var step = 1 << level;
    var newLevel = level - SHIFT;
    return this.array.every(function(newNode, levelIndex)  {
      var newOffset = offset + levelIndex * step;
      return newOffset >= max || newOffset + step <= 0 || newNode.iterate(vector, newLevel, newOffset, max, fn, reverseIndices);
    });
  };

  VNode.prototype.reverseIterate=function(vector, level, offset, max, fn, maintainIndices) {"use strict";
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
var __EMPTY_PVECT;
var __EMPTY_VNODE = new VNode(null, []);

module.exports = Vector;
