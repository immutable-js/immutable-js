import {
  Iterator,
  iteratorValue,
  iteratorDone,
  ITERATE_ENTRIES,
} from '../Iterator';
import { isCollection } from '../predicates/isCollection';

const factoryFlatten = (cx, makeSequence, depth, useKeys) => {
  const flatSequence = makeSequence(cx);
  flatSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    let iterations = 0;
    let stopped = false;
    function flatDeep(iter, currentDepth) {
      iter.__iterate((v, k) => {
        if ((!depth || currentDepth < depth) && isCollection(v)) {
          flatDeep(v, currentDepth + 1);
        } else {
          iterations++;
          if (fn(v, useKeys ? k : iterations - 1, flatSequence) === false) {
            stopped = true;
          }
        }
        return !stopped;
      }, reverse);
    }
    flatDeep(cx, 0);
    return iterations;
  };
  flatSequence.__iteratorUncached = function (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    let iterator = cx.__iterator(type, reverse);
    const stack = [];
    let iterations = 0;
    return new Iterator(() => {
      while (iterator) {
        const step = iterator.next();
        if (step.done !== false) {
          iterator = stack.pop();
          continue;
        }
        let v = step.value;
        if (type === ITERATE_ENTRIES) {
          v = v[1];
        }
        if ((!depth || stack.length < depth) && isCollection(v)) {
          stack.push(iterator);
          iterator = v.__iterator(type, reverse);
        } else {
          return useKeys ? step : iteratorValue(type, iterations++, v, step);
        }
      }
      return iteratorDone();
    });
  };
  return flatSequence;
};

export { factoryFlatten };
