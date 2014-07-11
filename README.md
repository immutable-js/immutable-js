Immutable Data Collections
==========================

Immutable data cannot be changed once created, leading to much simpler
application development and enabling techniques from functional programming such
as lazy evaluation. This provides a lazy `Sequence`, allowing efficient chaining
of sequence methods like `map` and `filter` without creating intermediate
represenations.

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

To use `immutable-data` from a [TypeScript](http://www.typescriptlang.org/) program.

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


Lazy Sequences
--------------

`immutable-data` provides a lazy `Sequence`, which is the base class for all of
its collections. This allows for efficient chaining of sequence operations like
`map` and `filter` as well as allowing for defining logic that is otherwise very
difficult to express.

```javascript
var map1 = Immutable.Map({a:1, b:1, c:1});
var map2 = map1.flip().map(key => key.toUpperCase()).flip().toMap();
console.log(map2); // Map { A: 1, B: 1, C: 1 }
```


JavaScript-first API
--------------------

While `immutable-data` is inspired by Clojure, Haskell and other functional
programming environments, it's designed to bring these powerful concepts to
JavaScript, and therefore has an Object-Oriented API that closely mirrors that
of [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
and [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

The only difference is that every method that would mutate the collection
instead returns a new collection.

```javascript
var vect1 = Immutable.Vector(1,2);
var vect2 = vect1.push(3,4,5);
var vect3 = vect2.slice(1, -1).toVector();
var vect4 = vect1.concat(vect2, vect3, vect4);
assert(vect1.length === 2);
assert(vect2.length === 5);
assert(vect3.length === 3);
assert(vect4.length === 10);
```

Almost all of the methods on `Array` will be found in similar form on
`Immutable.Vector`, those of `Map` found on `Immutable.Map`, and those of `Set`
found on `Immutable.Set`, including sequence operations.


Mutation, and breaking the rules
--------------------------------

> If a tree falls in the woods, does it make a sound?
>
> If a pure function mutates some local data in order to produce an immutable
> return value, is that ok?
>
> - Rich Hickey, Clojure

There is a performance penalty paid every time you create a new immutible object
via applying a mutation. If you need to perform a series of mutations, then this
can become a high cost. `immutable-data` gives you the ability to create a
temporary mutable copy of a collection and applying mutations in a highly
performant manner. In fact, this is exactly how `immutable-data` applies
mutations itself.

Just follow one simple rule: never return a mutable collection. You should
always see `asMutable()` and `asImmutable()` in close pairs.

```javascript
var vect1 = Immutable.Vector().asMutable();
var vect2 = vect1.push(1,2,3);
assert(vect1.length === 3);
assert(vect2.length === 3);
var vect = vect2.asImmutable();
```


API
---

Reference: [Immutable.d.ts](./type-definitions/Immutable.d.ts)


Contribution
------------

Taking pull requests! Or, use Github issues for requests.
