/// <reference path="../GraphQLJS/parser/node.d.ts" />

import PV = require('./PVector');
import PVector = PV.PVector;

var v0 = new PVector(0,1,2,3);
var v1 = v0.push(4,5,6);
var v2 = v1.pop();
var v3 = v2.set(128, 128);
var v4 = v3.set(12345, 12345);
var v5 = v4.push(12346, 12347, 12348, 12349, 12350, 12351, 12352);
var v6 = v5.set(1234, 1234);
var v7 = v6.remove(12346);

console.log('v0',v0);
console.log('v1',v1);
console.log('v2',v2);
console.log('v3',v3);
console.log('v4',v4);
console.log('v5',v5);
console.log('v6',v6);
console.log('v6',v7);
v7.forEach(console.log);

console.log(v6.get(1234), v6.get(1235));

//console.log(require('util').inspect(v6, {depth:null,colors:true}));
