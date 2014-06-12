import OrderedIterable = require('./OrderedIterable');

/**
 * A Queue allows us to push and pop to the first position in the list as well as walk this list.
 */

export class Queue<T> extends OrderedIterable<T, Queue<T>> {

  // @pragma Construction

  constructor(...values: Array<T>) {
    super(this);
    return Queue.fromArray(values);
  }

  static empty(): Queue<any> {
    if (!__EMPTY_QUEUE) {
      __EMPTY_QUEUE = Queue._make(undefined, undefined);
      __EMPTY_QUEUE.length = 0;
    }
    return __EMPTY_QUEUE;
  }

  static fromArray<T>(values: Array<T>): Queue<T> {
    var list:Queue<T> = Queue.empty();
    for (var ii = values.length - 1; ii >= 0; ii--) {
      list = list.push(values[ii]);
    }
    return list;
  }

  // @pragma Access

  length: number;

  get(index: number): T {
    var queue = this;
    while (index-- > 0) {
      queue = queue.pop();
    }
    return queue._value;
  }

  first(): T {
    return this._value;
  }

  // @pragma Modification

  push(value: T): Queue<T> {
    return Queue._make(value, this.length === 0 ? undefined : this);
  }

  pop(): Queue<T> {
    return this._next ? this._next : Queue.empty();
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
  private _next: Queue<T>;

  private static _make<T>(value: T, next: Queue<T>): Queue<T> {
    var queue = Object.create(Queue.prototype);
    queue.collection = queue;
    queue._value = value;
    queue._next = next;
    queue.length = next ? next.length + 1 : 1;
    return queue;
  }
}

var __EMPTY_QUEUE: Queue<any>;
