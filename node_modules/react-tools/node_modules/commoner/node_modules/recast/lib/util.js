var assert = require("assert");
var getFieldValue = require("./types").getFieldValue;
var sourceMap = require("source-map");
var SourceMapConsumer = sourceMap.SourceMapConsumer;
var SourceMapGenerator = sourceMap.SourceMapGenerator;
var hasOwn = Object.prototype.hasOwnProperty;

function getUnionOfKeys(obj) {
    for (var i = 0, key,
             result = {},
             objs = arguments,
             argc = objs.length;
         i < argc;
         i += 1)
    {
        obj = objs[i];
        for (key in obj)
            if (hasOwn.call(obj, key))
                result[key] = true;
    }
    return result;
}
exports.getUnionOfKeys = getUnionOfKeys;

exports.assertEquivalent = function(a, b) {
    if (!deepEquivalent(a, b)) {
        throw new Error(
            JSON.stringify(a) + " not equivalent to " +
            JSON.stringify(b)
        );
    }
};

function deepEquivalent(a, b) {
    if (a === b)
        return true;

    if (a instanceof Array)
        return deepArrEquiv(a, b);

    if (typeof a === "object")
        return deepObjEquiv(a, b);

    return false;
}
exports.deepEquivalent = deepEquivalent;

function deepArrEquiv(a, b) {
    assert.ok(a instanceof Array);
    var len = a.length;

    if (!(b instanceof Array &&
          b.length === len))
        return false;

    for (var i = 0; i < len; ++i) {
        if (i in a !== i in b)
            return false;

        if (!deepEquivalent(a[i], b[i]))
            return false;
    }

    return true;
}

function deepObjEquiv(a, b) {
    assert.strictEqual(typeof a, "object");
    if (!a || !b || typeof b !== "object")
        return false;

    for (var key in getUnionOfKeys(a, b)) {
        if (key === "loc" ||
            key === "range" ||
            key === "comments" ||
            key === "raw")
            continue;

        if (!deepEquivalent(getFieldValue(a, key),
                            getFieldValue(b, key)))
        {
            return false;
        }
    }

    return true;
}

function comparePos(pos1, pos2) {
    return (pos1.line - pos2.line) || (pos1.column - pos2.column);
}
exports.comparePos = comparePos;

exports.composeSourceMaps = function(formerMap, latterMap) {
    if (formerMap) {
        if (!latterMap) {
            return formerMap;
        }
    } else {
        return latterMap || null;
    }

    var smcFormer = new SourceMapConsumer(formerMap);
    var smcLatter = new SourceMapConsumer(latterMap);
    var smg = new SourceMapGenerator({
        file: latterMap.file,
        sourceRoot: latterMap.sourceRoot
    });

    var sourcesToContents = {};

    smcLatter.eachMapping(function(mapping) {
        var origPos = smcFormer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
        });

        var sourceName = origPos.source;

        smg.addMapping({
            source: sourceName,
            original: {
                line: origPos.line,
                column: origPos.column
            },
            generated: {
                line: mapping.generatedLine,
                column: mapping.generatedColumn
            },
            name: mapping.name
        });

        var sourceContent = smcFormer.sourceContentFor(sourceName);
        if (sourceContent && !hasOwn.call(sourcesToContents, sourceName)) {
            sourcesToContents[sourceName] = sourceContent;
            smg.setSourceContent(sourceName, sourceContent);
        }
    });

    return smg.toJSON();
};
