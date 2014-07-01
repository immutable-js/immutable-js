import OrderedLazyIterable = require('./OrderedLazyIterable');
import IList = require('./IList');

function invariant(condition: boolean, error: string): void {
  if (!condition) throw new Error(error);
}

/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When step is equal to 0, returns an infinite sequence of
 * start. When start is equal to end, returns empty list.
 */
class Range extends OrderedLazyIterable<number, Range> implements IList<number> {
  start: number;
  end: number;
  step: number;

  constructor(
    start?: number,
    end?: number,
    step?: number
  ) {
    if (!(this instanceof Range)) {
      return new Range(start, end, step);
    }
    this.start = start || 0;
    this.end = end == null ? Infinity : end;
    step = step == null ? 1 : Math.abs(step);
    this.step = this.end < this.start ? -step : step;
    this.length = this.step == 0 ? Infinity : Math.max(0, Math.ceil((this.end - this.start) / this.step - 1) + 1);
    super();
  }

  // @pragma Access
  length: number;

  has(index: number): boolean {
    invariant(index >= 0, 'Index out of bounds');
    return index < this.length;
  }

  get(index: number): number {
    invariant(index >= 0, 'Index out of bounds');
    if (this.length === Infinity || index < this.length) {
      return this.step == 0 ? this.start : this.start + index * this.step;
    }
  }

  first(): number {
    if (this.length > 0) {
      return this.get(0);
    }
  }

  last(): number {
    if (this.length > 0) {
      return this.get(this.length - 1);
    }
  }

  // @pragma Composition
  slice(begin: number, end?: number): Range {
    begin = begin < 0 ? Math.max(0, this.length + begin) : Math.min(this.length, begin);
    end = end > 0 ? Math.min(this.length, end) : Math.max(0, this.length + end);
    return new Range(this.get(begin), end == this.length ? this.end : this.get(end), this.step);
  }

  // @pragma Iteration
  iterate(
    fn: (value?: number, index?: number, range?: Range) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var value = this.start;
    for (var ii = 0; ii < this.length; ii++) {
      if (fn.call(thisArg, value, ii, this) === false) {
        return false;
      }
      value += this.step;
    }
    return true;
  }

  reverseIterate(
    fn: (value?: number, index?: number, range?: Range) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var value = this.start + (this.length - 1) * this.step;
    for (var ii = this.length - 1; ii >= 0; ii--) {
      if (fn.call(thisArg, value, ii, this) === false) {
        return false;
      }
      value -= this.step;
    }
    return true;
  }

  // Override - indexOf does not require iteration
  indexOf(searchValue: number): number {
    var offsetValue = searchValue - this.start;
    if (offsetValue % this.step === 0) {
      var index = offsetValue / this.step;
      if (index >= 0 && index < this.length) {
        return index
      }
    }
    return -1;
  }

  // Override - ensure length is real before putting in memory
  toArray(): Array<number> {
    invariant(this.length < Infinity, 'Cannot convert infinite list to array');
    return super.toArray();
  }
}

export = Range;
