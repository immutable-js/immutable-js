/**
 *  Copyright (c) 2017, Applitopia, Inc.
 *
 *  Modified source code is licensed under the MIT-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * Original source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-else-return */

import { NOT_SET, MakeRef, SetRef, GetRef } from './TrieUtils';
import { Iterator, iteratorValue, iteratorDone } from './Iterator';
import {
  SortedMapNode,
  SortedMapPacker,
  SortedMapNodeFactory,
} from './SortedMapNode';
import { KeyedCollection } from './Collection';
import assertNotInfinite from './utils/assertNotInfinite';

const DEFAULT_TYPE = 'btree';
const DEFAULT_BTREE_ORDER = 33;

// #pragma Trie Nodes

class SortedMapBtreeNode extends SortedMapNode {
  constructor(comparator, options, ownerID, entries, nodes) {
    super(comparator, options, ownerID);

    this.entries = entries;
    this.nodes = nodes;

    this.btreeOrder =
      options && options.btreeOrder ? options.btreeOrder : DEFAULT_BTREE_ORDER;
    this.btreeNodeSplitSize = Math.floor((this.btreeOrder - 1) / 2);

    this._calcSize();
    return this;
  }

  _calcSize() {
    this.size = 0;
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i][1] !== NOT_SET) {
        this.size++;
      }
    }
    if (this.nodes) {
      for (let i = 0; i < this.nodes.length; i++) {
        this.size += this.nodes[i].size;
      }
    }
  }

  getComparator() {
    return this.comparator;
  }

  get(key, notSetValue) {
    const entries = this.entries;
    const didMatch = MakeRef();
    const idx = binarySearch(this.comparator, entries, key, didMatch);
    if (GetRef(didMatch)) {
      const value = entries[idx][1];
      return value === NOT_SET ? notSetValue : value;
    }

    const nodes = this.nodes;
    if (nodes) {
      const value = nodes[idx].get(key, notSetValue);
      return value === NOT_SET ? notSetValue : value;
    }
    return notSetValue;
  }

  entryAt(index) {
    const didMatch = MakeRef();
    const subIndex = MakeRef();
    const idx = this.indexSearch(index, didMatch, subIndex);
    if (GetRef(didMatch)) {
      const entry = this.entries[idx];
      const key = entry[0];
      const value = entry[1];
      return [key, value];
    }

    return this.nodes[idx].entryAt(subIndex.value);
  }

  keyAt(index) {
    const didMatch = MakeRef();
    const subIndex = MakeRef();
    const idx = this.indexSearch(index, didMatch, subIndex);
    if (GetRef(didMatch)) {
      const entry = this.entries[idx];
      const key = entry[0];
      return key;
    }

    return this.nodes[idx].keyAt(subIndex.value);
  }

  valueAt(index) {
    const didMatch = MakeRef();
    const subIndex = MakeRef();
    const idx = this.indexSearch(index, didMatch, subIndex);
    if (GetRef(didMatch)) {
      const entry = this.entries[idx];
      const value = entry[1];
      return value;
    }

    return this.nodes[idx].valueAt(subIndex.value);
  }

  // Returns first key in this subtree
  firstKey() {
    const nodes = this.nodes;
    if (nodes) {
      return nodes[0].firstKey();
    }

    const entries = this.entries;
    return entries[0][0];
  }

  // Returns last key in this subtree
  lastKey() {
    const nodes = this.nodes;
    if (nodes) {
      return nodes[nodes.length - 1].lastKey();
    }

    const entries = this.entries;
    return entries[entries.length - 1][0];
  }

  upsert(ownerID, key, value, didChangeSize, didAlter, outKvn) {
    const ret = this._upsert(
      ownerID,
      key,
      value,
      didChangeSize,
      didAlter,
      outKvn
    );

    if (this === ret && GetRef(didChangeSize)) {
      this.size++;
    }

    return ret;
  }

  //
  // outKvn is out array with values [[key, value], node] i.e. [entry, node]
  // which can be consumed or returned by this operation
  //
  _upsert(ownerID, key, value, didChangeSize, didAlter, outKvn) {
    if (!outKvn) {
      // This must be a root case called from SortedMap
      const subKvn = [];

      let newRoot = this.upsert(
        ownerID,
        key,
        value,
        didChangeSize,
        didAlter,
        subKvn
      );

      if (subKvn[0]) {
        // Make a new root node
        const entries = [subKvn[0]];
        const nodes = [newRoot, subKvn[1]];
        newRoot = new SortedMapBtreeNode(
          this.comparator,
          this.options,
          ownerID,
          entries,
          nodes
        );
      }

      return newRoot;
    }

    const entries = this.entries;

    // Search keys
    const didMatch = MakeRef();
    const idx = binarySearch(this.comparator, entries, key, didMatch);
    const exists = GetRef(didMatch);

    const nodes = this.nodes;
    const canEdit = ownerID && ownerID === this.ownerID;
    let newEntries;
    let newNodes;

    if (exists) {
      // Updating entries

      if (entries[idx][1] === value) {
        //
        // OPERATION: NONE, same value, no need to update
        //
        return this;
      } else {
        //
        // OPERATION: UPDATE entry value in entries
        //
        const entry = [key, value];

        SetRef(didAlter);
        // Updating previously REMOVED ENTRY
        if (entries[idx][1] === NOT_SET) {
          SetRef(didChangeSize);
        }
        newEntries = setIn(entries, idx, entry, canEdit);
        newNodes = clone(nodes, canEdit);
      }
    } else {
      // Inserting into entries or upserting nodes

      // eslint-disable-next-line no-lonely-if
      if (nodes) {
        //
        // RECURSIVE: UPSERT node recursively
        //
        const subKvn = [];

        const updatedNode = nodes[idx].upsert(
          ownerID,
          key,
          value,
          didChangeSize,
          didAlter,
          subKvn
        );

        if (GetRef(didAlter)) {
          if (subKvn[0]) {
            //
            // Insert subKvn into this node
            //
            if (entries.length >= this.btreeOrder - 1) {
              return this.splitNode(
                idx,
                updatedNode,
                subKvn,
                outKvn,
                ownerID,
                canEdit
              );
            } else {
              //
              // Insert subKvn into entries and nodes
              //
              newEntries = spliceIn(entries, idx, subKvn[0], canEdit);
              newNodes = spliceIn(nodes, idx + 1, subKvn[1], canEdit);
              newNodes[idx] = updatedNode;
            }
          } else {
            //
            // No splitting, just setIn the updated subNode
            //
            newEntries = clone(entries, canEdit);
            newNodes = setIn(nodes, idx, updatedNode, canEdit);
          }
        } else {
          // Nothing changed
          return this;
        }
      } else {
        // Leaf node
        // Insert new entry into entries
        const entry = [key, value];

        SetRef(didAlter);
        SetRef(didChangeSize);

        if (entries.length >= this.btreeOrder - 1) {
          return this.splitLeaf(idx, entry, outKvn, ownerID, canEdit);
        } else {
          //
          // OPERATION: INSERT new entry into entries
          //
          newEntries = spliceIn(entries, idx, entry, canEdit);
        }
      }
    }

    return this.makeNewNode(newEntries, newNodes, ownerID, canEdit);
  }

  fastRemove(ownerID, key, didChangeSize, didAlter) {
    const ret = this._fastRemove(ownerID, key, didChangeSize, didAlter);

    if (this === ret && GetRef(didChangeSize)) {
      this.size--;
    }

    return ret;
  }

  // this version of remove doesn't do any rebalancing
  // it just sets the value in an entry to NOT_SET
  // this method would be preferable when removing large bulk
  // of entres from mutable SortedMap followed by pack()
  _fastRemove(ownerID, key, didChangeSize, didAlter) {
    const entries = this.entries;

    // Search keys
    const didMatch = MakeRef();
    const idx = binarySearch(this.comparator, entries, key, didMatch);
    const exists = GetRef(didMatch);

    const nodes = this.nodes;
    const canEdit = ownerID && ownerID === this.ownerID;
    let newEntries;
    let newNodes;

    if (exists) {
      // Remove entry from entries
      if (entries[idx][1] === NOT_SET) {
        // the entry has been technically deleted already
        return this;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      const newEntry = [key, NOT_SET];
      newEntries = setIn(entries, idx, newEntry, canEdit);
      newNodes = clone(nodes, canEdit);
    } else {
      // Remove from node

      // eslint-disable-next-line no-lonely-if
      if (nodes) {
        // RECURSIVE: REMOVE from node recursively
        const updatedNode = nodes[idx].fastRemove(
          ownerID,
          key,
          didChangeSize,
          didAlter
        );

        if (GetRef(didAlter)) {
          //
          // No splitting, just setIn the updated subNode
          //
          newEntries = clone(entries, canEdit);
          newNodes = setIn(nodes, idx, updatedNode, canEdit);
        } else {
          // Nothing changed
          return this;
        }
      } else {
        // OPERATION: NONE, key to be removed doesn't exist
        return this;
      }
    }

    return this.makeNewNode(newEntries, newNodes, ownerID, canEdit);
  }

  remove(ownerID, key, didChangeSize, didAlter, parent, parentIdx, outKvn) {
    const ret = this._remove(
      ownerID,
      key,
      didChangeSize,
      didAlter,
      parent,
      parentIdx,
      outKvn
    );

    if (this === ret && GetRef(didChangeSize)) {
      this.size--;
    }

    return ret;
  }

  //
  // outKvn is an output array with the following format
  //
  // [updatedEntry, updatedNode, updatedNodeIsLeft: boolean]
  //
  // The returned values can be:
  // - undefined - means the referenced item didn't change
  // - NOT_SET - means the referenced node was merged and has to be removed
  // - any other - the referenced item has to be updated with this value
  // outKvn[2] is boolean value indicating if node referenced in outKvnp[1]
  // is left (true) or right (false)
  //
  _remove(ownerID, key, didChangeSize, didAlter, parent, parentIdx, outKvn) {
    const entries = this.entries;

    // Search keys
    const didMatch = MakeRef();
    const idx = binarySearch(this.comparator, entries, key, didMatch);
    const exists = GetRef(didMatch);

    const nodes = this.nodes;
    const canEdit = ownerID && ownerID === this.ownerID;
    let newEntries;
    let newNodes;

    if (exists) {
      // Remove entry from entries
      if (nodes) {
        // OPERATION: MOVE some entries from neighbors or MERGE with a neighbor
        if (entries[idx][1] === NOT_SET) {
          // the entry has been technically deleted already
          return this;
        }
        // WORKAROUND: so far let's do the workaround and just update
        // the entry in place with NOT_SET
        SetRef(didAlter);
        SetRef(didChangeSize);
        const newEntry = [key, NOT_SET];
        newEntries = setIn(entries, idx, newEntry, canEdit);
        newNodes = clone(nodes, canEdit);
      } else {
        //
        // OPERATION: REMOVE entry from the LEAF
        //
        if (entries[idx][1] === NOT_SET) {
          // the entry has been technically deleted already
          return this;
        }
        SetRef(didAlter);
        SetRef(didChangeSize);
        if (entries.length <= this.btreeNodeSplitSize && parent) {
          // we don't have enough items in this leaf to just remove the entry
          // we should try borrow an entry from a neighbour or merge this mode with a neighbour
          // as a workaround we can just update a value in the entry to NOT_SET
          return this.consolidateLeaf(
            ownerID,
            idx,
            parent,
            parentIdx,
            canEdit,
            outKvn
          );
        }
        // it's ok to physically remove from the LEAF and no moves are needed
        // as the node will meet all the consistency rules
        newEntries = spliceOut(entries, idx, canEdit);
      }
    } else {
      // Remove from node

      // eslint-disable-next-line no-lonely-if
      if (nodes) {
        // RECURSIVE: REMOVE from node recursively
        const subKvn = [undefined, undefined, undefined];
        const updatedNode = nodes[idx].remove(
          ownerID,
          key,
          didChangeSize,
          didAlter,
          this,
          idx,
          subKvn
        );

        if (GetRef(didAlter)) {
          // take care of subKvn
          return this.spliceNode(
            ownerID,
            idx,
            updatedNode,
            parent,
            parentIdx,
            canEdit,
            subKvn,
            outKvn
          );
        } else {
          // Nothing changed
          return this;
        }
      } else {
        // OPERATION: NONE, key to be removed doesn't exist in this map
        return this;
      }
    }

    return this.makeNewNode(newEntries, newNodes, ownerID, canEdit);
  }

  makeNewNode(newEntries, newNodes, ownerID, canEdit) {
    if (newEntries.length === 0) {
      if (newNodes) {
        // Root node is turning into a leaf
        return newNodes[0];
      } else {
        // Root node leaf is turning into empty
        return;
      }
    }

    if (canEdit) {
      this.entries = newEntries;
      this.nodes = newNodes;
      this._calcSize();
      return this;
    }
    return new SortedMapBtreeNode(
      this.comparator,
      this.options,
      ownerID,
      newEntries,
      newNodes
    );
  }

  print(level, maxDepth) {
    function w(s) {
      process.stdout.write(s);
    }

    if (maxDepth && level >= maxDepth) {
      return;
    }

    const nodes = this.nodes;
    const entries = this.entries;

    w(indent(level));
    w('SIZE=' + this.size + '\n');
    if (nodes) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        w(indent(level));
        if (!node || !(node instanceof SortedMapNode)) {
          w(
            '+ CORRUPT NODE[' +
              i +
              '] (L' +
              level +
              ') ' +
              JSON.stringify(node) +
              '\n'
          );
        } else {
          if (node.nodes) {
            w('+ NODE[' + i + '] (L' + level + ')\n');
          } else {
            w('+ LEAF[' + i + '] (L' + level + ')\n');
          }
          node.print(level + 1, maxDepth);
        }
        if (i < entries.length) {
          w(indent(level));
          const entry = entries[i];
          if (!entry) {
            w('- CORRUPT ENTRY[' + i + ']: ' + JSON.stringify(entry) + '\n');
          } else if (entry[1] === NOT_SET) {
            w('- REMOVED ENTRY[' + i + ']: ' + JSON.stringify(entry[0]) + '\n');
          } else {
            w('- ENTRY[' + i + ']: ' + JSON.stringify(entry[0]) + '\n');
          }
        }
      }
    } else {
      for (let i = 0; i < entries.length; i++) {
        w(indent(level));
        const entry = entries[i];
        if (!entry) {
          w('- CORRUPT ENTRY[' + i + ']: ' + JSON.stringify(entry) + '\n');
        } else if (entry[1] === NOT_SET) {
          w('- REMOVED ENTRY[' + i + ']: ' + JSON.stringify(entry[0]) + '\n');
        } else {
          w('- ENTRY[' + i + ']: ' + JSON.stringify(entry[0]) + '\n');
        }
      }
    }
  }

  checkConsistency(printFlag, level, n, leafLevel) {
    function w(f) {
      if (printFlag) {
        const s = f();
        if (s !== undefined) {
          process.stdout.write(indent(level));
          process.stdout.write(s);
        }
      }
    }

    if (!level) {
      level = 0;
    }
    if (!n) {
      n = 0;
    }
    if (!leafLevel) {
      leafLevel = [undefined];
    }

    if (this.nodes) {
      w(() => '+ Checking NODE[' + n + '] (L' + level + ')\n');
    } else {
      w(() => '+ Checking LEAF[' + n + '] (L' + level + ')\n');
      if (leafLevel[0] === undefined) {
        leafLevel[0] = level;
      } else if (leafLevel[0] !== level) {
        failed(112, 'leaves are not on the same level');
      }
    }

    function failed(code, msg) {
      const s = 'Consistency Check Failed with error code ' + code + ': ' + msg;
      if (printFlag) {
        w(() => s + '\n');
        return code;
      }

      throw new Error(s);
    }

    const entries = this.entries;
    const nodes = this.nodes;

    if (!entries) {
      return failed(101, 'empty entries in a node');
    }

    if (!(entries.length > 0 && entries.length < this.btreeOrder)) {
      return failed(
        102,
        'entries length is out of range from 0 to (btreeOrder-1)'
      );
    }

    if (level > 0 && !(this.btreeNodeSplitSize <= entries.length)) {
      return failed(103, 'entries length is shorter than btreeNodeSplitSize');
    }

    if (nodes && !(nodes.length === entries.length + 1)) {
      return failed(104, 'nodes length out of sync with entries length');
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (!entry) return failed(105, 'empty entry');

      if (!(typeof entry === 'object' && entry instanceof Array))
        return failed(106, 'entry is not Array');

      if (!(entry.length === 2)) return failed(107, 'entry is not Array[2]');

      if (entry[1] === NOT_SET) {
        w(
          () =>
            '    - Checking REMOVED ENTRY[' +
            i +
            ']: ' +
            JSON.stringify(entry[0]) +
            '\n'
        );
        if (!nodes) {
          failed(113, 'NOT_SET values are not allowed in leaves');
        }
      } else {
        w(
          () =>
            '    - Checking ENTRY[' +
            i +
            ']: ' +
            JSON.stringify(entry[0]) +
            '\n'
        );
      }
    }

    // Check if all the keys are sorted
    for (let i = 0; i < entries.length - 1; i++) {
      if (!(this.comparator(entries[i][0], entries[i + 1][0]) < 0)) {
        return failed(108, 'the entries are not sorted');
      }
    }

    if (nodes)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!node || !(node instanceof SortedMapNode))
          return failed(109, 'empty or corrupt node');

        // Check the node recursively
        const code = node.checkConsistency(printFlag, level + 1, i, leafLevel);

        if (code !== 0) {
          return code;
        }

        if (
          i > 0 &&
          !(this.comparator(entries[i - 1][0], node.firstKey()) < 0)
        ) {
          return failed(110, 'the entry and right node not sorted');
        }

        if (
          i < entries.length &&
          !(this.comparator(node.lastKey(), entries[i][0]) < 0)
        ) {
          return failed(111, 'the entry and left node not sorted');
        }
      }

    return 0;
  }
} // class

// #pragma Iterators

SortedMapBtreeNode.prototype.iterate = function (fn, reverse) {
  const entries = this.entries;
  const nodes = this.nodes;

  if (nodes) {
    for (let ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      const node = nodes[reverse ? maxIndex + 1 - ii : ii];
      if (node.iterate(fn, reverse) === false) {
        return false;
      }
      const entry = entries[reverse ? maxIndex - ii : ii];
      if (entry[1] === NOT_SET) {
        continue;
      }
      if (fn(entry) === false) {
        return false;
      }
    }

    // Iterate through the remaining last node
    const node = nodes[reverse ? 0 : nodes.length - 1];
    if (node.iterate(fn, reverse) === false) {
      return false;
    }
  } else {
    for (let ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      const entry = entries[reverse ? maxIndex - ii : ii];
      if (entry[1] === NOT_SET) {
        continue;
      }
      if (fn(entry) === false) {
        return false;
      }
    }
  }
  return true;
};

SortedMapBtreeNode.prototype.iterateFrom = function (from, fn, reverse) {
  if (reverse) {
    return this.iterate(entry => {
      if (this.comparator(from, entry[0]) <= 0) {
        return fn(entry);
      }
      return true;
    }, reverse);
  }

  const entries = this.entries;
  const nodes = this.nodes;

  const didMatch = MakeRef();
  const idx = binarySearch(this.comparator, entries, from, didMatch);

  if (nodes) {
    for (let ii = idx, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      const node = nodes[ii];
      if (ii === idx && !GetRef(didMatch)) {
        if (node.iterateFrom(from, fn, reverse) === false) {
          return false;
        }
      } else if (ii > idx) {
        if (node.iterate(fn, reverse) === false) {
          return false;
        }
      }
      const entry = entries[ii];
      if (entry[1] === NOT_SET) {
        continue;
      }
      if (fn(entry) === false) {
        return false;
      }
    }

    // Iterate through the remaining last node
    const node = nodes[nodes.length - 1];
    if (idx === nodes.length - 1) {
      if (node.iterateFrom(from, fn, reverse) === false) {
        return false;
      }
    } else if (node.iterate(fn, reverse) === false) {
      return false;
    }
  } else {
    for (let ii = idx, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      const entry = entries[ii];
      if (entry[1] === NOT_SET) {
        continue;
      }
      if (fn(entry) === false) {
        return false;
      }
    }
  }
  return true;
};

SortedMapBtreeNode.prototype.iterateFromBackwards = function (
  from,
  fn,
  reverse
) {
  if (reverse) {
    return this.iterate(entry => {
      if (this.comparator(entry[0], from) <= 0) {
        return fn(entry);
      }
      return true;
    }, false);
  }

  const entries = this.entries;
  const nodes = this.nodes;

  const didMatch = MakeRef();
  const idx = binarySearch(this.comparator, entries, from, didMatch);

  if (nodes) {
    for (let ii = idx; ii >= 0; ii--) {
      if (ii < idx || GetRef(didMatch)) {
        const entry = entries[ii];
        if (entry[1] === NOT_SET) {
          continue;
        }
        if (fn(entry) === false) {
          return false;
        }
      }
      const node = nodes[ii];
      if (ii === idx && !GetRef(didMatch)) {
        if (node.iterateFromBackwards(from, fn, reverse) === false) {
          return false;
        }
      } else if (node.iterate(fn, true) === false) {
        return false;
      }
    }
  } else {
    for (let ii = GetRef(didMatch) ? idx : idx - 1; ii >= 0; ii--) {
      const entry = entries[ii];
      if (entry[1] === NOT_SET) {
        continue;
      }
      if (fn(entry) === false) {
        return false;
      }
    }
  }
  return true;
};

SortedMapBtreeNode.prototype.iterateFromIndex = function (index, fn) {
  const entries = this.entries;
  const nodes = this.nodes;

  const didMatch = MakeRef();
  const subIndex = MakeRef();
  const idx = this.indexSearch(index, didMatch, subIndex);

  if (nodes) {
    for (let ii = idx, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      const node = nodes[ii];
      if (ii === idx && !GetRef(didMatch)) {
        if (node.iterateFromIndex(subIndex.value, fn) === false) {
          return false;
        }
      } else if (ii > idx) {
        if (node.iterate(fn, false) === false) {
          return false;
        }
      }
      const entry = entries[ii];
      if (entry[1] === NOT_SET) {
        continue;
      }
      if (fn(entry) === false) {
        return false;
      }
    }

    // Iterate through the remaining last node
    const node = nodes[nodes.length - 1];
    if (idx === nodes.length - 1) {
      if (node.iterateFromIndex(subIndex.value, fn) === false) {
        return false;
      }
    } else if (node.iterate(fn, false) === false) {
      return false;
    }
  } else {
    for (let ii = idx, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      const entry = entries[ii];
      if (entry[1] === NOT_SET) {
        continue;
      }
      if (fn(entry) === false) {
        return false;
      }
    }
  }
  return true;
};

SortedMapBtreeNode.prototype.iterateFromIndexBackwards = function (index, fn) {
  const entries = this.entries;
  const nodes = this.nodes;

  const didMatch = MakeRef();
  const subIndex = MakeRef();
  const idx = this.indexSearch(index, didMatch, subIndex);

  if (nodes) {
    for (let ii = idx; ii >= 0; ii--) {
      if (ii < idx || GetRef(didMatch)) {
        const entry = entries[ii];
        if (entry[1] === NOT_SET) {
          continue;
        }
        if (fn(entry) === false) {
          return false;
        }
      }
      const node = nodes[ii];
      if (ii === idx && !GetRef(didMatch)) {
        if (node.iterateFromIndexBackwards(subIndex.value, fn) === false) {
          return false;
        }
      } else if (node.iterate(fn, true) === false) {
        return false;
      }
    }
  } else {
    for (let ii = GetRef(didMatch) ? idx : idx - 1; ii >= 0; ii--) {
      const entry = entries[ii];
      if (entry[1] === NOT_SET) {
        continue;
      }
      if (fn(entry) === false) {
        return false;
      }
    }
  }
  return true;
};

class SortedMapBtreeNodeIterator extends Iterator {
  constructor(map, type, reverse) {
    this._type = type;
    this._reverse = reverse;
    this._stack = map._root && mapIteratorFrame(map._root);
  }

  next() {
    const type = this._type;
    let stack = this._stack;
    while (stack) {
      const node = stack.node;
      let index = stack.index++;
      if (node.nodes) {
        const maxIndex = node.entries.length + node.nodes.length - 1;
        if (index <= maxIndex) {
          if (index % 2 === 0) {
            index /= 2;
            const subNode =
              node.nodes[this._reverse ? node.nodes.length - 1 - index : index];
            if (subNode) {
              stack = this._stack = mapIteratorFrame(subNode, stack);
            }
            continue;
          } else {
            index = (index - 1) / 2;
            const entry =
              node.entries[
                this._reverse ? node.entries.length - 1 - index : index
              ];
            if (entry[1] === NOT_SET) {
              continue;
            }
            return mapIteratorValue(type, entry);
          }
        }
      } else {
        // node.entries
        const maxIndex = node.entries.length - 1;
        if (index <= maxIndex) {
          const entry = node.entries[this._reverse ? maxIndex - index : index];
          if (entry[1] === NOT_SET) {
            continue;
          }
          return mapIteratorValue(type, entry);
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }
}

function mapIteratorValue(type, entry) {
  return iteratorValue(type, entry[0], entry[1]);
}

function mapIteratorFrame(node, prev) {
  return {
    node: node,
    index: 0,
    __prev: prev,
  };
}

//
// Array manipulation algorithms
//

function allocArray(n) {
  const a = new Array(n);
  return a;
}

const _indentStr = new Array(120).join(' ');

function indent(level) {
  let indentCnt = 4 * level;
  if (indentCnt > _indentStr.length) {
    indentCnt = _indentStr.length;
  }
  return _indentStr.substring(0, indentCnt);
}

function clone(array, canEdit) {
  if (array === undefined) {
    return array;
  }
  if (canEdit) {
    return array;
  }

  const newLen = array.length;
  const newArray = allocArray(newLen);
  for (let ii = 0; ii < newLen; ii++) {
    newArray[ii] = array[ii];
  }
  return newArray;
}

function setIn(array, idx, val, canEdit) {
  if (canEdit) {
    array[idx] = val;
    return array;
  }

  const newLen = array.length;
  const newArray = allocArray(newLen);
  for (let ii = 0; ii < idx; ii++) {
    newArray[ii] = array[ii];
  }
  newArray[idx] = val;
  for (let ii = idx + 1; ii < newLen; ii++) {
    newArray[ii] = array[ii];
  }
  return newArray;
}

function spliceIn(array, idx, val, canEdit) {
  const newLen = array.length + 1;

  if (canEdit) {
    // Have to shift items going backwards
    for (let ii = newLen - 1, stop = idx + 1; ii >= stop; ii--) {
      array[ii] = array[ii - 1];
    }
    array[idx] = val;
    return array;
  }

  const newArray = allocArray(newLen);
  for (let ii = 0; ii < idx; ii++) {
    newArray[ii] = array[ii];
  }
  newArray[idx] = val;
  for (let ii = idx + 1; ii < newLen; ii++) {
    newArray[ii] = array[ii - 1];
  }
  return newArray;
}

// eslint-disable-next-line no-unused-vars
function spliceInN(array, idx, n, valArray, canEdit) {
  const newLen = array.length + n;

  if (canEdit) {
    // Have to shift items going backwards
    for (let ii = newLen - 1, stop = idx + n; ii >= stop; ii--) {
      array[ii] = array[ii - n];
    }
    for (let ii = 0; ii < n; ii++) {
      array[idx + ii] = valArray[ii];
    }
    return array;
  }

  const newArray = allocArray(newLen);
  for (let ii = 0; ii < idx; ii++) {
    newArray[ii] = array[ii];
  }
  for (let ii = 0; ii < n; ii++) {
    newArray[idx + ii] = valArray[ii];
  }
  for (let ii = idx + n; ii < newLen; ii++) {
    newArray[ii] = array[ii - n];
  }
  return newArray;
}

function spliceOut(array, idx, canEdit) {
  const newLen = array.length - 1;

  if (canEdit) {
    for (let ii = idx; ii < newLen; ii++) {
      array[ii] = array[ii + 1];
    }
    array.length = newLen;
    return array;
  }

  const newArray = allocArray(newLen);
  for (let ii = 0; ii < idx; ii++) {
    newArray[ii] = array[ii];
  }
  for (let ii = idx; ii < newLen; ii++) {
    newArray[ii] = array[ii + 1];
  }
  return newArray;
}

function spliceOutN(array, idx, n, canEdit) {
  const newLen = array.length - n;

  if (canEdit) {
    for (let ii = idx; ii < newLen; ii++) {
      array[ii] = array[ii + n];
    }
    array.length = newLen;
    return array;
  }

  const newArray = allocArray(newLen);
  for (let ii = 0; ii < idx; ii++) {
    newArray[ii] = array[ii];
  }
  for (let ii = idx; ii < newLen; ii++) {
    newArray[ii] = array[ii + n];
  }
  return newArray;
}

//
// Example: spliceOutShiftRightN(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 3, 2, canEdit)
//
// removes item at index=3 ('d') and moves all remaining items in an awway right by 2 positions
//
// Result: [?, ?, 'a', 'b', 'c', 'f', 'g']
//
function spliceOutShiftRightN(array, idx, rightN, canEdit) {
  const newLen = array.length - 1 + rightN;
  let newArray;

  if (canEdit) {
    array.length = newLen;
    newArray = array;
  } else {
    newArray = allocArray(newLen);
  }

  for (let ii = newLen - 1, stop = idx + rightN; ii >= stop; ii--) {
    newArray[ii] = array[ii - rightN + 1];
  }
  for (let ii = idx + rightN - 1; ii >= rightN; ii--) {
    newArray[ii] = array[ii - rightN];
  }
  return newArray;
}

//
// First: setIn(array, setInIdx, setInValue)
// Then: spliceOut(array, spliceOutIdx)
// Optimized, eliminating redundant copying
// Equivalent of setInSpliceOutN(array, setInIdx, setInValue, spliceOutIdx, 1, canEdit)
//
// Example: setInSpliceOut(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 3, 'D', 1, canEdit)
//
// Result: ['a', 'c', 'D', 'f', 'g']
//
function setInSpliceOut(array, setInIdx, setInValue, spliceOutIdx, canEdit) {
  const newArray = spliceOut(array, spliceOutIdx, canEdit);

  // Now we can edit regardless of canEdit
  if (setInIdx < spliceOutIdx) {
    newArray[setInIdx] = setInValue;
  } else if (setInIdx > spliceOutIdx) {
    newArray[setInIdx - 1] = setInValue;
  }

  return newArray;
}

//
// First: setIn(array, setInIdx, setInValue)
// Then: spliceOut(array, spliceOutIdx)
// Optimized, eliminating redundant copying
//
// Example: setInSpliceOut(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 3, 'D', 1, 2, canEdit)
//
// Result: ['a', 'D', 'f', 'g']
//
// eslint-disable-next-line no-unused-vars
function setInSpliceOutN(
  array,
  setInIdx,
  setInValue,
  spliceOutIdx,
  n,
  canEdit
) {
  const newArray = spliceOutN(array, spliceOutIdx, n, canEdit);

  // Now we can edit regardless of canEdit
  if (setInIdx < spliceOutIdx) {
    newArray[setInIdx] = setInValue;
  } else if (setInIdx >= spliceOutIdx + n) {
    newArray[setInIdx - n] = setInValue;
  }

  return newArray;
}

function binarySearch(comparator, entries, key, didMatch) {
  let first = 0;
  let range = entries.length;

  while (range > 0) {
    const half = Math.floor(range / 2);
    const entry = entries[first + half];
    const entryKey = entry[0];
    const cmp = comparator(key, entryKey);
    if (cmp === 0) {
      SetRef(didMatch);
      return first + half;
    }
    if (cmp > 0) {
      first += half + 1;
      range -= half + 1;
    } else {
      range = half;
    }
  }
  return first;
}

SortedMapBtreeNode.prototype.indexSearch = function (
  index,
  didMatch,
  subIndex
) {
  if (index < 0 || index >= this.size) {
    throw new Error(
      'BtreeNode.indexSearch: index is out of bounds: ' +
        index +
        ' vs ' +
        this.size
    );
  }
  const entries = this.entries;
  const nodes = this.nodes;

  for (let i = 0; i < entries.length; i++) {
    if (nodes) {
      const node = nodes[i];
      if (index < node.size) {
        subIndex.value = index;
        return i;
      }
      index -= node.size;
    }

    const entry = entries[i];
    if (entry[1] !== NOT_SET) {
      if (index === 0) {
        SetRef(didMatch);
        return i;
      }
      index--;
    }
  }

  if (nodes) {
    const node = nodes[nodes.length - 1];
    if (index < node.size) {
      subIndex.value = index;
      return nodes.length - 1;
    }
  }

  throw new Error('BtreeNode.indexSearch: inconsistent node size');
};

//
// Node Split algorithms
//
SortedMapBtreeNode.prototype.splitNode = function (
  idx,
  updatedNode,
  subKvn,
  outKvn,
  ownerID,
  canEdit
) {
  const entries = this.entries;
  const nodes = this.nodes;
  const medianIdx = this.btreeNodeSplitSize;

  let newEntries;
  let newNodes;

  if (idx < medianIdx) {
    const rightEntries = entries.slice(medianIdx, entries.length);
    const rightNodes = nodes.slice(medianIdx, nodes.length);
    const rightNode = new SortedMapBtreeNode(
      this.comparator,
      this.options,
      this.ownerID,
      rightEntries,
      rightNodes
    );

    outKvn[0] = entries[medianIdx - 1];
    outKvn[1] = rightNode;

    if (canEdit) {
      // truncate existing entries and nodes
      entries.length = medianIdx;
      nodes.length = medianIdx + 1;

      // shift the items right to make room for returned Kvn
      // and updatedNode (has to go backwards)
      for (let i = medianIdx - 1; i >= idx + 1; i--) {
        entries[i] = entries[i - 1];
        nodes[i + 1] = nodes[i];
      }

      // place returned Kvn and updated node into entries and nodes
      entries[idx] = subKvn[0];
      nodes[idx] = updatedNode;
      nodes[idx + 1] = subKvn[1];
      newEntries = entries;
      newNodes = nodes;
    } else {
      // allocate new arrays for entries and nodes
      newEntries = allocArray(medianIdx);
      newNodes = allocArray(medianIdx + 1);

      // copy the items before idx into new arrays
      for (let i = 0; i < idx; i++) {
        newEntries[i] = entries[i];
        newNodes[i] = nodes[i];
      }

      // place returned Kvn and updated node into new arrays
      newEntries[idx] = subKvn[0];
      newNodes[idx] = updatedNode;
      newNodes[idx + 1] = subKvn[1];

      // copy remaining items after idx into new arrays
      for (let i = idx + 1; i < medianIdx; i++) {
        newEntries[i] = entries[i - 1];
        newNodes[i + 1] = nodes[i];
      }
    }
  } else if (idx === medianIdx) {
    // allocate the arrays for right node
    const rightEntries = allocArray(entries.length - medianIdx);
    const rightNodes = allocArray(nodes.length - medianIdx);

    // place subKvn to the beginning of right node arrays
    rightEntries[0] = entries[medianIdx];
    rightNodes[0] = subKvn[1];

    // copy the remaining items into the right node arrays
    for (let i = 1, len = rightEntries.length; i < len; i++) {
      rightEntries[i] = entries[medianIdx + i];
      rightNodes[i] = nodes[medianIdx + i];
    }
    // copy the last node item into rightNodes
    rightNodes[rightNodes.length - 1] = nodes[nodes.length - 1];

    const rightNode = new SortedMapBtreeNode(
      this.comparator,
      this.options,
      this.ownerID,
      rightEntries,
      rightNodes
    );

    outKvn[0] = subKvn[0];
    outKvn[1] = rightNode;

    if (canEdit) {
      // truncate existing entries and nodes
      entries.length = medianIdx;
      nodes.length = medianIdx + 1;
      nodes[idx] = updatedNode;
      newEntries = entries;
      newNodes = nodes;
    } else {
      // allocate new arrays for entries and nodes
      newEntries = allocArray(medianIdx);
      newNodes = allocArray(medianIdx + 1);

      // copy the items before idx into new arrays
      for (let i = 0; i < medianIdx; i++) {
        newEntries[i] = entries[i];
        newNodes[i] = nodes[i];
      }

      // place returned Kvn and updated node into new node arrays
      newNodes[idx] = updatedNode;
    }
  } else {
    // idx > medianIdx

    // allocate the arrays for right node
    const rightEntries = allocArray(entries.length - medianIdx);
    const rightNodes = allocArray(nodes.length - medianIdx);

    // copy the items into the beginning of right node arrays
    const idx0 = medianIdx + 1;
    const rightIdx = idx - idx0;
    for (let i = 0, len = rightIdx; i < len; i++) {
      rightEntries[i] = entries[idx0 + i];
      rightNodes[i] = nodes[idx0 + i];
    }

    // place subKvn to the middle right node arrays
    rightEntries[rightIdx] = subKvn[0];
    rightNodes[rightIdx] = updatedNode;
    rightNodes[rightIdx + 1] = subKvn[1];

    // copy the remaining items into the right node arrays
    for (let i = rightIdx + 1, len = rightEntries.length; i < len; i++) {
      rightEntries[i] = entries[medianIdx + i];
      rightNodes[i + 1] = nodes[medianIdx + i + 1];
    }

    const rightNode = new SortedMapBtreeNode(
      this.comparator,
      this.options,
      this.ownerID,
      rightEntries,
      rightNodes
    );

    outKvn[0] = entries[medianIdx];
    outKvn[1] = rightNode;

    if (canEdit) {
      // truncate existing entries and nodes
      entries.length = medianIdx;
      nodes.length = medianIdx + 1;
      newEntries = entries;
      newNodes = nodes;
    } else {
      // allocate new arrays for entries and nodes
      newEntries = entries.slice(0, medianIdx);
      newNodes = nodes.slice(0, medianIdx + 1);
    }
  }

  return this.makeNewNode(newEntries, newNodes, ownerID, canEdit);
};

SortedMapBtreeNode.prototype.splitLeaf = function (
  idx,
  entry,
  outKvn,
  ownerID,
  canEdit
) {
  const entries = this.entries;
  const medianIdx = this.btreeNodeSplitSize;

  let newEntries;
  let newNodes;

  if (idx < medianIdx) {
    const rightEntries = entries.slice(medianIdx, entries.length);
    const rightNode = new SortedMapBtreeNode(
      this.comparator,
      this.options,
      this.ownerID,
      rightEntries
    );

    outKvn[0] = entries[medianIdx - 1];
    outKvn[1] = rightNode;

    if (canEdit) {
      // truncate existing entries and nodes
      entries.length = medianIdx;

      // shift the items right to make room for returned Kvn
      // and updatedNode (has to go backwards)
      for (let i = medianIdx - 1; i >= idx + 1; i--) {
        entries[i] = entries[i - 1];
      }

      // place returned Kvn and updated node into entries and nodes
      entries[idx] = entry;
      newEntries = entries;
    } else {
      // allocate new arrays for entries and nodes
      newEntries = allocArray(medianIdx);

      // copy the items before idx into new arrays
      for (let i = 0; i < idx; i++) {
        newEntries[i] = entries[i];
      }

      // place returned Kvn and updated node into new arrays
      newEntries[idx] = entry;

      // copy remaining items after idx into new arrays
      for (let i = idx + 1; i < medianIdx; i++) {
        newEntries[i] = entries[i - 1];
      }
    }
  } else if (idx === medianIdx) {
    // allocate the arrays for right node
    const rightEntries = allocArray(entries.length - medianIdx);

    // place subKvn to the beginning of right node arrays
    rightEntries[0] = entries[medianIdx];

    // copy the remaining items into the right node arrays
    for (let i = 1, len = rightEntries.length; i < len; i++) {
      rightEntries[i] = entries[medianIdx + i];
    }

    const rightNode = new SortedMapBtreeNode(
      this.comparator,
      this.options,
      this.ownerID,
      rightEntries
    );

    outKvn[0] = entry;
    outKvn[1] = rightNode;

    if (canEdit) {
      // truncate existing entries and nodes
      entries.length = medianIdx;
      newEntries = entries;
    } else {
      // allocate new arrays for entries
      newEntries = allocArray(medianIdx);

      // copy the items before idx into new arrays
      for (let i = 0; i < medianIdx; i++) {
        newEntries[i] = entries[i];
      }
    }
  } else {
    // idx > medianIdx

    // allocate the arrays for right node
    const rightEntries = allocArray(entries.length - medianIdx);

    // copy the items into the beginning of right node arrays
    const idx0 = medianIdx + 1;
    const rightIdx = idx - idx0;
    for (let i = 0, len = rightIdx; i < len; i++) {
      rightEntries[i] = entries[idx0 + i];
    }

    // place subKvn to the middle right node arrays
    rightEntries[rightIdx] = entry;

    // copy the remaining items into the right node arrays
    for (let i = rightIdx + 1, len = rightEntries.length; i < len; i++) {
      rightEntries[i] = entries[medianIdx + i];
    }

    const rightNode = new SortedMapBtreeNode(
      this.comparator,
      this.options,
      this.ownerID,
      rightEntries
    );

    outKvn[0] = entries[medianIdx];
    outKvn[1] = rightNode;

    if (canEdit) {
      // truncate existing entries and nodes
      entries.length = medianIdx;
      newEntries = entries;
    } else {
      // allocate new arrays for entries and nodes
      newEntries = entries.slice(0, medianIdx);
    }
  }

  return this.makeNewNode(newEntries, newNodes, ownerID, canEdit);
};

SortedMapBtreeNode.prototype.spliceNode = function (
  ownerID,
  idx,
  updatedNode,
  parent,
  parentIdx,
  canEdit,
  subKvn,
  outKvn
) {
  const entries = this.entries;
  const nodes = this.nodes;

  let newEntries;
  let newNodes;

  const updatedEntry = subKvn[0];
  const updatedNeighbor = subKvn[1];
  const updatedNeighborIsLeft = subKvn[2];

  if (updatedNeighbor === NOT_SET) {
    //
    // Removing entry and node
    //
    if (entries.length <= this.btreeNodeSplitSize && parent) {
      // Not enough room, consolidate this node
      if (updatedNeighborIsLeft) {
        // remove left node in newNodes
        return this.consolidateNode(
          ownerID,
          idx,
          updatedNode,
          idx - 1,
          idx - 1,
          parent,
          parentIdx,
          canEdit,
          outKvn
        );
      } else {
        // remove right node in newNodes
        return this.consolidateNode(
          ownerID,
          idx,
          updatedNode,
          idx,
          idx + 1,
          parent,
          parentIdx,
          canEdit,
          outKvn
        );
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (updatedNeighborIsLeft) {
        // update left node in newNodes
        newNodes = setInSpliceOut(nodes, idx, updatedNode, idx - 1, canEdit);
        newEntries = spliceOut(entries, idx - 1, canEdit);
      } else {
        // update right node in newNodes
        newNodes = setInSpliceOut(nodes, idx, updatedNode, idx + 1, canEdit);
        newEntries = spliceOut(entries, idx, canEdit);
      }
    }
  } else {
    //
    // Updating entry and node
    //
    newNodes = setIn(nodes, idx, updatedNode, canEdit);
    if (updatedNeighbor) {
      if (updatedNeighborIsLeft) {
        // update left node in newNodes
        newNodes[idx - 1] = updatedNeighbor;
        newEntries = setIn(entries, idx - 1, updatedEntry, canEdit);
      } else {
        // update right node in newNodes
        newNodes[idx + 1] = updatedNeighbor;
        newEntries = setIn(entries, idx, updatedEntry, canEdit);
      }
    } else if (updatedEntry) {
      newEntries = setIn(entries, idx, updatedEntry, canEdit);
    } else {
      newEntries = clone(entries, canEdit);
    }
  }

  return this.makeNewNode(newEntries, newNodes, ownerID, canEdit);
};

//
// We updating node at position idx, removing the entry at position removeEntryIdx,
// and removing a neighbor node at position removeNodeIdx
// (either on the left or right side of updated node). We know that we already have
// a minimum number of allowed entries in the node, so we have to either
// move some entries from a neighbor or merge with neighbour
//
SortedMapBtreeNode.prototype.consolidateNode = function (
  ownerID,
  idx,
  updatedNode,
  removeEntryIdx,
  removeNodeIdx,
  parent,
  parentIdx,
  canEdit,
  outKvn
) {
  const entries = this.entries;
  const nodes = this.nodes;

  const parentEntries = parent.entries;
  const parentNodes = parent.nodes;

  //
  // Decide if we are going to move entries or merge
  // and with which neighbor we are going to proceed
  //
  let donorNode;
  let mergeNode;
  let leftNode;
  let rightNode;
  if (parentIdx === 0) {
    // Only right node can be a host within a scope of this parent
    rightNode = parentNodes[parentIdx + 1];
    mergeNode = donorNode = rightNode;
  } else if (parentIdx === parentNodes.length - 1) {
    // Only left node can be a host within a scope of this parent
    leftNode = parentNodes[parentIdx - 1];
    mergeNode = donorNode = leftNode;
  } else {
    // Both left and right node could be a potential donor
    leftNode = parentNodes[parentIdx - 1];
    rightNode = parentNodes[parentIdx + 1];
    const leftAvail =
      (leftNode.entries.length - this.btreeNodeSplitSize + 1) / 2;
    const rightAvail =
      (rightNode.entries.length - this.btreeNodeSplitSize + 1) / 2;
    if (leftAvail >= rightAvail) {
      donorNode = leftNode;
      mergeNode = rightNode;
    } else {
      donorNode = rightNode;
      mergeNode = leftNode;
    }
  }

  let newEntries;
  let newNodes;

  //
  // Move from the LEFT node
  //
  function moveFromLeftNode(node, n, merge) {
    // allocate newEntries extended by n
    newEntries = spliceOutShiftRightN(entries, removeEntryIdx, n, canEdit);
    newNodes = spliceOutShiftRightN(nodes, removeNodeIdx, n, canEdit);

    // now set the updatedNode, adjust the index according to the shift above
    const uIdx = idx < removeNodeIdx ? idx + n : idx + n - 1;
    newNodes[uIdx] = updatedNode;

    // Then move an item from the parent node into newEntries
    let i = n - 1;
    newEntries[i] = parentEntries[parentIdx - 1];

    // And move rightest node from the neighbor into newNodes
    newNodes[i--] = node.nodes[node.nodes.length - 1];

    // Then copy the items from the node
    let j;
    for (j = node.entries.length - 1; i >= 0; i--, j--) {
      newEntries[i] = node.entries[j];
      newNodes[i] = node.nodes[j];
    }

    if (merge) {
      outKvn[1] = NOT_SET;
    } else {
      // Last, copy the remaining entry from node to parent
      outKvn[0] = node.entries[j];

      // Make a copy of donor's node without donated entries
      const newNodeEntries = spliceOutN(
        node.entries,
        node.entries.length - n,
        n,
        canEdit
      );
      const newNodeNodes = spliceOutN(
        node.nodes,
        node.nodes.length - n,
        n,
        canEdit
      );

      outKvn[1] = node.makeNewNode(
        newNodeEntries,
        newNodeNodes,
        ownerID,
        canEdit
      );
    }
    outKvn[2] = true;
  }

  //
  // Move from the right node
  //
  function moveFromRightNode(node, n, merge) {
    newEntries = spliceOut(entries, removeEntryIdx, canEdit);
    newNodes = spliceOut(nodes, removeNodeIdx, canEdit);

    // Expand new entries
    let j = newEntries.length;
    newEntries.length += n;
    newNodes.length += n;

    // now set the updatedNode, adjust the index according to the shift above
    const uIdx = idx < removeNodeIdx ? idx : idx - 1;
    newNodes[uIdx] = updatedNode;

    // Then move an item from the parent node into newEntries
    newEntries[j++] = parentEntries[parentIdx];

    // Also copy the first item in right neighbor into newNodes
    newNodes[j] = node.nodes[0];

    // Then copy the items from the node
    for (let i = 0, iLimit = n - 1; i < iLimit; i++) {
      newEntries[j + i] = node.entries[i];
      newNodes[j + i + 1] = node.nodes[i + 1];
    }

    if (merge) {
      outKvn[1] = NOT_SET;
    } else {
      // Last, copy the remaining item from node to parent
      outKvn[0] = node.entries[n - 1];

      // Make a copy of donor's node without donated entries
      const newNodeEntries = spliceOutN(node.entries, 0, n, canEdit);
      const newNodeNodes = spliceOutN(node.nodes, 0, n, canEdit);

      outKvn[1] = node.makeNewNode(
        newNodeEntries,
        newNodeNodes,
        ownerID,
        canEdit
      );
    }
    outKvn[2] = false;
  }

  const donorAvail = Math.floor(
    (donorNode.entries.length - this.btreeNodeSplitSize + 1) / 2
  );
  if (donorAvail > 0) {
    //
    // OPERATION: MOVE
    //
    // move donorAvail entries from donorNode to this leaf through parentNodes
    if (donorNode === leftNode) {
      moveFromLeftNode(donorNode, donorAvail);
    } else {
      moveFromRightNode(donorNode, donorAvail);
    }
  } else {
    //
    // OPERATION: MERGE
    //
    // neither neighbour has enough entries to donate
    // we gotta merge this node with mergeNode which has fewer entries available
    // eslint-disable-next-line no-lonely-if
    if (mergeNode === leftNode) {
      // Merge with the left node
      moveFromLeftNode(mergeNode, mergeNode.entries.length + 1, true);
    } else {
      // Merge with the right node
      moveFromRightNode(mergeNode, mergeNode.entries.length + 1, true);
    }
  }

  return this.makeNewNode(newEntries, newNodes, ownerID, canEdit);
};

// We are eliminating the entry at position idx and we know that we already
// have a minimum number of allowed entries in the node, so we have to either
// move some entries from a neighbor or merge with neighbour
SortedMapBtreeNode.prototype.consolidateLeaf = function (
  ownerID,
  idx,
  parent,
  parentIdx,
  canEdit,
  outKvn
) {
  const entries = this.entries;
  const parentEntries = parent.entries;
  const parentNodes = parent.nodes;

  //
  // Decide if we are going to move entries or merge
  // and with which neighbor we are going to proceed
  //
  let donorNode;
  let leftNode;
  // eslint-disable-next-line no-unused-vars
  let rightNode;
  if (parentIdx === 0) {
    // Only right node can be a host within a scope of this parent
    rightNode = parentNodes[parentIdx + 1];
    donorNode = rightNode;
  } else if (parentIdx === parentNodes.length - 1) {
    // Only left node can be a host within a scope of this parent
    leftNode = parentNodes[parentIdx - 1];
    donorNode = leftNode;
  } else {
    // Both left and right node could be a potential donor
    leftNode = parentNodes[parentIdx - 1];
    rightNode = parentNodes[parentIdx + 1];
    const leftAvail = leftNode.entries.length - this.btreeNodeSplitSize;
    const rightAvail = rightNode.entries.length - this.btreeNodeSplitSize;
    if (leftAvail >= rightAvail) {
      donorNode = leftNode;
    } else {
      donorNode = rightNode;
    }
  }

  let newEntries;
  //
  // Move from the LEFT node
  //
  // n - is the number of entries added to the target node
  //
  function moveFromLeftNode(node, n, merge) {
    // allocate newEntries extended by n
    newEntries = spliceOutShiftRightN(entries, idx, n, canEdit);

    // m is number of entries to be moved from donor node
    let m = n;
    if (!parentNotSet) {
      // Move an item from the parent node into newEntries
      newEntries[n - 1] = parentEntry;
      m--;
    }

    // Then copy the items from the node
    for (let i = 0; i < m; i++) {
      newEntries[i] = node.entries[node.entries.length - m + i];
    }

    if (merge) {
      outKvn[1] = NOT_SET;
    } else {
      // Last, copy the remaining item from node to parent
      m++;
      outKvn[0] = node.entries[node.entries.length - m];

      // Make a copy of donor's node without donated entries
      const newNodeEntries = spliceOutN(
        node.entries,
        node.entries.length - m,
        m,
        canEdit
      );

      outKvn[1] = node.makeNewNode(newNodeEntries, undefined, ownerID, canEdit);
    }
    outKvn[2] = true;
  }

  //
  // Move from the right node
  //
  // n - is the number of entries added to the target node
  //
  function moveFromRightNode(node, n, merge) {
    newEntries = spliceOut(entries, idx, canEdit);
    // Expand new entries
    let j = newEntries.length;
    newEntries.length += n;

    // m is number of entries to be moved from donor node
    let m = n;
    if (!parentNotSet) {
      // Move an item from the parent node into newEntries
      newEntries[j++] = parentEntry;
      m--;
    }

    // Then copy the items from the node
    for (let i = 0; i < m; i++) {
      newEntries[j + i] = node.entries[i];
    }

    if (merge) {
      outKvn[1] = NOT_SET;
    } else {
      // Last, copy the remaining item from node to parent
      outKvn[0] = node.entries[m++];

      // Make a copy of donor's node without donated entries
      const newNodeEntries = spliceOutN(node.entries, 0, m, canEdit);

      outKvn[1] = node.makeNewNode(newNodeEntries, undefined, ownerID, canEdit);
    }
    outKvn[2] = false;
  }

  const parentEntry =
    donorNode === leftNode
      ? parentEntries[parentIdx - 1]
      : parentEntries[parentIdx];
  const parentNotSet = parentEntry[1] === NOT_SET;
  const parentAdj = parentNotSet ? 1 : 0;
  const donorAvail =
    donorNode.entries.length - this.btreeNodeSplitSize - parentAdj;
  if (donorAvail > 0) {
    //
    // OPERATION: MOVE
    //
    // move donorAvail entries from donorNode to this leaf through parentNodes
    const n = Math.floor((donorAvail + 1) / 2);
    if (donorNode === leftNode) {
      moveFromLeftNode(donorNode, n);
    } else {
      moveFromRightNode(donorNode, n);
    }
  } else {
    //
    // OPERATION: MERGE
    //
    // neither neighbour has enough entries to donate
    // we gotta merge this node with donorNode
    const n = donorNode.entries.length + 1 - parentAdj;
    if (donorNode === leftNode) {
      // Merge with the left node
      moveFromLeftNode(donorNode, n, true);
    } else {
      // Merge with the right node
      moveFromRightNode(donorNode, n, true);
    }
  }

  return this.makeNewNode(newEntries, undefined, ownerID, canEdit);
};

class SortedMapBtreeNodePacker extends SortedMapPacker {
  calcPlanCnt(order, height) {
    if (height < 1 || height > 20) {
      throw new Error('Height is out of supported limit');
    }

    // The recursive algorithm would be:
    //
    // if(height <= 1) {
    // 	return order - 1;
    // }
    // return order * this.calcPlanCnt(order, height - 1) + (order - 1);

    let n = order - 1;

    for (let h = 1; h < height; h++) {
      n = n * order + (order - 1);
    }

    return n;
  }

  prepareCachedPlan(order, n) {
    const key = order.toString() + ' ' + n.toString();

    const cachedPlan = SortedMapBtreeNodePacker.cache[key];

    if (cachedPlan) {
      return cachedPlan;
    }

    const plan = this.preparePlan(order, n);
    this.verifyPlan(plan);

    if (
      order < 100 &&
      n <= 100 &&
      n >= order &&
      SortedMapBtreeNodePacker.cacheSize < 500
    ) {
      SortedMapBtreeNodePacker.cache[key] = plan;
      SortedMapBtreeNodePacker.cacheSize++;
    }

    return plan;
  }

  preparePlan(order, n) {
    //
    // First determine height of the tree we are building
    //
    const order1 = order - 1;
    let height = 1;
    let maxEntriesCnt = order1;
    let maxEntriesCnt1;
    while (maxEntriesCnt < n) {
      maxEntriesCnt1 = maxEntriesCnt;
      maxEntriesCnt = maxEntriesCnt * order + order1;
      height++;
    }

    if (maxEntriesCnt === n) {
      // Exact match for the full tree
      return {
        op: 'build',
        full: true,
        height: height,
        order: order,
        repeat: 1,
        total: n,
      };
    }

    if (height === 1) {
      return {
        op: 'build',
        full: false,
        height: height,
        order: order,
        repeat: 1,
        total: n,
      };
    }

    //
    // Number of entries in subtrees of (height - 1)
    //
    const planCnt1 = maxEntriesCnt1;

    //
    // Then determine the root order
    //
    const rootOrder = 1 + Math.floor(n / (planCnt1 + 1));

    if (rootOrder < 2) {
      throw new Error(
        'Something is wrong, the rootOrder is expected to be >= 2'
      );
    }

    if (rootOrder * planCnt1 + (rootOrder - 1) === n) {
      const repeat = rootOrder;
      const repPlan = [];
      const total = repeat * planCnt1 + repeat - 1;
      repPlan.push({
        op: 'build',
        full: true,
        height: height - 1,
        order: order,
        repeat: rootOrder,
        total: total,
      });
      return {
        op: 'assemble',
        height: height,
        order: order,
        total: total,
        items: repPlan,
      };
    }

    // We have to adjust last two subtrees
    const plan = [];

    if (rootOrder > 2) {
      const repeat = rootOrder - 2;
      const total = repeat * planCnt1 + repeat - 1;
      const build = {
        op: 'build',
        full: true,
        height: height - 1,
        order: order,
        repeat: repeat,
        total: total,
      };
      plan.push(build);
      n -= total;
      n--;
    }

    // Find feasible plan for 2 subtrees and n entries
    n--; // 1 more entry will be in between the two subtrees
    const n2 = Math.floor(n / 2);
    if (n - n2 > 0) {
      plan.push(this.prepareCachedPlan(order, n - n2));
    }
    if (n2 > 0) {
      plan.push(this.prepareCachedPlan(order, n2));
    }

    let total = 0;
    const ilen = plan.length;
    for (let i = 0; i < ilen; i++) {
      total += plan[i].total;
    }
    total += plan.length - 1;

    return {
      op: 'assemble',
      height: height,
      order: order,
      total: total,
      items: plan,
    };
  }

  verifyPlan(plan, level) {
    function failed(msg) {
      throw new Error(msg);
    }

    if (level === undefined) {
      level = 0;
    }

    if (plan.op === 'assemble') {
      let cnt = 0;

      const ilen = plan.items.length;
      for (let i = 0; i < ilen; i++) {
        const pl = plan.items[i];
        cnt += pl.total;
        if (pl.op === 'build') {
          if (!(pl.order >= pl.repeat)) {
            failed(
              'Plan verification test failed: pl.order >= pl.repeat: ' +
                JSON.stringify(pl)
            );
          }
        }
        if (!(plan.height === pl.height + 1)) {
          failed('Plan verification test failed: plan.height === pl.height+1');
        }
        this.verifyPlan(pl, level + 1);
      }
      cnt += plan.items.length - 1;
      if (!(plan.total === cnt)) {
        failed('Count mismatch: ' + plan.total + ' vs ' + cnt);
      }
    } else if (plan.op === 'build') {
      // Verify plan consistency
      const ec = this.calcPlanCnt(plan.order, plan.height);
      if (plan.full) {
        const cnt = ec * plan.repeat + plan.repeat - 1;
        if (!(plan.total === cnt)) {
          failed('Plan verification test failed: plan.total === ec');
        }
      } else {
        if (!(plan.height === 1)) {
          failed(
            'Plan verification test failed: expected height 1, got instead ' +
              plan.height
          );
        }
        if (!(plan.total < ec)) {
          failed('Plan verification test failed: plan.total < ec');
        }
        const halfSize = Math.floor((plan.order - 1) / 2);
        if (level > 0 && !(plan.total >= halfSize)) {
          failed(
            'Plan verification test failed: plan.total >= halfSize: ' +
              plan.total +
              ', ' +
              halfSize
          );
        }
      }
    } else {
      failed('Plan verification test failed: invalid op: ' + plan.op);
    }
  }

  // Pack the map according to the plan
  // Return a new root
  //
  // Sample Plan:
  //   {
  //     "op": "assemble",
  //     "height": 2,
  //     "order": 7,
  //     "total": 10,
  //     "items": [
  //         {
  //             "op": "build",
  //             "full": false,
  //             "height": 1,
  //             "order": 7,
  //             "repeat": 1,
  //             "total": 5
  //         },
  //         {
  //             "op": "build",
  //             "full": false,
  //             "height": 1,
  //             "order": 7,
  //             "repeat": 1,
  //             "total": 4
  //         }
  //     ]
  // }
  //

  runPlan(plan, iter) {
    function failed(msg) {
      msg = 'Packing Plan is corrupt: ' + msg;
      throw new Error(msg);
    }

    if (plan.op === 'assemble') {
      const ilen = plan.items.length;
      for (let i = 0; i < ilen; i++) {
        if (i > 0) {
          this.populate(iter, 1);
        }
        this.runPlan(plan.items[i], iter);
      }
    } else if (plan.op === 'build') {
      const n = (plan.total - plan.repeat + 1) / plan.repeat;
      for (let i = 0; i < plan.repeat; i++) {
        if (i > 0) {
          this.populate(iter, 1);
        }
        this.populate(iter, n);
      }
    } else {
      failed('invalid op: ' + plan.op);
    }
    this.flush(plan.height);
  }

  flushLevel(level) {
    this.prepareLevel(level + 1);
    const node = this.stack[level];
    node._calcSize();
    this.addNode(level + 1, node);
    this.stack[level] = undefined;
  }

  flush(height) {
    for (let i = 0; i < height; i++) {
      const level = i;
      if (this.stack[level]) {
        // flush this level
        this.flushLevel(level);
        // next entry goes to parent
      }
    }
    this.stackLevel = height;
  }

  populate(iter, n) {
    for (let i = 0; i < n; i++) {
      const next = iter.next();
      this.entriesCnt++;
      if (next.done) {
        throw new Error(
          'unexpected end of iterator at ' +
            this.entriesCnt +
            ' vs ' +
            iter.size
        );
      }
      const entry = next.value;

      const level = this.stackLevel;
      this.prepareLevel(level);
      this.addEntry(level, entry);

      if (level > 0) {
        // Node - go populate the subtree now
        this.stackLevel = 0;
      } else if (this.stackIndices[level] === this.order - 1) {
        // Leaf - we have filled all entries
        // flush the leaf
        this.flushLevel(level);
        // next entry goes to parent
        this.stackLevel++;
      }
    }
  }

  addEntry(level, entry) {
    this.stack[level].entries[this.stackIndices[level]++] = entry;
  }

  addNode(level, node) {
    this.stack[level].nodes[this.stackIndices[level]] = node;

    if (this.stackIndices[level] === this.order - 1) {
      // we filled the whole node
      // flush the node
      this.flushLevel(level);
      // next entry goes to parent
      this.stackLevel++;
    }
  }

  prepareLevel(level) {
    if (!this.stack[level]) {
      const entries = allocArray(this.order - 1);
      entries.length = 0;
      let nodes;
      if (level > 0) {
        nodes = allocArray(this.order);
        nodes.length = 0;
      }
      this.stack[level] = new SortedMapBtreeNode(
        this.comparator,
        this.options,
        this.ownerID,
        entries,
        nodes
      );
      this.stackIndices[level] = 0;
    }
  }

  finish() {
    const level = this.stackLevel;
    if (level >= this.stack.length) {
      return undefined;
    }
    return this.stack[level].nodes[0];
  }

  // Will pack seq and store it in the map
  pack(comparator, options, ownerID, collection) {
    if (options && options.type && options.type !== DEFAULT_TYPE) {
      throw new Error('Unsuported type by btree factory: ' + options.type);
    }

    this.order =
      options && options.btreeOrder ? options.btreeOrder : DEFAULT_BTREE_ORDER;

    const kc = KeyedCollection(collection);
    assertNotInfinite(kc.size);

    const plan = this.preparePlan(this.order, kc.size);

    this.comparator = comparator;
    this.options = options;
    this.ownerID = ownerID;
    this.stack = [];
    this.stackIndices = [];
    this.stackLevel = 0;
    this.entriesCnt = 0;

    const iter = kc.entries();
    this.runPlan(plan, iter);

    if (!iter.next().done) {
      throw new Error('iterator did not end when expected');
    }

    return this.finish();
  }
}

SortedMapBtreeNodePacker.cache = {};
SortedMapBtreeNodePacker.cacheSize = 0;

export class SortedMapBtreeNodeFactory extends SortedMapNodeFactory {
  createNode(comparator, options, ownerID, entries, nodes) {
    return new SortedMapBtreeNode(comparator, options, ownerID, entries, nodes);
  }

  createPacker() {
    return new SortedMapBtreeNodePacker();
  }

  createIterator(map, type, reverse) {
    return new SortedMapBtreeNodeIterator(map, type, reverse);
  }
}
