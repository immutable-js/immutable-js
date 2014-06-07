import OrderedIterable = require('./OrderedIterable');

/**
 *
 * A Queue allows us to push and pop to the first position in the list as well as walk this list.
 *
 *   class Queue {
 *     static new(...values: T[]): PList;
 *     static empty(): PList;
 *     static fromArray(values: T[]): PList;
 *     toArray(): T[];
 *     push(value: T): PList;
 *     peek(): T;
 *     pop(): PList;
 *     length: number;
 *   }
 *
 */


export interface Queue<T> extends OrderedIterable<T, Queue<T>> {
  length: number;
  first(): T;
  push(value: T): Queue<T>;
  pop(): Queue<T>;
}

export class PQueue<T> extends OrderedIterable<T, PQueue<T>> implements Queue<T> {

  // @pragma Construction

  constructor(...values: Array<T>) {
    super(this);
    return PQueue.fromArray(values);
  }

  static empty(): PQueue<any> {
    if (!__EMPTY_QUEUE) {
      __EMPTY_QUEUE = PQueue._make(undefined, undefined);
      __EMPTY_QUEUE.length = 0;
    }
    return __EMPTY_QUEUE;
  }

  static fromArray<T>(values: Array<T>): PQueue<T> {
    var list:PQueue<T> = PQueue.empty();
    for (var ii = values.length - 1; ii >= 0; ii--) {
      list = list.push(values[ii]);
    }
    return list;
  }

  // @pragma Access

  length: number;

  first(): T {
    return this._value;
  }

  // @pragma Modification

  push(value: T): PQueue<T> {
    return PQueue._make(value, this.length === 0 ? undefined : this);
  }

  pop(): PQueue<T> {
    return this._next ? this._next : PQueue.empty();
  }

  // @pragma Iteration

  iterate(
    fn: (value: T, index: number, queue: Queue<T>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var queue = this;
    var iterations = 0;
    while (queue && queue.length) {
      if (fn.call(thisArg, queue._value, iterations++, this) === false) {
        return false;
      }
      queue = queue._next;
    }
    return true;
  }

  private _value: T;
  private _next: PQueue<T>;

  private static _make<T>(value: T, next: PQueue<T>): PQueue<T> {
    var queue = Object.create(PQueue.prototype);
    queue.collection = queue;
    queue._value = value;
    queue._next = next;
    queue.length = next ? next.length + 1 : 1;
    return queue;
  }
}

var __EMPTY_QUEUE: PQueue<any>;
