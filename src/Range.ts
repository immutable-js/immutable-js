import type { Seq } from '../type-definitions/immutable';
import {
  Iterator,
  iteratorValue,
  iteratorDone,
  type IteratorType,
} from './Iterator';
import { IndexedSeqImpl } from './Seq';
import { wrapIndex, wholeSlice, resolveBegin, resolveEnd } from './TrieUtils';
import deepEqual from './utils/deepEqual';
import invariant from './utils/invariant';

/**
 * Returns a `Seq.Indexed` of numbers from `start` (inclusive) to `end`
 * (exclusive), by `step`, where `start` defaults to 0, `step` to 1, and `end` to
 * infinity. When `start` is equal to `end`, returns empty range.
 *
 * Note: `Range` is a factory function and not a class, and does not use the
 * `new` keyword during construction.
 */
export const Range = (
  start: number,
  end: number,
  step: number = 1
): RangeImpl => {
  invariant(step !== 0, 'Cannot step a Range by 0');
  invariant(
    start !== undefined,
    'You must define a start value when using Range'
  );
  invariant(end !== undefined, 'You must define an end value when using Range');

  step = Math.abs(step);
  if (end < start) {
    step = -step;
  }
  const size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
  if (size === 0) {
    if (!EMPTY_RANGE) {
      EMPTY_RANGE = new RangeImpl(start, end, step, 0);
    }
    return EMPTY_RANGE;
  }
  return new RangeImpl(start, end, step, size);
};

export class RangeImpl extends IndexedSeqImpl implements Seq.Indexed<number> {
  private _start: number;
  private _end: number;
  private _step: number;

  constructor(start: number, end: number, step: number, size: number) {
    super();

    this._start = start;
    this._end = end;
    this._step = step;
    this.size = size;
  }

  override toString(): string {
    return this.size === 0
      ? 'Range []'
      : `Range [ ${this._start}...${this._end}${this._step !== 1 ? ' by ' + this._step : ''} ]`;
  }

  get<NSV>(index: number, notSetValue: NSV): number | NSV;
  get(index: number): number | undefined;
  get<NSV>(index: number, notSetValue?: NSV): number | NSV | undefined {
    // @ts-expect-error Issue with the mixin not understood by TypeScript
    return this.has(index)
      ? this._start + wrapIndex(this, index) * this._step
      : notSetValue;
  }

  includes(searchValue: number): boolean {
    const possibleIndex = (searchValue - this._start) / this._step;
    return (
      possibleIndex >= 0 &&
      possibleIndex < this.size &&
      possibleIndex === Math.floor(possibleIndex)
    );
  }

  // @ts-expect-error TypeScript does not understand the mixin
  slice(begin?: number | undefined, end?: number | undefined): RangeImpl {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    begin = resolveBegin(begin, this.size);
    end = resolveEnd(end, this.size);
    if (end <= begin) {
      return Range(0, 0);
    }
    return Range(
      this.get(begin, this._end),
      this.get(end, this._end),
      this._step
    );
  }

  indexOf(searchValue: number): number {
    const offsetValue = searchValue - this._start;
    if (offsetValue % this._step === 0) {
      const index = offsetValue / this._step;
      if (index >= 0 && index < this.size) {
        return index;
      }
    }
    return -1;
  }

  lastIndexOf(searchValue: number): number {
    return this.indexOf(searchValue);
  }

  override __iterate(
    fn: (value: number, index: number, iter: this) => boolean,
    reverse: boolean = false
  ): number {
    const size = this.size;
    const step = this._step;
    let value = reverse ? this._start + (size - 1) * step : this._start;
    let i = 0;
    while (i !== size) {
      if (fn(value, reverse ? size - ++i : i++, this) === false) {
        break;
      }
      value += reverse ? -step : step;
    }
    return i;
  }

  override __iterator(
    type: IteratorType,
    reverse: boolean = false
  ): Iterator<number> {
    const size = this.size;
    const step = this._step;
    let value = reverse ? this._start + (size - 1) * step : this._start;
    let i = 0;
    return new Iterator<number>(() => {
      if (i === size) {
        return iteratorDone();
      }
      const v = value;
      value += reverse ? -step : step;
      return iteratorValue(type, reverse ? size - ++i : i++, v);
    });
  }

  equals(other: unknown): boolean {
    return other instanceof RangeImpl
      ? this._start === other._start &&
          this._end === other._end &&
          this._step === other._step
      : deepEqual(this, other);
  }
}

let EMPTY_RANGE: RangeImpl | undefined;
