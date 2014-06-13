import OrderedIterable = require('./OrderedIterable');
interface IList<T> extends OrderedIterable<T, IList<T>> {
    length: number;
    get(index: number): T;
    first(): T;
    last(): T;
}
export = IList;
