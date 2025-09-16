import { IndexedCollection, IndexedCollectionImpl } from './Collection';
import { Iterator, iteratorValue, iteratorDone } from './Iterator';
import { ArraySeq } from './Seq';
import { wholeSlice, resolveBegin, resolveEnd, wrapIndex } from './TrieUtils';
import { asImmutable } from './methods/asImmutable';
import { asMutable } from './methods/asMutable';
import { wasAltered } from './methods/wasAltered';
import { withMutations } from './methods/withMutations';
import { IS_STACK_SYMBOL, isStack } from './predicates/isStack';
import assertNotInfinite from './utils/assertNotInfinite';

export const Stack = (value) =>
  value === undefined || value === null
    ? emptyStack()
    : isStack(value)
      ? value
      : emptyStack().pushAll(value);

Stack.of = function (...values) {
  return Stack(values);
};

export class StackImpl extends IndexedCollectionImpl {
  create(value) {
    return Stack(value);
  }

  toString() {
    return this.__toString('Stack [', ']');
  }

  // @pragma Access

  get(index, notSetValue) {
    let head = this._head;
    index = wrapIndex(this, index);
    while (head && index--) {
      head = head.next;
    }
    return head ? head.value : notSetValue;
  }

  peek() {
    return this._head && this._head.value;
  }

  // @pragma Modification

  push(...values) {
    if (values.length === 0) {
      return this;
    }
    const newSize = this.size + values.length;
    let head = this._head;
    for (let ii = values.length - 1; ii >= 0; ii--) {
      head = {
        value: values[ii],
        next: head,
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

  pushAll(iter) {
    iter = IndexedCollection(iter);
    if (iter.size === 0) {
      return this;
    }
    if (this.size === 0 && isStack(iter)) {
      return iter;
    }
    assertNotInfinite(iter.size);
    let newSize = this.size;
    let head = this._head;
    iter.__iterate((value) => {
      newSize++;
      head = {
        value: value,
        next: head,
      };
    }, /* reverse */ true);
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  }

  pop() {
    return this.slice(1);
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
    return emptyStack();
  }

  slice(begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    let resolvedBegin = resolveBegin(begin, this.size);
    const resolvedEnd = resolveEnd(end, this.size);
    if (resolvedEnd !== this.size) {
      // super.slice(begin, end);
      return IndexedCollectionImpl.prototype.slice.call(this, begin, end);
    }
    const newSize = this.size - resolvedBegin;
    let head = this._head;
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

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyStack();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeStack(this.size, this._head, ownerID, this.__hash);
  }

  // @pragma Iteration

  __iterate(fn, reverse) {
    if (reverse) {
      return new ArraySeq(this.toArray()).__iterate(
        (v, k) => fn(v, k, this),
        reverse
      );
    }
    let iterations = 0;
    let node = this._head;
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
      return new ArraySeq(this.toArray()).__iterator(type, reverse);
    }
    let iterations = 0;
    let node = this._head;
    return new Iterator(() => {
      if (node) {
        const value = node.value;
        node = node.next;
        return iteratorValue(type, iterations++, value);
      }
      return iteratorDone();
    });
  }
}

Stack.isStack = isStack;

const StackPrototype = StackImpl.prototype;
StackPrototype[IS_STACK_SYMBOL] = true;
StackPrototype.shift = StackPrototype.pop;
StackPrototype.unshift = StackPrototype.push;
StackPrototype.unshiftAll = StackPrototype.pushAll;
StackPrototype.withMutations = withMutations;
StackPrototype.wasAltered = wasAltered;
StackPrototype.asImmutable = asImmutable;
StackPrototype['@@transducer/init'] = StackPrototype.asMutable = asMutable;
StackPrototype['@@transducer/step'] = function (result, arr) {
  return result.unshift(arr);
};
StackPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

function makeStack(size, head, ownerID, hash) {
  const map = Object.create(StackPrototype);
  map.size = size;
  map._head = head;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}

function emptyStack() {
  return makeStack(0);
}
