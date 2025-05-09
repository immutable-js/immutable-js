import {
  getIterator,
  Iterator,
  iteratorValue,
  iteratorDone,
  ITERATE_VALUES,
} from '../Iterator';

const factoryZipWith = (
  keyIter,
  makeSequence,
  Collection,
  ArraySeq,
  zipper,
  iters,
  zipAll
) => {
  const zipSequence = makeSequence(keyIter);
  const sizes = ArraySeq(iters).map((i) => i.size);
  zipSequence.size = zipAll ? sizes.max() : sizes.min();
  // Note: this a generic base implementation of __iterate in terms of
  // __iterator which may be more generically useful in the future.
  zipSequence.__iterate = function (fn, reverse) {
    /* generic:
    var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
    var step;
    var iterations = 0;
    while (!(step = iterator.next()).done) {
      iterations++;
      if (fn(step.value[1], step.value[0], this) === false) {
        break;
      }
    }
    return iterations;
    */
    const iterator = this.__iterator(ITERATE_VALUES, reverse);
    let step;
    let iterations = 0;
    while (!(step = iterator.next()).done) {
      if (fn(step.value, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  };
  zipSequence.__iteratorUncached = function (type, reverse) {
    const iterators = iters.map(
      (i) => ((i = Collection(i)), getIterator(reverse ? i.reverse() : i))
    );
    let iterations = 0;
    let isDone = false;
    return new Iterator(() => {
      let steps;
      if (!isDone) {
        steps = iterators.map((i) => i.next());
        isDone = zipAll
          ? steps.every((s) => s.done)
          : steps.some((s) => s.done);
      }
      if (isDone) {
        return iteratorDone();
      }
      return iteratorValue(
        type,
        iterations++,
        zipper.apply(
          null,
          steps.map((s) => s.value)
        )
      );
    });
  };
  return zipSequence;
};

export { factoryZipWith };
