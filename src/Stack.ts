import OrderedIterable = require('./OrderedIterable');
import IList = require('./IList');

/**
 * A Stack allows us to push and pop to the first position in the list as well as walk this list.
 */

class Stack<T> extends OrderedIterable<T, Stack<T>> implements IList<T> {

  // @pragma Construction

  constructor(...values: Array<T>) {
    return Stack.fromArray(values);
    super();
  }

  static empty(): Stack<any> {
    if (!__EMPTY_QUEUE) {
      __EMPTY_QUEUE = Stack._make(undefined, undefined);
      __EMPTY_QUEUE.length = 0;
    }
    return __EMPTY_QUEUE;
  }

  static fromArray<T>(values: Array<T>): Stack<T> {
    var list:Stack<T> = Stack.empty();
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

  last(): T {
    return this.get(this.length - 1);
  }

  // @pragma Modification

  push(value: T): Stack<T> {
    return Stack._make(value, this.length === 0 ? undefined : this);
  }

  pop(): Stack<T> {
    return this._next ? this._next : Stack.empty();
  }

  // @pragma Iteration

  iterate(
    fn: (value?: T, index?: number, queue?: Stack<T>) => any, // false or undefined
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
  private _next: Stack<T>;

  private static _make<T>(value: T, next: Stack<T>): Stack<T> {
    var queue = Object.create(Stack.prototype);
    queue._value = value;
    queue._next = next;
    queue.length = next ? next.length + 1 : 1;
    return queue;
  }
}

var __EMPTY_QUEUE: Stack<any>;

export = Stack;
