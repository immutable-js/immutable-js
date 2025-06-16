import { Iterator, iteratorValue, iteratorDone } from './Iterator';
import { SeqIndexedWhenNotIndexed } from './Seq';
import { SeqArray } from './SeqArray';
import { wholeSlice, resolveBegin, resolveEnd, wrapIndex } from './TrieUtils';
import {
  collectionOpAsMutable,
  collectionOpAsImmutable,
} from './collection/collection';
import { collectionIndexedPropertiesCreate } from './collection/collectionIndexed';
import { IS_STACK_SYMBOL, SHAPE_STACK } from './const';
import { isStack } from './predicates/isStack';
import transformToMethods from './transformToMethods';
import { assertNotInfinite, flagSpread } from './utils';

const stackOpToString = (cx) => {
  return cx.__toString('Stack [', ']');
};

const stackOpGet = (cx, index, notSetValue) => {
  let head = cx._head;
  index = wrapIndex(cx, index);
  while (head && index--) {
    head = head.next;
  }
  return head ? head.value : notSetValue;
};

const stackOpPeek = (cx) => {
  return cx._head && cx._head.value;
};

// @pragma Modification

const stackOpPush = (cx, values) => {
  if (values.length === 0) {
    return cx;
  }
  const newSize = cx.size + values.length;
  let head = cx._head;
  for (let ii = values.length - 1; ii >= 0; ii--) {
    head = {
      value: values[ii],
      next: head,
    };
  }
  if (cx.__ownerID) {
    cx.size = newSize;
    cx._head = head;
    cx.__hash = undefined;
    cx.__altered = true;
    return cx;
  }
  return stackCreate(newSize, head);
};

const stackOpPushAll = (cx, iter) => {
  iter = SeqIndexedWhenNotIndexed(iter);
  if (iter.size === 0) {
    return cx;
  }
  if (cx.size === 0 && isStack(iter)) {
    return iter;
  }
  assertNotInfinite(iter.size);
  let newSize = cx.size;
  let head = cx._head;
  iter.__iterate((value) => {
    newSize++;
    head = {
      value: value,
      next: head,
    };
  }, /* reverse */ true);
  if (cx.__ownerID) {
    cx.size = newSize;
    cx._head = head;
    cx.__hash = undefined;
    cx.__altered = true;
    return cx;
  }
  return stackCreate(newSize, head);
};

const stackOpPop = (cx) => {
  return cx.slice(1);
};

const stackOpClear = (cx) => {
  if (cx.size === 0) {
    return cx;
  }
  if (cx.__ownerID) {
    cx.size = 0;
    cx._head = undefined;
    cx.__hash = undefined;
    cx.__altered = true;
    return cx;
  }
  return stackCreateEmpty();
};

const stackOpSlice = (cx, begin, end) => {
  if (wholeSlice(begin, end, cx.size)) {
    return cx;
  }
  let resolvedBegin = resolveBegin(begin, cx.size);
  const resolvedEnd = resolveEnd(end, cx.size);
  if (resolvedEnd !== cx.size) {
    return cx.slice(begin, end);
  }
  const newSize = cx.size - resolvedBegin;
  let head = cx._head;
  while (resolvedBegin--) {
    head = head.next;
  }
  if (cx.__ownerID) {
    cx.size = newSize;
    cx._head = head;
    cx.__hash = undefined;
    cx.__altered = true;
    return cx;
  }
  return stackCreate(newSize, head);
};

// @pragma Mutability

const stackOpEnsureOwner = (cx, ownerID) => {
  if (ownerID === cx.__ownerID) {
    return cx;
  }
  if (!ownerID) {
    if (cx.size === 0) {
      return stackCreateEmpty();
    }
    cx.__ownerID = ownerID;
    cx.__altered = false;
    return cx;
  }
  return stackCreate(cx.size, cx._head, ownerID, cx.__hash);
};

// @pragma Iteration

const stackOpIterate = (cx, fn, reverse) => {
  if (reverse) {
    return SeqArray(cx.toArray()).__iterate((v, k) => fn(v, k, cx), reverse);
  }
  let iterations = 0;
  let node = cx._head;
  while (node) {
    if (fn(node.value, iterations++, cx) === false) {
      break;
    }
    node = node.next;
  }
  return iterations;
};

const stackOpIterator = (cx, type, reverse) => {
  if (reverse) {
    return SeqArray(cx.toArray()).__iterator(type, reverse);
  }
  let iterations = 0;
  let node = cx._head;
  return new Iterator(() => {
    if (node) {
      const value = node.value;
      node = node.next;
      return iteratorValue(type, iterations++, value);
    }
    return iteratorDone();
  });
};

const stackPropertiesCreate = ((cache) => () => {
  cache =
    cache ||
    (cache = Object.assign(
      {},
      collectionIndexedPropertiesCreate(),
      {
        [IS_STACK_SYMBOL]: true,
        create: Stack,
        ['@@transducer/init']: function () {
          return collectionOpAsMutable(this);
        },
        ['@@transducer/step']: function (result, arr) {
          return result.unshift(arr);
        },
        ['@@transducer/result']: function (obj) {
          return collectionOpAsImmutable(obj);
        },
      },
      transformToMethods({
        toString: stackOpToString,
        get: stackOpGet,
        peek: stackOpPeek,
        push: flagSpread(stackOpPush),
        unshift: flagSpread(stackOpPush),
        pushAll: stackOpPushAll,
        unshiftAll: stackOpPushAll,
        pop: stackOpPop,
        shift: stackOpPop,
        clear: stackOpClear,
        slice: stackOpSlice,
        __ensureOwner: stackOpEnsureOwner,
        __iterate: stackOpIterate,
        __iterator: stackOpIterator,
      })
    ));

  return cache;
})();

const stackCreate = (size, head, ownerID, hash) => {
  const stack = Object.create(stackPropertiesCreate());
  stack.size = size;
  stack._head = head;
  stack.__ownerID = ownerID;
  stack.__hash = hash;
  stack.__altered = false;
  stack.__shape = SHAPE_STACK;
  return stack;
};

const stackCreateEmpty = ((cache) => () => {
  return cache || (cache = stackCreate(0));
})();

export const Stack = (value) =>
  value === undefined || value === null
    ? stackCreateEmpty()
    : isStack(value)
      ? value
      : stackCreateEmpty().pushAll(value);

Stack.of = (...args) => Stack(args);
Stack.isStack = isStack;
