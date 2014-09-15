Immutable Data Collections
==========================

Immutable data cannot be changed once created, leading to much simpler
application development and enabling techniques from functional programming such
as lazy evaluation. Immutable JS provides a lazy `Sequence`, allowing efficient
chaining of sequence methods like `map` and `filter` without creating
intermediate representations.

`immutable` provides `Sequence`, `Range`, `Repeat`, `Map`, `OrderedMap`, `Set`
and a sparse `Vector` by using lazy sequences and [hash maps tries](http://en.wikipedia.org/wiki/Hash_array_mapped_trie).
They achieve efficiency by using structural sharing and minimizing the need to
copy or cache data.


Getting started
---------------

Install `immutable` using npm

```shell
npm install immutable
```

Then require it into any module.

```javascript
var Immutable = require('immutable');
var map = Immutable.Map({a:1, b:2, c:3});
```

### Browser

To use `immutable` from a browser, download [dist/Immutable.min.js](./dist/Immutable.min.js).

Then, add it as a script tag to your page:

```html
<script src="Immutable.min.js"></script>
<script>
    var map = Immutable.Map({a:1, b:2, c:3});
    map = map.set('b', 20);
    map.get('b'); // 20
</script>
```

Or use an AMD loader (such as [RequireJS](http://requirejs.org/)):

```javascript
require(['./Immutable.min.js'], function (Immutable) {
    var map = Immutable.Map({a:1, b:2, c:3});
    map = map.set('b', 20);
    map.get('b'); // 20
});
```

### TypeScript
Use these Immutable collections and sequences as you would use native
collections in your [TypeScript](http://typescriptlang.org) programs while still taking
advantage of type generics, error detection, and auto-complete in your IDE.

Just add a reference with a relative path to the type declarations at the top
of your file.

```javascript
///<reference path='./node_modules/immutable/dist/Immutable.d.ts'/>
import Immutable = require('immutable');
var map: Immutable.Map<string, number>;
map = Immutable.Map({a:1, b:2, c:3});
map = map.set('b', 20);
map.get('b'); // 20
```


The case for Immutability
-------------------------

Much of what makes application development difficult is tracking mutation and
maintaining state. Developing with immutable data encourages you to think
differently about how data flows through your application.

Subscribing to data events throughout your application, by using
`Object.observe`, or any other mechanism, creates a huge overhead of
book-keeping which can hurt performance, sometimes dramatically, and creates
opportunities for areas of your application to get out of sync with each other
due to simple programmer error. Since immutable data never changes, subscribing
to changes throughout the model is a dead-end and new data can only ever be
passed from above.

This model of data flow aligns well with the architecture of [React](http://facebook.github.io/react/)
and especially well with an application designed using the ideas of [Flux](http://facebook.github.io/react/docs/flux-overview.html).

When data is passed from above rather than being subscribed to, and you're only
interested in doing work when something has changed, you can use equality.
`immutable` always returns itself when a mutation results in an identical
collection, allowing for using `===` equality to determine if something
has changed.

```javascript
var map1 = Immutable.Map({a:1, b:2, c:3});
var map2 = map1.set('b', 2);
assert(map1 === map2);
```

If an object is immutable, it can be "cloned" simply by making another reference
to it instead of copying the entire object. Because a reference is much smaller
than the object itself, this results in memory savings and a potential boost in
execution speed for programs which rely on copies (such as an undo-stack).

```javascript
var map1 = Immutable.Map({a:1, b:2, c:3});
var clone = map1;
```


JavaScript-first API
--------------------

While `immutable` is inspired by Clojure, Haskell and other functional
programming environments, it's designed to bring these powerful concepts to
JavaScript, and therefore has an Object-Oriented API that closely mirrors that
of [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array),
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), and
[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

The difference for the immutable collections is that methods which would mutate
the collection, like `push`, `set`, `unshift` or `splice` instead return a new
immutable collection. Methods which return new arrays like `slice` or `concat`
instead return new immutable collections.

```javascript
var vect1 = Immutable.Vector(1, 2);
var vect2 = vect1.push(3, 4, 5);
var vect3 = vect2.unshift(0);
var vect4 = vect1.concat(vect2, vect3);
assert(vect1.length === 2);
assert(vect2.length === 5);
assert(vect3.length === 6);
assert(vect4.length === 13);
assert(vect4.get(0) === 1);
```

Almost all of the methods on `Array` will be found in similar form on
`Immutable.Vector`, those of `Map` found on `Immutable.Map`, and those of `Set`
found on `Immutable.Set`, including sequence operations like `forEach` and `map`.

```javascript
var alpha = Immutable.Map({a:1, b:2, c:3, d:4});
alpha.map((v, k) => k.toUpperCase()).join();
// 'A,B,C,D'
```

### Accepts raw JavaScript objects.

Designed to inter-operate with your existing JavaScript, `immutable`
accepts plain JavaScript Arrays and Objects anywhere a method expects a
`Sequence` with no performance penalty.

```javascript
var map1 = Immutable.Map({a:1, b:2, c:3, d:4});
var map2 = Immutable.Map({c:10, a:20, t:30});
var obj = {d:100, o:200, g:300};
var map3 = map1.merge(map2, obj);
// Map { a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300 }
```

This is possible because `immutable` can treat any JavaScript Array or Object
as a Sequence. You can take advantage of this in order to get sophisticated
sequence methods on JavaScript Objects, which otherwise have a very sparse
native API. Because Sequences evaluate lazily and do not cache intermediate
results, these operations are extremely efficient.

```javascript
var myObject = {a:1,b:2,c:3};
Sequence(myObject).map(x => x * x).toObject();
// { a: 1, b: 4, c: 9 }
```

### Converts back to raw JavaScript objects.

All `immutable` Sequences can be converted to plain JavaScript Arrays and
Objects shallowly with `toArray()` and `toObject()` or deeply with `toJS()`.
All sequences also implement `toJSON()` allowing them to be passed to
`JSON.stringify` directly.

```javascript
var deep = Immutable.Map({a:1, b:2, c:Immutable.Vector(3,4,5)});
deep.toObject() // { a: 1, b: 2, c: Vector [ 3, 4, 5 ] }
deep.toArray() // [ 1, 2, Vector [ 3, 4, 5 ] ]
deep.toJS() // { a: 1, b: 2, c: [ 3, 4, 5 ] }
JSON.stringify(deep) // '{"a":1,"b":2,"c":[3,4,5]}'
```


Nested Structures
-----------------

The collections in `immutable` are intended to be nested, allowing for deep
trees of data, similar to JSON.

```javascript
var nested = Immutable.fromJS({a:{b:{c:[3,4,5]}}});
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

var nested4 = nested3.updateIn(['a', 'b', 'c'], vect => vect.push(6));
// Map { a: Map { b: Map { c: Vector [ 3, 4, 5, 6 ], d: 7 } } }
```


Lazy Sequences
--------------

The `Sequence` is a set of (key, value) entries which can be iterated, and
is the base class for all collections in `immutable`, allowing them to make
use of all the Sequence methods (such as `map` and `filter`).

**Sequences are immutable** — Once a sequence is created, it cannot be
changed, appended to, rearranged or otherwise modified. Instead, any mutative
method called on a sequence will return a new immutable sequence.

**Sequences are lazy** — Sequences do as little work as necessary to respond
to any method call.

For example, the following does not perform any work, because the resulting sequence is
never used:

    var oddSquares = Immutable.Sequence(1,2,3,4,5,6,7,8)
      .filter(x => x % 2).map(x => x * x);

Once the sequence is used, it performs only the work necessary. In this
example, no intermediate arrays are ever created, filter is only called
twice, and map is only called once:

    console.log(oddSquares.last()); // 49

Lazy Sequences allow for the efficient chaining of sequence operations, allowing
for the expression of logic that can otherwise be very tedious:

    Immutable.Sequence({a:1, b:1, c:1})
      .flip().map(key => key.toUpperCase()).flip().toObject();
    // Map { A: 1, B: 1, C: 1 }

As well as expressing logic that would otherwise seem memory-limited:

    Immutable.Range(1, Infinity)
      .skip(1000)
      .map(n => -n)
      .filter(n => n % 2 === 0)
      .take(2)
      .reduce((r, n) => r * n, 1);
    // 1006008

Note: A sequence is always iterated in the same order, however that order may
not always be well defined, as is the case for the `Map`.


Equality treats Collections as Data
-----------------------------------

`immutable` provides equality which treats immutable data structures as
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


Cursors
-------

Cursors allow you to hold a reference to a path in a nested immutable data
structure, allowing you to pass smaller sections of a larger nested
collection to portions of your application while maintaining a central point
aware of changes to the entire data structure: an `onChange` function which is
called whenever a cursor or sub-cursor calls `update`.

This is particularly useful when used in conjuction with component-based UI
libraries like [React](http://facebook.github.io/react/) or to simulate
"state" throughout an application while maintaining a single flow of logic.


```javascript
var data = Immutable.fromJS({ a: { b: { c: 1 } } });
var cursor = data.cursor(['a', 'b', 'c'], newData => {
  data = newData;
});

// ... elsewhere ...

cursor.deref(); // 1
cursor = cursor.update(x => x + 1);
cursor.deref(); // 2

// ... back to data ...

data.getIn(['a', 'b', 'c']); // 2
```


Batching Mutations
------------------

> If a tree falls in the woods, does it make a sound?
>
> If a pure function mutates some local data in order to produce an immutable
> return value, is that ok?
>
> — Rich Hickey, Clojure

Applying a mutation to create a new immutable object will result in a performance penalty.
If you need to apply a series of mutations, `immutable` gives you the ability to create a
temporary mutable copy of a collection and apply a batch of mutations in a highly
performant manner by using `withMutations`. In fact, this is exactly how `immutable`
applies complex mutations itself.

As an example, this results in the creation of 2, not 4, new immutable Vectors.

```javascript
var vect1 = Immutable.Vector(1,2,3);
var vect2 = vect1.withMutations(function (vect) {
  vect.push(4).push(5).push(6);
});
assert(vect1.length === 3);
assert(vect2.length === 6);
```

Note: `immutable` also provides `asMutable` and `asImmutable`, but only
encourages their use when `withMutations` will not suffice.


API Documentation
-----------------

All documentation is contained within the type definition file, [Immutable.d.ts](./type-definitions/Immutable.d.ts).


Contribution
------------

Use [Github issues](https://github.com/facebook/immutable-js/issues) for requests.

We actively welcome pull requests, learn how to [contribute](./CONTRIBUTING.md).


Thanks
------

[Hugh Jackson](https://github.com/hughfdjackson/), for providing the npm package
name. If you're looking for his unsupported package, see [v1.4.1](https://www.npmjs.org/package/immutable/1.4.1).


License
-------

`immutable` is [BSD-licensed](./LICENSE). We also provide an additional [patent grant](./PATENTS).
