function universalModule() {
  var module = {};
  %MODULE%
  return module.exports;
}
typeof exports === 'object' ? module.exports = universalModule() :
  typeof define === 'function' && define.amd ? define(universalModule) :
    Immutable = universalModule();
