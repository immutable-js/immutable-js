/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * Additions copyright (c) 2020, Andi McClure.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DELETE,
  SHIFT,
  SIZE,
  MASK,
  OwnerID,
  MakeRef,
  SetRef,
  wrapIndex,
  wholeSlice,
  resolveBegin,
  resolveEnd,
} from './TrieUtils';
import { SetCollection } from './Collection';
import { hasIterator, Iterator, iteratorValue, iteratorDone } from './Iterator';
import { setIn } from './methods/setIn';
import { deleteIn } from './methods/deleteIn';
import { update } from './methods/update';
import { updateIn } from './methods/updateIn';
import { mergeIn } from './methods/mergeIn';
import { mergeDeepIn } from './methods/mergeDeepIn';
import { withMutations } from './methods/withMutations';
import { asMutable } from './methods/asMutable';
import { asImmutable } from './methods/asImmutable';
import { wasAltered } from './methods/wasAltered';
import assertNotInfinite from './utils/assertNotInfinite';

const DEBUGMAX = null; // = 4; // Temporarily use a max size of 4 in order to test code */
const identity = x => x;
const lt = (x,y) => x < y;
const NODEMAX = DEBUGMAX || (1 << SHIFT);
const NODEMID = NODEMAX / 2;

const IS_SORTED_LIST_SYMBOL      = '@@__IMMUTABLE_SORTED_LIST__@@';
const IS_SORTED_LIST_NODE_SYMBOL = '@@__IMMUTABLE_SORTED_LIST_NODE__@@';

// FIXME: This is an ES6 iterator, but immutable-js has its own iterator system.
class SortedListIterator {
  constructor(obj) {
    this.obj = obj;
    this.stack = []
    if (obj._root)
      this.stack.push({node:obj._root, index:0});
  }

  next() {
    while (this.stack.length > 0) {
      const stackLength = this.stack.length;
      const top = this.stack[stackLength-1];
      const array = top.node.array;
      if (top.index >= array.length) {
        this.stack.pop();
      } else {
        const value = array[top.index++];
        if (stackLength < this.obj._level) {
          this.stack.push({node:value, index:0})
        } else {
          return {value:value}
        }
      }
    }
    return {done:true}
  }
}

export function isSortedList(maybeList) {
  return Boolean(maybeList && maybeList[IS_SORTED_LIST_SYMBOL]);
}

// Invariants:
// - vnodes always contain at least one item
// - vnodes never contain more than NODEMAX (32) items
// - branch (non-leaf) vnodes always contain at least two items (THIS IS NOT A VALID ASSUMPTION)

export class SortedList extends SetCollection {
  // @pragma Construction

  constructor(value, keyFn, ltFn) {
    const empty = emptySortedList();
    if (value === null || value === undefined) {
      if (!keyFn && !ltFn)
        return empty;
      return makeSortedList(0,0,null,null,null,keyFn,ltFn);
    }
    if (isSortedList(value) && value._key == keyFn && value._lt == ltFn) {
      return value;
    }
    const iter = IndexedCollection(value);
    const size = iter.size;
    const typedEmpty = makeSortedList(0,0,null,null,null,keyFn,ltFn)
    if (size === 0) {
      if (!keyFn && !ltFn)
        return empty;
      return typedEmpty;
    }
    assertNotInfinite(size);
    return typedEmpty.withMutations(list => {
      iter.forEach((v) => list.add(v));
    });
  }

  static of(/*...values*/) {
    return this(arguments);
  }

  toString() {
    return this.__toString('SortedList [', ']');
  }

  _makeVnode(array) { // Note empty VNodes are not allowed
    return new VNode(array, this._key(array[0]), this._key(array[array.length-1]))
  }

  // Note: No attempt is made at sort stability
  add(value) {
    if (!this._root) {
      const root = this._makeVnode([value])
      return makeSortedList(1, 1, root, root, root, this._key, this._lt, this.__hash)
    }
    let maxLevel = this._level, head, tail;
    const key = this._key(value);
    const isMax = !this._lt(key, this._root.max); // Key is gte max of root. Will be inserted into current tail vnode
    const isMin = !isMax && !this._lt(this._root.min, key); // Key is lte min of root. Will be inserted into current head vnode
    const stack = [{ // : {node:VNode, isMin?:boolean, isMax?:boolean, index?:number}
      node:this._root,
      isMin:isMin, // Mark no searching needed
      isMax:isMax  // Mark no searching needed
    }];
    let descendMin = true, descendMax = true; // True if we have taken only min/max descents
    // First descend into the tree and find the insertion point
    for(let level = 0;; level++) {
      const top = stack[stack.length-1];
      const array = top.node.array
      if (level < maxLevel - 1) { // Branch nodes
        if (top.isMax) { // Pass through a previously figured out isMax (bias high)
          const index = array.length-1;
          top.index = index;
          stack.push({node:array[index], isMax:true})
          if (array.length > 1)
            descendMin = false;
        } else if (top.isMin) { // Pass through a previously figured out isMin
          top.index = 0;
          stack.push({node:array[0], isMin:true});
          if (array.length > 1)
            descendMax = false;
        } else { // Binary search within node to find best index
          let maxIndex = array.length-1;
          let minIndex = 0; // Target node is currently known to be somewhere between minIndex and maxIndex inclusive
          let isMax = false;

          if (!this._lt(key, array[maxIndex].min)) { // Key is gte min of array[maxIndex]
            minIndex = maxIndex; // Key is inside array[maxIndex]
          } else if (this._lt(array[0].max, key)) { // Skip search if key lte max of array[0] (is inside array[0])
            // Target node is now known to be somewhere between minIndex and maxIndex exclusive. We narrow the
            // range until either we happen on the cell containing key, or minIndex and maxIndex are exactly
            // 1 apart (in which case we've proven the key is in the gap between minIndex and maxIndex, at which
            // point we arbitrarily choose to descend into minIndex so we can add at the end of an array).
            isMax = true; // Assume this ends with "exactly 1 apart"
            while (minIndex < maxIndex - 1) {
              let searchIndex = Math.ceil((minIndex+maxIndex)/2)
              let searchNode = array[searchIndex]
              if (this._lt(key, searchNode.min)) {
                maxIndex = searchIndex; // Target node now known to be between minIndex and searchIndex exclusive
              } else if (this._lt(searchNode.max, key)) {
                minIndex = searchIndex; // Target node now known to be between searchIndex and maxIndex exclusive
              } else { // It's gte searchNode min and lte searchNode max, so... it's inside searchNode. Cutoff search
                minIndex = searchIndex;
                isMax = false; // Guess we aren't hitting "exactly 1 apart" after all
                break;
              }
            }
          }

          top.index = minIndex; // Descend into min index so if we're adding "between" we still add at end of array
          
          if (descendMin && minIndex != 0)
            descendMin = false;
          if (descendMax && minIndex != array.length-1)
            descendMax = false;

          let isMin = false;
          if (!isMax) {
            if (minIndex == 0 && !this._lt(array[0].min, key)) {
              isMin = true;
            } else if ((minIndex == array.length-1) && !this._lt(key, array[minIndex].max)) {
              isMax = true;
            }
          }
          stack.push({node:array[minIndex], isMax:isMax, isMin:isMin})
        }
      } else { // We are now looking at a leaf node, and "stack" contains a complete route from the root to the leaf.
        const leafOverflow = array.length >= NODEMAX; // If leaf array is full we must split one or more nodes
        let leafNode;      // Leaf array we will be searching
        let lastNode;      // What is the last singular node we created?
        let lastNodeLevel; // At what level was the last singular node we created?
        let checkHeadTail = false; // Set true if the leaf node has a chance to change head/tail.

        let lastLeft, lastRight;

        // First we need to find or create the true leaf node.
        if (!leafOverflow) { // It's either the leaf we were already looking at
          leafNode = top.node;
        } else { // Or else we have to create it by splitting
          lastLeft = new VNode(array.slice(0,NODEMID), top.node.min, this._key(array[NODEMID-1]));
          lastRight = new VNode(array.slice(NODEMID), this._key(array[NODEMID]), top.node.max);
          
          const branchLeft = this._lt(key, lastRight.min)
          leafNode = // Which of the two new nodes will we insert value into below?
            branchLeft ? lastLeft : lastRight;
          if (branchLeft) { // The split may have broken isMax/isMin.
            top.isMax = !this._lt(key, lastLeft.max) // key gte max of lastLeft
          } else {
            top.isMin = !this._lt(lastRight.min, key) // key lte min of lastRight
          }

          // Head/tail can change when a leaf node splits
          if (stack.length <= 1) { // We split single node into a head and a tail
            head = lastLeft;
            tail = lastRight;
          } else { // The head or tail MAY or MAY NOT have changed.
            if (descendMin) {
              head = lastLeft;
            } else if (descendMax) {
              tail = lastRight;
            }
          }
        }

        // Now we know what node is the leaf node, figure out what index to insert into the leaf at
        let minIndex = 0;
        let maxIndex = leafNode.array.length-1;
        let maxKey = this._key(leafNode.array[maxIndex])
        let minKey = this._key(leafNode.array[0])
        if (top.isMax) { // We are off the bottom or equal to bottom
          maxIndex = minIndex = maxIndex + 1;
        } else if (top.isMin) { // We are off the top or equal to top
          maxIndex = 0;
        } else { // Target node is somewhere between minIndex and maxIndex exclusive
          // We binary search until maxIndex is gte the key, minIndex is lt the key, and maxIndex-minIndex=1
          while (minIndex < maxIndex - 1) {
            let searchIndex = Math.ceil((minIndex+maxIndex)/2)
            let searchKey = this._key(leafNode.array[searchIndex])
            if (this._lt(key, searchKey)) {
              maxIndex = searchIndex; // Target index is somewhere between minIndex and searchIndex exclusive
            } else {
              minIndex = searchIndex; // Target index is somewhere between minIndex and searchIndex exclusive
            }
          }
        }

        // The search inside the leaf ends with maxIndex as the insert index:
        if (!leafOverflow) {
          lastNode = vnodeInsert(leafNode, maxIndex, value, key, key);
          lastNodeLevel = level;

          if (stack.length == 1) { // Assume a node can only be head AND tail if it's the root. Keeping this true requires special casing in shift/pop
            head = tail = lastNode;
          } else if (descendMin) {
            head = lastNode;
          } else if (descendMax) {
            tail = lastNode;
          }
        } else { // In the overflow case we own the only reference to (created) the node and can mutate it
          vnodeMutateInsert(leafNode, maxIndex, value, key, key);

          // The leaf is now dealt with, but since we're in the overflow path we have to handle splits.
          // We split the node above into lastLeft and lastRight. Now we need to put them in the tree, 
          // but that may trigger more splits. Walk backward up the tree until there are no more splits:
          for(lastNodeLevel = level-1; lastNodeLevel >= 0; lastNodeLevel--) {
            const top = stack[lastNodeLevel];
            let node = top.node;
            let index = top.index;
            const overflow = node.array.length >= NODEMAX;
            const left = lastLeft, right = lastRight;
            if (!overflow) { // Room for 1 more node. Do an insert of the left node:
              node = vnodeInsert(node, index, left);
            } else { // Need to do at least one more level of split:
              lastLeft = new VNode(node.array.slice(0,NODEMID), node.min, node.array[NODEMID-1].max);
              lastRight = new VNode(node.array.slice(NODEMID), node.array[NODEMID].min, node.max);
              if (index < NODEMID) {
                node = lastLeft;
              } else {
                index -= NODEMID;
                node = lastRight;
              }
              vnodeMutateInsert(node, index, left); // Since we created this node, we can mutate it
            }
            vnodeMutateReplace(node, index+1, right); // The index we previously found has been moved over one by the insert
            if (!overflow) { // We are done splitting and can pass lastNode/lastNodeLevel to the final step
              lastNode = node;
              break;
            }
          }
          if (lastNodeLevel < 0) { // We split the entire tree, so we need to make a new root node.
            lastNode = new VNode([lastLeft, lastRight], lastLeft.min, lastRight.max);
            maxLevel++;
          }
        }

        // The leaf and the splits are dealt with, now it's just the rest of the tree. Walk backward
        // up the tree from just above our leaf (or, from just above the highest split point) to the root
        for(lastNodeLevel--; lastNodeLevel >= 0; lastNodeLevel--) {
          const top = stack[lastNodeLevel];

          lastNode = vnodeReplace(top.node, top.index, lastNode);
        }

        // We've walked all the way up to the top now, so lastNode is new root.
        return makeSortedList(this.size+1, maxLevel, lastNode, head || this._head, tail || this._tail,
                              this._key, this._lt, this.__hash);
      }
    }
  }

  clear() {
    if (this.size === 0) {
      return this;
    }
    return makeSortedList(0, 0, null, null, null,
                          this._key, this._lt, this.__hash);
  }

  // Query least
  first(notSetValue) {
    if (this.size == 0) {
      return notSetValue;
    }
    return this._head.array[0]
  }

  // Query greatest
  last(notSetValue) {
    if (this.size == 0) {
      return notSetValue;
    }
    const tailArray = this._tail.array;
    return tailArray[tailArray.length-1]
  }

  shift() { // Remove least
    if (this.size == 0) {
      throw new Error("Shifting from empty collection")
    }
    if (this.size == 1) {
      return this.clear();
    }
    const stack = [this._root] // Stack of nodes
    const maxLevel = this._level; // Original level count
    let levelAdjust = 0; // Number of levels we've shaved off in this pop
    // First just make a list of "leftmost" nodes.
    for(let level = 0; level < maxLevel-1; level++) {
      const node = stack[level];
      const array = node.array;
      stack.push(array[0]);
    }
    let lastNode; // Last created node
    let min, head;
    // Special behavior for the leftmost leaf node
    {
      const node = stack.pop();
      const nodeArray = node.array;
      if (nodeArray.length > 1) {
        const array = nodeArray.slice(1);
        min = this._key(array[0]); // This is the only situation where a new min must be calculated
        head = lastNode = new VNode(array, min, node.max);
      }
    }
    if (!lastNode) { // Leftmost leaf node has been erased completely!
      while (stack.length > 0) { // Walk up the stack until we find a node long enough to survive:
        const node = stack.pop();
        const nodeArray = node.array;
        const arrayLength = nodeArray.length;
        if (stack.length == 0 && arrayLength <= 2) { // We hit the top of the tree, and the root only has one child!
          lastNode = nodeArray[arrayLength-1]; // Make that child the new root. // FIXME could this index be hardcoded to 1?
          min = lastNode.min;
          levelAdjust++;
        } else if (arrayLength > 1) { // Expected case: We found a suitable node
          const array = nodeArray.slice(1); // Mark we removed the leaf node (and maybe some parent branches)
          min = array[0].min;
          lastNode = new VNode(array, min, node.max);
          break;
        }
      }
      // Now that we've walked up to find a node that survives, we need to walk back *down* again...
      head = lastNode;
      const walkLength = maxLevel - stack.length - 1 - levelAdjust;
      for (let level = 0; level < walkLength; level++) {
        head = head.array[0]; // ...to find the new tail.
      }
    }
    // We're now done deleting content and just need to walk up to the root marking our changes.
    while (stack.length > 0) {
      const node = stack.pop();
      lastNode = vnodeReplace(node, 0, lastNode, min);
    }
    // Last ditch, rare check: Did we just accidentally create a root branch node with exactly one element?
    // This can happen when mixing shifts and pops, and it must be checked for to prevent a bug with setting head/tail
    while (lastNode.array.length == 1 && levelAdjust < maxLevel-1) {
      lastNode = lastNode.array[0];
      levelAdjust++;
    }
    // Laster ditch, rarer check: Did we just accidentally create a root branch node whose children have one element each?
    // This can happen when mixing shifts and pops, and there is no reason to avoid it other than performance.
    while (lastNode.array.length == 2 && levelAdjust < maxLevel-2 &&
           lastNode.array[0].array.length == 1 && lastNode.array[1].array.length == 1) {
      lastNode = new VNode([lastNode.array[0].array[0], lastNode.array[1].array[0]], lastNode.min, lastNode.max)
      levelAdjust++;
    }

    return makeSortedList(this.size-1, maxLevel - levelAdjust, lastNode,
                          head, maxLevel-levelAdjust == 1 ? lastNode : this._tail,
                          this._key, this._lt, this.__hash);
  }

  // Note code is substantially similar to shift but using array-last members, tails and maxes
  pop() { // Remove greatest
    if (this.size == 0) {
      throw new Error("Popping from empty collection")
    }
    if (this.size == 1) {
      return this.clear();
    }
    const stack = [this._root] // Stack of nodes
    const maxLevel = this._level; // Original level count
    let levelAdjust = 0; // Number of levels we've shaved off in this pop
    // First just make a list of "rightmost" nodes.
    for(let level = 0; level < maxLevel-1; level++) {
      const node = stack[level];
      const array = node.array;
      stack.push(array[array.length-1]);
    }
    let lastNode; // Last created node
    let max, tail;
    // Special behavior for the rightmost leaf node
    {
      const node = stack.pop();
      const nodeArray = node.array;
      if (nodeArray.length > 1) {
        const array = nodeArray.slice(0,-1);
        max = this._key(array[array.length-1]); // This is the only situation where a max must be calculated
        tail = lastNode = new VNode(array, node.min, max);
      }
    }
    if (!lastNode) { // Rightmost leaf node has been erased completely!
      while (stack.length > 0) { // Walk up the stack until we find a node long enough to survive:
        const node = stack.pop();
        const nodeArray = node.array;
        const arrayLength = nodeArray.length;
        if (stack.length == 0 && arrayLength <= 2) { // We hit the top of the tree, and the root only has one child!
          lastNode = node.array[0]; // Make that child the new root.
          max = lastNode.max;
          levelAdjust++;
        } else if (arrayLength > 1) { // Expected case: We found a suitable node
          const array = nodeArray.slice(0,-1); // Mark we removed the leaf node (and maybe some parent branches)
          max = array[array.length-1].max;
          lastNode = new VNode(array, node.min, max);
          break;
        }
      }
      // Now that we've walked up to find a node that survives, we need to walk back *down* again...
      tail = lastNode;
      const walkLength = maxLevel - stack.length - 1 - levelAdjust;
      for (let level = 0; level < walkLength; level++) {
        const array = tail.array;
        tail = array[array.length-1]; // ...to find the new tail.
      }
    }
    // We're now done deleting content and just need to walk up to the root marking our changes.
    while (stack.length > 0) {
      const node = stack.pop();
      lastNode = vnodeReplace(node, node.array.length-1, lastNode, null, max);
    }
    // Last ditch, rare check: Did we just accidentally create a root branch node with exactly one element?
    // This can happen when mixing shifts and pops, and it must be checked for to prevent a bug with setting head/tail
    while (lastNode.array.length == 1 && levelAdjust < maxLevel-1) {
      lastNode = lastNode.array[0];
      levelAdjust++;
    }
    // Laster ditch, rarer check: Did we just accidentally create a root branch node whose children have one element each?
    // This can happen when mixing shifts and pops, and there is no reason to avoid it other than performance.
    while (lastNode.array.length == 2 && levelAdjust < maxLevel-2 &&
           lastNode.array[0].array.length == 1 && lastNode.array[1].array.length == 1) {
      lastNode = new VNode([lastNode.array[0].array[0], lastNode.array[1].array[0]], lastNode.min, lastNode.max)
      levelAdjust++;
    }

    return makeSortedList(this.size-1, maxLevel - levelAdjust, lastNode,
                          maxLevel-levelAdjust == 1 ? lastNode : this._head, tail,
                          this._key, this._lt, this.__hash);
  }

  // @pragma Composition

  concat(/*...collections*/) {
    const seqs = [];
    for (let i = 0; i < arguments.length; i++) {
      const argument = arguments[i];
      const seq = IndexedCollection(
        typeof argument !== 'string' && hasIterator(argument)
          ? argument
          : [argument]
      );
      if (seq.size !== 0) {
        seqs.push(seq);
      }
    }
    if (seqs.length === 0) {
      return this;
    }
    if (this.size === 0 && !this.__ownerID && seqs.length === 1) {
      return this.constructor(seqs[0]);
    }
    return this.withMutations(list => {
      seqs.forEach(seq => seq.forEach(value => list.push(value)));
    });
  }

  setSize(size) {
    return setListBounds(this, 0, size);
  }

  map(mapper, context) {
    return this.withMutations(list => {
      for (let i = 0; i < this.size; i++) {
        list.set(i, mapper.call(context, list.get(i), i, list));
      }
    });
  }

  // @pragma Iteration

  slice(begin, end) {
    const size = this.size;
    if (wholeSlice(begin, end, size)) {
      return this;
    }
    return setListBounds(
      this,
      resolveBegin(begin, size),
      resolveEnd(end, size)
    );
  }

  __iterator(type, reverse) {
    let index = reverse ? this.size : 0;
    const values = iterateList(this, reverse);
    return new Iterator(() => {
      const value = values();
      return value === DONE
        ? iteratorDone()
        : iteratorValue(type, reverse ? --index : index++, value);
    });
  }

  __iterate(fn, reverse) {
    let index = reverse ? this.size : 0;
    const values = iterateList(this, reverse);
    let value;
    while ((value = values()) !== DONE) {
      if (fn(value, reverse ? --index : index++, this) === false) {
        break;
      }
    }
    return index;
  }
}

SortedList.isSortedList = isSortedList;

export const SortedListPrototype = SortedList.prototype;
SortedListPrototype[IS_SORTED_LIST_SYMBOL] = true;
SortedListPrototype[DELETE] = SortedListPrototype.remove;
SortedListPrototype.merge = SortedListPrototype.concat;
SortedListPrototype.setIn = setIn;
SortedListPrototype.deleteIn = SortedListPrototype.removeIn = deleteIn;
SortedListPrototype.update = update;
SortedListPrototype.updateIn = updateIn;
SortedListPrototype.mergeIn = mergeIn;
SortedListPrototype.mergeDeepIn = mergeDeepIn;
SortedListPrototype.withMutations = withMutations;
SortedListPrototype.wasAltered = wasAltered;
SortedListPrototype.asImmutable = asImmutable;
SortedListPrototype['@@transducer/init'] = SortedListPrototype.asMutable = asMutable;
SortedListPrototype['@@transducer/step'] = function (result, arr) {
  return result.push(arr);
};
SortedListPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};
SortedListPrototype[Symbol.iterator] = function () {
  return new SortedListIterator(this);
}

class VNode {
  constructor(array, min, max) {
    this.array = array;
    this.min = min;
    this.max = max;
  }
}
VNode.prototype[IS_SORTED_LIST_NODE_SYMBOL] = true

function vnodeReplace(node, index, value, minKey, maxKey) { // key optional if value is node
  const array = [...node.array]; // Copy array
  array[index] = value;          // Replace index value
  const min = index == 0 ? (minKey != null ? minKey : value.min) : node.min; // Adjust edges
  const max = index == array.length-1 ? (maxKey != null ? maxKey : value.max) : node.max;
  return new VNode(array, min, max)
}

function vnodeInsert(node, index, value, minKey, maxKey) { // key optional if value is node
  const oldArray = node.array;
  const array = [...oldArray.slice(0,index), value, ...oldArray.slice(index)]
  const min = index == 0 ? (minKey != null ? minKey : value.min) : node.min;
  const max = index == oldArray.length ? (maxKey != null ? maxKey : value.max) : node.max;
  return new VNode(array, min, max)
}

function vnodeMutateReplace(node, index, value, minKey, maxKey) { // key optional if value is node
  node.array[index] = value;
  if (index == 0)
    node.min = (minKey != null ? minKey : value.min);
  if (index == node.array.length-1)
    node.max = (maxKey != null ? maxKey : value.max);
}

function vnodeMutateInsert(node, index, value, minKey, maxKey) { // key optional if value is node
  node.array.splice(index, 0, value);

  if (index == 0)
    node.min = (minKey != null ? minKey : value.min);
  if (index == node.array.length-1)
    node.max = (maxKey != null ? maxKey : value.max);
}

function makeSortedList(size, level, root, head, tail, keyFn, ltFn, hash) {
  const list = Object.create(SortedListPrototype);
  list.size = size;
  list._level = level;
  list._root = root;
  list._head = head;
  list._tail = tail;
  list._key = keyFn || identity;
  list._lt = ltFn || lt;
  list.__hash = hash; // ENTIRELY UNCLEAR WHAT THIS DOES-- TODO-ANDI
  list.__altered = false;
  return list;
}

let EMPTY_SORTED_LIST;
export function emptySortedList() {
  return EMPTY_SORTED_LIST || (EMPTY_SORTED_LIST = makeSortedList(0, 0));
}
