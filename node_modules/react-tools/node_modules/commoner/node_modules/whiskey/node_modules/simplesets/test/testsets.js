var assert = require('assert');
var sets   = require('../lib/simplesets');

////////////////////
// sets.Set tests 
////////////////////

// Test basic set construction, add, remove, size, copy, equals, and has.
var s1 = new sets.Set([1, 2, 3]);
var s2 = new sets.Set();
assert.equal(s1.size(), 3);
assert.equal(s2.size(), 0);
assert.equal(s1.has(2), true);
assert.equal(s1.has(4), false);
assert.equal(s2.has(1), false);
s1.remove(2);
s1.add(42);
s2.add(3); s2.add(4);
s2.remove(3);
assert.equal(s1.has(2), false);
assert.equal(s2.has(3), false);
assert.equal(s2.has(4), true);
assert.ok(s1.equals(new sets.Set([42, 1, 3])));
assert.ok(s2.equals(s2));
assert.ok(s1.equals(s1.copy()));
assert.ok(s1.copy() !== s1);
assert.ok(!s1.equals(s2));
assert.ok(typeof s1.array() == typeof [1, 2, 3]);

// Test two-set operations, using mixed number and string keys.
var s3 = new sets.Set([1, 2, 3, "1", "2", "3"]);
var s4 = new sets.Set([3, "1", "foo"]);
var nullset = new sets.Set();
var s3sub = new sets.Set([1, "3", 2]);
assert.ok(s3.issuperset(s3sub));
assert.ok(!s3sub.issuperset(s3));
assert.ok(s3sub.issubset(s3));
assert.ok(!s4.issubset(s3));
assert.ok(s3.union(s4).equals(new sets.Set([1, 2, 3, "1", "2", "3", "foo"])));
assert.ok(s3.intersection(s4).equals(new sets.Set(["1", 3])));
assert.ok(s3.difference(s4).equals(new sets.Set([1, 2, "2", "3"])));
assert.ok(s3.symmetric_difference(s4).equals(new sets.Set([1, 2, "2", "3", "foo"])));
assert.ok(nullset.union(nullset.copy()).size() === 0);

// Test the pop operation
var sa = new sets.Set([3, 1, 4, 1, 5, 9]);
var sb = new sets.Set();

for (var i = 0; i < 200; i++) {
    var sa_copy = sa.copy();
    sb.add(sa_copy.pop());
    assert.ok(sa_copy.size() === sa.size() - 1);
}

assert.ok(sb.issubset(sa));

// Test the pick operation, in much the same way.
var sa = new sets.Set([3, 1, 4, 1, 5, 9]);
var sb = new sets.Set();

for (var i = 0; i < 200; i++) {
    var sa_old_size = sa.size();
    sb.add(sa.pick());
    assert.ok(sa.size() === sa_old_size);
}

assert.ok(sb.issubset(sa));
assert.ok(nullset.pick() === null);
assert.ok(nullset.pop() === null);
assert.ok(nullset.issubset(nullset));

// Make sure add and remove return the set, for chaining.
var s5 = new sets.Set();
s5.add(3).add(4).remove(3);
assert.ok(s5.equals(new sets.Set([4])));

// Test each() function
function set_test_each(s) {
    n = new sets.Set();
    s.each(function(x) {
	assert.ok(!n.has(x));
	n.add(x);
    });
    assert.ok(n.equals(s));
    assert.ok(s.equals(n));
}
set_test_each(new sets.Set([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9]));
set_test_each(new sets.Set([1, 2, 3, "1", "2", "3", "foo"]));
set_test_each(new sets.Set());
set_test_each(new sets.Set({foo: 42}));

///////////////////////
// sets.StringSet tests 
///////////////////////

// Test basic set construction, add, remove, size, copy, equals, and has.
var s1 = new sets.StringSet([1, 2, 3]);
var s2 = new sets.StringSet();
assert.equal(s1.size(), 3);
assert.equal(s2.size(), 0);
assert.equal(s1.has(2), true);
assert.equal(s1.has(4), false);
assert.equal(s2.has(1), false);
s1.remove(2);
s1.add(42);
s2.add(3); s2.add(4);
s2.remove(3);
assert.equal(s1.has(2), false);
assert.equal(s2.has(3), false);
assert.equal(s2.has(4), true);
assert.ok(s1.equals(new sets.StringSet([42, 1, 3])));
assert.ok(s2.equals(s2));
assert.ok(s1.equals(s1.copy()));
assert.ok(s1.copy() !== s1);
assert.ok(!s1.equals(s2));
assert.ok(typeof s1.array() == typeof [1, 2, 3]);

// Test two-set operations, using mixed number and string keys.
var s3 = new sets.StringSet([1, 2, 3, "11", "22", "33"]);
var s4 = new sets.StringSet([3, "11", "foo"]);
var nullset = new sets.StringSet();
var s3sub = new sets.StringSet([1, "33", 2]);
assert.ok(s3.issuperset(s3sub));
assert.ok(!s3sub.issuperset(s3));
assert.ok(s3sub.issubset(s3));
assert.ok(!s4.issubset(s3));
assert.ok(s3.intersection(s4).equals(new sets.StringSet(["11", 3])));
assert.ok(s3.difference(s4).equals(new sets.StringSet([1, 2, "22", "33"])));
assert.ok(s3.symmetric_difference(s4).equals(new sets.StringSet([1, 2, "22", "33", "foo"])));
assert.ok(nullset.union(nullset.copy()).size() === 0);

// Test the pop operation
var sa = new sets.StringSet([3, 1, 4, 1, 5, 9]);
var sb = new sets.StringSet();

for (var i = 0; i < 200; i++) {
    var sa_copy = sa.copy();
    sb.add(sa_copy.pop());
    assert.ok(sa_copy.size() === sa.size() - 1);
}

assert.ok(sb.issubset(sa));

// Test the pick operation, in much the same way.
var sa = new sets.StringSet([3, 1, 4, 1, 5, 9]);
var sb = new sets.StringSet();

for (var i = 0; i < 200; i++) {
    var sa_old_size = sa.size();
    sb.add(sa.pick());
    assert.ok(sa.size() === sa_old_size);
}

assert.ok(sb.issubset(sa));
assert.ok(nullset.pick() === null);
assert.ok(nullset.pop() === null);
assert.ok(nullset.issubset(nullset));

// Make sure add and remove return the set, for chaining.
var s5 = new sets.StringSet();
s5.add(3).add(4).remove(3);
assert.ok(s5.equals(new sets.StringSet([4])));

// Test each() function
function stringset_test_each(s) {
    n = new sets.StringSet();
    s.each(function(x) {
	assert.ok(!n.has(x));
	n.add(x);
    });
    assert.ok(n.equals(s));
    assert.ok(s.equals(n));
}
set_test_each(new sets.StringSet([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9]));
set_test_each(new sets.StringSet([1, 2, 3, "11", "22", "33", "foo"]));
set_test_each(new sets.StringSet());
set_test_each(new sets.StringSet({foo: 42}));

// If we got to here, then...
console.log('All tests passed!');