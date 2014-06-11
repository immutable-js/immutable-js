import OrderedIterable = require('./OrderedIterable');

function invariant(condition: boolean, error: string): void {
  if (!condition) throw new Error(error);
}

export interface VectorFactory<T> {
  (...values: Array<T>): Vector<T>;
  empty(): Vector<T>;
  fromArray(values: Array<T>): Vector<T>;
}

export interface Vector<T> extends OrderedIterable<T, Vector<T>> {
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

  // TODO: @pragma Mutability
  //isTransient(): boolean;
  //asTransient(): Vector<T>;
  //asPersistent(): Vector<T>;
  //clone(): Vector<T>;
}


export class PVector<T> extends OrderedIterable<T, PVector<T>> implements Vector<T> {

  // @pragma Construction

  constructor(...values: Array<T>) {
    super(this);
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
    if (this.length > 0) {
      return this.get(0);
    }
  }

  last(): T {
    if (this.length > 0) {
      return this.get(this.length - 1);
    }
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

    var newRoot = vNodePop(this._root, this._size, this._level) || __EMPTY_VNODE;
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

    // TODO: make this a little more efficient by doing less cloning if there are multiple values?
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
    var newOrigin = begin < 0 ? Math.max(this._origin, this._size + begin) : Math.min(this._size, this._origin + begin);
    var newSize = end == null ? this._size : end < 0 ? Math.max(this._origin, this._size + end) : Math.min(this._size, this._origin + end);
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

  iterate(
    fn: (value: T, index: number, vector: PVector<T>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var tailOffset = getTailOffset(this._size);
    return (
      vNodeIterate(this, this._root, this._level, -this._origin, tailOffset - this._origin, fn, thisArg) &&
      vNodeIterate(this, this._tail, 0, tailOffset - this._origin, this._size - this._origin, fn, thisArg)
    );
  }

  // Override - set correct length before returning
  toArray(): Array<T> {
    var array = super.toArray();
    array.length = this.length;
    return array;
  }

  // @pragma Private

  private _origin: number;
  private _size: number;
  private _level: number;
  private _root: VNode<T>;
  private _tail: VNode<T>;

  private static _make<T>(origin: number, size: number, level: number, root: VNode<T>, tail: VNode<T>): PVector<T> {
    var vect = Object.create(PVector.prototype);
    vect.collection = vect;
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
    this.array = array || []; // new Array(SIZE);
  }

  clone(): VNode<T> {
    return new VNode(this.array.slice());
  }
}

function vNodePop<T>(node: VNode<T>, length: number, level: number): VNode<T> {
  var subidx = ((length - 1) >>> level) & MASK;
  if (level > SHIFT) {
    var newChild = vNodePop(this.array[subidx], length, level - SHIFT);
    if (newChild || subidx) {
      var newNode = node.clone();
      if (newChild) {
        newNode.array[subidx] = newChild;
      } else {
        delete newNode.array[subidx];
      }
      return newNode;
    }
  } else if (subidx !== 0) {
    var newNode = node.clone();
    delete newNode.array[subidx];
    return newNode;
  }
}

function vNodeIterate<T>(
  vector: Vector<T>,
  node: VNode<T>,
  level: number,
  offset: number,
  max: number,
  fn: (value: T, index: number, vector: Vector<T>) => any, // false or undefined
  thisArg: any
): boolean {
  if (level === 0) {
    return node.array.every((value, rawIndex) => {
      var index = rawIndex + offset;
      return index < 0 || index >= max || fn.call(thisArg, value, index, vector) !== false;
    });
  } else {
    var step = 1 << level;
    var newLevel = level - SHIFT;
    return node.array.every((newNode, levelIndex) => {
      var newOffset = offset + levelIndex * step;
      return newOffset >= max || newOffset + step <= 0 || vNodeIterate(vector, newNode, newLevel, newOffset, max, fn, thisArg);
    });
  }
}




var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __EMPTY_VNODE = new VNode([]);
var __EMPTY_PVECT: PVector<any>;
