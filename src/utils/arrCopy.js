// http://jsperf.com/copy-array-inline
export default function arrCopy(arr, offset) {
  offset = offset || 0;
  const len = Math.max(0, arr.length - offset);
  const newArr = new Array(len);
  for (let ii = 0; ii < len; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}
