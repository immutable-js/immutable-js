// return object an object w/ functions transformed to resemble methods
// eg,
// ```
// function = {
//   getValue: (data, key) => data.get(key)
// }
// transformToMethods(functions) => ({
//   getValue: function (key) { return function.getValue(this, key) }
// })
// ```

const methodArgs = [
  (fn) =>
    function () {
      return fn(this);
    },
  (fn) =>
    function (a1) {
      return fn(this, a1);
    },
  (fn) =>
    function (a1, a2) {
      return fn(this, a1, a2);
    },
  (fn) =>
    function (a1, a2, a3) {
      return fn(this, a1, a2, a3);
    },
  (fn) =>
    function (a1, a2, a3, a4) {
      return fn(this, a1, a2, a3, a4);
    },
  (fn) =>
    function (a1, a2, a3, a4, a5) {
      return fn(this, a1, a2, a3, a4, a5);
    },
  (fn) =>
    function (a1, a2, a3, a4, a5, a6) {
      return fn(this, a1, a2, a3, a4, a5, a6);
    },
  (fn) =>
    function (a1, a2, a3, a4, a5, a6, a7) {
      return fn(this, a1, a2, a3, a4, a5, a6, a7);
    },
  (fn) =>
    function (a1, a2, a3, a4, a5, a6, a7, a8) {
      return fn(this, a1, a2, a3, a4, a5, a6, a7, a8);
    },
];

const methodArgsSpread = [
  // these wrappers for spread functions, eg
  //
  // concat(...values) {}
  // splice(index, removeNum, ...values) {}
  // interleave(...collections) {}
  // zip(...collections) {}
  // zipAll(...collections) {}
  // zipWith(zipper, ...collections) {}
  (fn) =>
    function (...a1) {
      return fn(this, a1);
    },
  (fn) =>
    function (a1, ...a2) {
      return fn(this, a1, a2);
    },
  (fn) =>
    function (a1, a2, ...a3) {
      return fn(this, a1, a2, a3);
    },
];

const transformToMethod = ((cache) => (methodval) => {
  const methodvalname = methodval.name;

  return (
    (methodvalname && cache[methodvalname]) ||
    (cache[methodvalname] = methodval.unspread
      ? methodArgsSpread[methodval.length - 2](methodval)
      : methodArgs[methodval.length](methodval))
  );
})({});

const transformToMethods = (methodsmap, target = {}) => {
  target = Object.keys(methodsmap).reduce((methodsObj, methodkey) => {
    const methodval = methodsmap[methodkey];

    methodsObj[methodkey] =
      typeof methodval === 'function'
        ? transformToMethod(methodval)
        : methodval;

    return methodsObj;
  }, target);

  return target;
};

export default transformToMethods;
