// True if Object.defineProperty works as expected. IE8 fails this test.
export var canDefineProperty = (function() {
  try {
    Object.defineProperty({}, '@', {});
    return true;
  } catch (e) {
    return false;
  }
}());
