import OrderedIterable = require('./OrderedIterable');

function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When step is equal to 0, returns an infinite sequence of
 * start. When start is equal to end, returns empty list.
 */
export class Range extends OrderedIterable<number, Range> {
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
    super(this);
    this.start = start || 0;
    this.end = end == null ? Infinity : end;
    step = step == null ? 1 : Math.abs(step);
    this.step = this.end < this.start ? -step : step;
    this.length = this.step == 0 ? Infinity : Math.max(0, Math.ceil((this.end - this.start) / this.step - 1) + 1);
  }

  // @pragma Access
  length: number;

  get(index: number): number {
    invariant(index >= 0, 'Index out of bounds');
    if (this.length === Infinity || index < this.length) {
      return this.step == 0 ? this.start : this.start + index * this.step;
    }
  }

  exists(index: number): boolean {
    invariant(index >= 0, 'Index out of bounds');
    return index < this.length;
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
    fn: (value: number, index: number, range: Range) => any, // false or undefined
    thisArg?: any
  ): boolean {
    for (var ii = 0; ii < this.length; ii++) {
      if (fn.call(thisArg, this.start + ii * this.step, ii, this) === false) {
        return false;
      }
    }
    return true;
  }

  // Override - ensure length is real before putting in memory
  toArray(): Array<number> {
    invariant(this.length < Infinity, 'Cannot convert infinite list to array');
    return super.toArray();
  }
}
