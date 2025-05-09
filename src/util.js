const utilIsArrayLike = (value) => {
  if (Array.isArray(value) || typeof value === 'string') {
    return true;
  }

  // @ts-expect-error "Type 'unknown' is not assignable to type 'boolean'" : convert to Boolean
  return (
    value &&
    typeof value === 'object' &&
    // @ts-expect-error check that `'length' in value &&`
    Number.isInteger(value.length) &&
    // @ts-expect-error check that `'length' in value &&`
    value.length >= 0 &&
    // @ts-expect-error check that `'length' in value &&`
    (value.length === 0
      ? // Only {length: 0} is considered Array-like.
        Object.keys(value).length === 1
      : // An object is only Array-like if it has a property where the last value
        // in the array-like may be found (which could be undefined).
        // @ts-expect-error check that `'length' in value &&`
        value.hasOwnProperty(value.length - 1))
  );
};

const utilArrSpliceIn = (array, idx, val, canEdit) => {
  const newLen = array.length + 1;
  if (canEdit && idx + 1 === newLen) {
    array[idx] = val;
    return array;
  }
  const newArray = new Array(newLen);
  let after = 0;
  for (let ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      newArray[ii] = val;
      after = -1;
    } else {
      newArray[ii] = array[ii + after];
    }
  }
  return newArray;
};

const utilArrSpliceOut = (array, idx, canEdit) => {
  const newLen = array.length - 1;
  if (canEdit && idx === newLen) {
    array.pop();
    return array;
  }
  const newArray = new Array(newLen);
  let after = 0;
  for (let ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      after = 1;
    }
    newArray[ii] = array[ii + after];
  }
  return newArray;
};

// http://jsperf.com/copy-array-inline
const utilArrCopy = (arr, offset) => {
  offset = offset || 0;
  const len = Math.max(0, arr.length - offset);
  const newArr = new Array(len);
  for (let ii = 0; ii < len; ii++) {
    // @ts-expect-error We may want to guard for undefined values with `if (arr[ii + offset] !== undefined`, but ths should not happen by design
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
};

const utilArrSetAt = (array, idx, val, canEdit) => {
  const newArray = canEdit ? array : utilArrCopy(array);
  newArray[idx] = val;
  return newArray;
};

const utilFlagSpread = (fn) => ((fn.unspread = true), fn);

/**
 * Converts a value to a string, adding quotes if a string was provided.
 */
const utilQuoteString = (value) => {
  try {
    return typeof value === 'string' ? JSON.stringify(value) : String(value);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_ignoreError) {
    return JSON.stringify(value);
  }
};

const utilInvariant = (condition, error) => {
  if (!condition) throw new Error(error);
};

const utilAssertNotInfinite = (size) => {
  utilInvariant(
    size !== Infinity,
    'Cannot perform this action with an infinite size.'
  );
};

const utilHasOwnProperty = Object.prototype.hasOwnProperty;

const utilCopyShallow = (from) => {
  if (Array.isArray(from)) {
    return utilArrCopy(from);
  }
  const to = {};
  for (const key in from) {
    if (utilHasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  return to;
};

const utilAssignNamedPropAccessor = (prototype, name) => {
  try {
    Object.defineProperty(prototype, name, {
      get: function () {
        return this.get(name);
      },
      set: function (value) {
        utilInvariant(this.__ownerID, 'Cannot set on an immutable record.');
        this.set(name, value);
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO enable eslint here
  } catch (error) {
    // Object.defineProperty failed. Probably IE8.
  }
};

export {
  utilFlagSpread,
  utilHasOwnProperty,
  utilCopyShallow,
  utilIsArrayLike,
  utilArrSpliceIn,
  utilArrSpliceOut,
  utilArrCopy,
  utilArrSetAt,
  utilQuoteString,
  utilInvariant,
  utilAssertNotInfinite,
  utilAssignNamedPropAccessor,
};
