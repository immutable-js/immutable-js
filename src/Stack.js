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
import "Iterator"
/* global Sequence, IndexedSequence, wholeSlice, resolveBegin, resolveEnd,
          MapPrototype, Iterator, iteratorValue, iteratorDone */
/* exported Stack */


class Stack extends IndexedSequence {

  // @pragma Construction

  constructor(...values) {
    return Stack.from(values);
  }

  static empty() {
    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
  }

  static from(sequence) {
    var stack = Stack.empty();
    return sequence ?
      sequence.constructor === Stack ?
        sequence :
        stack.unshiftAll(sequence) :
      stack;
  }

  toString() {
    return this.__toString('Stack [', ']');
  }

  // @pragma Access

  get(index, notSetValue) {
    var head = this._head;
    while (head && index--) {
      head = head.next;
    }
    return head ? head.value : notSetValue;
  }

  peek() {
    return this._head && this._head.value;
  }

  // @pragma Modification

  unshift(/*...values*/) {
    if (arguments.length === 0) {
      return this;
    }
    var newLength = this.length + arguments.length;
    var head = this._head;
    for (var ii = arguments.length - 1; ii >= 0; ii--) {
      head = {
        value: arguments[ii],
        next: head
      };
    }
    if (this.__ownerID) {
      this.length = newLength;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newLength, head);
  }

  unshiftAll(seq) {
    seq = Sequence(seq);
    if (seq.length === 0) {
      return this;
    }
    var newLength = this.length;
    var head = this._head;
    seq.reverse().forEach(value => {
      newLength++;
      head = {
        value: value,
        next: head
      };
    });
    if (this.__ownerID) {
      this.length = newLength;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newLength, head);
  }

  shift() {
    return this.slice(1);
  }

  clear() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
      this._head = undefined;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return Stack.empty();
  }

  slice(begin, end) {
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.length);
    var resolvedEnd = resolveEnd(end, this.length);
    if (resolvedEnd !== this.length) {
      return super.slice(begin, end);
    }
    var newLength = this.length - resolvedBegin;
    var head = this._head;
    while (resolvedBegin--) {
      head = head.next;
    }
    if (this.__ownerID) {
      this.length = newLength;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newLength, head);
  }

  // @pragma Mutability

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeStack(this.length, this._head, ownerID, this.__hash);
  }

  // @pragma Iteration

  __iterateUncached(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    var node = this._head;
    while (node) {
      if (fn(node.value, iterations++, this) === false) {
        break;
      }
      node = node.next;
    }
    return iterations;
  }

  __iteratorUncached(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterations = 0;
    var node = this._head;
    return new Iterator(() => {
      if (node) {
        var value = node.value;
        node = node.next;
        return iteratorValue(type, iterations++, value);
      }
      return iteratorDone();
    });
  }
}

var StackPrototype = Stack.prototype;
StackPrototype.push = StackPrototype.unshift;
StackPrototype.pop = StackPrototype.shift;
StackPrototype.withMutations = MapPrototype.withMutations;
StackPrototype.asMutable = MapPrototype.asMutable;
StackPrototype.asImmutable = MapPrototype.asImmutable;
StackPrototype.wasAltered = MapPrototype.wasAltered;


function makeStack(length, head, ownerID, hash) {
  var map = Object.create(StackPrototype);
  map.length = length;
  map._head = head;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}

var EMPTY_STACK;
