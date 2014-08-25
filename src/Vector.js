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
          SHIFT, SIZE, MASK, NOT_SET, DID_ALTER, OwnerID, MakeRef, SetRef,
          arrCopy, iteratorResult */
/* exported Vector, VectorPrototype */


class Vector extends IndexedSequence {

  // @pragma Construction

  constructor(...values) {
    return Vector.from(values);
  }

  static empty() {
    return EMPTY_VECT || (EMPTY_VECT = makeVector(0, 0, SHIFT));
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
      return makeVector(0, sequence.length, SHIFT, null, new VNode(
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

  set(index, value) {
    return updateVector(this, index, value);
  }

  delete(index) {
    return updateVector(this, index, NOT_SET);
  }

  clear() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = this._origin = this._size = 0;
      this._level = SHIFT;
      this._root = this._tail = null;
      this.__altered = true;
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
    return new VectorIterator(this);
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
        iterateVNode(this._tail, 0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse) &&
        iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
    } else {
      didComplete =
        iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) &&
        iterateVNode(this._tail, 0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse);
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
VectorPrototype['@@iterator'] = VectorPrototype.iterator;
VectorPrototype.update = MapPrototype.update;
VectorPrototype.updateIn = MapPrototype.updateIn;
VectorPrototype.cursor = MapPrototype.cursor;
VectorPrototype.withMutations = MapPrototype.withMutations;
VectorPrototype.asMutable = MapPrototype.asMutable;
VectorPrototype.asImmutable = MapPrototype.asImmutable;
VectorPrototype.wasAltered = MapPrototype.wasAltered;


class VNode {
  constructor(array, ownerID) {
    this.array = array;
    this.ownerID = ownerID;
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
    var editable = editableVNode(this, ownerID);
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
    var editable = editableVNode(this, ownerID);
    if (!removingLast) {
      editable.array.length = sizeIndex + 1;
    }
    if (newChild) {
      editable.array[sizeIndex] = newChild;
    }
    return editable;
  }
}

function iterateVNode(node, level, offset, max, fn, reverse) {
  if (node) {
    var ii;
    var array = node.array;
    var maxII = array.length - 1;
    if (level === 0) {
      for (ii = 0; ii <= maxII; ii++) {
        var rawIndex = reverse ? maxII - ii : ii;
        if (array.hasOwnProperty(rawIndex)) {
          var index = rawIndex + offset;
          if (index >= 0 && index < max && fn(array[rawIndex], index) === false) {
            return false;
          }
        }
      }
    } else {
      var step = 1 << level;
      var newLevel = level - SHIFT;
      for (ii = 0; ii <= maxII; ii++) {
        var levelIndex = reverse ? maxII - ii : ii;
        var newOffset = offset + levelIndex * step;
        if (newOffset < max && newOffset + step > 0) {
          var nextNode = array[levelIndex];
          if (nextNode && !iterateVNode(nextNode, newLevel, newOffset, max, fn, reverse)) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

class VectorIterator {

  constructor(vector) {
    var tailOffset = getTailOffset(vector._size);

    var tailStack = vector._tail && vectIteratorFrame(
      vector._tail.array,
      0,
      tailOffset - vector._origin,
      vector._size - vector._origin
    );

    this._stack = vector._root ? vectIteratorFrame(
      vector._root.array,
      vector._level,
      -vector._origin,
      tailOffset - vector._origin,
      tailStack
    ) : tailStack;
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
            return iteratorResult([index, value]);
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
              stack = this._stack = vectIteratorFrame(
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
    return iteratorResult();
  }
}

function vectIteratorFrame(array, level, offset, max, prevFrame) {
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
  vect.__altered = false;
  return vect;
}

function updateVector(vector, index, value) {
  if (index >= vector.length) {
    return value === NOT_SET ? vector : vector.withMutations(vect => {
      setVectorBounds(vect, 0, index + 1).set(index, value)
    });
  }

  index = rawIndex(index, vector._origin);

  var newTail = vector._tail;
  var newRoot = vector._root;
  var didAlter = MakeRef(DID_ALTER);
  if (index >= getTailOffset(vector._size)) {
    newTail = updateVNode(newTail, vector.__ownerID, 0, index, value, didAlter);
  } else {
    newRoot = updateVNode(newRoot, vector.__ownerID, vector._level, index, value, didAlter);
  }

  if (!didAlter.value) {
    return vector;
  }

  if (vector.__ownerID) {
    vector._root = newRoot;
    vector._tail = newTail;
    vector.__altered = true;
    return vector;
  }
  return makeVector(vector._origin, vector._size, vector._level, newRoot, newTail);
}

function updateVNode(node, ownerID, level, index, value, didAlter) {
  var deleted = value === NOT_SET;
  var newNode;
  var idx = (index >>> level) & MASK;
  var nodeHas = node && idx < node.array.length && node.array.hasOwnProperty(idx);
  if (deleted && !nodeHas) {
    return node;
  }

  if (level > 0) {
    var lowerNode = node && node.array[idx];
    var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
    if (newLowerNode === lowerNode) {
      return node;
    }
    newNode = editableVNode(node, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }

  if (!deleted && nodeHas && node.array[idx] === value) {
    return node;
  }

  SetRef(didAlter);

  newNode = editableVNode(node, ownerID);
  deleted ?
    (delete newNode.array[idx]) :
    (newNode.array[idx] = value);
  return newNode;
}

function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
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
    newRoot = new VNode(newRoot && newRoot.array.length ? [null, newRoot] : [], owner);
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
    newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
    newLevel += SHIFT;
  }

  // Locate or create the new tail.
  var oldTail = vector._tail;
  var newTail = newTailOffset < oldTailOffset ?
    vectorNodeFor(vector, newSize - 1) :
    newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

  // Merge Tail into tree.
  if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldSize && oldTail.array.length) {
    newRoot = editableVNode(newRoot, owner);
    var node = newRoot;
    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
      var idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }

  // If the size has been reduced, there's a chance the tail needs to be trimmed.
  if (newSize < oldSize) {
    newTail = newTail && newTail.removeAfter(owner, 0, newSize);
  }

  // If the new origin is within the tail, then we do not need a root.
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newSize -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

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
      newRoot = newRoot && newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot && newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newSize -= offsetShift;
    }
  }

  if (vector.__ownerID) {
    vector.length = newSize - newOrigin;
    vector._origin = newOrigin;
    vector._size = newSize;
    vector._level = newLevel;
    vector._root = newRoot;
    vector._tail = newTail;
    vector.__altered = true;
    return vector;
  }
  return makeVector(newOrigin, newSize, newLevel, newRoot, newTail);
}

function mergeIntoVectorWith(vector, merger, iterables) {
  var seqs = [];
  for (var ii = 0; ii < iterables.length; ii++) {
    var seq = iterables[ii];
    seq && seqs.push(Sequence(seq));
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
