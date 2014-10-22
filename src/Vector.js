/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Sequence"
import "Map"
import "TrieUtils"
import "Iterator"
/* global Sequence, IndexedSequence, wrapIndex,
          MapPrototype, mergeIntoCollectionWith, deepMerger,
          DELETE, SHIFT, SIZE, MASK, NOT_SET, DID_ALTER, OwnerID, MakeRef,
          SetRef, arrCopy, Iterator, iteratorValue, iteratorDone */
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
    if (!sequence || sequence.length === 0 || sequence.size === 0) {
      return Vector.empty();
    }
    if (sequence.constructor === Vector) {
      return sequence;
    }
    var isArray = Array.isArray(sequence);
    if (sequence.size > 0 && sequence.size < SIZE) {
      return makeVector(0, sequence.size, SHIFT, null, new VNode(
        isArray ? arrCopy(sequence) : Sequence(sequence).toArray()
      ));
    }
    if (!isArray) {
      sequence = Sequence(sequence).valueSeq();
    }
    return Vector.empty().merge(sequence);
  }

  toString() {
    return this.__toString('Vector [', ']');
  }

  // @pragma Access

  get(index, notSetValue) {
    index = wrapIndex(this, index);
    if (index < 0 || index >= this.size) {
      return notSetValue;
    }
    index += this._origin;
    var node = vectorNodeFor(this, index);
    return node && node.array[index & MASK];
  }

  // @pragma Modification

  set(index, value) {
    return updateVector(this, index, value);
  }

  remove(index) {
    return updateVector(this, index, NOT_SET);
  }

  clear() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = this._origin = this._capacity = 0;
      this._level = SHIFT;
      this._root = this._tail = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return Vector.empty();
  }

  push(/*...values*/) {
    var values = arguments;
    var oldSize = this.size;
    return this.withMutations(vect => {
      setVectorBounds(vect, 0, oldSize + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        vect.set(oldSize + ii, values[ii]);
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

  setSize(size) {
    return setVectorBounds(this, 0, size);
  }

  // @pragma Iteration

  slice(begin, end) {
    var sliceSequence = super.slice(begin, end);
    // Optimize the case of vector.slice(b, e).toVector()
    if (sliceSequence !== this) {
      var vector = this;
      var size = vector.size;
      sliceSequence.toVector = () => setVectorBounds(
        vector,
        begin < 0 ? Math.max(0, size + begin) : size ? Math.min(size, begin) : begin,
        end == null ? size : end < 0 ? Math.max(0, size + end) : size ? Math.min(size, end) : end
      );
    }
    return sliceSequence;
  }

  __iterator(type, reverse) {
    return new VectorIterator(this, type, reverse);
  }

  __iterate(fn, reverse) {
    var iterations = 0;
    var eachFn = v => fn(v, iterations++, this);
    var tailOffset = getTailOffset(this._capacity);
    if (reverse) {
      iterateVNode(this._tail, 0, tailOffset - this._origin, this._capacity - this._origin, eachFn, reverse) &&
        iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
    } else {
      iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) &&
        iterateVNode(this._tail, 0, tailOffset - this._origin, this._capacity - this._origin, eachFn, reverse);
    }
    return iterations;
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      return this;
    }
    return makeVector(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
  }
}

var VectorPrototype = Vector.prototype;
VectorPrototype[DELETE] = VectorPrototype.remove;
VectorPrototype.setIn = MapPrototype.setIn;
VectorPrototype.removeIn = MapPrototype.removeIn;
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
        editable.array[ii] = undefined;
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
      editable.array.pop();
    }
    if (newChild) {
      editable.array[sizeIndex] = newChild;
    }
    return editable;
  }
}

function iterateVNode(node, level, offset, max, fn, reverse) {
    var ii;
    var array = node && node.array;
    if (level === 0) {
      var from = offset < 0 ? -offset : 0;
      var to = max - offset;
      if (to > SIZE) {
        to = SIZE;
      }
      for (ii = from; ii < to; ii++) {
        if (fn(array && array[reverse ? from + to - 1 - ii : ii]) === false) {
          return false;
        }
      }
    } else {
      var step = 1 << level;
      var newLevel = level - SHIFT;
      for (ii = 0; ii <= MASK; ii++) {
        var levelIndex = reverse ? MASK - ii : ii;
        var newOffset = offset + (levelIndex << level);
        if (newOffset < max && newOffset + step > 0) {
          var nextNode = array && array[levelIndex];
          if (!iterateVNode(nextNode, newLevel, newOffset, max, fn, reverse)) {
            return false;
          }
        }
      }
    }
  return true;
}

class VectorIterator extends Iterator {

  constructor(vector, type, reverse) {
    this._type = type;
    this._reverse = !!reverse;
    this._maxIndex = vector.size - 1;
    var tailOffset = getTailOffset(vector._capacity);
    var rootStack = vectIteratorFrame(
      vector._root && vector._root.array,
      vector._level,
      -vector._origin,
      tailOffset - vector._origin - 1
    );
    var tailStack = vectIteratorFrame(
      vector._tail && vector._tail.array,
      0,
      tailOffset - vector._origin,
      vector._capacity - vector._origin - 1
    );
    this._stack = reverse ? tailStack : rootStack;
    this._stack.__prev = reverse ? rootStack : tailStack;
  }

  next() {
    var stack = this._stack;
    while (stack) {
      var array = stack.array;
      var rawIndex = stack.index++;
      if (this._reverse) {
        rawIndex = MASK - rawIndex;
        if (rawIndex > stack.rawMax) {
          rawIndex = stack.rawMax;
          stack.index = SIZE - rawIndex;
        }
      }
      if (rawIndex >= 0 && rawIndex < SIZE && rawIndex <= stack.rawMax) {
        var value = array && array[rawIndex];
        if (stack.level === 0) {
          var type = this._type;
          var index;
          if (type !== 1) {
            index = stack.offset + (rawIndex << stack.level);
            if (this._reverse) {
              index = this._maxIndex - index;
            }
          }
          return iteratorValue(type, index, value);
        } else {
          this._stack = stack = vectIteratorFrame(
            value && value.array,
            stack.level - SHIFT,
            stack.offset + (rawIndex << stack.level),
            stack.max,
            stack
          );
        }
        continue;
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }
}

function vectIteratorFrame(array, level, offset, max, prevFrame) {
  return {
    array: array,
    level: level,
    offset: offset,
    max: max,
    rawMax: ((max - offset) >> level),
    index: 0,
    __prev: prevFrame
  };
}

function makeVector(origin, capacity, level, root, tail, ownerID, hash) {
  var vect = Object.create(VectorPrototype);
  vect.size = capacity - origin;
  vect._origin = origin;
  vect._capacity = capacity;
  vect._level = level;
  vect._root = root;
  vect._tail = tail;
  vect.__ownerID = ownerID;
  vect.__hash = hash;
  vect.__altered = false;
  return vect;
}

function updateVector(vector, index, value) {
  index = wrapIndex(vector, index);

  if (index >= vector.size || index < 0) {
    return value === NOT_SET ? vector : vector.withMutations(vect => {
      index < 0 ?
        setVectorBounds(vect, index).set(0, value) :
        setVectorBounds(vect, 0, index + 1).set(index, value)
    });
  }

  index += vector._origin;

  var newTail = vector._tail;
  var newRoot = vector._root;
  var didAlter = MakeRef(DID_ALTER);
  if (index >= getTailOffset(vector._capacity)) {
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
    vector.__hash = undefined;
    vector.__altered = true;
    return vector;
  }
  return makeVector(vector._origin, vector._capacity, vector._level, newRoot, newTail);
}

function updateVNode(node, ownerID, level, index, value, didAlter) {
  var removed = value === NOT_SET;
  var newNode;
  var idx = (index >>> level) & MASK;
  var nodeHas = node && idx < node.array.length;
  if (removed && !nodeHas) {
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

  if (!removed && nodeHas && node.array[idx] === value) {
    return node;
  }

  SetRef(didAlter);

  newNode = editableVNode(node, ownerID);
  if (removed && idx === newNode.array.length - 1) {
    newNode.array.pop()
  } else {
    newNode.array[idx] = removed ? undefined : value;
  }
  return newNode;
}

function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
}

function vectorNodeFor(vector, rawIndex) {
  if (rawIndex >= getTailOffset(vector._capacity)) {
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
  var oldCapacity = vector._capacity;
  var newOrigin = oldOrigin + begin;
  var newCapacity = end == null ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
    return vector;
  }

  // If it's going to end after it starts, it's empty.
  if (newOrigin >= newCapacity) {
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
    newCapacity += offsetShift;
    oldCapacity += offsetShift;
  }

  var oldTailOffset = getTailOffset(oldCapacity);
  var newTailOffset = getTailOffset(newCapacity);

  // New size might require creating a higher root.
  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
    newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
    newLevel += SHIFT;
  }

  // Locate or create the new tail.
  var oldTail = vector._tail;
  var newTail = newTailOffset < oldTailOffset ?
    vectorNodeFor(vector, newCapacity - 1) :
    newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

  // Merge Tail into tree.
  if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
    newRoot = editableVNode(newRoot, owner);
    var node = newRoot;
    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
      var idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }

  // If the size has been reduced, there's a chance the tail needs to be trimmed.
  if (newCapacity < oldCapacity) {
    newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
  }

  // If the new origin is within the tail, then we do not need a root.
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newCapacity -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

  // Otherwise, if the root has been trimmed, garbage collect.
  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
    offsetShift = 0;

    // Identify the new top root node of the subtree of the old root.
    while (newRoot) {
      var beginIndex = (newOrigin >>> newLevel) & MASK;
      if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
        break;
      }
      if (beginIndex) {
        offsetShift += (1 << newLevel) * beginIndex;
      }
      newLevel -= SHIFT;
      newRoot = newRoot.array[beginIndex];
    }

    // Trim the new sides of the new root.
    if (newRoot && newOrigin > oldOrigin) {
      newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newCapacity -= offsetShift;
    }
  }

  if (vector.__ownerID) {
    vector.size = newCapacity - newOrigin;
    vector._origin = newOrigin;
    vector._capacity = newCapacity;
    vector._level = newLevel;
    vector._root = newRoot;
    vector._tail = newTail;
    vector.__hash = undefined;
    vector.__altered = true;
    return vector;
  }
  return makeVector(newOrigin, newCapacity, newLevel, newRoot, newTail);
}

function mergeIntoVectorWith(vector, merger, iterables) {
  var seqs = [];
  for (var ii = 0; ii < iterables.length; ii++) {
    var seq = iterables[ii];
    seq && seqs.push(Sequence(seq));
  }
  var maxSize = Math.max.apply(null, seqs.map(s => s.size || 0));
  if (maxSize > vector.size) {
    vector = vector.setSize(maxSize);
  }
  return mergeIntoCollectionWith(vector, merger, seqs);
}

function getTailOffset(size) {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}

var EMPTY_VECT;
