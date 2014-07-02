var assert = require("assert");
var path = require("path");
var spawn = require("child_process").spawn;
var Q = require("q");
var util = require("./util");
var hasOwn = Object.prototype.hasOwnProperty;

function run(cmd, args) {
    return spawn(cmd, args, {
        stdio: "pipe",
        env: process.env
    });
}

var _grepExtensionP;
function grepExtensionP() {
    if (!_grepExtensionP) {
        var grepExtensionDef = Q.defer();
        run("grep", [
            "--quiet",
            "--perl-regexp",
            "spawn",
            __filename
        ]).on("close", function(code) {
            if (code === 0 || code === 1) {
                grepExtensionDef.resolve("--perl-regexp");
            } else {
                grepExtensionDef.resolve("--extended-regexp");
            }
        });
        _grepExtensionP = grepExtensionDef.promise;
    }
    return _grepExtensionP;
}

function grepP(pattern, sourceDir, grepExtension) {
    var grep = run("grep", [
        "--recursive",
        "--only-matching",
        "--text", // treat binary files (e.g., vim swp) as text
        "--null", // separate file from match with \0 instead of :
        grepExtension,
        pattern,
        sourceDir
    ]);

    var outs = [];
    var errs = [];
    var closed = false;

    grep.stdout.on("data", function(data) {
        assert.ok(!closed);
        outs.push(data);
    });

    grep.stderr.on("data", function(data) {
        assert.ok(!closed);
        errs.push(data);
    });

    var deferred = Q.defer();
    var promise = deferred.promise;

    grep.on("close", function(code) {
        assert.ok(!closed);
        closed = true;

        switch (code) {
        default:
            if (errs.length > 0) {
                util.log.err(errs.join(""));
            }

            // intentionally fall through

        case 0: case 1: // 1 means no results
            deferred.resolve(outs.join(""));
        }
    });

    return promise.then(function(out) {
        var pathToMatch = {};

        out.split("\n").forEach(function(line) {
            if ((line = line.trim())) {
                var splat = line.split("\0"); // see --null above
                var relPath = path.relative(sourceDir, splat.shift());

                // Only record the first match in any particular file.
                if (hasOwn.call(pathToMatch, relPath))
                    return;

                pathToMatch[relPath] = splat.join("\0");
            }
        });

        return pathToMatch;
    });
};

module.exports = function(pattern, sourceDir) {
    return grepExtensionP().then(function(extension) {
        return grepP(pattern, sourceDir, extension);
    });
};
