var logmagic = require('../lib/logmagic');
var log = logmagic.local('mylib.foo.bar');
//console.log(log);
log.info("Hello!");
log.error("more stuff", {SOME_VAR: "myvalue"});
log.errorf("more stuff: ${SOME_VAR}", {SOME_VAR: "myvalue"});
log.trace("testing trace v0");

logmagic.route("__root__", logmagic.TRACE1, "console");
logmagic.route("__root__", logmagic.TRACE1, "graylog2-stderr");
log.trace("testing trace v1", {slug: 1});

log = logmagic.local('mylib.foo.cars');
log.trace("hello world", {counter: 33, account_id: 42, txnid: "fxxxxx"});
logmagic.addRewriter(function(modulename, level, msg, extra) {
  if (extra.request) {
    extra.accountId = extra.request.account.id;
    extra.txnId = extra.request.txtId;
    delete extra.request;
  }
  return extra;
});

log.trace("hello baksdfnsdf", {special: 'aaa', account_id: 42, txnid: "fxxxxx", full_message: "loooong message"});

log.dbg("hello xxxx", {request: {account: {id: 45}, txtId: "XXXXXXXXXXXXX"}});

//console.log(log);
