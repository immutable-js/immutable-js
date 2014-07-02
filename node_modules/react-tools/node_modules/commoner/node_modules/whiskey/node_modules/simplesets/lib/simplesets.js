// Set code for Node.js, which stores objects in arrays. All sets are
// mutable, and set update operations happen destructively. However,
// operations like set intersection and difference create a new set.

var SetPrototype = {
    // Does this set contain an element x? Returns true or false.
    has: function(x) {
	return this._items.indexOf(x) >= 0;
    },

    // Add an element x to this set, and return this set.
    add: function(x) {
	if (!this.has(x)) this._items.push(x);
	return this;
    },

    // Remove an element x from this set, if it is part of the set. If
    // it is not part of the set, do nothing. Returns this set.
    remove: function(x) {
	var pos = this._items.indexOf(x);
	if (pos >= 0) {
	    this._items.splice(pos, 1);
	}
	return this;
    },

    // Return a new set containing the items found in either this set,
    // the other set, or both.
    union: function(other) {
	var result = new exports.Set();
	result._items = this._items.concat(); // Make a copy
	for (var i = 0; i < other._items.length; i++)
	    result.add(other._items[i]);
	return result;
    },

    // Return a new set containing the items found in both this set
    // and the other set.
    intersection: function(other) {
	var result = new exports.Set();
	for (var i = 0; i < other._items.length; i++)
	    if (this.has(other._items[i]))
		result._items.push(other._items[i]);
	return result;
    },

    // Return a new set containing the items in this set that are not
    // in the other set.
    difference: function(other) {
	var result = new exports.Set();
	for (var i = 0; i < this._items.length; i++)
	    if (!other.has(this._items[i]))
		result._items.push(this._items[i]);
	return result;
    },

    // Return a new set containing the items in either this set or the
    // other set, but not both.
    symmetric_difference: function(other) {
	// Hideously inefficient -- but who uses this function, anyway?
	return this.union(other).difference(this.intersection(other));
    },

    // Return true if every element of this set is in the other set.
    issubset: function(other) {
	for (var i = 0; i < this._items.length; i++)
	    if (!other.has(this._items[i]))
		return false;
	return true;
    },

    // Return true if every element of the other is in this set.
    issuperset: function(other) {
	return other.issubset(this);
    },

    // Return a copy of the items in the set, as an array.
    array: function() {
	return this._items.concat();
    },

    // Return the size of the set.
    size: function() {
	return this._items.length;
    },

    // Return a shallow copy of the set.
    copy: function() {
	var result = new exports.Set();
	result._items = this._items.concat();
	return result;
    },

    // Return a random element of the set, or null if the set is
    // empty. Unlike pop, does not remove the element from the set.
    pick: function() {
	if (this._items.length === 0) return null;

	var i = Math.floor(Math.random() * this._items.length);
	return this._items[i];
    },

    // Remove and return a random element of the set, or null if the
    // set is empty.
    pop: function() {
	if (this._items.length === 0) return null;

	var i = Math.floor(Math.random() * this._items.length);
	return this._items.splice(i, 1)[0];
    },

    // Return true if this set equals another set, i.e. if every
    // element in each set is equal to an element in the other set.
    equals: function(other) {
	// Common case: sets are different size.
	if (this.size() !== other.size()) return false;

	
	// If sets are the same size, we can just check to see that
	// every element in this set corresponds to an element in the
	// other set.
	for (var i = 0; i < this._items.length; i++)
	    if (!other.has(this._items[i]))
		return false;
	return true;
    },

    // Call a callback function on each element of the set. If the set
    // is changed by the callback, the results are undefined.
    each: function(callback) {
	// If there's no callback, don't bother.
	if (!callback) return;

	for (var i = 0; i < this._items.length; i++)
	    callback(this._items[i]);
    }
};

exports.Set = function(items) {
    // All items are stored in this list, in no particular order.
    this._items = [];

    // If initial items were given, add them to the set.
    if (typeof items !== "undefined")
	for (var i = 0; i < items.length; i++)
	    this.add(items[i]);
};

exports.Set.prototype = SetPrototype;


var StringSetPrototype = {
    // Does this set contain an element x? Returns true or false.
    has: function(x) {
	return this._items.hasOwnProperty(x);
    },

    // Add an element x to this set, and return this set.
    add: function(x) {
	if (!this.has(x)) {
	    this._items[x] = x;
	    this._size++;
	}
	return this;
    },

    // Remove an element x from this set, if it is part of the set. If
    // it is not part of the set, do nothing. Returns this set.
    remove: function(x) {
	if (this.has(x)) {
	    delete this._items[x];
	    this._size--;
	}
	return this;
    },

    // Return a new set containing the items found in either this set,
    // the other set, or both.
    union: function(other) {
	var result = new exports.StringSet();
	for (var x in this._items) result.add(this._items[x]);
	for (x in other._items) result.add(other._items[x]);
	return result;
    },

    // Return a new set containing the items found in both this set
    // and the other set.
    intersection: function(other) {
	var result = new exports.StringSet();
	for (var x in other._items)
	    if (this._items.hasOwnProperty(x))
		result.add(this._items[x]);
	return result;
    },

    // Return a new set containing the items in this set that are not
    // in the other set.
    difference: function(other) {
	var result = new exports.StringSet();
	for (var x in this._items)
	    if (!other._items.hasOwnProperty(x))
		result.add(this._items[x]);
	return result;
    },

    // Return a new set containing the items in either this set or the
    // other set, but not both.
    symmetric_difference: function(other) {
	// Hideously inefficient -- but who uses this function, anyway?
	return this.union(other).difference(this.intersection(other));
    },

    // Return true if every element of this set is in the other set.
    issubset: function(other) {
	for (var x in this._items)
	    if (!other._items.hasOwnProperty(x))
		return false;
	return true;
    },

    // Return true if every element of the other is in this set.
    issuperset: function(other) {
	return other.issubset(this);
    },

    // Return a copy of the items in the set, as an array.
    array: function() {
	var arr = [];
	for (var x in this._items)
	    arr.push(this._items[x]);
	return arr;
    },

    // Return the size of the set.
    size: function() {
	return this._size;
    },

    // Return a shallow copy of the set.
    copy: function() {
	var result = new exports.StringSet();
	for (var x in this._items) result.add(this._items[x]);
	return result;
    },

    // Return a random element of the set, or null if the set is
    // empty. Unlike pop, does not remove the element from the set.
    pick: function() {
	if (this._size === 0) return null;

	var i = Math.floor(Math.random() * this._size);
	for (var x in this._items) {
	    if (i === 0) return this._items[x];
	    i--;
	}
	// This should never happen
	return null;
    },

    // Remove and return a random element of the set, or null if the
    // set is empty.
    pop: function() {
	if (this._size === 0) return null;

	var i = Math.floor(Math.random() * this._size);
	for (var x in this._items) {
	    if (i === 0) {
		var ret = this._items[x];
		this.remove(this._items[x]);
		return ret;
	    }
	    i--;
	}
	// This should never happen
	return null;
    },
    
    // Return true if this set equals another set, i.e. if every
    // element in each set is equal to an element in the other set.
    equals: function(other) {
	// Common case: sets are different size.
	if (this.size() !== other.size()) return false;
	
	// If sets are the same size, we can just check to see that
	// every element in this set corresponds to an element in the
	// other set.
	for (var x in this._items)
	    if (!other.has(this._items[x]))
		return false;
	return true;
    },

    // Call a callback function on each element of the set. If the set
    // is changed by the callback, the results are undefined.
    each: function(callback) {
	// If there's no callback, don't bother.
	if (!callback) return;

	for (var x in this._items)
	    callback(this._items[x]);
    }
}

// A special type of set, where all keys have unique string
// representations. This works fine with a set containing only
// strings, or only numbers. However, if you want to have the number
// 42 and the string "42" in the same set, you should use the Set data
// type, not StringSet.
exports.StringSet = function(items) {
    // All items are stored in an object. 
    this._items = {};
    // We maintain a size variable for the cardinality of the set.
    this._size = 0;

    // If initial items were given, add them to the set.
    if (typeof items !== "undefined")
	for (var i = 0; i < items.length; i++)
	    this.add(items[i]);
};

exports.StringSet.prototype = StringSetPrototype;