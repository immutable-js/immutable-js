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

interface ISeq<T> {
  forEach(fn: (key:any, value:T) => void): void;
  first(): T;
  rest(): ISeq<T>;
}

interface IList<T> extends ISeq<T> {
  length: number;
  toArray(): T[];
  push(item: T): IList<T>;
  peek(): T;
  pop(): IList<T>;
  forEach(fn: (key:any, value:T) => void): void;
  map(fn: (key:any, value:T) => T): IList<T>;
}

interface IQueue<T> extends ISeq<T> {
  length: number;
  enqueue(): IQueue<T>;
  dequeue(): IQueue<T>;
  //back(): T;
  front(): T;
}

class EmptyList implements IList<any> {
  private static singleton: EmptyList;

  constructor() {
    if (EmptyList.singleton) {
      return EmptyList.singleton;
      //throw new Error('Singleton double created. Do not use new.');
    }
    this.length = 0;
    Object.freeze(this);
    EmptyList.singleton = this;
  }

  length: number;

  toArray(): any[] {
    return [];
  }

  push(item: any): IList<any> {
    return new PList(item);
  }

  peek(): any {
    return null;
  }

  first(): any {
    return null;
  }

  pop(): IList<any> {
    return this;
  }

  rest(): ISeq<any> {
    return this;
  }

  forEach(fn: (key:any, value:any) => void): void {
    // no-op
  }

  map(fn: (key:any, value:any) => any): IList<any> {
    return this;
  }
}

class PList<T> implements IList<T> {
  private item: T;
  private next: PList<T>;

  constructor(item: T, next?: PList<T>) {
    this.length = next ? next.length + 1 : 1;
    this.item = item;
    this.next = next;
    Object.freeze(this);
  }

  length: number;

  static fromArray<T>(items: T[]): IList<T> {
    if (items.length === 0) {
      return new EmptyList();
    }
    var list:IList<T> = new PList(items[items.length - 1]);
    for (var ii = items.length - 2; ii >= 0; ii--) {
      list = list.push(items[ii]);
    }
    return list;
  }

  toArray(): T[] {
    var array = [];
    this.forEach((index, item) => array.push(item));
    return array;
  }

  push(item: T): IList<T> {
    return new PList(item, this);
  }

  peek(): T {
    return this.item;
  }

  first(): T {
    return this.peek();
  }

  pop(): IList<T> {
    return this.next ? this.next : new EmptyList();
  }

  rest(): ISeq<T> {
    return this.pop();
  }

  forEach(fn: (key:number, value:T) => void): void {
    var ptr = this;
    var index = 0;
    while (ptr) {
      fn(0, ptr.item);
      ptr = ptr.next;
      index++;
    }
  }

  map(fn: (key:number, value:T) => T): IList<T> {
    var results = [];
    this.forEach((index, item) => results.push(fn(index, item)));
    return PList.fromArray(results);
  }
}




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
y.forEach((index, item) => console.log(item));

console.log('Mapping', y);
var ymap = y.map((index, item) => item.toLowerCase());
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






















