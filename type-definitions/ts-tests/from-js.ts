import {
  fromJS,
  List,
  Map
} from '../../';

// $ExpectType any
var withReviver = fromJS({}, (a: any, b: any) => b);

// $ExpectType string
var fromString: string = fromJS('abc');

// $ExpectType List<number>
var fromArrayA: List<number> = fromJS([0, 1, 2]);

// $ExpectType List<number>
var fromListA: List<number> = fromJS(List([0, 1, 2]));

// $ExpectType Map<'a' | 'b' | 'c', number>
var fromObjectA: Map<'a' | 'b' | 'c', number> = fromJS({a: 0, b: 1, c: 2});

// $ExpectType Map<string, number>
var fromMapA: Map<string, number> = fromJS(Map({a: 0, b: 1, c: 2}));

// $ExpectType List<Map<'a', number>>
var fromArrayB: List<Map<'a', number>> = fromJS([{a: 0}]);

// $ExpectType Map<'a', List<number>>
var fromObjectB: Map<'a', List<number>> = fromJS({a: [0]});

// $ExpectType List<List<List<number>>>
var fromArrayC: List<List<List<number>>> = fromJS([[[0]]]);

// $ExpectType Map<'a', Map<'b', Map<'c', number>>>
var fromObjectC: Map<'a', Map<'b', Map<'c', number>>> = fromJS({a: {b: {c: 0}}});
