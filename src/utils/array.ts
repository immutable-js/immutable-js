import arrCopy from './arrCopy';

export function setAt<T>(
  array: Array<T>,
  idx: number,
  val: T,
  canEdit: boolean
): Array<T> {
  const newArray = canEdit ? array : arrCopy(array);
  newArray[idx] = val;
  return newArray;
}

export function spliceIn<T>(
  array: Array<T>,
  idx: number,
  val: T,
  canEdit: boolean
): Array<T> {
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
}

export function spliceOut<T>(
  array: Array<T>,
  idx: number,
  canEdit: boolean
): Array<T> {
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
}
