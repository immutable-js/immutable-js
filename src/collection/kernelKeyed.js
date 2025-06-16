import { hash } from '../Hash';
import { SHIFT, SIZE, MASK, OwnerID, SetRef } from '../TrieUtils';
import {
  NOT_SET,
  SHAPE_NODEVALUE,
  SHAPE_NODEARRAYMAP,
  SHAPE_NODEHASHARRAYMAP,
  SHAPE_NODEHASHCOLLISION,
  SHAPE_NODEBITMAPINDEXED,
} from '../const';
import { is } from '../is';

import transformToMethods from '../transformToMethods';
import { arrCopy, spliceIn, spliceOut, setAt } from '../utils';

const MAX_ARRAY_MAP_SIZE = SIZE / 4;
const MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
const MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

const kernelKeyedHashArrayMapOpGet = (
  nham,
  shift,
  keyHash,
  key,
  notSetValue
) => {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  const idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  const node = nham.nodes[idx];
  return node
    ? node.get(shift + SHIFT, keyHash, key, notSetValue)
    : notSetValue;
};

const kernelKeyedHashArrayMapOpUpdate = (
  nham,
  ownerID,
  shift,
  keyHash,
  key,
  value,
  didChangeSize,
  didAlter
) => {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  const idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  const removed = value === NOT_SET;
  const nodes = nham.nodes;
  const node = nodes[idx];

  if (removed && !node) {
    return nham;
  }

  const newNode = kernelKeyedOpUpdateOrCreate(
    node,
    ownerID,
    shift + SHIFT,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );
  if (newNode === node) {
    return nham;
  }

  let newCount = nham.count;
  if (!node) {
    newCount++;
  } else if (!newNode) {
    newCount--;
    if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
      return kernelKeyedHashArrayMapOpNodesPack(ownerID, nodes, newCount, idx);
    }
  }

  const isEditable = ownerID && ownerID === nham.ownerID;
  const newNodes = setAt(nodes, idx, newNode, isEditable);

  if (isEditable) {
    nham.count = newCount;
    nham.nodes = newNodes;
    return nham;
  }

  return kernelKeyedHashArrayMapCreate(ownerID, newCount, newNodes);
};

const kernelKeyedHashCollisionOpUpdate = (
  nhc,
  ownerID,
  shift,
  keyHash,
  key,
  value,
  didChangeSize,
  didAlter
) => {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }

  const removed = value === NOT_SET;

  if (keyHash !== nhc.keyHash) {
    if (removed) {
      return nhc;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return kernelKeyedOpMergeInto(nhc, ownerID, shift, keyHash, [key, value]);
  }

  const entries = nhc.entries;
  let idx = 0;
  const len = entries.length;
  for (; idx < len; idx++) {
    if (is(key, entries[idx][0])) {
      break;
    }
  }
  const exists = idx < len;

  if (exists ? entries[idx][1] === value : removed) {
    return nhc;
  }

  SetRef(didAlter);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
  (removed || !exists) && SetRef(didChangeSize);

  if (removed && len === 2) {
    return kernelKeyedCreate(ownerID, nhc.keyHash, entries[idx ^ 1]);
  }

  const isEditable = ownerID && ownerID === nhc.ownerID;
  const newEntries = isEditable ? entries : arrCopy(entries);

  if (exists) {
    if (removed) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
      idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
    } else {
      newEntries[idx] = [key, value];
    }
  } else {
    newEntries.push([key, value]);
  }

  if (isEditable) {
    nhc.entries = newEntries;
    return nhc;
  }

  return kernelKeyedHashCollisionCreate(ownerID, nhc.keyHash, newEntries);
};

const kernelKeyedHashCollisionCreate = (
  (cache) => (ownerID, keyHash, entries) => {
    const nhc = Object.create(
      cache ||
        (cache = transformToMethods({
          shape: SHAPE_NODEHASHCOLLISION,
          get: kernelKeyedArrayEntryNodeOpGet,
          iterate: kernelKeyedArrayEntriesIterate,
          update: kernelKeyedHashCollisionOpUpdate,
        }))
    );

    nhc.ownerID = ownerID;
    nhc.keyHash = keyHash;
    nhc.entries = entries;

    return nhc;
  }
)();

const kernelKeyedBitmapIndexedOpNodesExpand = (
  ownerID,
  nodes,
  bitmap,
  including,
  node
) => {
  let count = 0;
  const expandedNodes = new Array(SIZE);
  for (let ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
  }
  expandedNodes[including] = node;

  return kernelKeyedHashArrayMapCreate(ownerID, count + 1, expandedNodes);
};

const kernelKeyedOpMergeInto = (node, ownerID, shift, keyHash, entry) => {
  if (node.keyHash === keyHash) {
    return kernelKeyedHashCollisionCreate(ownerID, keyHash, [
      node.entry,
      entry,
    ]);
  }

  const idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
  const idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

  let newNode;
  const nodes =
    idx1 === idx2
      ? [kernelKeyedOpMergeInto(node, ownerID, shift + SHIFT, keyHash, entry)]
      : ((newNode = kernelKeyedCreate(ownerID, keyHash, entry)),
        idx1 < idx2 ? [node, newNode] : [newNode, node]);

  return kernelKeyedBitmapIndexedCreate(
    ownerID,
    (1 << idx1) | (1 << idx2),
    nodes
  );
};

const kernelKeyedOpGet = (nv, shift, keyHash, key, notSetValue) => {
  return is(key, nv.entry[0]) ? nv.entry[1] : notSetValue;
};

const kernelKeyedOpUpdate = (
  nv,
  ownerID,
  shift,
  keyHash,
  key,
  value,
  didChangeSize,
  didAlter
) => {
  const removed = value === NOT_SET;
  const keyMatch = is(key, nv.entry[0]);
  if (keyMatch ? value === nv.entry[1] : removed) {
    return nv;
  }

  SetRef(didAlter);

  if (removed) {
    SetRef(didChangeSize);
    return; // undefined
  }

  if (keyMatch) {
    if (ownerID && ownerID === nv.ownerID) {
      nv.entry[1] = value;
      return nv;
    }

    return kernelKeyedCreate(ownerID, nv.keyHash, [key, value]);
  }

  SetRef(didChangeSize);
  return kernelKeyedOpMergeInto(nv, ownerID, shift, hash(key), [key, value]);
};

const kernelKeyedOpIterate = (nv, fn) => {
  return fn(nv.entry);
};

const kernelKeyedCreate = ((cache) => (ownerID, keyHash, entry) => {
  const nv = Object.create(
    cache ||
      (cache = transformToMethods({
        shape: SHAPE_NODEVALUE,
        get: kernelKeyedOpGet,
        iterate: kernelKeyedOpIterate,
        update: kernelKeyedOpUpdate,
      }))
  );

  nv.ownerID = ownerID;
  nv.keyHash = keyHash;
  nv.entry = entry;

  return nv;
})();

const kernelKeyedBitmapIndexedOpNodeIsLeaf = (node) => {
  return (
    node.shape === SHAPE_NODEVALUE || node.shape === SHAPE_NODEHASHCOLLISION
  );
};

const kernelKeyedHashArrayMapOpNodesPack = (
  ownerID,
  nodes,
  count,
  excluding
) => {
  let bitmap = 0;
  let packedII = 0;
  const packedNodes = new Array(count);
  for (let ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
    const node = nodes[ii];
    if (node !== undefined && ii !== excluding) {
      bitmap |= bit;
      packedNodes[packedII++] = node;
    }
  }

  return kernelKeyedBitmapIndexedCreate(ownerID, bitmap, packedNodes);
};

const kernelKeyedOpUpdateOrCreate = (
  node,
  ownerID,
  shift,
  keyHash,
  key,
  value,
  didChangeSize,
  didAlter
) => {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);

    return kernelKeyedCreate(ownerID, keyHash, [key, value]);
  }
  return node.update(
    ownerID,
    shift,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );
};

const popCount = (x) => {
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x += x >> 8;
  x += x >> 16;
  return x & 0x7f;
};

const kernelKeyedBitmapIndexedGet = (nbi, shift, keyHash, key, notSetValue) => {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  const bit = 1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK);
  const bitmap = nbi.bitmap;
  return (bitmap & bit) === 0
    ? notSetValue
    : nbi.nodes[popCount(bitmap & (bit - 1))].get(
        shift + SHIFT,
        keyHash,
        key,
        notSetValue
      );
};

const kernelKeyedBitmapIndexedOpUpdate = (
  nbi,
  ownerID,
  shift,
  keyHash,
  key,
  value,
  didChangeSize,
  didAlter
) => {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  const keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  const bit = 1 << keyHashFrag;
  const bitmap = nbi.bitmap;
  const exists = (bitmap & bit) !== 0;

  if (!exists && value === NOT_SET) {
    return nbi;
  }

  const idx = popCount(bitmap & (bit - 1));
  const nodes = nbi.nodes;
  const node = exists ? nodes[idx] : undefined;
  const newNode = kernelKeyedOpUpdateOrCreate(
    node,
    ownerID,
    shift + SHIFT,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );

  if (newNode === node) {
    return nbi;
  }

  if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
    return kernelKeyedBitmapIndexedOpNodesExpand(
      ownerID,
      nodes,
      bitmap,
      keyHashFrag,
      newNode
    );
  }

  if (
    exists &&
    !newNode &&
    nodes.length === 2 &&
    kernelKeyedBitmapIndexedOpNodeIsLeaf(nodes[idx ^ 1])
  ) {
    return nodes[idx ^ 1];
  }

  if (
    exists &&
    newNode &&
    nodes.length === 1 &&
    kernelKeyedBitmapIndexedOpNodeIsLeaf(newNode)
  ) {
    return newNode;
  }

  const isEditable = ownerID && ownerID === nbi.ownerID;
  const newBitmap = exists ? (newNode ? bitmap : bitmap ^ bit) : bitmap | bit;
  const newNodes = exists
    ? newNode
      ? setAt(nodes, idx, newNode, isEditable)
      : spliceOut(nodes, idx, isEditable)
    : spliceIn(nodes, idx, newNode, isEditable);

  if (isEditable) {
    nbi.bitmap = newBitmap;
    nbi.nodes = newNodes;
    return nbi;
  }

  return kernelKeyedBitmapIndexedCreate(ownerID, newBitmap, newNodes);
};

const kernelKeyedBitmapIndexedCreate = ((cache) => (ownerID, bitmap, nodes) => {
  const nbi = Object.create(
    cache ||
      (cache = transformToMethods({
        shape: SHAPE_NODEBITMAPINDEXED,
        get: kernelKeyedBitmapIndexedGet,
        iterate: kernelKeyedMapOpNodesIterate,
        update: kernelKeyedBitmapIndexedOpUpdate,
      }))
  );

  nbi.ownerID = ownerID;
  nbi.bitmap = bitmap;
  nbi.nodes = nodes;

  return nbi;
})();

const kernelKeyedArrayEntriesIterate = (node, fn, reverse) => {
  const entries = node.entries;
  for (let ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
    if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
      return false;
    }
  }
};

const kernelKeyedArrayEntryNodeOpGet = (
  nam,
  shift,
  keyHash,
  key,
  notSetValue
) => {
  const entries = nam.entries;
  for (let ii = 0, len = entries.length; ii < len; ii++) {
    if (is(key, entries[ii][0])) {
      return entries[ii][1];
    }
  }
  return notSetValue;
};

const kernelKeyedArrayMapOpUpdate = (
  nam,
  ownerID,
  shift,
  keyHash,
  key,
  value,
  didChangeSize,
  didAlter
) => {
  const removed = value === NOT_SET;

  const entries = nam.entries;
  let idx = 0;
  const len = entries.length;
  for (; idx < len; idx++) {
    if (is(key, entries[idx][0])) {
      break;
    }
  }
  const exists = idx < len;

  if (exists ? entries[idx][1] === value : removed) {
    return nam;
  }

  SetRef(didAlter);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
  (removed || !exists) && SetRef(didChangeSize);

  if (removed && entries.length === 1) {
    return; // undefined
  }

  if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
    return kernelKeyedArrayMapOpNodesCreate(ownerID, entries, key, value);
  }

  const isEditable = ownerID && ownerID === nam.ownerID;
  const newEntries = isEditable ? entries : arrCopy(entries);

  if (exists) {
    if (removed) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
      idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
    } else {
      newEntries[idx] = [key, value];
    }
  } else {
    newEntries.push([key, value]);
  }

  if (isEditable) {
    nam.entries = newEntries;
    return nam;
  }

  return kernelKeyedArrayMapCreate(ownerID, newEntries);
};

const kernelKeyedArrayMapCreate = ((cache) => (ownerID, entries) => {
  const nam = Object.create(
    cache ||
      (cache = transformToMethods({
        shape: SHAPE_NODEARRAYMAP,
        get: kernelKeyedArrayEntryNodeOpGet,
        iterate: kernelKeyedArrayEntriesIterate,
        update: kernelKeyedArrayMapOpUpdate,
      }))
  );

  nam.ownerID = ownerID;
  nam.entries = entries;

  return nam;
})();

const kernelKeyedArrayMapOpNodesCreate = (ownerID, entries, key, value) => {
  if (!ownerID) {
    ownerID = new OwnerID();
  }

  let node = kernelKeyedCreate(ownerID, hash(key), [key, value]);
  for (let ii = 0; ii < entries.length; ii++) {
    const entry = entries[ii];
    node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
  }
  return node;
};

const kernelKeyedMapOpNodesIterate = (collection, fn, reverse) => {
  const nodes = collection.nodes;
  for (let ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
    const node = nodes[reverse ? maxIndex - ii : ii];
    if (node && node.iterate(fn, reverse) === false) {
      return false;
    }
  }
};

const kernelKeyedHashArrayMapCreate = ((cache) => (ownerID, count, nodes) => {
  const nham = Object.create(
    cache ||
      (cache = transformToMethods({
        shape: SHAPE_NODEHASHARRAYMAP,
        get: kernelKeyedHashArrayMapOpGet,
        iterate: kernelKeyedMapOpNodesIterate,
        update: kernelKeyedHashArrayMapOpUpdate,
      }))
  );

  nham.ownerID = ownerID;
  nham.count = count;
  nham.nodes = nodes;

  return nham;
})();

const kernelKeyedOpHas = (cx, searchKey) => {
  return cx.get(searchKey, NOT_SET) !== NOT_SET;
};

export {
  kernelKeyedArrayMapCreate,
  kernelKeyedArrayMapOpUpdate,
  kernelKeyedArrayMapOpNodesCreate,
  kernelKeyedHashArrayMapCreate,
  kernelKeyedHashArrayMapOpGet,
  kernelKeyedHashArrayMapOpUpdate,
  kernelKeyedHashArrayMapOpNodesPack,
  kernelKeyedHashCollisionCreate,
  kernelKeyedHashCollisionOpUpdate,
  kernelKeyedBitmapIndexedCreate,
  kernelKeyedBitmapIndexedGet,
  kernelKeyedBitmapIndexedOpUpdate,
  kernelKeyedBitmapIndexedOpNodesExpand,
  kernelKeyedBitmapIndexedOpNodeIsLeaf,
  kernelKeyedMapOpNodesIterate,
  kernelKeyedArrayEntryNodeOpGet,
  kernelKeyedArrayEntriesIterate,
  kernelKeyedCreate,
  kernelKeyedOpGet,
  kernelKeyedOpIterate,
  kernelKeyedOpUpdate,
  kernelKeyedOpUpdateOrCreate,
  kernelKeyedOpMergeInto,
  kernelKeyedOpHas,
};
