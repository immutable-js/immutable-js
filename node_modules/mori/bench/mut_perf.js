;(function() {
var m = mori;

for(var j = 0; j < 10; j++) {
  var s = new Date();
  var arr = [];
  for(var i = 0; i < 10000000; i++) {
    arr.push(i);
  }
  print("Array push " + arr.length + " items " + ((new Date())-s));
}

for(var j = 0; j < 10; j++) {
  s = new Date();
  var mv = m.mutable.thaw(m.vector());
  for(var i = 0; i < 10000000; i++) {
    mv = m.mutable.conj1(mv, i);
  }
  var v = m.mutable.freeze(mv);
  print("Mutable vector conj " + m.count(v) + " items " + ((new Date())-s));
}
})();
