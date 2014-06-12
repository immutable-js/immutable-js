import OrderedIterable = require('./OrderedIterable');

function invariant(condition: boolean, error: string): void {
  if (!condition) throw new Error(error);
}

// TODO: Note that Vector implements all public methods of Map.
//   We should document this in the typesystem.
class Vector<T> extends OrderedIterable<T, Vector<T>> {

  // @pragma Construction

  constructor(...values: Array<T>) {
    return Vector.fromArray(values);
    super();
  }

  static empty(): Vector<any> {
    return __EMPTY_PVECT || (__EMPTY_PVECT =
      Vector._make(0, 0, SHIFT, __EMPTY_VNODE, __EMPTY_VNODE)
    );
  }

  static fromArray<T>(values: Array<T>): Vector<T> {
    if (values.length === 0) {
      return Vector.empty();
    }
    if (values.length > 0 && values.length < SIZE) {
      return Vector._make<T>(0, values.length, SHIFT, __EMPTY_VNODE, new VNode(null, values.slice()));
    }
    var vect: Vector<T> = Vector.empty().asTransient();
    values.forEach((value, index) => {
      vect = vect.set(index, value);
    });
    return vect.asPersistent();
  }

  // @pragma Access

  public length: number;

  has(index: number): boolean {
    index = rawIndex(index, this._origin);
    if (index >= this._size) {
      return false;
    }
    var node = this._nodeFor(index);
    var property = index & MASK;
    return !!node && node.array.hasOwnProperty(<any>property);
  }

  get(index: number): T {
    index = rawIndex(index, this._origin);
    if (index < this._size) {
      var node = this._nodeFor(index);
      return node && node.array[index & MASK];
    }
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

  empty(): Vector<T> {
    if (this._ownerID) {
      this.length = this._origin = this._size = 0;
      this._level = SHIFT;
      this._root = this._tail = __EMPTY_VNODE;
      return this;
    }
    return Vector.empty();
  }

  set(index: number, value: T): Vector<T> {
    index = rawIndex(index, this._origin);
    var tailOffset = getTailOffset(this._size);

    // Overflow's tail, merge the tail and make a new one.
    if (index >= tailOffset + SIZE) {
      // Tail might require creating a higher root.
      var newRoot = this._root;
      var newLevel = this._level;
      while (tailOffset > 1 << (newLevel + SHIFT)) {
        newRoot = new VNode(this._ownerID, [newRoot]);
        newLevel += SHIFT;
      }
      if (newRoot === this._root) {
        newRoot = newRoot.ensureOwner(this._ownerID);
      }

      // Merge Tail into tree.
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (tailOffset >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this._ownerID) : new VNode(this._origin, []);
      }
      node.array[(tailOffset >>> SHIFT) & MASK] = this._tail;

      // Create new tail with set index.
      var newTail = new VNode<T>(this._ownerID, []);
      newTail.array[index & MASK] = value;
      var newSize = index + 1;
      if (this._ownerID) {
        this.length = newSize - this._origin;
        this._size = newSize;
        this._level = newLevel;
        this._root = newRoot;
        this._tail = newTail;
        return this;
      }
      return Vector._make(this._origin, newSize, newLevel, newRoot, newTail);
    }

    // Fits within tail.
    if (index >= tailOffset) {
      var newTail = this._tail.ensureOwner(this._ownerID);
      newTail.array[index & MASK] = value;
      var newSize = index >= this._size ? index + 1 : this._size;
      if (this._ownerID) {
        this.length = newSize - this._origin;
        this._size = newSize;
        this._tail = newTail;
        return this;
      }
      return Vector._make(this._origin, newSize, this._level, this._root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this._root.ensureOwner(this._ownerID);
    var node = newRoot;
    for (var level = this._level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(this._ownerID) : new VNode(this._ownerID, []);
    }
    node.array[index & MASK] = value;
    if (this._ownerID) {
      this._root = newRoot;
      return this;
    }
    return Vector._make(this._origin, this._size, this._level, newRoot, this._tail);
  }

  push(...values: Array<T>): Vector<T> {
    var vec = this;
    for (var ii = 0; ii < values.length; ii++) {
      vec = vec.set(vec.length, values[ii]);
    }
    return vec;
  }

  pop(): Vector<T> {
    var newSize = this._size - 1;

    if (newSize <= this._origin) {
      return this.empty();
    }

    if (this._ownerID) {
      this.length--;
      this._size--;
    }

    // Fits within tail.
    if (newSize > getTailOffset(this._size)) {
      var newTail = this._tail.ensureOwner(this._ownerID);
      newTail.array.pop();
      if (this._ownerID) {
        this._tail = newTail;
        return this;
      }
      return Vector._make(this._origin, newSize, this._level, this._root, newTail);
    }

    var newRoot = this._root.pop(this._ownerID, this._size, this._level) || __EMPTY_VNODE;
    var newTail = this._nodeFor(newSize - 1);
    if (this._ownerID) {
      this._root = newRoot;
      this._tail = newTail;
      return this;
    }
    return Vector._make(this._origin, newSize, this._level, newRoot, newTail);
  }

  delete(index: number): Vector<T> {
    index = rawIndex(index, this._origin);
    var tailOffset = getTailOffset(this._size);

    // Out of bounds, no-op.
    if (!this.has(index)) {
      return this;
    }

    // Delete within tail.
    if (index >= tailOffset) {
      var newTail = this._tail.ensureOwner(this._ownerID);
      delete newTail.array[index & MASK];
      if (this._ownerID) {
        this._tail = newTail;
        return this;
      }
      return Vector._make(this._origin, this._size, this._level, this._root, newTail);
    }

    // Fits within existing tree.
    var newRoot = this._root.ensureOwner(this._ownerID);
    var node = newRoot;
    for (var level = this._level; level > 0; level -= SHIFT) {
      var idx = (index >>> level) & MASK;
      node = node.array[idx] = node.array[idx].ensureOwner(this._ownerID);
    }
    delete node.array[index & MASK];
    if (this._ownerID) {
      this._root = newRoot;
      return this;
    }
    return Vector._make(this._origin, this._size, this._level, newRoot, this._tail);
  }

  unshift(...values: Array<T>): Vector<T> {
    var newOrigin = this._origin - values.length;
    var newSize = this._size;
    var newLevel = this._level;
    var newRoot = this._root;

    while (newOrigin < 0) {
      var node = new VNode<T>(this._ownerID, []);
      node.array[1] = newRoot;
      newOrigin += 1 << newLevel;
      newSize += 1 << newLevel;
      newLevel += SHIFT;
      newRoot = node;
    }

    if (newRoot === this._root) {
      newRoot = this._root.ensureOwner(this._ownerID);
    }

    // TODO: this should probably be replaced by what "push" does, it might not always be correct.
    var tempOwner = this._ownerID || new OwnerID();
    for (var ii = 0; ii < values.length; ii++) {
      var index = newOrigin + ii;
      var node = newRoot;
      for (var level = newLevel; level > 0; level -= SHIFT) {
        var idx = (index >>> level) & MASK;
        node = node.array[idx] = node.array[idx] ? node.array[idx].ensureOwner(tempOwner) : new VNode<T>(tempOwner, []);
      }
      node.array[index & MASK] = values[ii];
    }

    if (this._ownerID) {
      this.length = newSize - newOrigin;
      this._origin = newOrigin;
      this._size = newSize;
      this._level = newLevel;
      this._root = newRoot;
      return this;
    }
    return Vector._make(newOrigin, newSize, newLevel, newRoot, this._tail);
  }

  shift(): Vector<T> {
    return this.slice(1);
  }

  // @pragma Composition
  reverse(): Vector<T> {
    // This should really only affect how inputs are translated and iteration ordering.
    // This should probably also need to be a lazy sequence to keep the data structure intact.
    invariant(false, 'NYI');
    return null;
  }

  merge(vector: Vector<T>): Vector<T> {
    var newVect = this.asTransient();
    vector.iterate((value, index) => newVect.set(index, value));
    return newVect.asPersistent();
  }

  concat(...vectors: Array<Vector<T>>): Vector<T> {
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

  slice(begin: number, end?: number): Vector<T> {
    var newOrigin = begin < 0 ? Math.max(this._origin, this._size + begin) : Math.min(this._size, this._origin + begin);
    var newSize = end == null ? this._size : end < 0 ? Math.max(this._origin, this._size + end) : Math.min(this._size, this._origin + end);
    if (newOrigin >= newSize) {
      return this.empty();
    }
    var newTail = newSize === this._size ? this._tail : this._nodeFor(newSize) || new VNode(this._ownerID, []);
    // TODO: should also calculate a new root and garbage collect?
    // This would be a tradeoff between memory footprint and perf.
    // I still expect better performance than Array.slice(), so it's probably worth freeing memory.
    if (this._ownerID) {
      this.length = newSize - newOrigin;
      this._origin = newOrigin;
      this._size = newSize;
      this._tail = newTail;
      return this;
    }
    return Vector._make(newOrigin, newSize, this._level, this._root, newTail);
  }

  splice(index: number, removeNum: number, ...values: Array<T>): Vector<T> {
    return this.slice(0, index).concat(Vector.fromArray(values), this.slice(index + removeNum));
  }

  // @pragma Mutability

  isTransient(): boolean {
    return !!this._ownerID;
  }

  asTransient(): Vector<T> {
    if (this._ownerID) {
      return this;
    }
    var vect = this.clone();
    vect._ownerID = new OwnerID();
    return vect;
  }

  asPersistent(): Vector<T> {
    this._ownerID = undefined;
    return this;
  }

  clone(): Vector<T> {
    return Vector._make(this._origin, this._size, this._level, this._root, this._tail, this._ownerID && new OwnerID());
  }

  // @pragma Iteration

  iterate(
    fn: (value?: T, index?: number, vector?: Vector<T>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var tailOffset = getTailOffset(this._size);
    return (
      this._root.iterate(this, this._level, -this._origin, tailOffset - this._origin, fn, thisArg) &&
      this._tail.iterate(this, 0, tailOffset - this._origin, this._size - this._origin, fn, thisArg)
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
  private _ownerID: OwnerID;

  private static _make<T>(origin: number, size: number, level: number, root: VNode<T>, tail: VNode<T>, ownerID?: OwnerID): Vector<T> {
    var vect = Object.create(Vector.prototype);
    vect.length = size - origin;
    vect._origin = origin;
    vect._size = size;
    vect._level = level;
    vect._root = root;
    vect._tail = tail;
    vect._ownerID = ownerID;
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

class OwnerID {
  constructor() {}
}

class VNode<T> {
  constructor(public ownerID: OwnerID, public array: Array<any>) {}

  pop(ownerID: OwnerID, length: number, level: number): VNode<T> {
    var idx = ((length - 1) >>> level) & MASK;
    if (level > SHIFT) {
      var newChild = this.array[idx].pop(ownerID, length, level - SHIFT);
      if (newChild || idx) {
        var editable = this.ensureOwner(ownerID);
        if (newChild) {
          editable.array[idx] = newChild;
        } else {
          delete editable.array[idx];
        }
        return editable;
      }
    } else if (idx !== 0) {
      var editable = this.ensureOwner(ownerID);
      delete editable.array[idx];
      return editable;
    }
  }

  ensureOwner(ownerID: OwnerID): VNode<T> {
    if (ownerID && ownerID === this.ownerID) {
      return this;
    }
    return new VNode<T>(ownerID, this.array.slice());
  }

  iterate(
    vector: Vector<T>,
    level: number,
    offset: number,
    max: number,
    fn: (value?: T, index?: number, vector?: Vector<T>) => any, // false or undefined
    thisArg: any
  ): boolean {
    if (level === 0) {
      return this.array.every((value, rawIndex) => {
        var index = rawIndex + offset;
        return index < 0 || index >= max || fn.call(thisArg, value, index, vector) !== false;
      });
    }
    var step = 1 << level;
    var newLevel = level - SHIFT;
    return this.array.every((newNode, levelIndex) => {
      var newOffset = offset + levelIndex * step;
      return newOffset >= max || newOffset + step <= 0 || newNode.iterate(vector, newLevel, newOffset, max, fn, thisArg);
    });
  }
}


var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;
var __EMPTY_VNODE = new VNode(null, []);
var __EMPTY_PVECT: Vector<any>;

export = Vector;
