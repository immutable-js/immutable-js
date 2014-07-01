var m = require("./mori.bare.js").mori;

function time(f) {
  var s = new Date();
  f();
  console.log("Elapsed ms: ", (new Date())-s);
}

time(function() {
  var x = {foo: 1};

  for(var i = 0; i < 1000000; i++) {
    x.foo = 2;
  }
});

time(function() {
  var x = Object.freeze({foo: 1});

  for(var i = 0; i < 1000000; i++) {
    x.foo = 2;
  }
});

time(function() {
  var x = m.hash_map("foo", 1),
      y = m.proxy(x);

  for(var i = 0; i < 1000000; i++) {
    y.foo = 2;
  }
});
