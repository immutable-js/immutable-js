"use strict";

function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

export interface VectorFactory<T> {
  (...values: Array<T>): Vector<T>;
  empty(): Vector<T>;
  fromArray(values: Array<T>): Vector<T>;
}

export interface Vector<T> {
  // @pragma Construction
  toArray(): Array<T>;

  // @pragma Access
  length: number;
  get(index: number): T;
  exists(index: number): boolean;
  first(): T;
  last(): T;

  // @pragma Modification
  set(index: number, value: T): Vector<T>;
  push(...values: Array<T>): Vector<T>;
  pop(): Vector<T>;
  remove(index: number): Vector<T>;
  unshift(...values: Array<T>): Vector<T>;
  shift(): Vector<T>;

  // @pragma Composition
  reverse(): Vector<T>;
  concat(vec: Vector<T>): Vector<T>;
  slice(begin: number, end?: number): Vector<T>;
  splice(index: number, removeNum: number, ...values: Array<T>): Vector<T>;

  // @pragma Iteration
  indexOf(value: T): number;
  findIndex(fn: (value: T, index: number, vector: Vector<T>) => boolean, thisArg?: any): number;
  forEach(fn: (value: T, index: number, vector: Vector<T>) => any, thisArg?: any): void;
  map<R>(fn: (value: T, index: number, vector: Vector<T>) => R, thisArg?: any): Vector<R>;
}


export class PVector<T> implements Vector<T> {

  // @pragma Construction
  constructor(...values: Array<T>) {
    return PVector.fromArray(values);
  }

  static empty(): PVector<any> {
    return __EMPTY_PVECT || (__EMPTY_PVECT =
      PVector._make(0, 0, SHIFT, __EMPTY_VNODE, __EMPTY_VNODE)
    );
  }

  static fromArray<T>(values: Array<T>): PVector<T> {
    if (values.length > 0 && values.length < SIZE) {
      return PVector._make<T>(0, values.length, SHIFT, __EMPTY_VNODE, new VNode(values.slice()));
    }

    // TODO: create a TVector and then return a cast to PVector
    var vect: PVector<T> = PVector.empty();
    values.forEach((value, index) => {
      vect = vect.set(index, value);
    });
    return vect;
  }

  toArray(): Array<T> {
    var array = new Array(this.length);
    this.forEach(function (value, index) {
      array[index] = value;
    });
    return array;
  }

  // @pragma Access

  public length: number;

  get(index: number): T {
    index = rawIndex(index, this._origin);
    if (index < this._size) {
      var node = this._nodeFor(index);
      return node && node.array[index & MASK];
    }
  }

  exists(index: number): boolean {
    index = rawIndex(index, this._origin);
    if (index >= this._size) {
      return false;
    }
    var node = this._nodeFor(index);
    var property = index & MASK;
    return !!node && node.array.hasOwnProperty(<any>property);
  }

  first(): T {
    return this.get(0);
  }

  last(): T {
    return this.get(this.length - 1);
  }

  // @pragma Modification

  set(index: number, value: T): PVector<T> {
    index = rawIndex(index, this._origin);
    var tailOffset = getTailOffset(this._size);

    // Overflow's tail, merge the tail and make a new one.
    if (index >= tailOffset + SIZE) {
      // Tail might require creating a higher root.
      var newRoot = this._root;
      var newShift = this._level;
      while (tailOffset > 1 << (newShift + SHIFT)) {
        newRoot = new VNode([newRoot]);
        newShift += SHIFT;
      }
      if (newRoot === this._root) {
        newRoot = newRoot.clone();
      }

      // Merge Tail into tree.
      var node = newRoot;
      for (var level = newShift; level > SHIFT; level -= SHIFT) {
        var subidx = (tailOffset >>> level) & MASK;
        node = node.array[subidx] = node.array[subidx] ? node.array[subidx].clone() : new VNode();
      }
      node.array[(tailOffset >>> SHIFT) & MASK] = this._tail;

      // Create new tail with set index.
      var newTail = new VNode<T>();
      newTail.array[index & MASK] = value;
      return PVector._make(this._origin, index + 1, newShift, newRoot, newTail);
    }

    // Fits within tail.
    if (index >= tailOffset) {
      var newTail = this._tail.clone();
      newTail.array[index & MASK] = value;
      var newLength = index >= this._size ? index + 1 : this._size;
      return PVector._make(this._origin, newLength, this._level, this._root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this._root.clone();
    var node = newRoot;
    for (var level = this._level; level > 0; level -= SHIFT) {
      var subidx = (index >>> level) & MASK;
      node = node.array[subidx] = node.array[subidx] ? node.array[subidx].clone() : new VNode();
    }
    node.array[index & MASK] = value;
    return PVector._make(this._origin, this._size, this._level, newRoot, this._tail);
  }

  push(...values: Array<T>): PVector<T> {
    var vec = this;
    for (var ii = 0; ii < values.length; ii++) {
      vec = vec.set(vec.length, values[ii]);
    }
    return vec;
  }

  pop(): PVector<T> {
    var newSize = this._size - 1;

    if (newSize <= this._origin) {
      return PVector.empty();
    }

    // Fits within tail.
    if (newSize > getTailOffset(this._size)) {
      var newTail = new VNode<T>(this._tail.array.slice(0, -1));
      return PVector._make(this._origin, newSize, this._level, this._root, newTail);
    }

    var newRoot = this._root.pop(this._size, this._level) || __EMPTY_VNODE;
    var newTail = this._nodeFor(newSize - 1);
    return PVector._make(this._origin, newSize, this._level, newRoot, newTail);
  }

  remove(index: number): PVector<T> {
    index = rawIndex(index, this._origin);
    var tailOffset = getTailOffset(this._size);

    // Out of bounds, no-op.
    if (!this.exists(index)) {
      return this;
    }

    // Delete within tail.
    if (index >= tailOffset) {
      var newTail = this._tail.clone();
      delete newTail.array[index & MASK];
      return PVector._make(this._origin, this._size, this._level, this._root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this._root.clone();
    var node = newRoot;
    for (var level = this._level; level > 0; level -= SHIFT) {
      var subidx = (index >>> level) & MASK;
      node = node.array[subidx] = node.array[subidx].clone();
    }
    delete node.array[index & MASK];
    return PVector._make(this._origin, this._size, this._level, newRoot, this._tail);
  }

  unshift(...values: Array<T>): PVector<T> {
    var newOrigin = this._origin - values.length;
    var newSize = this._size;
    var newLevel = this._level;
    var newRoot = this._root;

    while (newOrigin < 0) {
      var node = new VNode<T>();
      node.array[1] = newRoot;
      newOrigin += 1 << newLevel;
      newSize += 1 << newLevel;
      newLevel += SHIFT;
      newRoot = node;
    }

    if (newRoot === this._root) {
      newRoot = this._root.clone();
    }

    for (var ii = 0; ii < values.length; ii++) {
      var index = newOrigin + ii;
      var node = newRoot;
      for (var level = newLevel; level > 0; level -= SHIFT) {
        var subidx = (index >>> level) & MASK;
        node = node.array[subidx] = node.array[subidx] ? node.array[subidx].clone() : new VNode<T>();
      }
      node.array[index & MASK] = values[ii];
    }

    return PVector._make(newOrigin, newSize, newLevel, newRoot, this._tail);
  }

  shift(): PVector<T> {
    return this.slice(1);
  }

  // @pragma Composition
  reverse(): PVector<T> {
    // This should really only affect how inputs are translated and iteration ordering.
    // This should probably also need to be a lazy sequence to keep the data structure intact.
    invariant(false, 'NYI');
    return null;
  }

  concat(...vectors: Array<PVector<T>>): PVector<T> {
    var vector = this;
    for (var ii = 0; ii < vectors.length; ii++) {
      if (vectors[ii].length > 0) {
        if (vector.length === 0) {
          vector = vectors[ii];
        } else {
          // Clojure implements this as a lazy seq.
          // Likely because there is no efficient way to do this.
          // We need to rebuild a new datastructure entirely.
          // However, if all you wanted to do was iterate over both, or if you wanted
          //   to put them into a different data structure, lazyseq would help.
          invariant(false, 'NYI');
        }
      }
    }
    return vector;
  }

  slice(begin: number, end?: number): PVector<T> {
    var newOrigin = begin < 0 ? Math.max(this._origin, this._size - begin) : Math.min(this._size, this._origin + begin);
    var newSize = end == null ? this._size : end < 0 ? Math.max(this._origin, this._size - end) : Math.min(this._size, this._origin + end);
    if (newOrigin >= newSize) {
      return PVector.empty();
    }
    var newTail = newSize === this._size ? this._tail : this._nodeFor(newSize) || new VNode();
    // TODO: should also calculate a new root and garbage collect?
    // This would be a tradeoff between memory footprint and perf.
    // I still expect better performance than Array.slice(), so it's probably worth freeing memory.
    return PVector._make(newOrigin, newSize, this._level, this._root, newTail);
  }

  splice(index: number, removeNum: number, ...values: Array<T>): PVector<T> {
    return this.slice(0, index).concat(PVector.fromArray(values), this.slice(index + removeNum));
  }

  // @pragma Iteration

  indexOf(searchValue: T): number {
    return this.findIndex(value => value === searchValue);
    // TODO: this over-iterates.
    var foundIndex = -1;
    this.forEach(function (value, index) {
      if (foundIndex === -1 && value === searchValue) {
        foundIndex = index;
      }
    });
    return foundIndex;
  }

  findIndex(
    fn: (value: T, index: number, vector: PVector<T>) => boolean,
    thisArg?: any
  ): number {
    var index;
    index = this._root.findIndex(this, this._level, -this._origin, fn, thisArg);
    if (index == null) {
      var tailOffset = getTailOffset(this._size) - this._origin;
      index = this._tail.findIndex(this, 0, tailOffset, fn, thisArg);
    }
    return index >= 0 ? index : -1;
  }

  forEach(
    fn: (value: T, index: number, vector: PVector<T>) => any,
    thisArg?: any
  ): void {
    this._root.forEach(this, this._level, -this._origin, fn, thisArg);
    var tailOffset = getTailOffset(this._size) - this._origin;
    this._tail.forEach(this, 0, tailOffset, fn, thisArg);
  }

  map<R>(
    fn: (value: T, index: number, vector: PVector<T>) => R,
    thisArg?: any
  ): PVector<R> {
    // lazy sequence!
    invariant(false, 'NYI');
    return null;
  }

  // @pragme Private

  private _origin: number;
  private _size: number;
  private _level: number;
  private _root: VNode<T>;
  private _tail: VNode<T>;

  private static _make<T>(origin:number, size: number, level: number, root: VNode<T>, tail: VNode<T>): PVector<T> {
    var vect = Object.create(PVector.prototype);
    vect._origin = origin;
    vect._size = size;
    vect._level = level;
    vect._root = root;
    vect._tail = tail;
    vect.length = size - origin;
    return vect;
  }

  private _nodeFor(rawIndex: number): VNode<T> {
    if (rawIndex >= getTailOffset(this._size)) {
      return this._tail;
    }
    if (rawIndex < 1 << (this._level + SHIFT)) {
      var node = this._root;
      var level = this._level;
      while (node && level > 0) {
        node = node.array[(rawIndex >>> level) & MASK];
        level -= SHIFT;
      }
      return node;
    }
  }
}

function rawIndex(index: number, origin: number) {
  invariant(index >= 0, 'Index out of bounds');
  return index + origin;
}

function getTailOffset(size: number): number {
  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
}

class VNode<T> {
  public array: Array<any>;

  constructor(array?: Array<any>) {
    this.array = array || new Array(SIZE);
  }

  clone(): VNode<T> {
    return new VNode(this.array.slice());
  }

  pop(length: number, level: number): VNode<T> {
    var subidx = ((length - 1) >>> level) & MASK;
    if (level > SHIFT) {
      var newChild = this.array[subidx].pop(length, level - SHIFT);
      if (newChild || subidx) {
        var node = this.clone();
        if (newChild) {
          node.array[subidx] = newChild;
        } else {
          delete node.array[subidx];
        }
        return node;
      }
    } else if (subidx) {
      var newNode = this.clone();
      delete newNode.array[subidx];
      return newNode;
    }
  }

  findIndex(
    vector: Vector<T>,
    level: number,
    offset: number,
    fn: (value: T, index: number, vector: Vector<T>) => boolean,
    thisArg: any
  ): number {
    var foundIndex;
    if (level === 0) {
      this.array.some((value, rawIndex) => {
        var index = rawIndex + offset;
        if (index >= 0 && fn.call(thisArg, value, index, vector)) {
          foundIndex = index;
          return true;
        }
      });
    } else {
      var step = 1 << level;
      var newLevel = level - SHIFT;
      this.array.some((value, index) => {
        var newOffset = offset + index * step;
        if (newOffset + step > 0) {
          foundIndex = value.findIndex(vector, newLevel, newOffset, fn, thisArg);
          if (foundIndex >= 0) {
            return true;
          }
        }
      });
    }
    return foundIndex;
  }

  forEach(
    vector: Vector<T>,
    level: number,
    offset: number,
    fn: (value: T, index: number, vector: Vector<T>) => any,
    thisArg: any
  ): void {
    if (level === 0) {
      this.array.forEach((value, rawIndex) => {
        var index = rawIndex + offset;
        index >= 0 && fn.call(thisArg, value, index, vector);
      });
    } else {
      var step = 1 << level;
      var newLevel = level - SHIFT;
      this.array.forEach((value, index) => {
        var newOffset = offset + index * step;
        newOffset + step > 0 && value.forEach(vector, newLevel, newOffset, fn, thisArg);
      });
    }
  }
}

var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __EMPTY_VNODE = new VNode([]);
var __EMPTY_PVECT;





// subvec!
/*

Subvec is a datastructure which wraps a vector and a start and end position.
Wrapping the vector allows it to reuse data and thus be an O(1) operation.
However the side-effect of this is that it holds *all* data the vector holds.
It would be smarter if subvec found only the chunks that it needs to retain.
This is probably an O(log(N)) operation.

Say we have a vector of 16 elements with chunk size 4:

               [_ _ _ _]

[_ _ _ _] [_ _ _ _] [_ _ _ _] [_ _ _ _]

If we want [0,2], then we should make a new vector to hold the first chunk only.
Actually, we might take that node and make it the new tail, and leave an empty tree!
If we want [5,10], then we only need to hold the inner two nodes and can release the sides.
Actually, we might take only the first node and then make the second a new tail.

This means some values will still be over retained, but at most SIZE size values.

Access methods simply offset by "start".
Setter methods modify the underlying datastructure and return a new Subvec with the additional start/end applied.
"Shift" is the same as slice(1,0)
"Unshift" is a little trickier, might be as easy as slice(-1), but if the vector index is negative, then a shift is necessary.
  This may be done by moving all nodes over one position in the parent, unless the last slot is full, then you go to the parent and continue.
  The result of this is that all nodes have been "shifted over" by some power of SIZE. This gives you a new vector with extra space and you can then slice(-1).

*/

//function build_subvec(v, start, end) {
//  while (v instanceof Subvec) {
//    start = v.start + start;
//    end = v.start + end;
//    v = v.v;
//  }
//  var c = v.length;
//  if (start < 0 || end < 0 || start > c || end > c) {
//      throw (new Error("Index out of bounds"));
//  }
//  return new Subvec(v, start, end);
//}
//
//
///**
// * @constructor
// */
//cljs.core.Subvec = (function (v, start, end) {
//    this.v = v;
//    this.start = start;
//    this.end = end;
//});
//cljs.core.Subvec.prototype.cljs$core$ICollection$_conj$arity$2 = (function (coll, o) {
//    var self__ = this;
//    var coll__$1 = this;
//    return cljs.core.build_subvec.call(null, self__.meta, cljs.core._assoc_n.call(null, self__.v, self__.end, o), self__.start, (self__.end + 1), null);
//});
//cljs.core.Subvec.prototype.cljs$core$IReversible$_rseq$arity$1 = (function (coll) {
//    var self__ = this;
//    var coll__$1 = this;
//    if (!((self__.start === self__.end))) {
//        return (new cljs.core.RSeq(coll__$1, ((self__.end - self__.start) - 1), null));
//    } else {
//        return null;
//    }
//});
//cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq$arity$1 = (function (coll) {
//    var self__ = this;
//    var coll__$1 = this;
//    var subvec_seq = ((function (coll__$1) {
//        return (function subvec_seq(i) {
//            if ((i === self__.end)) {
//                return null;
//            } else {
//                return cljs.core.cons.call(null, cljs.core._nth.call(null, self__.v, i), (new cljs.core.LazySeq(null, ((function (coll__$1) {
//                    return (function () {
//                        return subvec_seq.call(null, (i + 1));
//                    });
//                })(coll__$1)), null, null)));
//            }
//        });
//    })(coll__$1));
//    return subvec_seq.call(null, self__.start);
//});
//cljs.core.Subvec.prototype.cljs$core$ICounted$_count$arity$1 = (function (coll) {
//    var self__ = this;
//    var coll__$1 = this;
//    return (self__.end - self__.start);
//});
//cljs.core.Subvec.prototype.cljs$core$IStack$_peek$arity$1 = (function (coll) {
//    var self__ = this;
//    var coll__$1 = this;
//    return cljs.core._nth.call(null, self__.v, (self__.end - 1));
//});
//cljs.core.Subvec.prototype.cljs$core$IStack$_pop$arity$1 = (function (coll) {
//    var self__ = this;
//    var coll__$1 = this;
//    if ((self__.start === self__.end)) {
//        throw (new Error("Can't pop empty vector"));
//    } else {
//        return cljs.core.build_subvec.call(null, self__.meta, self__.v, self__.start, (self__.end - 1), null);
//    }
//});
//cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n$arity$3 = (function (coll, n, val) {
//    var self__ = this;
//    var coll__$1 = this;
//    var v_pos = (self__.start + n);
//    return cljs.core.build_subvec.call(null, self__.meta, cljs.core.assoc.call(null, self__.v, v_pos, val), self__.start, (function () {
//        var x__3473__auto__ = self__.end;
//        var y__3474__auto__ = (v_pos + 1);
//        return ((x__3473__auto__ > y__3474__auto__) ? x__3473__auto__ : y__3474__auto__);
//    })(), null);
//});
//cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv$arity$2 = (function (coll, other) {
//    var self__ = this;
//    var coll__$1 = this;
//    return cljs.core.equiv_sequential.call(null, coll__$1, other);
//});
//cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = (function (coll, meta__$1) {
//    var self__ = this;
//    var coll__$1 = this;
//    return cljs.core.build_subvec.call(null, meta__$1, self__.v, self__.start, self__.end, self__.__hash);
//});
//cljs.core.Subvec.prototype.cljs$core$ICloneable$_clone$arity$1 = (function (_) {
//    var self__ = this;
//    var ___$1 = this;
//    return (new cljs.core.Subvec(self__.meta, self__.v, self__.start, self__.end, self__.__hash));
//});
//cljs.core.Subvec.prototype.cljs$core$IMeta$_meta$arity$1 = (function (coll) {
//    var self__ = this;
//    var coll__$1 = this;
//    return self__.meta;
//});
//cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$2 = (function (coll, n) {
//    var self__ = this;
//    var coll__$1 = this;
//    if (((n < 0)) || ((self__.end <= (self__.start + n)))) {
//        return cljs.core.vector_index_out_of_bounds.call(null, n, (self__.end - self__.start));
//    } else {
//        return cljs.core._nth.call(null, self__.v, (self__.start + n));
//    }
//});
//cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$3 = (function (coll, n, not_found) {
//    var self__ = this;
//    var coll__$1 = this;
//    if (((n < 0)) || ((self__.end <= (self__.start + n)))) {
//        return not_found;
//    } else {
//        return cljs.core._nth.call(null, self__.v, (self__.start + n), not_found);
//    }
//});
//cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = (function (coll) {
//    var self__ = this;
//    var coll__$1 = this;
//    return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, self__.meta);
//});
//cljs.core.__GT_Subvec = (function __GT_Subvec(meta, v, start, end, __hash) {
//    return (new cljs.core.Subvec(meta, v, start, end, __hash));
//});
//




