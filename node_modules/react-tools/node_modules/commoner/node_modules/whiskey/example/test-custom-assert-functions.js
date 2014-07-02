exports['test_assertThrow'] = function(test, assert) {
  assert.assertThrow();
};

exports['test_assertNoop'] = function(test, assert) {
  assert.assertNoop();
  test.finish();
};
