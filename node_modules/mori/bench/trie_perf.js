var p = require("persistent-hash-trie"),
    m = require("../mori.js");

var s = new Date();
var trie = p.Trie();
for(var i = 0; i < 1e5; i++) {
  trie = p.assoc(trie, "key"+i, "value");
}
console.log("Trie assoc 100000 keys", (new Date())-s);

s = new Date();
for(var i = 0; i < 1e5; i++) {
  p.get(trie, "key"+i);
}
console.log("Trie access 100000 keys", (new Date())-s);

var trie_small = p.assoc(p.Trie(), "key", "value");
s = new Date();
for(var i = 0; i < 1e6; i++) {
  p.get(trie_small, "key");
}
console.log("Small Trie get", (new Date())-s);

s = new Date();
var hash_map = m.hash_map();
for(var i = 0; i < 1e5; i++) {
  hash_map = m.assoc(hash_map, "key"+i, "value");
}
console.log("PHM assoc 100000 keys", (new Date())-s);

s = new Date();
for(var i = 0; i < 1e5; i++) {
  m.get(hash_map, "key"+i);
}
console.log("PHM access 100000 keys", (new Date())-s);

var array_map = m.array_map("key", "value");
s = new Date();
for(var i = 0; i < 1e6; i++) {
  m.get(array_map, "key");
}
console.log("Array map get", (new Date())-s);
