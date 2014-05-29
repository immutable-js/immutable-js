/**
*
* A PList (persistent list) allows us to push and pop to the first position in the list as well as walk this list.
*
*   class PList<T> {
*     static new(...items: T[]): PList;
*     static empty(): PList;
*     static fromArray(items: T[]): PList;
*     toArray(): T[];
*     push(item: T): PList;
*     peek(): T;
*     pop(): PList;
*     length: number;
*   }
*
*/

var EmptyList = (function () {
    function EmptyList() {
        if (EmptyList.singleton) {
            return EmptyList.singleton;
            //throw new Error('Singleton double created. Do not use new.');
        }
        console.log('creating an EmptyList');
        this.length = 0;
        Object.freeze(this);
        EmptyList.singleton = this;
    }
    EmptyList.prototype.toArray = function () {
        return [];
    };

    EmptyList.prototype.push = function (item) {
        return new PList(item);
    };

    EmptyList.prototype.peek = function () {
        return null;
    };

    EmptyList.prototype.first = function () {
        return null;
    };

    EmptyList.prototype.pop = function () {
        return this;
    };

    EmptyList.prototype.rest = function () {
        return this;
    };

    EmptyList.prototype.forEach = function (fn) {
        // no-op
    };

    EmptyList.prototype.map = function (fn) {
        return this;
    };
    return EmptyList;
})();

var PList = (function () {
    function PList(item, next) {
        this.length = next ? next.length + 1 : 1;
        this.item = item;
        this.next = next;
        Object.freeze(this);
    }
    PList.fromArray = function (items) {
        if (items.length === 0) {
            return new EmptyList();
        }
        var list = new PList(items[items.length - 1]);
        for (var ii = items.length - 2; ii >= 0; ii--) {
            list = list.push(items[ii]);
        }
        return list;
    };

    PList.prototype.toArray = function () {
        var array = [];
        this.forEach(function (index, item) {
            return array.push(item);
        });
        return array;
    };

    PList.prototype.push = function (item) {
        return new PList(item, this);
    };

    PList.prototype.peek = function () {
        return this.item;
    };

    PList.prototype.first = function () {
        return this.peek();
    };

    PList.prototype.pop = function () {
        return this.next ? this.next : new EmptyList();
    };

    PList.prototype.rest = function () {
        return this.pop();
    };

    PList.prototype.forEach = function (fn) {
        var ptr = this;
        var index = 0;
        while (ptr) {
            fn(0, ptr.item);
            ptr = ptr.next;
            index++;
        }
    };

    PList.prototype.map = function (fn) {
        var results = [];
        this.forEach(function (index, item) {
            return results.push(fn(index, item));
        });
        return PList.fromArray(results);
    };
    return PList;
})();

/////////////////////
console.log('Test: -----------------');

var x = PList.fromArray(['B', 'C']);
console.log(x.toArray());
var y = x.push('A');
console.log(x.toArray(), y.toArray());
var peekedX = x.peek();
var peekedY = y.peek();
console.log(peekedX, peekedY);
var z = x.push('Z');
var xn = y.pop();
console.log(x.toArray(), y.toArray(), z.toArray(), xn.toArray());
console.log('---');

console.log('Iterating...', y);
y.forEach(function (index, item) {
    return console.log(item);
});

console.log('Mapping', y);
var ymap = y.map(function (index, item) {
    return item.toLowerCase();
});
console.log(ymap.toArray());

console.log('---');
var xnn = xn.pop();
var xnnn = xnn.pop();
var xnnnn = xnnn.pop();
console.log(x.toArray(), y.toArray());
console.log(xn, xn.toArray());
console.log(xnn, xnn.toArray(), xnn == xn, xnn === xn);
console.log(xnnn, xnnn.toArray(), xnnn == xnn, xnnn === xnn);
console.log(xnnnn, xnnnn.toArray(), xnnnn == xnnn, xnnnn === xnnn);
