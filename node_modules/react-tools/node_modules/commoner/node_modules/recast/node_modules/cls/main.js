// Sentinel value passed to base constructors to skip invoking this.init.
var populating = {};

function makeClass(base, newProps) {
  var baseProto = base.prototype;
  var ownProto = Object.create(baseProto);
  var newStatics = newProps.statics;
  var populated;

  function constructor() {
    if (!populated) {
      if (base.extend === extend) {
        // Ensure population of baseProto if base created by makeClass.
        base.call(populating);
      }

      // Wrap override methods to make this._super available.
      populate(ownProto, newProps, baseProto);

      // Help the garbage collector reclaim this object, since we
      // don't need it anymore.
      newProps = null;

      populated = true;
    }

    // When we invoke a constructor just for the sake of making sure
    // its prototype has been populated, the receiver object (this)
    // will be strictly equal to the populating object, which means we
    // want to avoid invoking this.init.
    if (this === populating) {
      return;
    }

    // Evaluate this.init only once to avoid looking up .init in the
    // prototype chain twice.
    var init = this.init;
    if (init) {
      init.apply(this, arguments);
    }
  }

  // Copy any static properties that have been assigned to the base
  // class over to the subclass.
  populate(constructor, base);

  if (newStatics) {
    // Remove the statics property from newProps so that it does not
    // get copied to the prototype.
    delete newProps.statics;

    // We re-use populate for static properties, so static methods
    // have the same access to this._super that normal methods have.
    populate(constructor, newStatics, base);

    // Help the GC reclaim this object.
    newStatics = null;
  }

  // These property assignments overwrite any properties of the same
  // name that may have been copied from base, above. Note that ownProto
  // has not been populated with any methods or properties, yet, because
  // we postpone that work until the subclass is instantiated for the
  // first time. Also note that we share a single implementation of
  // extend between all classes.
  constructor.prototype = ownProto;
  constructor.extend = extend;
  constructor.base = baseProto;

  // Setting constructor.prototype.constructor = constructor is
  // important so that instanceof works properly in all browsers.
  ownProto.constructor = constructor;

  // Setting .cls as a shorthand for .constructor is purely a
  // convenience to make calling static methods easier.
  ownProto.cls = constructor;

  // If there is a static initializer, call it now. This needs to happen
  // last so that the constructor is ready to be used if, for example,
  // constructor.init needs to create an instance of the new class.
  if (constructor.init) {
    constructor.init(constructor);
  }

  return constructor;
}

function populate(target, source, parent) {
  for (var name in source) {
    if (source.hasOwnProperty(name)) {
      target[name] = parent ? maybeWrap(name, source, parent) : source[name];
    }
  }
}

var hasOwnExp = /\bhasOwnProperty\b/;
var superExp = hasOwnExp.test(populate) ? /\b_super\b/ : /.*/;

function maybeWrap(name, child, parent) {
  var cval = child && child[name];
  var pval = parent && parent[name];

  if (typeof cval === "function" &&
      typeof pval === "function" &&
      cval !== pval && // Avoid infinite recursion.
      cval.extend !== extend && // Don't wrap classes.
      superExp.test(cval)) // Only wrap if this._super needed.
  {
    return function() {
      var saved = this._super;
      this._super = parent[name];
      try { return cval.apply(this, arguments) }
      finally { this._super = saved };
    };
  }

  return cval;
}

function extend(newProps) {
  return makeClass(this, newProps || {});
}

module.exports = extend.call(function(){});
