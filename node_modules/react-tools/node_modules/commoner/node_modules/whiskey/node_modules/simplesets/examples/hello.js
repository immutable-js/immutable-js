// Some toy examples of how to use the Set class.

var sets = require('simplesets');

var s1 = new sets.Set(['hello', 'world', 'how', 'are', 'you', 'today']);
var s2 = new sets.Set(['say', 'hello', 'to', 'the', 'world']);

// Print out both of the sets, as arrays of their elements.
console.log('s1 =', s1.array());
console.log('s2 =', s2.array());

// Do some set operations.
console.log('Intersection:', s1.intersection(s2).array());
console.log('s1 - s2:', s1.difference(s2).array());
console.log('s2 - s1:', s2.difference(s1).array());
console.log('Union:', s1.union(s2).array());

// Make a set with numbers and strings.
var s3 = new sets.Set([1, 2, 3, 'a', 'b', 'c']);
console.log('Mixing data types:', s3.array());
// Add in some more data types.
var my_dict = {foo: 42, bar: 'bazaar'};
s3.add(my_dict);		// This will add to the set...
s3.add(my_dict);		// ...but now this will do nothing.
s3.remove(3);
s3.remove('c');
console.log('New s3 =', s3.array());

// You can make shallow copies of sets.
var s4 = new sets.Set([1, 2, 3]);
var s5 = s4.copy();
s4.add(42);
s5.remove(2);
console.log('s4 =', s4.array());
console.log('s5 =', s5.array());