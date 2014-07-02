exports.test_long_running_2 = function(test, assert) {
  setTimeout(function() {
    assert.equal(2,2);
    test.finish();
  }, 5000);
}
