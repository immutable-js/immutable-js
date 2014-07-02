function assert(test, msg) {
    if (!test) {
        throw new Error(msg);
    }
}

module.exports = assert.ok = assert;
