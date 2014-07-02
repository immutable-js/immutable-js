Introduction
---

Standardized `class` syntax
[is coming](http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes)
in ECMAScript 6, supposedly, but until then I need a class factory that fills the gap.

For me that means (in no particular order):

* prototypal inheritance under the hood
* access to overridden properties (`super`)
* inheritance of `static` properties
* `static` constructors
* close correspondence to ES6 syntax
* ES5/browser compatibility
* only-pay-for-what-you-use performance
* excellent test coverage: [![Build Status](https://travis-ci.org/benjamn/cls.png?branch=master)](https://travis-ci.org/benjamn/cls)

I have no delusions of persuading the world to use this tool. Just try
`npm search inheritance` some time to see how many other people have come
up with solutions that work for them.

If you have a special interest in the tired me-too sport of
pure-JavaScript class factory implementations, you might find this one
interesting for its solutions to each of the requirements listed above,
particularly the lazy (just-in-time) population of prototype properties.

Note that I did not mention privacy enforcement as a requirement. If you
need a mechanism like the `private` keyword in other languages, I have a
separate [project](https://npmjs.org/package/private) that works
seamlessly alongside this one.

Installation
---
From NPM:

    npm install cls

From GitHub:

    cd path/to/node_modules
    git clone git://github.com/benjamn/cls.git
    cd cls
    npm install .

Usage
---

One example will have to suffice for now:
```js
var cls = require("cls");

var BaseClass = cls.extend({
    init: function(a, b) {
        this.sum = a + b;
    },

    getSum: function() {
        return this.sum;
    },

    statics: {
        name: "BaseClass",

        init: function(cls) {
            cls.zero = new cls(0, 0);
        }
    }
});

var SubClass = BaseClass.extend({
    init: function(arg) {
        this._super(arg, arg);
        this.sum += 1;
    },

    statics: {
        name: "SubClass"
    }
});

assert(BaseClass.name === "BaseClass");
assert(SubClass.name === "SubClass");

assert(new BaseClass(2).getSum() === 4);
assert(new SubClass(2).getSum() === 5);

assert(SubClass.zero !== BaseClass.zero);
assert(SubClass.zero instanceof SubClass);
assert(SubClass.zero.getSum() === 1);
```
For more complex examples, see `test/run.js`.
