import { SetCollection } from './Collection';
import { flattenFactory, reify } from './Operations';
import { IS_SET_SYMBOL, isSet } from './predicates/isSet';
import { isSeq } from './predicates/isSeq';

export class Option extends SetCollection {
  constructor(value) {
    const instance =
      value === null || value === undefined ? new None() : new Some(value);
    return instance;
  }

  __iterator() {
    return this._val[Symbol.iterator]();
  }

  __iterate(fn, reverse) {
    return !Array.isArray(this._val)
      ? this._val
      : this._val.map(k => fn(k, k, this), reverse);
  }
}

Option.isSet = isSet;

const OptionPrototype = Option.prototype;
OptionPrototype[IS_SET_SYMBOL] = true;
OptionPrototype._isNone = function() {
  return !this._val || this._val[0] === null || this._val[0] === undefined;
};
OptionPrototype.getOrElse = function(elseVal) {
  return this._isNone() ? elseVal : this._val[0];
};
OptionPrototype.filter = function(predicate) {
  return this._isNone() || predicate(this._val[0]) === false
    ? None()
    : Some(this._val[0]);
};

export class None extends Option {
  constructor() {
    if (this instanceof None) {
      this._val = [undefined];
      return this;
    }
    return new None();
  }

  __iterate() {}

  toString() {
    return 'None';
  }
}
None.isSet = isSet;

const NonePrototype = None.prototype;
NonePrototype[IS_SET_SYMBOL] = true;
NonePrototype.map = function() {
  return this;
};
NonePrototype.flatMap = function() {
  return this;
};
NonePrototype.flatten = function() {
  return this;
};

// =-=-=-=-=-=--=-=

export class Some extends Option {
  constructor(value) {
    if (this instanceof Some) {
      if (value === null || value === undefined) return new None();
      this._val = [value];
      return this;
    }
    return new Some(value);
  }

  toString() {
    return `Some(${this._val})`;
  }
}
Some.isSet = isSet;

const SomePrototype = Some.prototype;
SomePrototype[IS_SET_SYMBOL] = true;
SomePrototype._create = function(value) {
  return new Some(value);
};
SomePrototype.map = function(predicate) {
  if (typeof predicate !== 'function') throw new Error('Expected Function');
  else {
    const result = predicate(this._val[0]);
    // eslint-disable-next-line no-restricted-globals
    return typeof result === 'number' && isNaN(result)
      ? new None()
      : new Some(result);
  }
};
SomePrototype.flatten = function(doDeepFlatten) {
  const flatResult = flattenFactory(this, doDeepFlatten, true);
  if (isSeq(flatResult)) {
    // flatResult.size returns undefined here
    const numEntries = flatResult.toArray().length;
    if (numEntries === 0) return None();
    if (numEntries === 1) return reify(this, flatResult.toArray()[0]);
  }
  throw new Error('TypeError: Expected Seq of type Option.');
};
SomePrototype.flatMap = function(predicate) {
  return this.map(predicate).flatten(false);
};
