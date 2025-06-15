import { SHIFT, SIZE, MASK, SetRef } from '../TrieUtils';

import { SHAPE_NODELIST, DONE } from '../const';

const kernelIndexedVNodeCreate = (array, ownerID) => {
  return {
    array,
    ownerID,
  };
};

const kernelIndexedVNodeOpEditable = (vnode, ownerID) => {
  if (ownerID && vnode && ownerID === vnode.ownerID) {
    return vnode;
  }
  return kernelIndexedVNodeCreate(vnode ? vnode.array.slice() : [], ownerID);
};

const kernelIndexedVNodeOpUpdate = (
  vnode,
  ownerID,
  level,
  index,
  value,
  didAlter
) => {
  const idx = (index >>> level) & MASK;
  const nodeHas = vnode && idx < vnode.array.length;
  if (!nodeHas && value === undefined) {
    return vnode;
  }

  let newNode;

  if (level > 0) {
    const lowerNode = vnode && vnode.array[idx];
    const newLowerNode = kernelIndexedVNodeOpUpdate(
      lowerNode,
      ownerID,
      level - SHIFT,
      index,
      value,
      didAlter
    );
    if (newLowerNode === lowerNode) {
      return vnode;
    }
    newNode = kernelIndexedVNodeOpEditable(vnode, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }

  if (nodeHas && vnode.array[idx] === value) {
    return vnode;
  }

  if (didAlter) {
    SetRef(didAlter);
  }

  newNode = kernelIndexedVNodeOpEditable(vnode, ownerID);
  if (value === undefined && idx === newNode.array.length - 1) {
    newNode.array.pop();
  } else {
    newNode.array[idx] = value;
  }
  return newNode;
};

const kernelIndexedVNodeOpRemoveBefore = (vnode, ownerID, level, index) => {
  if (
    (index & ((1 << (level + SHIFT)) - 1)) === 0 ||
    vnode.array.length === 0
  ) {
    return vnode;
  }
  const originIndex = (index >>> level) & MASK;
  if (originIndex >= vnode.array.length) {
    return kernelIndexedVNodeCreate([], ownerID);
  }
  const removingFirst = originIndex === 0;
  let newChild;
  if (level > 0) {
    const oldChild = vnode.array[originIndex];
    newChild =
      oldChild &&
      kernelIndexedVNodeOpRemoveBefore(oldChild, ownerID, level - SHIFT, index);
    if (newChild === oldChild && removingFirst) {
      return vnode;
    }
  }
  if (removingFirst && !newChild) {
    return vnode;
  }
  const editable = kernelIndexedVNodeOpEditable(vnode, ownerID);
  if (!removingFirst) {
    for (let ii = 0; ii < originIndex; ii++) {
      editable.array[ii] = undefined;
    }
  }
  if (newChild) {
    editable.array[originIndex] = newChild;
  }
  return editable;
};

const kernelIndexedVNodeOpRemoveAfter = (vnode, ownerID, level, index) => {
  if (
    index === (level ? 1 << (level + SHIFT) : SIZE) ||
    vnode.array.length === 0
  ) {
    return vnode;
  }
  const sizeIndex = ((index - 1) >>> level) & MASK;
  if (sizeIndex >= vnode.array.length) {
    return vnode;
  }

  let newChild;
  if (level > 0) {
    const oldChild = vnode.array[sizeIndex];
    newChild =
      oldChild &&
      kernelIndexedVNodeOpRemoveAfter(oldChild, ownerID, level - SHIFT, index);
    if (newChild === oldChild && sizeIndex === vnode.array.length - 1) {
      return vnode;
    }
  }

  const editable = kernelIndexedVNodeOpEditable(vnode, ownerID);
  editable.array.splice(sizeIndex + 1);
  if (newChild) {
    editable.array[sizeIndex] = newChild;
  }
  return editable;
};

const kernelIndexedCreate = (
  origin,
  capacity,
  level,
  root,
  tail,
  ownerID,
  hash
) => {
  const nls = {};
  nls.size = capacity - origin;
  nls._origin = origin;
  nls._capacity = capacity;
  nls._level = level;
  nls._root = root;
  nls._tail = tail;
  nls.__ownerID = ownerID;
  nls.__hash = hash;
  nls.__altered = false;
  nls.__shape = SHAPE_NODELIST;

  return nls;
};

const kernelIndexedCreateEmpty = () => {
  return kernelIndexedCreate(0, 0, SHIFT);
};

const kernelIndexedOpSizeTailOffset = (size) => {
  return size < SIZE ? 0 : ((size - 1) >>> SHIFT) << SHIFT;
};

const kernelIndexedOpFindVNodeFor = (list, rawIndex) => {
  if (rawIndex >= kernelIndexedOpSizeTailOffset(list._capacity)) {
    return list._tail;
  }
  if (rawIndex < 1 << (list._level + SHIFT)) {
    let node = list._root;
    let level = list._level;
    while (node && level > 0) {
      node = node.array[(rawIndex >>> level) & MASK];
      level -= SHIFT;
    }
    return node;
  }
};

const kernelIndexedOpIterate = (list, reverse) => {
  const left = list._origin;
  const right = list._capacity;
  const tailPos = kernelIndexedOpSizeTailOffset(right);
  const tail = list._tail;

  return iterateNodeOrLeaf(list._root, list._level, 0);

  function iterateNodeOrLeaf(node, level, offset) {
    return level === 0
      ? iterateLeaf(node, offset)
      : iterateNode(node, level, offset);
  }

  function iterateLeaf(node, offset) {
    const array = offset === tailPos ? tail && tail.array : node && node.array;
    let from = offset > left ? 0 : left - offset;
    let to = right - offset;
    if (to > SIZE) {
      to = SIZE;
    }
    return () => {
      if (from === to) {
        return DONE;
      }
      const idx = reverse ? --to : from++;
      return array && array[idx];
    };
  }

  function iterateNode(node, level, offset) {
    let values;
    const array = node && node.array;
    let from = offset > left ? 0 : (left - offset) >> level;
    let to = ((right - offset) >> level) + 1;
    if (to > SIZE) {
      to = SIZE;
    }
    return () => {
      while (true) {
        if (values) {
          const value = values();
          if (value !== DONE) {
            return value;
          }
          values = null;
        }
        if (from === to) {
          return DONE;
        }
        const idx = reverse ? --to : from++;
        values = iterateNodeOrLeaf(
          array && array[idx],
          level - SHIFT,
          offset + (idx << level)
        );
      }
    };
  }
};

export {
  kernelIndexedVNodeCreate,
  kernelIndexedVNodeOpEditable,
  kernelIndexedVNodeOpUpdate,
  kernelIndexedVNodeOpRemoveAfter,
  kernelIndexedVNodeOpRemoveBefore,
  kernelIndexedCreate,
  kernelIndexedCreateEmpty,
  kernelIndexedOpFindVNodeFor,
  kernelIndexedOpIterate,
};
