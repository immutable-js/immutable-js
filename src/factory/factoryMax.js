const defaultComparator = (a, b) => {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;

  return a > b ? 1 : a < b ? -1 : 0;
};

const maxCompare = (comparator, a, b) => {
  const comp = comparator(b, a);
  // b is considered the new max if the comparator declares them equal, but
  // they are not equal and b is in fact a nullish value.
  return (
    (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) ||
    comp > 0
  );
};

const factoryMax = (collection, comparator, mapper) => {
  if (!comparator) {
    comparator = defaultComparator;
  }
  if (mapper) {
    const entry = collection
      .toSeq()
      .map((v, k) => [v, mapper(v, k, collection)])
      .reduce((a, b) => (maxCompare(comparator, a[1], b[1]) ? b : a));
    return entry && entry[0];
  }

  const res = collection.reduce((a, b) =>
    maxCompare(comparator, a, b) ? b : a
  );

  return res;
};

export { factoryMax };
