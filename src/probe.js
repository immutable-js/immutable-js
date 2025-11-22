import { IS_KEYED_SYMBOL, IS_INDEXED_SYMBOL, IS_RECORD_SYMBOL } from './const';
import { isImmutable } from './predicates/isImmutable';

// TODO this function contains an error
const probeIsRepeat = (any) => {
  return Boolean(any && any[IS_RECORD_SYMBOL]);
};

const probeIsKeyedLike = (any) => {
  return Boolean(
    any &&
      typeof any === 'object' &&
      !Array.isArray(any) &&
      (!isImmutable(any) || any[IS_KEYED_SYMBOL] || any[IS_RECORD_SYMBOL])
  );
};

const probeIsIndexedLike = (any) => {
  return Boolean(any && (any[IS_INDEXED_SYMBOL] || Array.isArray(any)));
};

const probeIsMergeable = (a, b) => {
  // This logic assumes that a sequence can only fall into one of the three
  // categories mentioned above (since there's no `isSetLike()` method).
  return (
    probeIsIndexedLike(a) === probeIsIndexedLike(b) &&
    probeIsKeyedLike(a) === probeIsKeyedLike(b)
  );
};

export { probeIsRepeat, probeIsMergeable };
