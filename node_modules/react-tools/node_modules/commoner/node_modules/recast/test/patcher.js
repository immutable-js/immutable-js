var assert = require("assert");
var patcherModule = require("../lib/patcher");
var getReprinter = patcherModule.getReprinter;
var Patcher = patcherModule.Patcher;
var fromString = require("../lib/lines").fromString;
var parse = require("../lib/parser").parse;
var NodePath = require("ast-types").NodePath;

var code = [
    "// file comment",
    "exports.foo({",
    "    // some comment",
    "    bar: 42,",
    "    baz: this",
    "});"
];

function loc(sl, sc, el, ec) {
    return {
        start: { line: sl, column: sc },
        end: { line: el, column: ec }
    };
}

describe("patcher", function() {
    it("Patcher", function() {
        var lines = fromString(code.join("\n")),
            patcher = new Patcher(lines),
            selfLoc = loc(5, 9, 5, 13);

        assert.strictEqual(patcher.get(selfLoc).toString(), "this");

        patcher.replace(selfLoc, "self");

        assert.strictEqual(patcher.get(selfLoc).toString(), "self");

        var got = patcher.get().toString();
        assert.strictEqual(got, code.join("\n").replace("this", "self"));

        // Make sure comments are preserved.
        assert.ok(got.indexOf("// some") >= 0);

        var oyezLoc = loc(2, 12, 6, 1),
            beforeOyez = patcher.get(oyezLoc).toString();
        assert.strictEqual(beforeOyez.indexOf("exports"), -1);
        assert.ok(beforeOyez.indexOf("comment") >= 0);

        patcher.replace(oyezLoc, "oyez");

        assert.strictEqual(patcher.get().toString(), [
            "// file comment",
            "exports.foo(oyez);"
        ].join("\n"));

        // "Reset" the patcher.
        patcher = new Patcher(lines);
        patcher.replace(oyezLoc, "oyez");
        patcher.replace(selfLoc, "self");

        assert.strictEqual(patcher.get().toString(), [
            "// file comment",
            "exports.foo(oyez);"
        ].join("\n"));
    });

    var trickyCode = [
        "    function",
        "      foo(bar,",
        "  baz) {",
        "        qux();",
        "    }"
    ].join("\n");

    it("GetIndent", function() {
        function check(indent) {
            var lines = fromString(trickyCode).indent(indent);
            var path = new NodePath(parse(lines.toString()))
                .get("program", "body", 0, "body");

            var reprinter = getReprinter(path);
            var reprintedLines = reprinter(function(path) {
                assert.ok(false, "should not have called print function");
            });

            assert.strictEqual(reprintedLines.length, 3);
            assert.strictEqual(reprintedLines.getIndentAt(1), 0);
            assert.strictEqual(reprintedLines.getIndentAt(2), 4);
            assert.strictEqual(reprintedLines.getIndentAt(3), 0);
            assert.strictEqual(reprintedLines.toString(), [
                "{",
                "    qux();",
                "}"
            ].join("\n"));
        }

        for (var indent = -4; indent <= 4; ++indent)
            check(indent);
    });
});
