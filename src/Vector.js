/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Sequence"
import "is"
import "invariant"
import "Map"
import "TrieUtils"
/* global Sequence, IndexedSequence, is, invariant,
          MapPrototype, mergeIntoCollectionWith, deepMerger,
          SHIFT, SIZE, MASK, NOT_SET, OwnerID, arrCopy */
/* exported Vector, VectorPrototype */


class Vector extends IndexedSequence {

  // @pragma Construction

  constructor(...values) {
    return Vector.from(values);
  }

  static empty() {
    return EMPTY_VECT || (EMPTY_VECT =
      makeVector(0, 0, SHIFT, EMPTY_VNODE, EMPTY_VNODE)
    );
  }

  static from(sequence) {
    if (!sequence || sequence.length === 0) {
      return Vector.empty();
    }
    if (sequence.constructor === Vector) {
      return sequence;
    }
    var isArray = Array.isArray(sequence);
    if (sequence.length > 0 && sequence.length < SIZE) {
      return makeVector(0, sequence.length, SHIFT, EMPTY_VNODE, new VNode(
        isArray ? arrCopy(sequence) : Sequence(sequence).toArray()
      ));
    }
    if (!isArray) {
      sequence = Sequence(sequence);
      if (!(sequence instanceof IndexedSequence)) {
        sequence = sequence.values();
      }
    }
    return Vector.empty().merge(sequence);
  }

  toString() {
    return this.__toString('Vector [', ']');
  }

  // @pragma Access

  get(index, notSetValue) {
    index = rawIndex(index, this._origin);
    if (index >= this._size) {
      return notSetValue;
    }
    var node = vectorNodeFor(this, index);
    var maskedIndex = index & MASK;
    return node && (notSetValue === undefined || node.array.hasOwnProperty(maskedIndex)) ?
      node.array[maskedIndex] : notSetValue;
  }

  first() {
    return this.get(0);
  }

  last() {
    return this.get(this.length ? this.length - 1 : 0);
  }

  // @pragma Modification

  // TODO: set and delete seem very similar.

  set(index, value) {
    var tailOffset = getTailOffset(this._size);

    if (index >= this.length) {
      return this.withMutations(vect =>
        setVectorBounds(vect, 0, index + 1).set(index, value)
      );
    }

    if (this.get(index, NOT_SET) === value) {
      return this;
    }

    index = rawIndex(index, this._origin);

    // Fits within tail.
    if (index >= tailOffset) {
      var newTail = this._tail.ensureOwner(this.__ownerID);
      newTail.array[index & MASK] = value;
      var newSize = index >= this._size ? index + 1 : this._size;
      if (this.__ownerID) {
        this.length = newSize - this._origin;
        this._size = newSize;
        this._tail = newTail;
        return this;
      }
      return makeVector(this._origin, newSize, this._level, this._root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this._root.ensureOwner(this.__ownerID);
    var node = newRoot;
    for (var level = this._level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this.__ownerID) : new VNode([], this.__ownerID);
    }
    node.array[index & MASK] = value;
    if (this.__ownerID) {
      this._root = newRoot;
      return this;
    }
    return makeVector(this._origin, this._size, this._level, newRoot, this._tail);
  }

  delete(index) {
    // Out of bounds, no-op. Probably a more efficient way to do this...
    if (!this.has(index)) {
      return this;
    }

    var tailOffset = getTailOffset(this._size);
    index = rawIndex(index, this._origin);

    // Delete within tail.
    if (index >= tailOffset) {
      var newTail = this._tail.ensureOwner(this.__ownerID);
      delete newTail.array[index & MASK];
      if (this.__ownerID) {
        this._tail = newTail;
        return this;
      }
      return makeVector(this._origin, this._size, this._level, this._root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this._root.ensureOwner(this.__ownerID);
    var node = newRoot;
    for (var level = this._level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      // TODO: if we don't check "has" above, this could be null.
      node = node.array[idx] = node.array[idx].ensureOwner(this.__ownerID);
    }
    delete node.array[index & MASK];
    if (this.__ownerID) {
      this._root = newRoot;
      return this;
    }
    return makeVector(this._origin, this._size, this._level, newRoot, this._tail);
  }

  clear() {
    if (this.__ownerID) {
      this.length = this._origin = this._size = 0;
      this._level = SHIFT;
      this._root = this._tail = EMPTY_VNODE;
      return this;
    }
    return Vector.empty();
  }

  push(/*...values*/) {
    var values = arguments;
    var oldLength = this.length;
    return this.withMutations(vect => {
      setVectorBounds(vect, 0, oldLength + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(oldLength + ii, values[ii]);
      }
    });
  }

  pop() {
    return setVectorBounds(this, 0, -1);
  }

  unshift(/*...values*/) {
    var values = arguments;
    return this.withMutations(vect => {
      setVectorBounds(vect, -values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(ii, values[ii]);
      }
    });
  }

  shift() {
    return setVectorBounds(this, 1);
  }

  // @pragma Composition

  merge(/*...seqs*/) {
    return mergeIntoVectorWith(this, null, arguments);
  }

  mergeWith(merger, ...seqs) {
    return mergeIntoVectorWith(this, merger, seqs);
  }

  mergeDeep(/*...seqs*/) {
    return mergeIntoVectorWith(this, deepMerger(null), arguments);
  }

  mergeDeepWith(merger, ...seqs) {
    return mergeIntoVectorWith(this, deepMerger(merger), seqs);
  }

  setLength(length) {
    return setVectorBounds(this, 0, length);
  }

  // @pragma Iteration

  slice(begin, end, maintainIndices) {
    var sliceSequence = super.slice(begin, end, maintainIndices);
    // Optimize the case of vector.slice(b, e).toVector()
    if (!maintainIndices && sliceSequence !== this) {
      var vector = this;
      var length = vector.length;
      sliceSequence.toVector = () => setVectorBounds(
        vector,
        begin < 0 ? Math.max(0, length + begin) : length ? Math.min(length, begin) : begin,
        end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end
      );
    }
    return sliceSequence;
  }

  iterator() {
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

  __deepEquals(other) {
    var iterator = this.iterator();
    return other.every((v, k) => {
      var entry = iterator.next().value;
      return entry && k === entry[0] && is(v, entry[1]);
    });
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return makeVector(this._origin, this._size, this._level, this._root, this._tail, ownerID);
  }
}

var VectorPrototype = Vector.prototype;
VectorPrototype['@@iterator'] = VectorPrototype.__iterator__;
VectorPrototype.update = MapPrototype.update;
VectorPrototype.updateIn = MapPrototype.updateIn;
VectorPrototype.cursor = MapPrototype.cursor;
VectorPrototype.withMutations = MapPrototype.withMutations;
VectorPrototype.asMutable = MapPrototype.asMutable;
VectorPrototype.asImmutable = MapPrototype.asImmutable;


class VNode {
  constructor(array, ownerID) {
    this.array = array;
    this.ownerID = ownerID;
  }

  ensureOwner(ownerID) {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new VNode(this.array.slice(), ownerID);
  }

  // TODO: seems like these methods are very similar

  removeBefore(ownerID, level, index) {
    if (index === level ? 1 << level : 0 || this.array.length === 0) {
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
  }

  removeAfter(ownerID, level, index) {
    if (index === level ? 1 << level : 0 || this.array.length === 0) {
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
    this._stack = iteratorFrame(
      root.array,
      level,
      -origin,
      tailOffset - origin,
      iteratorFrame(
        tail.array,
        0,
        tailOffset - origin,
        size - origin
      )
    );
  }

  next() /*(number,T)*/ {
    var stack = this._stack;
    iteration: while (stack) {
      if (stack.level === 0) {
        stack.rawIndex || (stack.rawIndex = 0);
        while (stack.rawIndex < stack.array.length) {
          var index = stack.rawIndex + stack.offset;
          if (index >= 0 && index < stack.max && stack.array.hasOwnProperty(stack.rawIndex)) {
            var value = stack.array[stack.rawIndex];
            stack.rawIndex++;
            return { value: [index, value], done: false };
          }
          stack.rawIndex++;
        }
      } else {
        var step = 1 << stack.level;
        stack.levelIndex || (stack.levelIndex = 0);
        while (stack.levelIndex < stack.array.length) {
          var newOffset = stack.offset + stack.levelIndex * step;
          if (newOffset + step > 0 && newOffset < stack.max) {
            var node = stack.array[stack.levelIndex];
            if (node) {
              stack.levelIndex++;
              stack = this._stack = iteratorFrame(
                node.array,
                stack.level - SHIFT,
                newOffset,
                stack.max,
                stack
              );
              continue iteration;
            }
          }
          stack.levelIndex++;
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return { value: undefined, done: true };
  }
}


function iteratorFrame(array, level, offset, max, prevFrame) {
  return {
    array: array,
    level: level,
    offset: offset,
    max: max,
    __prev: prevFrame
  };
}

function makeVector(origin, size, level, root, tail, ownerID) {
  var vect = Object.create(VectorPrototype);
  vect.length = size - origin;
  vect._origin = origin;
  vect._size = size;
  vect._level = level;
  vect._root = root;
  vect._tail = tail;
  vect.__ownerID = ownerID;
  return vect;
}

function vectorNodeFor(vector, rawIndex) {
  if (rawIndex >= getTailOffset(vector._size)) {
    return vector._tail;
  }
  if (rawIndex < 1 << (vector._level + SHIFT)) {
    var node = vector._root;
    var level = vector._level;
    while (node && level > 0) {
      node = node.array[(rawIndex >>> level) & MASK];
      level -= SHIFT;
    }
    return node;
  }
}

function setVectorBounds(vector, begin, end) {
  var owner = vector.__ownerID || new OwnerID();
  var oldOrigin = vector._origin;
  var oldSize = vector._size;
  var newOrigin = oldOrigin + begin;
  var newSize = end == null ? oldSize : end < 0 ? oldSize + end : oldOrigin + end;
  if (newOrigin === oldOrigin && newSize === oldSize) {
    return vector;
  }

  // If it's going to end after it starts, it's empty.
  if (newOrigin >= newSize) {
    return vector.clear();
  }

  var newLevel = vector._level;
  var newRoot = vector._root;

  // New origin might require creating a higher root.
  var offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    // TODO: why only ever shifting over by 1?
    newRoot = new VNode(newRoot.array.length ? [,newRoot] : [], owner);
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
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
  var oldTail = vector._tail;
  var newTail = newTailOffset < oldTailOffset ?
    vectorNodeFor(vector, newSize - 1) :
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
    newRoot = EMPTY_VNODE;
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
    newRoot = newRoot || EMPTY_VNODE;
  }

  if (vector.__ownerID) {
    vector.length = newSize - newOrigin;
    vector._origin = newOrigin;
    vector._size = newSize;
    vector._level = newLevel;
    vector._root = newRoot;
    vector._tail = newTail;
    return vector;
  }
  return makeVector(newOrigin, newSize, newLevel, newRoot, newTail);
}

function mergeIntoVectorWith(vector, merger, iterables) {
  var seqs = [];
  for (var ii = 0; ii < iterables.length; ii++) {
    var seq = iterables[ii];
    seq && seqs.push(seq.forEach ? seq : Sequence(seq));
  }
  var maxLength = Math.max.apply(null, seqs.map(s => s.length || 0));
  if (maxLength > vector.length) {
    vector = vector.setLength(maxLength);
  }
  return mergeIntoCollectionWith(vector, merger, seqs);
}

function rawIndex(index, origin) {
  invariant(index >= 0, 'Index out of bounds');
  return index + origin;
}

function getTailOffset(size) {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}

var EMPTY_VECT;
var EMPTY_VNODE = new VNode([]);
