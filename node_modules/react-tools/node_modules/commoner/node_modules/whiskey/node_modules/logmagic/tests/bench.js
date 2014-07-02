var graylog = require('../lib/graylog');
var ops = 100000;

var start = (new Date().getTime());
for (var i = 0; i < ops; i++) {
  var str = graylog.logstr("testing.example.foo", 3, "hello world", {counter: i, account_id: 42, txnid: "fxxxxx"});
  var str = graylog.logstr("testing.example.bar", 9, "hello baksdfnsdf", {special: 'aaa', account_id: 42, txnid: "fxxxxx"});
}
var end = (new Date().getTime());

var ms = (end - start);

console.log(ops + " logstr operations in " + ms + "ms, " + (ops/ms) * 1000  + " (logstr/second)");