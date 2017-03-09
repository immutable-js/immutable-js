/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { wholeSlice, resolveBegin, resolveEnd, wrapIndex } from './TrieUtils'
import { IndexedIterable } from './Iterable'
import { IndexedCollection } from './Collection'
import { MapPrototype } from './Map'
import { Iterator, iteratorValue, iteratorDone } from './Iterator'
import assertNotInfinite from './utils/assertNotInfinite'


export class Stack extends IndexedCollection {

  // @pragma Construction

  /**
   * Constructor for the immutable Stack object
   * @param {*} value - 
   */
  constructor(value) {
    return value === null || value === undefined ? emptyStack() :
      isStack(value) ? value :
      emptyStack().unshiftAll(value);
  }

  /**
   * Public Static method that creates a Stack object out of all the arguments passed in
   * @returns {Stack} - a stack created out of the args array to this function
   */
  static of(/*...values*/) {
    return this(arguments);
  }

  /**
   * Public method that calls the built in parent class's toString method to return
   * the string representation of this object
   * 
   * @returns {String}
   */
  toString() {
    return this.__toString('Stack [', ']');
  }

  // @pragma Access

  /**
   * 
   * @param {integer} index - the index of the element you want to get from the stack
   * @param {*} notSetValue - if the item at the index doesn't exist or if it's null, you can return a default value
   * @returns {*} - the item at the index passed in, or the notSetValue if that item doesn't exist
   */
  get(index, notSetValue) {
    var head = this._head;
    index = wrapIndex(this, index);
    while (head && index--) {
      head = head.next;
    }
    return head ? head.value : notSetValue;
  }

  /**
   * Public accessor method that peeks at the next element that would get popped out of the stack
   * and returns it. If this item is null (this._head === null), then null is returned
   * 
   * @returns {*} - Top item of the stack or null if stack is empty
   */
  peek() {
    return this._head && this._head.value;
  }

  // @pragma Modification

  /**
   * Creates a new stack instance from the previous instance and
   * the arguments array, resulting in a new immutable stack
   * 
   * @param {None} - No specific param
   * @return {Stack} - New immutable instance of the stack
   */
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
    return makeStack(newSize, head);
  }

  /**
   * Takes in an array of elements and returns a new immutable stack with the elements in 
   * the array pushed on the previous instance of the stack (This works with any Javascript or 
   * Immutable.js object that can be turned into an IndexedIterable object)
   * 
   * @param {Array} iter - Takes in an array of elements
   * @return {Stack} - returns a new immutable stack with all the object of the array pushed in order 
   * (array ends up being reversed, with the last element being the first that will be popped)
   */
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
    return makeStack(newSize, head);
  }

  /**
   * Returns a stack with the top element removed
   * 
   * @return {Stack} - returns an immutable instance of a stack with the top element removed
   */
  pop() {
    return this.slice(1);
  }

  /**
   * Utility method for pushing multiple unrelated values onto stack object
   * 
   * @param {None} - no required parameters
   * @returns {Stack} - returns a new stack with every parameter passed into function pushed
   * onto the stack in order that they are passed in.
   */
  unshift(/*...values*/) {
    return this.push.apply(this, arguments);
  }

  /**
   * Utility method that does the same thing as pushAll.
   * 
   * This exists because different stack implementations for different languages may used
   * unshift or push to refer to adding an element to the stack, and this allow you to use either one
   * 
   * @param {Array} iter - Takes in an array of elements
   * @returns {Stack} - returns an immutable instance after the changes have been made
   */
  unshiftAll(iter) {
    return this.pushAll(iter);
  }

  /**
   * Utility method for popping an element from your stack
   * 
   * This exists because different stack implementations for different languages may used
   * unshift or push to refer to adding an element to the stack, and this allow you to use either one
   * 
   * @return {Stack} - returns an immutable instance of a stack with the top element removed
   */
  shift() {
    return this.pop.apply(this, arguments);
  }
  
  /**
   * Returns itself if the stack is empty, otherwise it returns an empty immutable stack instance
   * 
   * @return {Stack} - returns an immutable instance of a stack with no elements in it
   */
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
    return emptyStack();
  }

  /**
   * returns a new stack instance from the begin index to the end index
   * 
   * @param {Integer} begin - start index of new stack
   * @param {Integer} end - end index of new stack
   * @returns {Stack} - the new immutable stack from the begin index to the end index
   */
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
    return makeStack(newSize, head);
  }

  // @pragma Mutability

  /**
   * Make sure the only things with the proper ownerID can access this object
   * 
   * @param {Integer} ownerID - ID of owner instance
   */
  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeStack(this.size, this._head, ownerID, this.__hash);
  }

  // @pragma Iteration

  /**
   * Iterate through all the elements of the stack in reverse order and apply function fn
   * to all of the elements
   * 
   * @param {(*) -> (None)} fn - function to apply to all the elements
   * @param {Stack} reverse - the stack you want to iterate through and apply changes to
   */
  __iterate(fn, reverse) {
    if (reverse) {
      return this.reverse().__iterate(fn);
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

  /**
   * Create an iterator object from the reversed stack
   * 
   * @param {*} type - type you want to set each of the elements to
   * @param {*} reverse - the stack you want to reverse and make an iterator out of
   * @returns {Iterator} - the reversed iterator for this stacks
   */
  __iterator(type, reverse) {
    if (reverse) {
      return this.reverse().__iterator(type);
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

/**
 * Takes in any parameter and returns whether it is an immutable stack object or not.
 * 
 * @param {*} maybeStack - item you want to check to see whether it matches stack type
 * @returns {Boolean} - true if the object is a stack object, false if it isn't
 */
function isStack(maybeStack) {
  return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
}

Stack.isStack = isStack;

// used to uniquely identify objects as immutable stack objects
var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

// Copies mandatory methods for ensuring immutability from the Map classes Prototype 
// (avoids reimplementation in the Stack class) since these methods are not needed in the
// parent class. 
var StackPrototype = Stack.prototype;
StackPrototype[IS_STACK_SENTINEL] = true;
StackPrototype.withMutations = MapPrototype.withMutations;
StackPrototype.asMutable = MapPrototype.asMutable;
StackPrototype.asImmutable = MapPrototype.asImmutable;
StackPrototype.wasAltered = MapPrototype.wasAltered;

/**
 * Create a stack instance using the stack prototype (instead of using the Javascript OOP approach)
 * 
 * @param {*} size - the maximum size you want to make the stack
 * @param {*} head - the element you want to put on top of the stack
 * @param {*} ownerID - the ID of the
 * @param {*} hash - 
 */
function makeStack(size, head, ownerID, hash) {
  var map = Object.create(StackPrototype);
  map.size = size;
  map._head = head;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}

var EMPTY_STACK;
/**
 * Public utility function to return an empty immutable stack instance.
 * if the EMPTY_STACK constant is set, it just returns that, otherwise it sets the constant and 
 * then returns it
 *
 * @returns {Stack} - an empty immutable stack instance.
 */
function emptyStack() {
  return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
}
