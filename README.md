Immutable collections for JavaScript
====================================

[![Build Status](https://travis-ci.org/facebook/immutable-js.svg?branch=master)](https://travis-ci.org/facebook/immutable-js)

[Immutable][] data cannot be changed once created, leading to much simpler
application development, no defensive copying, and enabling advanced memoization
and change detection techniques with simple logic. [Persistent][] data presents
a mutative API which does not update the data in-place, but instead always
yields new updated data.

Immutable.js provides many Persistent Immutable data structures including:
`List`, `Stack`, `Map`, `OrderedMap`, `Set`, `OrderedSet` and `Record`.

These data structures are highly efficient on modern JavaScript VMs by using
structural sharing via [hash maps tries][] and [vector tries][] as popularized
by Clojure and Scala, minimizing the need to copy or cache data.

Immutable.js also provides a lazy `Seq`, allowing efficient
chaining of collection methods like `map` and `filter` without creating
intermediate representations. Create some `Seq` with `Range` and `Repeat`.

Want to hear more? Watch the presentation about Immutable.js:

<a href="https://youtu.be/I7IdS-PbEgI" target="_blank" alt="Immutable Data and React"><img src="https://img.youtube.com/vi/I7IdS-PbEgI/0.jpg" /></a>

[Persistent]: http://en.wikipedia.org/wiki/Persistent_data_structure
[Immutable]: http://en.wikipedia.org/wiki/Immutable_object
[hash maps tries]: http://en.wikipedia.org/wiki/Hash_array_mapped_trie
[vector tries]: http://hypirion.com/musings/understanding-persistent-vector-pt-1


Getting started
---------------

Install `immutable` using npm.

```shell
npm install immutable
```

Then require it into any module.

```js
const { Map } = require('immutable')
const map1 = Map({ a: 1, b: 2, c: 3 })
const map2 = map1.set('b', 50)
map1.get('b') // 2
map2.get('b') // 50
```

### Browser

To use Immutable.js from a browser, download [dist/immutable.min.js](https://github.com/facebook/immutable-js/blob/master/dist/immutable.min.js)
or use a CDN such as [CDNJS](https://cdnjs.com/libraries/immutable)
or [jsDelivr](http://www.jsdelivr.com/#!immutable.js).

Then, add it as a script tag to your page:

```html
<script src="immutable.min.js"></script>
<script>
    var map1 = Immutable.Map({a:1, b:2, c:3});
    var map2 = map1.set('b', 50);
    map1.get('b'); // 2
    map2.get('b'); // 50
</script>
```

Or use an AMD loader (such as [RequireJS](http://requirejs.org/)):

```js
require(['./immutable.min.js'], function (Immutable) {
    var map1 = Immutable.Map({a:1, b:2, c:3});
    var map2 = map1.set('b', 50);
    map1.get('b'); // 2
    map2.get('b'); // 50
});
```

If you're using [webpack](https://webpack.github.io/) or
[browserify](http://browserify.org/), the `immutable` npm module also works
from the browser.

### Flow & TypeScript

Use these Immutable collections and sequences as you would use native
collections in your [Flowtype](https://flowtype.org/) or [TypeScript](http://typescriptlang.org) programs while still taking
advantage of type generics, error detection, and auto-complete in your IDE.

Installing `immutable` via npm brings with it type definitions for Flow (v0.39.0 or higher)
and TypeScript (v2.1.0 or higher), so you shouldn't need to do anything at all!

#### Using TypeScript with Immutable.js v4

Immutable.js type definitions embrace ES2015. While Immutable.js itself supports
legacy browsers and environments, its type definitions require TypeScript's 2015
lib. Include either `"target": "es2015"` or `"lib": "es2015"` in your
`tsconfig.json`, or provide `--target es2015` or `--lib es2015` to the
`tsc` command.

```js
import { Map } from "immutable";
const map1 = Map({ a: 1, b: 2, c: 3 });
const map2 = map1.set('b', 50);
map1.get('b'); // 2
map2.get('b'); // 50
```

#### Using TypeScript with Immutable.js v3 and earlier:

Previous versions of Immutable.js include a reference file which you can include
via relative path to the type definitions at the top of your file.

```js
///<reference path='./node_modules/immutable/dist/immutable.d.ts'/>
import Immutable = require('immutable');
var map1: Immutable.Map<string, number>;
map1 = Immutable.Map({a:1, b:2, c:3});
var map2 = map1.set('b', 50);
map1.get('b'); // 2
map2.get('b'); // 50
```


The case for Immutability
-------------------------

Much of what makes application development difficult is tracking mutation and
maintaining state. Developing with immutable data encourages you to think
differently about how data flows through your application.

Subscribing to data events throughout your application creates a huge overhead of
book-keeping which can hurt performance, sometimes dramatically, and creates
opportunities for areas of your application to get out of sync with each other
due to easy to make programmer error. Since immutable data never changes,
subscribing to changes throughout the model is a dead-end and new data can only
ever be passed from above.

This model of data flow aligns well with the architecture of [React][]
and especially well with an application designed using the ideas of [Flux][].

When data is passed from above rather than being subscribed to, and you're only
interested in doing work when something has changed, you can use equality.

Immutable collections should be treated as *values* rather than *objects*. While
objects represent some thing which could change over time, a value represents
the state of that thing at a particular instance of time. This principle is most
important to understanding the appropriate use of immutable data. In order to
treat Immutable.js collections as values, it's important to use the
`Immutable.is()` function or `.equals()` method to determine value equality
instead of the `===` operator which determines object reference identity.

```js
const { Map } = require('immutable')
const map1 = Map( {a: 1, b: 2, c: 3 })
const map2 = map1.set('b', 2)
assert(map1.equals(map2) === true)
const map3 = map1.set('b', 50)
assert(map1.equals(map3) === false)
```

Note: As a performance optimization Immutable.js attempts to return the existing
collection when an operation would result in an identical collection, allowing
for using `===` reference equality to determine if something definitely has not
changed. This can be extremely useful when used within a memoization function
which would prefer to re-run the function if a deeper equality check could
potentially be more costly. The `===` equality check is also used internally by
`Immutable.is` and `.equals()` as a performance optimization.

If an object is immutable, it can be "copied" simply by making another reference
to it instead of copying the entire object. Because a reference is much smaller
than the object itself, this results in memory savings and a potential boost in
execution speed for programs which rely on copies (such as an undo-stack).

```js
const { Map } = require('immutable')
const map1 = Map({ a: 1, b: 2, c: 3 })
const clone = map1;
```

[React]: http://facebook.github.io/react/
[Flux]: http://facebook.github.io/flux/docs/overview.html


JavaScript-first API
--------------------

While Immutable.js is inspired by Clojure, Scala, Haskell and other functional
programming environments, it's designed to bring these powerful concepts to
JavaScript, and therefore has an Object-Oriented API that closely mirrors that
of [ES2015][] [Array][], [Map][], and [Set][].

[ES2015]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[Map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[Set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

The difference for the immutable collections is that methods which would mutate
the collection, like `push`, `set`, `unshift` or `splice` instead return a new
immutable collection. Methods which return new arrays like `slice` or `concat`
instead return new immutable collections.

```js
const { List } = require('immutable')
const list1 = List([ 1, 2 ]);
const list2 = list1.push(3, 4, 5);
const list3 = list2.unshift(0);
const list4 = list1.concat(list2, list3);
assert(list1.size === 2);
assert(list2.size === 5);
assert(list3.size === 6);
assert(list4.size === 13);
assert(list4.get(0) === 1);
```

Almost all of the methods on [Array][] will be found in similar form on
`Immutable.List`, those of [Map][] found on `Immutable.Map`, and those of [Set][]
found on `Immutable.Set`, including collection operations like `forEach()`
and `map()`.

```js
const { Map } = require('immutable')
const alpha = Map({ a: 1, b: 2, c: 3, d: 4 });
alpha.map((v, k) => k.toUpperCase()).join();
// 'A,B,C,D'
```

### Accepts raw JavaScript objects.

Designed to inter-operate with your existing JavaScript, Immutable.js
accepts plain JavaScript Arrays and Objects anywhere a method expects an
`Collection`.

```js
const { Map } = require('immutable')
const map1 = Map({ a: 1, b: 2, c: 3, d: 4 })
const map2 = Map({ c: 10, a: 20, t: 30 })
const obj = { d: 100, o: 200, g: 300 }
const map3 = map1.merge(map2, obj);
// Map { a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300 }
```

This is possible because Immutable.js can treat any JavaScript Array or Object
as a Collection. You can take advantage of this in order to get sophisticated
collection methods on JavaScript Objects, which otherwise have a very sparse
native API. Because Seq evaluates lazily and does not cache intermediate
results, these operations can be extremely efficient.

```js
const { Seq } = require('immutable')
const myObject = { a: 1, b: 2, c: 3 }
Seq(myObject).map(x => x * x).toObject();
// { a: 1, b: 4, c: 9 }
```

Keep in mind, when using JS objects to construct Immutable Maps, that
JavaScript Object properties are always strings, even if written in a quote-less
shorthand, while Immutable Maps accept keys of any type.

```js
const { fromJS } = require('immutable')

const obj = { 1: "one" }
Object.keys(obj) // [ "1" ]
obj["1"] // "one"
obj[1]   // "one"

const map = fromJS(obj)
map.get("1") // "one"
map.get(1)   // undefined
```

Property access for JavaScript Objects first converts the key to a string, but
since Immutable Map keys can be of any type the argument to `get()` is
not altered.


### Converts back to raw JavaScript objects.

All Immutable.js Collections can be converted to plain JavaScript Arrays and
Objects shallowly with `toArray()` and `toObject()` or deeply with `toJS()`.
All Immutable Collections also implement `toJSON()` allowing them to be passed
to `JSON.stringify` directly.

```js
const { Map, List } = require('immutable')
const deep = Map({ a: 1, b: 2, c: List([ 3, 4, 5 ]) })
deep.toObject() // { a: 1, b: 2, c: List [ 3, 4, 5 ] }
deep.toArray() // [ 1, 2, List [ 3, 4, 5 ] ]
deep.toJS() // { a: 1, b: 2, c: [ 3, 4, 5 ] }
JSON.stringify(deep) // '{"a":1,"b":2,"c":[3,4,5]}'
```

### Embraces ES2015

Immutable.js supports all JavaScript environments, including legacy
browsers (even IE8). However it also takes advantage of features added to
JavaScript in [ES2015][], the latest standard version of JavaScript, including
[Iterators][], [Arrow Functions][], [Classes][], and [Modules][]. It's inspired
by the native [Map][] and [Set][] collections added to ES2015.

All examples in the Documentation are presented in ES2015. To run in all
browsers, they need to be translated to ES3.

```js
// ES2015
const mapped = foo.map(x => x * x);
// ES3
var mapped = foo.map(function (x) { return x * x; });
```

[Iterators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol
[Arrow Functions]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
[Classes]: http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes
[Modules]: http://www.2ality.com/2014/09/es6-modules-final.html


Nested Structures
-----------------

The collections in Immutable.js are intended to be nested, allowing for deep
trees of data, similar to JSON.

```js
const { fromJS } = require('immutable')
const nested = fromJS({ a: { b: { c: [ 3, 4, 5 ] } } })
// Map { a: Map { b: Map { c: List [ 3, 4, 5 ] } } }
```

A few power-tools allow for reading and operating on nested data. The
most useful are `mergeDeep`, `getIn`, `setIn`, and `updateIn`, found on `List`,
`Map` and `OrderedMap`.

```js
const nested2 = nested.mergeDeep({ a: { b: { d: 6 } } })
// Map { a: Map { b: Map { c: List [ 3, 4, 5 ], d: 6 } } }

nested2.getIn([ 'a', 'b', 'd' ]) // 6

const nested3 = nested2.updateIn([ 'a', 'b', 'd' ], value => value + 1)
// Map { a: Map { b: Map { c: List [ 3, 4, 5 ], d: 7 } } }

const nested4 = nested3.updateIn([ 'a', 'b', 'c' ], list => list.push(6))
// Map { a: Map { b: Map { c: List [ 3, 4, 5, 6 ], d: 7 } } }
```


Lazy Seq
--------

`Seq` describes a lazy operation, allowing them to efficiently chain
use of all the sequence methods (such as `map` and `filter`).

**Seq is immutable** — Once a Seq is created, it cannot be
changed, appended to, rearranged or otherwise modified. Instead, any mutative
method called on a Seq will return a new Seq.

**Seq is lazy** — Seq does as little work as necessary to respond to any
method call.

For example, the following does not perform any work, because the resulting
Seq is never used:

```js
const { Seq } = require('immutable')
const oddSquares = Seq([ 1, 2, 3, 4, 5, 6, 7, 8 ])
  .filter(x => x % 2)
  .map(x => x * x)
```

Once the Seq is used, it performs only the work necessary. In this
example, no intermediate arrays are ever created, filter is called three times,
and map is only called once:

```js
console.log(oddSquares.get(1)); // 9
```

Any collection can be converted to a lazy Seq with `.toSeq()`.

```js
const { Map } = require('immutable')
const seq = Map({ a: 1, b: 2, c: 3 }).toSeq()
```

Seq allows for the efficient chaining of sequence operations, especially when
converting to a different concrete type (such as to a JS object):

```js
seq.flip().map(key => key.toUpperCase()).flip().toObject();
// { A: 1, B: 1, C: 1 }
```

As well as expressing logic that would otherwise seem memory-limited:

```js
const { Range } = require('immutable')
Range(1, Infinity)
  .skip(1000)
  .map(n => -n)
  .filter(n => n % 2 === 0)
  .take(2)
  .reduce((r, n) => r * n, 1);
// 1006008
```

Note: A Collection is always iterated in the same order, however that order may
not always be well defined, as is the case for the `Map`.


Equality treats Collections as Data
-----------------------------------

Immutable.js provides equality which treats immutable data structures as pure
data, performing a deep equality check if necessary.

```js
const { Map, is } = require('immutable')
const map1 = Map({ a: 1, b: 2, c: 3 })
const map2 = Map({ a: 1, b: 2, c: 3 })
assert(map1 !== map2) // two different instances
assert(is(map1, map2)) // have equivalent values
assert(map1.equals(map2)) // alternatively use the equals method
```

`Immutable.is()` uses the same measure of equality as [Object.is][]
including if both are immutable and all keys and values are equal
using the same measure of equality.

[Object.is]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is


Batching Mutations
------------------

> If a tree falls in the woods, does it make a sound?
>
> If a pure function mutates some local data in order to produce an immutable
> return value, is that ok?
>
> — Rich Hickey, Clojure

Applying a mutation to create a new immutable object results in some overhead,
which can add up to a minor performance penalty. If you need to apply a series
of mutations locally before returning, Immutable.js gives you the ability to
create a temporary mutable (transient) copy of a collection and apply a batch of
mutations in a performant manner by using `withMutations`. In fact, this is
exactly how  Immutable.js applies complex mutations itself.

As an example, building `list2` results in the creation of 1, not 3, new
immutable Lists.

```js
const { List } = require('immutable')
const list1 = List([ 1, 2, 3 ]);
const list2 = list1.withMutations(function (list) {
  list.push(4).push(5).push(6);
});
assert(list1.size === 3);
assert(list2.size === 6);
```

Note: Immutable.js also provides `asMutable` and `asImmutable`, but only
encourages their use when `withMutations` will not suffice. Use caution to not
return a mutable copy, which could result in undesired behavior.

*Important!*: Only a select few methods can be used in `withMutations` including
`set`, `push` and `pop`. These methods can be applied directly against a
persistent data-structure where other methods like `map`, `filter`, `sort`,
and `splice` will always return new immutable data-structures and never mutate
a mutable collection.


Documentation
-------------

[Read the docs](http://facebook.github.io/immutable-js/docs/) and eat your vegetables.

Docs are automatically generated from [Immutable.d.ts](https://github.com/facebook/immutable-js/blob/master/type-definitions/Immutable.d.ts).
Please contribute!

Also, don't miss the [Wiki](https://github.com/facebook/immutable-js/wiki) which
contains articles on specific topics. Can't find something? Open an [issue](https://github.com/facebook/immutable-js/issues).


Testing
-------

If you are using the [Chai Assertion Library](http://chaijs.com/), [Chai Immutable](https://github.com/astorije/chai-immutable) provides a set of assertions to use against Immutable.js collections.


Contribution
------------

Use [Github issues](https://github.com/facebook/immutable-js/issues) for requests.

We actively welcome pull requests, learn how to [contribute](./CONTRIBUTING.md).


Changelog
---------

Changes are tracked as [Github releases](https://github.com/facebook/immutable-js/releases).


Thanks
------

[Phil Bagwell](https://www.youtube.com/watch?v=K2NYwP90bNs), for his inspiration
and research in persistent data structures.

[Hugh Jackson](https://github.com/hughfdjackson/), for providing the npm package
name. If you're looking for his unsupported package, see [this repository](https://github.com/hughfdjackson/immutable).


License
-------

Immutable.js is [BSD-licensed](https://github.com/facebook/immutable-js/blob/master/LICENSE). We also provide an additional [patent grant](https://github.com/facebook/immutable-js/blob/master/PATENTS).
