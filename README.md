Immutable Data Collections
==========================

Immutable data cannot be changed once created, leading to much simpler
application development and enabling techniques from functional programming such
as lazy evaluation. This provides a lazy `Sequence`, allowing efficient chaining
of sequence methods like `map` and `filter` without creating intermediate
representations.

`immutable-data` implements a sparse `Vector`, `Map`, `OrderedMap`, `Set` and
`Range` by using lazy sequences and hash maps tries. They achieve acceptable
performance by using structural sharing and minimizing the need to copy data.


Getting started
---------------

Install immutable-data using npm

```shell
npm install immutable-data
```

Then require it into any module.

```javascript
var Immutable = require('immutable-data');
var map = Immutable.Map({a:1, b:2, c:3});
```

To use `immutable-data` from a browser, try [Browserify](http://browserify.org/).


Use these Immutable collections and sequences as you would use native
collections in your [TypeScript](typescriptlang.org) programs while still taking
advantage of type generics, error detection, and auto-complete in your IDE.

(Because of TypeScript 1.0's issue with NodeJS module resolution, you must
require the full file path)

```javascript
import Immutable = require('./node_modules/immutable-data/dist/Immutable');
var map: Immutable.Map<string, number>;
map = Immutable.Map({a:1, b:2, c:3});
```


The case for Immutability
-------------------------

Much of what makes application development difficult is tracking mutation and
maintaining state. Developing with immutable data encourages you to think
differently about how data flows through your application.

When data is passed from above rather than being subscribed to, and you're only
interested in doing work when something has changed, you use equality. Immutable
data allows for using `===` equality to determine if something has changed.

```javascript
var map1 = Immutable.Map({a:1, b:2, c:3});
var map2 = map1.set('b', 2);
assert(map1 === map2);
```

If an object is immutable, it can be copied simply by making a copy of a
reference to it instead of copying the entire object. Because a reference is
much smaller than the object itself, this results in memory savings and a
potential boost in execution speed for programs which rely on copies.

```javascript
var map1 = Immutable.Map({a:1, b:2, c:3});
var map2 = map1.clone();
assert(map1 === map2);
```


JavaScript-first API
--------------------

While `immutable-data` is inspired by Clojure, Haskell and other functional
programming environments, it's designed to bring these powerful concepts to
JavaScript, and therefore has an Object-Oriented API that closely mirrors that
of [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array),
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), and
[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

The only difference is that every method that would mutate the collection
instead returns a new collection.

```javascript
var vect1 = Immutable.Vector(1, 2);
var vect2 = vect1.push(3, 4, 5);
var vect3 = vect2.slice(1, -1);
var vect4 = vect1.concat(vect2, vect3, vect4);
assert(vect1.length === 2);
assert(vect2.length === 5);
assert(vect3.length === 3);
assert(vect4.length === 10);
```

Almost all of the methods on `Array` will be found in similar form on
`Immutable.Vector`, those of `Map` found on `Immutable.Map`, and those of `Set`
found on `Immutable.Set`, including sequence operations like `forEach` and `map`.

```javascript
> var alpha = Immutable.Map({a:1, b:2, c:3, d:4});
> alpha.map((v, k) => k.toUpperCase()).forEach(k => console.log(k));
A
B
C
D
```

Designed to inter-operate with your existing JavaScript, `immutable-data`
accepts plain JavaScript Array and Objects anywhere a method expects a
`Sequence` with no performance penalty.

```javascript
var map1 = Immutable.Map({a:1, b:2, c:3, d:4});
var map2 = Immutable.Map({c:10, a:20, t:30});
var obj = {d:100, o:200, g:300};
var map3 = map1.merge(map2, obj);
// Map { a: 20, b: 2, c: 10, d: 1000, t: 30, o: 2000, g: 300 }
```

All `immutable-data` Sequences can be converted to plain JavaScript Arrays and
Objects shallowly with `toArray()` and `toObject()` or deeply with `toJSON()`,
allowing `JSON.stringify` to work automatically.

```javascript
var deep = Immutable.Map({a:1, b:2, c:Immutable.Vector(3,4,5)});
deep.toObject() // { a: 1, b: 2, c: Vector [ 3, 4, 5 ] }
deep.toArray() // [ 1, 2, Vector [ 3, 4, 5 ] ]
deep.toJSON() // { a: 1, b: 2, c: [ 3, 4, 5 ] }
JSON.stringify(deep) // '{"a":1,"b":2,"c":[3,4,5]}'
```


Nested Structures
-----------------

The collections in `immutable-data` are intended to be nested, allowing for deep
trees of data, similar to JSON.

```javascript
var nested = Immutable.fromJSON({a:{b:{c:[3,4,5]}}});
// Map { a: Map { b: Map { c: Vector [ 3, 4, 5 ] } } }
```

A few power-tools allow for reading and operating on nested data. The
most useful are `mergeDeep`, `getIn` and `updateIn`, found on `Vector`, `Map`
and `OrderedMap`.

```javascript
var nested2 = nested.mergeDeep({a:{b:{d:6}}});
// Map { a: Map { b: Map { c: Vector [ 3, 4, 5 ], d: 6 } } }
```

```javascript
nested2.getIn(['a', 'b', 'd']); // 6
var nested3 = nested2.updateIn(['a', 'b', 'd'], value => value + 1);
// Map { a: Map { b: Map { c: Vector [ 3, 4, 5 ], d: 7 } } }
```


Lazy Sequences
--------------

The lazy `Sequence`, which is the base class for all collections in
`immutable-data`. This allows for efficient chaining of sequence operations like
`map` and `filter` as well as allowing for defining logic that is otherwise very
difficult to express.

```javascript
var map1 = Immutable.Map({a:1, b:1, c:1});
var map2 = map1.flip().map(key => key.toUpperCase()).flip().toMap();
console.log(map2); // Map { A: 1, B: 1, C: 1 }
```


Equality treats Collections as Data
-----------------------------------

`immutable-data` provides equality which treats immutable data structures as
pure data, performing a deep equality check if necessary.

```javascript
var map1 = Immutable.Map({a:1, b:1, c:1});
var map2 = Immutable.Map({a:1, b:1, c:1});
assert(map1 !== map2);
assert(Immutable.is(map1, map2) === true);
```

`Immutable.is` uses the same measure of equality as [Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
including if both are immutable sequences and all keys and values are equal
using the same measure of equality.


Batching Mutations
------------------

> If a tree falls in the woods, does it make a sound?
>
> If a pure function mutates some local data in order to produce an immutable
> return value, is that ok?
>
> — Rich Hickey, Clojure

There is a performance penalty paid every time you create a new immutable object
via applying a mutation. If you need to apply a series of mutations
`immutable-data` gives you the ability to create a temporary mutable copy of a
collection and applying a batch of mutations in a highly performant manner by
using `withMutations`. In fact, this is exactly how `immutable-data` applies
complex mutations itself.

As an example, this results in the creation of 2, not 4, new immutable Vectors.

```javascript
var vect1 = Immutable.Vector(1,2,3);
var vect2 = vect1.withMutations(function (vect) {
  vect.push(4).push(5).push(6);
});
assert(vect1.length === 3);
assert(vect2.length === 6);
```


API Documentation
-----------------

All documentation is contained within the type definition file, [Immutable.d.ts](./type-definitions/Immutable.d.ts).


Contribution
------------

Taking pull requests! Or, use Github issues for requests.
