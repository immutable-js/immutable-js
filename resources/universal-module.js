function universalModule() {
  %MODULE%
  return Immutable;
}
module && module.exports ? module.exports = universalModule() :
  define && define.amd ? define(universalModule) :
    Immutable = universalModule();
