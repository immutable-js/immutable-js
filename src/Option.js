import { SetCollection } from './Collection';
import { IS_SET_SYMBOL, isSet } from './predicates/isSet';

export class Option extends SetCollection {

  constructor(value) {
    if (value === null || value === undefined) return Object.create(NonePrototype);
    else return Some(value);
  }

  __iterator(type, reverse) {
    return this._map.__iterator(type, reverse);
  }

}

Option.isSet = isSet;

const OptionPrototype = Option.prototype;
OptionPrototype[IS_SET_SYMBOL] = true;


export class None extends Option {

  constructor() {}
}
None.isSet = isSet;

const NonePrototype = None.prototype;
NonePrototype[IS_SET_SYMBOL] = true;

// =-=-=-=-=-=--=-=

export class Some extends Option {

  constructor(value) {
    if (value === null || value === undefined) return Object.create(NonePrototype);
    else {
      return SomePrototype.create(value);
    }
  }
}
Some.isSet = isSet;

const SomePrototype = Some.prototype;
SomePrototype[IS_SET_SYMBOL] = true;
SomePrototype.create = function(value) {
  const some = Object.create(SomePrototype);
  some._val = value;
  return some;
};
