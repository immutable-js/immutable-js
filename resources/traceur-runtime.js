var $Object = Object;

function createClass(ctor, methods, staticMethods, superClass) {
  var proto;
  if (superClass) {
    var superProto = superClass.prototype;
    proto = $Object.create(superProto);
  } else {
    proto = ctor.prototype;
  }
  $Object.keys(methods).forEach(function (key) {
    proto[key] = methods[key];
  });
  superClass && $Object.keys(superClass).forEach(function (key) {
    ctor[key] = superClass[key];
  });
  $Object.keys(staticMethods).forEach(function (key) {
    ctor[key] = staticMethods[key];
  });
  proto.constructor = ctor;
  ctor.prototype = proto;
  return ctor;
}

function superCall(self, proto, name, args) {
  return $Object.getPrototypeOf(proto)[name].apply(self, args);
}

function defaultSuperCall(self, proto, args) {
  superCall(self, proto, 'constructor', args);
}

var $traceurRuntime = {};
$traceurRuntime.createClass = createClass;
$traceurRuntime.superCall = superCall;
$traceurRuntime.defaultSuperCall = defaultSuperCall;
