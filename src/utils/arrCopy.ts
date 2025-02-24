// http://jsperf.com/copy-array-inline

export default function arrCopy<I>(arr: Array<I>, offset?: number): Array<I> {
  offset = offset || 0;
  const len = Math.max(0, arr.length - offset);
  const newArr: Array<I> = new Array(len);
  for (let ii = 0; ii < len; ii++) {
    // @ts-expect-error We may want to guard for undefined values with `if (arr[ii + offset] !== undefined`, but ths should not happen by design
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}
