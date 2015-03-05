/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { wholeSlice, resolveBegin, resolveEnd } from './TrieUtils'
import { IndexedIterable } from './Iterable'
import { IndexedCollection } from './Collection'
import { MapPrototype } from './Map'
import { Iterator, iteratorValue, iteratorDone } from './Iterator'
import assertNotInfinite from './utils/assertNotInfinite'
import { createFactory } from './createFactory'

export class StackClass extends IndexedCollection {

  // @pragma Construction

  constructor(size, head, ownerID, hash) {
    this.size = size;
    this._head = head;
    this.__ownerID = ownerID;
    this.__hash = hash;
    this.__altered = false;
  }

  static of(/*...values*/) {
    return this.factory(arguments);
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

  push(/*...values*/) {
    if (arguments.length === 0) {
      return this;
    }
    var newSize = this.size + arguments.length;
    var head = this._head;
    for (var ii = arguments.length - 1; ii >= 0; ii--) {
      head = {
        value: arguments[ii],
        next: head
      };
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return new this.constructor.Class(newSize, head);
  }

  pushAll(iter) {
    iter = IndexedIterable(iter);
    if (iter.size === 0) {
      return this;
    }
    assertNotInfinite(iter.size);
    var newSize = this.size;
    var head = this._head;
    iter.reverse().forEach(value => {
      newSize++;
      head = {
        value: value,
        next: head
      };
    });
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return new this.constructor.Class(newSize, head);
  }

  pop() {
    return this.slice(1);
  }

  unshift(/*...values*/) {
    return this.push.apply(this, arguments);
  }

  unshiftAll(iter) {
    return this.pushAll(iter);
  }

  shift() {
    return this.pop.apply(this, arguments);
  }

  clear() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._head = undefined;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return this.__empty();
  }

  slice(begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.size);
    var resolvedEnd = resolveEnd(end, this.size);
    if (resolvedEnd !== this.size) {
      // super.slice(begin, end);
      return IndexedCollection.prototype.slice.call(this, begin, end);
    }
    var newSize = this.size - resolvedBegin;
    var head = this._head;
    while (resolvedBegin--) {
      head = head.next;
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return new this.constructor.Class(newSize, head);
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
    return new this.constructor.Class(this.size, this._head, ownerID, this.__hash);
  }

  // @pragma Iteration

  __iterate(fn, reverse) {
    if (reverse) {
      return this.toSeq().cacheResult.__iterate(fn, reverse);
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

  __iterator(type, reverse) {
    if (reverse) {
      return this.toSeq().cacheResult().__iterator(type, reverse);
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

  __empty() {
    return new this.constructor.Class(0);
  }

  static __factory(value, emptyStack) {
    return emptyStack.unshiftAll(value)
  }

}

function isStack(maybeStack) {
  return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
}

StackClass.__check = StackClass.isStack = isStack;

var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

var StackPrototype = StackClass.prototype;
StackPrototype[IS_STACK_SENTINEL] = true;
StackPrototype.withMutations = MapPrototype.withMutations;
StackPrototype.asMutable = MapPrototype.asMutable;
StackPrototype.asImmutable = MapPrototype.asImmutable;
StackPrototype.wasAltered = MapPrototype.wasAltered;

export var Stack = createFactory(StackClass)
