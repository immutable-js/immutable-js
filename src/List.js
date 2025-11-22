import { Iterator, iteratorValue, iteratorDone, hasIterator } from './Iterator';

import { SeqIndexed, SeqIndexedWhenNotIndexed } from './Seq';
import {
  SHIFT,
  SIZE,
  MASK,
  OwnerID,
  MakeRef,
  wrapIndex,
  wholeSlice,
  resolveBegin,
  resolveEnd,
} from './TrieUtils';
import {
  collectionOpWithMutations,
  collectionOpWasAltered,
  collectionOpAsMutable,
  collectionOpAsImmutable,
} from './collection/collection';

import { collectionIndexedPropertiesCreate } from './collection/collectionIndexed.js';

import {
  kernelIndexedOpIterate,
  kernelIndexedOpFindVNodeFor,
  kernelIndexedVNodeCreate,
  kernelIndexedVNodeOpUpdate,
  kernelIndexedVNodeOpEditable,
  kernelIndexedVNodeOpRemoveBefore,
  kernelIndexedVNodeOpRemoveAfter,
} from './collection/kernelIndexed';
import { DELETE, IS_LIST_SYMBOL, SHAPE_LIST, DONE } from './const';
import { isList } from './predicates/isList';
import transformToMethods from './transformToMethods';
import { flagSpread, assertNotInfinite } from './utils';

const listToString = (cx) => {
  return cx.__toString('List [', ']');
};

const listGet = (cx, index, notSetValue) => {
  index = wrapIndex(cx, index);
  if (index >= 0 && index < cx.size) {
    index += cx._origin;
    const node = kernelIndexedOpFindVNodeFor(cx, index);
    return node && node.array[index & MASK];
  }
  return notSetValue;
};

const listRemove = (cx, index) => {
  return !cx.has(index)
    ? cx
    : index === 0
      ? cx.shift()
      : index === cx.size - 1
        ? cx.pop()
        : cx.splice(index, 1);
};

const listUpdate = (list, index, value) => {
  index = wrapIndex(list, index);

  if (index !== index) {
    return list;
  }

  if (index >= list.size || index < 0) {
    return collectionOpWithMutations(list, (list) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
      index < 0
        ? listBoundsSet(list, index).set(0, value)
        : listBoundsSet(list, 0, index + 1).set(index, value);
    });
  }

  index += list._origin;

  let newTail = list._tail;
  let newRoot = list._root;
  const didAlter = MakeRef();
  if (index >= getTailOffset(list._capacity)) {
    newTail = kernelIndexedVNodeOpUpdate(
      newTail,
      list.__ownerID,
      0,
      index,
      value,
      didAlter
    );
  } else {
    newRoot = kernelIndexedVNodeOpUpdate(
      newRoot,
      list.__ownerID,
      list._level,
      index,
      value,
      didAlter
    );
  }

  if (!didAlter.value) {
    return list;
  }

  if (list.__ownerID) {
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return listCreate(
    list._origin,
    list._capacity,
    list._level,
    newRoot,
    newTail
  );
};

const listBoundsSet = (list, begin, end) => {
  // Sanitize begin & end using this shorthand for ToInt32(argument)
  // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
  if (begin !== undefined) {
    begin |= 0;
  }
  if (end !== undefined) {
    end |= 0;
  }
  const owner = list.__ownerID || new OwnerID();
  let oldOrigin = list._origin;
  let oldCapacity = list._capacity;
  let newOrigin = oldOrigin + begin;
  let newCapacity =
    end === undefined
      ? oldCapacity
      : end < 0
        ? oldCapacity + end
        : oldOrigin + end;
  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
    return list;
  }

  // If it's going to end after it starts, it's empty.
  if (newOrigin >= newCapacity) {
    // throw new Error('unverified')
    return listClear(list);
  }

  let newLevel = list._level;
  let newRoot = list._root;

  // New origin might need creating a higher root.
  let offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    newRoot = kernelIndexedVNodeCreate(
      newRoot && newRoot.array.length ? [undefined, newRoot] : [],
      owner
    );
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
  }
  if (offsetShift) {
    newOrigin += offsetShift;
    oldOrigin += offsetShift;
    newCapacity += offsetShift;
    oldCapacity += offsetShift;
  }

  const oldTailOffset = getTailOffset(oldCapacity);
  const newTailOffset = getTailOffset(newCapacity);

  // New size might need creating a higher root.
  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
    newRoot = kernelIndexedVNodeCreate(
      newRoot && newRoot.array.length ? [newRoot] : [],
      owner
    );
    newLevel += SHIFT;
  }

  // Locate or create the new tail.
  const oldTail = list._tail;
  let newTail =
    newTailOffset < oldTailOffset
      ? kernelIndexedOpFindVNodeFor(list, newCapacity - 1)
      : newTailOffset > oldTailOffset
        ? kernelIndexedVNodeCreate([], owner)
        : oldTail;

  // Merge Tail into tree.
  if (
    oldTail &&
    newTailOffset > oldTailOffset &&
    newOrigin < oldCapacity &&
    oldTail.array.length
  ) {
    newRoot = kernelIndexedVNodeOpEditable(newRoot, owner);
    let node = newRoot;
    for (let level = newLevel; level > SHIFT; level -= SHIFT) {
      const idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = kernelIndexedVNodeOpEditable(
        node.array[idx],
        owner
      );
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }

  // If the size has been reduced, there's a chance the tail needs to be trimmed.
  if (newCapacity < oldCapacity) {
    newTail =
      newTail &&
      kernelIndexedVNodeOpRemoveAfter(newTail, owner, 0, newCapacity);
  }

  // If the new origin is within the tail, then we do not need a root.
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newCapacity -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail =
      newTail && kernelIndexedVNodeOpRemoveBefore(newTail, owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
    offsetShift = 0;

    // Identify the new top root node of the subtree of the old root.
    while (newRoot) {
      const beginIndex = (newOrigin >>> newLevel) & MASK;
      if ((beginIndex !== newTailOffset >>> newLevel) & MASK) {
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
      newRoot = kernelIndexedVNodeOpRemoveBefore(
        newRoot,
        owner,
        newLevel,
        newOrigin - offsetShift
      );
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = kernelIndexedVNodeOpRemoveAfter(
        newRoot,
        owner,
        newLevel,
        newTailOffset - offsetShift
      );
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newCapacity -= offsetShift;
    }
  }

  if (list.__ownerID) {
    list.size = newCapacity - newOrigin;
    list._origin = newOrigin;
    list._capacity = newCapacity;
    list._level = newLevel;
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return listCreate(newOrigin, newCapacity, newLevel, newRoot, newTail);
};

function getTailOffset(size) {
  return size < SIZE ? 0 : ((size - 1) >>> SHIFT) << SHIFT;
}

const listInsert = (cx, index, value) => {
  return cx.splice(index, 0, value);
};

const listClear = (cx) => {
  if (cx.size === 0) {
    return cx;
  }
  if (cx.__ownerID) {
    cx.size = cx._origin = cx._capacity = 0;
    cx._level = SHIFT;
    cx._root = cx._tail = cx.__hash = undefined;
    cx.__altered = true;
    return cx;
  }
  return listCreateEmpty();
};

const listPush = (cx, values) => {
  const oldSize = cx.size;

  return collectionOpWithMutations(cx, (list) => {
    listBoundsSet(list, 0, oldSize + values.length);
    for (let ii = 0; ii < values.length; ii++) {
      list.set(oldSize + ii, values[ii]);
    }
  });
};

const listUnshift = (cx, values) => {
  return collectionOpWithMutations(cx, (list) => {
    listBoundsSet(list, -values.length);
    for (let ii = 0; ii < values.length; ii++) {
      list.set(ii, values[ii]);
    }
  });
};

const listShuffle = (cx, random) => {
  random = random || Math.random;

  return collectionOpWithMutations(cx, (mutable) => {
    // implementation of the Fisher-Yates shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    let current = mutable.size;
    let destination;
    let tmp;

    while (current) {
      destination = Math.floor(random() * current--);

      tmp = mutable.get(destination);
      mutable.set(destination, mutable.get(current));
      mutable.set(current, tmp);
    }
  });
};

const listConcat = (cx, collections) => {
  const seqs = [];

  for (let i = 0; i < collections.length; i++) {
    const argument = collections[i];
    const seq = SeqIndexedWhenNotIndexed(
      typeof argument !== 'string' && hasIterator(argument)
        ? argument
        : [argument]
    );

    if (seq.size !== 0) {
      seqs.push(seq);
    }
  }
  if (seqs.length === 0) {
    return cx;
  }
  if (cx.size === 0 && !cx.__ownerID && seqs.length === 1) {
    return List(seqs[0]);
  }

  return collectionOpWithMutations(cx, (list) => {
    seqs.forEach((seq) => seq.forEach((value) => list.push(value)));
  });
};

const listMap = (cx, mapper, context) => {
  return collectionOpWithMutations(cx, (list) => {
    for (let i = 0; i < cx.size; i++) {
      list.set(i, mapper.call(context, list.get(i), i, cx));
    }
  });
};

const listSlice = (cx, begin, end) => {
  const size = cx.size;
  if (wholeSlice(begin, end, size)) {
    return cx;
  }
  return listBoundsSet(cx, resolveBegin(begin, size), resolveEnd(end, size));
};

const list__iterator = (cx, type, reverse) => {
  let index = reverse ? cx.size : 0;
  const values = kernelIndexedOpIterate(cx, reverse);
  return new Iterator(() => {
    const value = values();
    return value === DONE
      ? iteratorDone()
      : iteratorValue(type, reverse ? --index : index++, value);
  });
};

const list__iterate = (cx, fn, reverse) => {
  let index = reverse ? cx.size : 0;
  const values = kernelIndexedOpIterate(cx, reverse);
  let value;
  while ((value = values()) !== DONE) {
    if (fn(value, reverse ? --index : index++, cx) === false) {
      break;
    }
  }
  return index;
};

const list__ensureOwner = (cx, ownerID) => {
  if (ownerID === cx.__ownerID) {
    return cx;
  }
  if (!ownerID) {
    if (cx.size === 0) {
      return listCreateEmpty();
    }
    cx.__ownerID = ownerID;
    cx.__altered = false;
    return cx;
  }
  return listCreate(
    cx._origin,
    cx._capacity,
    cx._level,
    cx._root,
    cx._tail,
    ownerID,
    cx.__hash
  );
};

export const listPropertiesCreate = (
  (cache) => () =>
    cache ||
    (cache = Object.assign(
      {},
      collectionIndexedPropertiesCreate(),
      {
        create: (value) => List(value),
      },
      transformToMethods({
        [IS_LIST_SYMBOL]: true,
        [DELETE]: listRemove,
        toString: listToString,
        get: listGet,
        set: listUpdate,
        remove: listRemove,
        insert: listInsert,
        clear: listClear,
        push: flagSpread(listPush),
        pop: (cx) => listBoundsSet(cx, 0, -1),
        unshift: flagSpread(listUnshift),
        shift: (cx) => listBoundsSet(cx, 1),
        shuffle: (cx, random) => listShuffle(cx, random),
        concat: flagSpread(listConcat),
        setSize: (cx, size) => listBoundsSet(cx, 0, size),
        map: listMap,
        slice: listSlice,
        wasAltered: collectionOpWasAltered,
        __iterator: list__iterator,
        __iterate: list__iterate,
        __ensureOwner: list__ensureOwner,
      })
    ))
)();

const listCreate = (origin, capacity, level, root, tail, ownerID, hash) => {
  const list = Object.create(listPropertiesCreate());
  list.size = capacity - origin;
  list._origin = origin;
  list._capacity = capacity;
  list._level = level;
  list._root = root;
  list._tail = tail;
  list.__ownerID = ownerID;
  list.__hash = hash;
  list.__altered = false;
  list.__shape = SHAPE_LIST;

  return list;
};

export const listCreateEmpty = () => {
  return listCreate(0, 0, SHIFT);
};

export const List = (value) => {
  if (value === undefined || value === null) {
    return listCreateEmpty();
  }
  if (isList(value)) {
    return value;
  }
  const iter = SeqIndexed(value);
  const size = iter.size;
  if (size === 0) {
    return listCreateEmpty();
  }
  assertNotInfinite(size);
  if (size > 0 && size < SIZE) {
    return listCreate(
      0,
      size,
      SHIFT,
      null,
      kernelIndexedVNodeCreate(iter.toArray())
    );
  }

  return collectionOpWithMutations(listCreateEmpty(), (list) => {
    list.setSize(size);
    iter.forEach((v, i) => list.set(i, v));
  });
};

Object.assign(List, {
  isList,
  of: (...args) => List(args),
});
