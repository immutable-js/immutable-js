/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

var SequenceModule = require('./Sequence');
var Sequence = SequenceModule.Sequence;
var IndexedSequence = SequenceModule.IndexedSequence;
var ImmutableMap = require('./Map');


for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){Vector[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;Vector.prototype=Object.create(____SuperProtoOfIndexedSequence);Vector.prototype.constructor=Vector;Vector.__superConstructor__=IndexedSequence;

  // @pragma Construction

  function Vector() {"use strict";var values=Array.prototype.slice.call(arguments,0);
    return Vector.from(values);
  }

  Vector.empty=function() {"use strict";
    return __EMPTY_VECT || (__EMPTY_VECT =
      Vector.$Vector_make(0, 0, SHIFT, __EMPTY_VNODE, __EMPTY_VNODE)
    );
  };

  Vector.from=function(sequence) {"use strict";
    if (sequence && sequence.constructor === Vector) {
      return sequence;
    }
    if (!sequence || sequence.length === 0) {
      return Vector.empty();
    }
    var isArray = Array.isArray(sequence);
    if (sequence.length > 0 && sequence.length < SIZE) {
      return Vector.$Vector_make(0, sequence.length, SHIFT, __EMPTY_VNODE, new VNode(
        isArray ? sequence.slice() : Sequence(sequence).toArray()
      ));
    }
    if (!isArray) {
      sequence = Sequence(sequence);
      if (!(sequence instanceof IndexedSequence)) {
        sequence = sequence.values();
      }
    }
    return Vector.empty().merge(sequence);
  };

  Vector.prototype.toString=function() {"use strict";
    return this.__toString('Vector [', ']');
  };

  // @pragma Access

  Vector.prototype.get=function(index, undefinedValue) {"use strict";
    index = rawIndex(index, this.$Vector_origin);
    if (index >= this.$Vector_size) {
      return undefinedValue;
    }
    var node = this.$Vector_nodeFor(index);
    var maskedIndex = index & MASK;
    return node && (undefinedValue === undefined || node.array.hasOwnProperty(maskedIndex)) ?
      node.array[maskedIndex] : undefinedValue;
  };

  Vector.prototype.first=function() {"use strict";
    return this.get(0);
  };

  Vector.prototype.last=function() {"use strict";
    return this.get(this.length ? this.length - 1 : 0);
  };

  // @pragma Modification

  // TODO: set and delete seem very similar.

  Vector.prototype.set=function(index, value) {"use strict";
    var tailOffset = getTailOffset(this.$Vector_size);

    if (index >= this.length) {
      return this.withMutations(function(vect) 
        {return vect.$Vector_setBounds(0, index + 1).set(index, value);}
      );
    }

    if (this.get(index, __SENTINEL) === value) {
      return this;
    }

    index = rawIndex(index, this.$Vector_origin);

    // Fits within tail.
    if (index >= tailOffset) {
      var newTail = this.$Vector_tail.ensureOwner(this.__ownerID);
      newTail.array[index & MASK] = value;
      var newSize = index >= this.$Vector_size ? index + 1 : this.$Vector_size;
      if (this.__ownerID) {
        this.length = newSize - this.$Vector_origin;
        this.$Vector_size = newSize;
        this.$Vector_tail = newTail;
        return this;
      }
      return Vector.$Vector_make(this.$Vector_origin, newSize, this.$Vector_level, this.$Vector_root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this.$Vector_root.ensureOwner(this.__ownerID);
    var node = newRoot;
    for (var level = this.$Vector_level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this.__ownerID) : new VNode([], this.__ownerID);
    }
    node.array[index & MASK] = value;
    if (this.__ownerID) {
      this.$Vector_root = newRoot;
      return this;
    }
    return Vector.$Vector_make(this.$Vector_origin, this.$Vector_size, this.$Vector_level, newRoot, this.$Vector_tail);
  };

  Vector.prototype.delete=function(index) {"use strict";
    // Out of bounds, no-op. Probably a more efficient way to do this...
    if (!this.has(index)) {
      return this;
    }

    var tailOffset = getTailOffset(this.$Vector_size);
    index = rawIndex(index, this.$Vector_origin);

    // Delete within tail.
    if (index >= tailOffset) {
      var newTail = this.$Vector_tail.ensureOwner(this.__ownerID);
      delete newTail.array[index & MASK];
      if (this.__ownerID) {
        this.$Vector_tail = newTail;
        return this;
      }
      return Vector.$Vector_make(this.$Vector_origin, this.$Vector_size, this.$Vector_level, this.$Vector_root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this.$Vector_root.ensureOwner(this.__ownerID);
    var node = newRoot;
    for (var level = this.$Vector_level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      // TODO: if we don't check "has" above, this could be null.
      node = node.array[idx] = node.array[idx].ensureOwner(this.__ownerID);
    }
    delete node.array[index & MASK];
    if (this.__ownerID) {
      this.$Vector_root = newRoot;
      return this;
    }
    return Vector.$Vector_make(this.$Vector_origin, this.$Vector_size, this.$Vector_level, newRoot, this.$Vector_tail);
  };

  Vector.prototype.clear=function() {"use strict";
    if (this.__ownerID) {
      this.length = this.$Vector_origin = this.$Vector_size = 0;
      this.$Vector_level = SHIFT;
      this.$Vector_root = this.$Vector_tail = __EMPTY_VNODE;
      return this;
    }
    return Vector.empty();
  };

  Vector.prototype.push=function() {"use strict";
    var values = arguments;
    var oldLength = this.length;
    return this.withMutations(function(vect)  {
      vect.$Vector_setBounds(0, oldLength + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(oldLength + ii, values[ii]);
      }
    });
  };

  Vector.prototype.pop=function() {"use strict";
    return this.$Vector_setBounds(0, -1);
  };

  Vector.prototype.unshift=function() {"use strict";
    var values = arguments;
    return this.withMutations(function(vect)  {
      vect.$Vector_setBounds(-values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(ii, values[ii]);
      }
    });
  };

  Vector.prototype.shift=function() {"use strict";
    return this.$Vector_setBounds(1);
  };

  // @pragma Composition

  Vector.prototype.merge=function() {"use strict";var seqs=Array.prototype.slice.call(arguments,0);
    return ImmutableMap.prototype.merge.apply(
      vectorWithLengthOfLongestSeq(this, seqs), arguments);
  };

  Vector.prototype.mergeWith=function(fn)  {"use strict";var seqs=Array.prototype.slice.call(arguments,1);
    return ImmutableMap.prototype.mergeWith.apply(
      vectorWithLengthOfLongestSeq(this, seqs), arguments);
  };

  Vector.prototype.mergeDeep=function() {"use strict";var seqs=Array.prototype.slice.call(arguments,0);
    return ImmutableMap.prototype.mergeDeep.apply(
      vectorWithLengthOfLongestSeq(this, seqs), arguments);
  };

  Vector.prototype.mergeDeepWith=function(fn)  {"use strict";var seqs=Array.prototype.slice.call(arguments,1);
    return ImmutableMap.prototype.mergeDeepWith.apply(
      vectorWithLengthOfLongestSeq(this, seqs), arguments);
  };

  Vector.prototype.setLength=function(length) {"use strict";
    return this.$Vector_setBounds(0, length);
  };

  Vector.prototype.$Vector_setBounds=function(begin, end) {"use strict";
    var owner = this.__ownerID || new OwnerID();
    var oldOrigin = this.$Vector_origin;
    var oldSize = this.$Vector_size;
    var newOrigin = oldOrigin + begin;
    var newSize = end == null ? oldSize : end < 0 ? oldSize + end : oldOrigin + end;
    if (newOrigin === oldOrigin && newSize === oldSize) {
      return this;
    }

    // If it's going to end after it starts, it's empty.
    if (newOrigin >= newSize) {
      return this.clear();
    }

    var newLevel = this.$Vector_level;
    var newRoot = this.$Vector_root;

    // New origin might require creating a higher root.
    var offsetShift = 0;
    while (newOrigin + offsetShift < 0) {
      // TODO: why only ever shifting over by 1?
      newRoot = new VNode(newRoot.array.length ? [,newRoot] : [], owner);
      offsetShift += 1 << newLevel;
      newLevel += SHIFT;
    }
    if (offsetShift) {
      newOrigin += offsetShift;
      oldOrigin += offsetShift;
      newSize += offsetShift;
      oldSize += offsetShift;
    }

    var oldTailOffset = getTailOffset(oldSize);
    var newTailOffset = getTailOffset(newSize);

    // New size might require creating a higher root.
    while (newTailOffset >= 1 << (newLevel + SHIFT)) {
      newRoot = new VNode(newRoot.array.length ? [newRoot] : [], owner);
      newLevel += SHIFT;
    }

    // Locate or create the new tail.
    var oldTail = this.$Vector_tail;
    var newTail = newTailOffset < oldTailOffset ?
      this.$Vector_nodeFor(newSize) :
      newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

    // Merge Tail into tree.
    if (newTailOffset > oldTailOffset && newOrigin < oldSize && oldTail.array.length) {
      newRoot = newRoot.ensureOwner(owner);
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(owner) : new VNode([], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
    }

    // If the size has been reduced, there's a chance the tail needs to be trimmed.
    if (newSize < oldSize) {
      newTail = newTail.removeAfter(owner, 0, newSize);
    }

    // If the new origin is within the tail, then we do not need a root.
    if (newOrigin >= newTailOffset) {
      newOrigin -= newTailOffset;
      newSize -= newTailOffset;
      newLevel = SHIFT;
      newRoot = __EMPTY_VNODE;
      newTail = newTail.removeBefore(owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
    } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
      var beginIndex, endIndex;
      offsetShift = 0;

      // Identify the new top root node of the subtree of the old root.
      do {
        beginIndex = ((newOrigin) >>> newLevel) & MASK;
        endIndex = ((newTailOffset - 1) >>> newLevel) & MASK;
        if (beginIndex === endIndex) {
          if (beginIndex) {
            offsetShift += (1 << newLevel) * beginIndex;
          }
          newLevel -= SHIFT;
          newRoot = newRoot && newRoot.array[beginIndex];
        }
      } while (newRoot && beginIndex === endIndex);

      // Trim the new sides of the new root.
      if (newRoot && newOrigin > oldOrigin) {
        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
      }
      if (newRoot && newTailOffset < oldTailOffset) {
        newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
      }
      if (offsetShift) {
        newOrigin -= offsetShift;
        newSize -= offsetShift;
      }
      // Ensure root is not null.
      newRoot = newRoot || __EMPTY_VNODE;
    }

    if (this.__ownerID) {
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

  // @pragma Mutability

  Vector.prototype.__ensureOwner=function(ownerID) {"use strict";
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return Vector.$Vector_make(this.$Vector_origin, this.$Vector_size, this.$Vector_level, this.$Vector_root, this.$Vector_tail, ownerID);
  };

  // @pragma Iteration

  Vector.prototype.slice=function(begin, end, maintainIndices) {"use strict";
    var sliceSequence = ____SuperProtoOfIndexedSequence.slice.call(this,begin, end, maintainIndices);
    // Optimize the case of vector.slice(b, e).toVector()
    if (!maintainIndices && sliceSequence !== this) {
      var vector = this;
      var length = vector.length;
      sliceSequence.toVector = function()  {return vector.$Vector_setBounds(
        begin < 0 ? Math.max(0, length + begin) : length ? Math.min(length, begin) : begin,
        end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end
      );};
    }
    return sliceSequence;
  };

  Vector.prototype.__deepEquals=function(other) {"use strict";
    var is = require('./Immutable').is;
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
    vect.__ownerID = ownerID;
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


Vector.prototype.updateIn = ImmutableMap.prototype.updateIn;
Vector.prototype.withMutations = ImmutableMap.prototype.withMutations;
Vector.prototype.asMutable = ImmutableMap.prototype.asMutable;
Vector.prototype.asImmutable = ImmutableMap.prototype.asImmutable;



  function OwnerID() {"use strict";}




  function VNode(array, ownerID) {"use strict";
    this.array = array;
    this.ownerID = ownerID;
  }

  VNode.prototype.ensureOwner=function(ownerID) {"use strict";
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new VNode(this.array.slice(), ownerID);
  };

  // TODO: seems like these methods are very similar

  VNode.prototype.removeBefore=function(ownerID, level, index) {"use strict";
    if (index === 1 << level || this.array.length === 0) {
      return this;
    }
    var originIndex = (index >>> level) & MASK;
    if (originIndex >= this.array.length) {
      return new VNode([], ownerID);
    }
    var removingFirst = originIndex === 0;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[originIndex];
      newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
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

  VNode.prototype.removeAfter=function(ownerID, level, index) {"use strict";
    if (index === 1 << level || this.array.length === 0) {
      return this;
    }
    var sizeIndex = ((index - 1) >>> level) & MASK;
    if (sizeIndex >= this.array.length) {
      return this;
    }
    var removingLast = sizeIndex === this.array.length - 1;
    var newChild;
    if (level > 0) {
      var oldChild = this.array[sizeIndex];
      newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
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



function vectorWithLengthOfLongestSeq(vector, seqs) {
  var maxLength = Math.max.apply(null, seqs.map(function(seq)  {return seq.length || 0;}));
  return maxLength > vector.length ? vector.setLength(maxLength) : vector;
}

function rawIndex(index, origin) {
  if (index < 0) throw new Error('Index out of bounds');
  return index + origin;
}

function getTailOffset(size) {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}


var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __SENTINEL = {};
var __EMPTY_VECT;
var __EMPTY_VNODE = new VNode([]);

module.exports = Vector;
