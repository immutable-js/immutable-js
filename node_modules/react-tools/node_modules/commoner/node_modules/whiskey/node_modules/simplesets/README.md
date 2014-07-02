Simple set datatype for JavaScript
==========

This provides a set data type, with an API very close to that of [Python's sets module](http://docs.python.org/library/sets.html).

Installation
----------

If you have the node package manager, this is easy:

    npm install simplesets

You could also clone the git repository, and install it manually.

Usage
----------

Here's an example of how you use it:

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
    
The set data type has the simplest, stupidest implementation possible: an unordered array. This is because of how JavaScript's data types work. If it were possible to compute a hash value from any data type, or get its memory address, then we could do something more elaborate. If `<` and `>` operations were defined for all data types, we could use some kind of balanced tree representation, or sorted arrays. If JavaScript objects supported arbitrary data types as indices, this would all be too easy. But none of those things is true, so we're stuck relying only on the `===` operation, and unsorted arrays. For small sets, this is not a problem. For larger sets, if performance of set operations turns out to be problematic, you may want to use a specialized set data type. For example, if your set members are all strings, you could represent sets as objects with set members as keys, and it would be fast. For this, use the `StringSet` class, described below.

Set API
----------

The `Set` class has the following methods:

* `new Set(items)`: Creates a new set. If an array `items` is given, its contents will be added to the set.

* `has(x)`: Does this set contain an element `x`? Returns `true` or `false`.

* `add(x)`: Add an element `x` to this set, and return this set.

* `remove(x)`: Remove an element `x` from this set, if it is part of the set. If it is not part of the set, do nothing. Returns this set.

* `union(other)`: Return a new set containing the items found in either this set, the other set, or both.

* `intersection(other)`: Return a new set containing the items found in both this set and the other set.

* `difference(other)`: Return a new set containing the items in this set that are not in the other set.

* `symmetric_difference(other)`: Return a new set containing the items in either this set or the other set, but not both.

* `issubset(other)`: Return `true` if every element of this set is in the other set.

* `issuperset(other)`: Return `true` if every element of the other is in this set.

* `equals(other)`: Return `true` if this set equals another set, i.e. if every element in each set is equal to an element in the other set.

* `array()`: Return a copy of the items in the set, as an array.

* `size()`: Return the size of the set.

* `copy()`: Return a shallow copy of the set.

* `pop()`: Remove and return a random element of the set, or null if the set is empty.

* `pick()`: Return a random element of the set, or null if the set is empty. Unlike `pop`, does not remove the element from the set.

* `each(callback)`: Call a callback function on each element of the set. If the set is changed by the callback, the results are undefined. The callback takes a single argument: the set element that it's being called on.

The condition for determining whether two values are equal is the `===` operator. Therefore sets can support any mix of data types, as long as the data types can be compared for equality in some meaningful sense with `===`.

Specialized sets
----------

If all of your set members have unique string representations, then you can create a set using object properties to keep track of the members. This takes advantage of the fast built-in object type in JavaScript, and is generally better than using general-purpose sets if there will not be collisions, e.g. a set containing both the number 42 and the string "42".

The `StringSet` class behaves just like the `Set` class, but it uses this object-based encoding and requires that all set members have unique string representations. Instantiate it with `new StringSet(items)`, and the API is the same as described above.

Note that `Set` will generally be faster and more memory-efficient than `StringSet` for sets with fewer than around 110 elements. `StringSet` is good for large sets, though.
