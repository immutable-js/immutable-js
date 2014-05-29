function install(globalObject) {
  if (!globalObject.jasmine) {
    throw new Error(
      'It looks like you\'re trying to install jasmine-pit before installing ' +
      'jasmine! Make sure there is a `jasmine` property on the global object ' +
      '(window/global/etc) before calling install().'
    );
  }

  var jasmine = globalObject.jasmine;

  globalObject.pit = function pit(specName, promiseBuilder) {
    var jasmineEnv = jasmine.getEnv();
    return jasmineEnv.it(specName, function() {
      var isFinished = false;
      var error = null;

      jasmineEnv.currentSpec.runs(function() {
        try {
          var promise = promiseBuilder();
          if (promise && promise.then) {
            promise.then(undefined, function(err) {
              error = err; isFinished = true;
            }).done(function() {
              isFinished = true;
            });
          } else {
            isFinished = true;
          }
        } catch (e) {
          error = e;
          isFinished = true;
        }
      });

      jasmineEnv.currentSpec.waitsFor(function() { return isFinished; });
      jasmineEnv.currentSpec.runs(function() { if (error) throw error; });
    });
  };

  globalObject.xpit = function xpit(specName, promiseBuilder) {
    return jasmine.getEnv().xit(specName, promiseBuilder);
  };
}

exports.install = install;
