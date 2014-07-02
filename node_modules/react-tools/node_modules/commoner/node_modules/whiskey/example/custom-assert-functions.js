function assertThrow() {
  throw new Error('Assert thrown');
}

function assertNoop() {
}

exports.assertThrow = assertThrow;
exports.assertNoop = assertNoop;
