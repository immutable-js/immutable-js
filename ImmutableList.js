"use strict";

/**
Just playing around with immutable data structures in Javascript using Object.freeze.

The one concern I have with my approach here is memory management. 
If a list is ever started as an array, then the fate of all elements are shared.
I could fix this by storing each item as a separate 'chunk' but I'm worried about CPU and memory bloat from doing that.
Would I need a wrapper to know the difference between a list of lists and a list which simply has hierarchy?
I suppose I am already using a simple array as the wrapper for value objects added.

I'll use the syntax <...> for a List and [...] for an Array and () for a wrapped-range List.

# A one-sided tree.
Chunks: (<A>), <<<(<B>)>, (<C>)>, (<D>)>

# A flat tree
Chunks: <(<A>), (<B>), (<C>), (<D>)>

# A flat array tree
Chunks: [A], [B], [C], [D]

# one chunk of many items
Chunks: [A, B, C, D]

*/

function ImmutableList() {
  if (this instanceof ImmutableList) {
    throw new Error('Do not use "new" with this function');
  }
  var array = Array.prototype.slice.call(arguments);
  return ImmutableList.fromArray(array);
}

var EMPTY_LIST;
ImmutableList.empty = function () {
  if (!EMPTY_LIST) {
    var newList = Object.create(ImmutableList.prototype);
    newList.length = 0
    newList.__chunks = Object.freeze([]);
    EMPTY_LIST = Object.freeze(newList);
  }
  return EMPTY_LIST;
};

ImmutableList.fromArray = function (array) {
  if (array.length === 0) {
    return ImmutableList.empty();
  }
  var newList = Object.create(ImmutableList.prototype);
  newList.length = array.length;
  newList.__chunks = Object.freeze([Object.freeze(array)]);
  return Object.freeze(newList);
};

ImmutableList.prototype.toArray = function() {
  var array = [];
  this.forEach(function (item) {
    array.push(item);
  });
  return array;
};

ImmutableList.prototype.push = function (item) {
  var newList = Object.create(ImmutableList.prototype);
  newList.length = this.length + 1;
  newList.__chunks = Object.freeze([
    this,
    Object.freeze([item])
  ]);
  return Object.freeze(newList);
};

ImmutableList.prototype.concat = function (list) {
  if (!(list instanceof ImmutableList)) {
    throw new Error('Must concat ImmutableList');
  }
  
  // Concat an empty list is a no-op.
  if (list.length === 0) {
    return this;
  }
  
  var newList = Object.create(ImmutableList.prototype);
  newList.length = this.length + list.length;
  newList.__chunks = Object.freeze([
    this,
    list
  ]);
  return Object.freeze(newList);
};

ImmutableList.prototype.peek = function() {
  if (this.length == 0) {
    return null;
  }
  
  var lastChunk = this.__chunks[this.__chunks.length - 1];
  if (lastChunk instanceof ImmutableList) {
    return lastChunk.peek();
  } else {
    return lastChunk[lastChunk.length - 1];
  }
};

ImmutableList.prototype.pop = function() {
  // Pop an empty list is a no-op.
  if (this.length == 0) {
    return this;
  }
  
  // Pop an list of length-1 returns an empty list.
  if (this.length === 1) {
    return ImmutableList.empty();
  }
  
  var lastChunk = this.__chunks[this.__chunks.length - 1];
  
  // Special case where this branch has two children and the last chunk contains
  // a single element, we can simply return the first child.
  if (lastChunk.length === 1 && this.__chunks.length === 2 
      && this.__chunks[0] instanceof ImmutableList) {
    return this.__chunks[0];
  }
  
  // In this case you want to return a list with a new last chunk based on the previous one
  // but with it's end index one less.
  throw new Error('Not yet implemented this scenario');
};

function ArrayIterator(array) {
  this.array = array;
  this.index = 0;
}

ArrayIterator.prototype.next = function() {
  if (this.index >= this.array.length) {
    return {done: true};
  }
  var value = this.array[this.index];
  this.index++;
  return {value: value};
};

function ImmutableListIterator(list) {
  this.list = list;
  this.index = 0;
  this.iterator;
}

// TODO: this shouldn't need to create an object for each layer of depth.
// There is a much more simple iteration strategy here using an index path.
ImmutableListIterator.prototype.next = function() {
  while (this.index < this.list.__chunks.length) {
    var chunk = this.list.__chunks[this.index];
    var iterator = this.iterator;
    if (!iterator) {
      iterator = chunk instanceof ImmutableList ? new ImmutableListIterator(chunk) : new ArrayIterator(chunk);
      this.iterator = iterator;
    }
    var next = iterator.next();
    if (!next.done) {
      return next;
    }
    this.iterator = null;
    this.index++;
  }
  return {done: true};
};

ImmutableList.prototype.forEach = function(fn) {
  var iterator = new ImmutableListIterator(this);
  var next = iterator.next();
  while (!next.done) {
    fn(next.value);
    next = iterator.next();
  }
};

ImmutableList.prototype.map = function(fn) {
  var iterator = new ImmutableListIterator(this);
  var data = [];
  var next = iterator.next();
  while (!next.done) {
    data.push(fn(next.value));
    next = iterator.next();
  }
  return ImmutableList.fromArray(data);
};

ImmutableList.prototype.toString = function() {
  return '@[' + this.toArray().join(', ') + ']';
};



var x = ImmutableList('A', 'B');
console.log(x);
var y = x.push('C');
console.log(x, y);
var peekedX = x.peek();
var peekedY = y.peek();
console.log(peekedX, peekedY);
var xn = y.pop();
console.log(x, y, xn);
console.log('---');

var z = ImmutableList('H', 'I', 'J');
var xz = x.concat(z);
var zx = z.concat(x);
console.log(x,z,xz,zx,xz.peek(),zx.peek());


console.log('Iterating...', xz);
xz.forEach(function (item) {
  console.log(item);
});
console.log('Iterating...', zx);
zx.forEach(function (item) {
  console.log(item);
});

console.log('Mapping', xz);
var xzmap = xz.map(function (item) {
  return item.toLowerCase();
});
console.log(xzmap);

console.log('---');
var xnn = xn.pop();
console.log(x, y, xn, xnn);















