var assert = require("assert");
var fs = require("fs");
var path = require("path");
var util = require("../lib/util");
var main = require("../main");

function testFile(path) {
    fs.readFile(path, "utf-8", function(err, source) {
        assert.equal(err, null);
        assert.strictEqual(typeof source, "string");

        var ast = main.parse(source);
        assert.ok(util.deepEquivalent(ast.original, ast));
        var code = main.print(ast).code;
        assert.strictEqual(source, code);
    });
}

function addTest(name) {
    it(name, function() {
        testFile(path.join(__dirname, "..", name + ".js"));
    });
}

describe("identity", function() {
    // Add more tests here as need be.
    addTest("test/data/regexp-props");
    addTest("test/data/empty");
    addTest("test/data/backbone");
    addTest("test/lines");
    addTest("lib/lines");
    addTest("lib/printer");
});
