var Watcher = require("../lib/watcher").Watcher;
var BuildContext = require("../lib/context").BuildContext;
var ModuleReader = require("../lib/reader").ModuleReader;
var ReadFileCache = require("../lib/cache").ReadFileCache;
var grepP = require("../lib/grep");
var util = require("../lib/util");
var fs = require("fs");
var Q = require("q");

var path = require("path");
var sourceDir = path.resolve(__dirname, "source");
var outputDir = path.resolve(__dirname, "output");

try {
    fs.mkdirSync(outputDir);
} catch (exists) {
    // pass
}

var watcher = new Watcher(new ReadFileCache(sourceDir), false);

var debugContext = new BuildContext({
    config: { debug: true },
    sourceDir: sourceDir
}, new ReadFileCache(sourceDir));

var releaseContext = new BuildContext({
    config: { debug: false },
    sourceDir: sourceDir
}, new ReadFileCache(sourceDir));

debugContext.setCacheDirectory(path.join(
    outputDir, ".debug-module-cache"));

releaseContext.setCacheDirectory(path.join(
    outputDir, ".release-module-cache"));

debugContext.setRelativize(true);
releaseContext.setRelativize(true);

function getProvidedP(id) {
    var context = this;
    return context.getProvidedP().then(function(idToPath) {
        if (idToPath.hasOwnProperty(id))
            return context.readFileP(idToPath[id]);
    });
}

function getSourceP(id) {
    return this.readModuleP(id);
}

function waitForHelpers(t, helperP) {
    Q.all([
        helperP(debugContext),
        helperP(releaseContext)
    ]).done(t.finish.bind(t));
}

function checkHome(assert, home) {
    return Q(home).then(function(home) {
        assert.strictEqual(home.id, "home");
        assert.strictEqual(typeof home.source, "string");
        assert.notEqual(home.source.indexOf("exports"), -1);
        assert.strictEqual(home.source.indexOf('require("./assert");'), 0);
        return home;
    }).invoke("getRequiredP").then(function(reqs) {
        assert.strictEqual(reqs.length, 1);
        assert.strictEqual(reqs[0].id, "assert");
    });
}

exports.testModuleReader = function(t, assert) {
    var reader = new ModuleReader(debugContext, [getSourceP], []);
    var homeP = reader.readModuleP("home");
    checkHome(assert, homeP).done(t.finish.bind(t));
};

exports.testMissingModuleWarning = function(t, assert) {
    function helperP(context) {
        var reader = new ModuleReader(context, [getSourceP], []);
        var id = "this/module/should/not/exist";
        return reader.readModuleP(id).then(function(module) {
            assert.strictEqual(module.id, id);
            assert.notEqual(module.source.indexOf("throw new Error"), -1);
        });
    }

    waitForHelpers(t, helperP);
};

exports.testSkipFailingResolvers = function(t, assert) {
    var reader = new ModuleReader(debugContext, [function(id) {
        return this.makePromise(function(callback) {
            process.nextTick(function() {
                callback(new Error("bad thing happen"));
            });
        });
    }, function(id) {
        throw new Error("superbad situation");
    }, getSourceP], []);

    var homeP = reader.readModuleP("home");
    checkHome(assert, homeP).done(t.finish.bind(t));
};

exports.testReaderCaching = function(t, assert) {
    var reader = new ModuleReader(debugContext, [getSourceP], []);

    var homes = [
        reader.readModuleP("home"),
        reader.readModuleP("home"),
        reader.readModuleP.originalFn.call(reader, "home")
    ];

    assert.strictEqual(homes[0], homes[1]);
    assert.notStrictEqual(homes[0], homes[2]);
    assert.notStrictEqual(homes[1], homes[2]);

    Q.spread(homes, function(h0, h1, h2) {
        assert.strictEqual(h0, h1);
        assert.strictEqual(h0, h2);
        assert.strictEqual(h1, h2);

        assert.strictEqual(h0.hash, h1.hash);
        assert.strictEqual(h1.hash, h2.hash);
    }).done(t.finish.bind(t));
};

exports.testMultipleFileOutput = function(t, assert) {
    var mfSource = [
        "function multiFile(foo) {",
        "  console.log(foo);",
        "}"
    ].join("\n");

    var pkg = require("../package.json");

    function getSourceP(id) {
        assert.strictEqual(id, "multi-file");
        return Q(mfSource);
    }

    function processP1(id, source) {
        assert.strictEqual(source, mfSource);
        return {
            ".js": source,
            ".json": util.readJsonFileP(
                path.join(__dirname, "..", "package.json")
            )
        };
    }

    function processP2(id, input) {
        assert.strictEqual(input[".js"], mfSource);

        var json = input[".json"];
        assert.deepEqual(json, pkg);

        input[".json"] = util.makePromise(function(callback) {
            process.nextTick(function() {
                callback(null, JSON.stringify(json));
            });
        });

        return input;
    }

    function processP3(id, input) {
        assert.strictEqual(input[".js"], mfSource);
        assert.strictEqual(typeof input[".json"], "string");
        assert.deepEqual(JSON.parse(input[".json"]), pkg);

        return input;
    }

    var reader = new ModuleReader(
        debugContext,
        [getSourceP],
        [processP1, processP2, processP3]
    );

    reader.readModuleP("multi-file").then(function(mf) {
        assert.strictEqual(mf.id, "multi-file");
        assert.strictEqual(mf.source, mfSource);
        assert.deepEqual(JSON.parse(mf.output[".json"]), pkg);
    }).done(t.finish.bind(t));
};

exports.testGrepP = function(t, assert) {
    Q.spread([
        grepP("@providesModule\\s+\\S+", sourceDir),
        debugContext.getProvidedP()
    ], function(pathToMatch, valueToPath) {
        assert.deepEqual(pathToMatch, {
            "widget/share.js": "@providesModule WidgetShare",
            "widget/.bogus.js": "@providesModule WidgetShare",
            "widget/bogus.js~": "@providesModule WidgetShare"
        });
        assert.deepEqual(valueToPath, {
            "WidgetShare": "widget/share.js"
        });
    }).done(t.finish.bind(t));
};

exports.testProvidesModule = function(t, assert) {
    var code = arguments.callee.toString();

    /**
     * Look, Ma! A test function that uses itself as input!
     * @providesModule
     * @providesModule foo/bar
     */

    assert.strictEqual(
        code.split("@provides" + "Module").length,
        4);

    assert.strictEqual(
        debugContext.getProvidedId(code),
        "foo/bar");

    assert.strictEqual(
        debugContext.getProvidedId(
            "no at-providesModule, here"),
        null);

    /**
     * Just to make sure we only pay attention to the first one.
     * @providesModule ignored
     */

    function helper(context) {
        var reader = new ModuleReader(context, [
            getProvidedP,
            getSourceP
        ], []);

        return Q.all([
            Q.spread([
                reader.readModuleP("widget/share"),
                reader.readModuleP("WidgetShare")
            ], function(ws1, ws2) {
                assert.strictEqual(ws1.id, ws2.id);
                assert.strictEqual(ws1.id, "WidgetShare");
                assert.strictEqual(ws1, ws2);
            }),

            reader.readMultiP([
                "widget/share",
                "WidgetShare"
            ]).then(function(modules) {
                assert.strictEqual(modules.length, 1);
                assert.strictEqual(modules[0].id, "WidgetShare");
            }),

            reader.readModuleP(
                "widget/gallery"
            ).then(function(gallery) {
                return gallery.getRequiredP();
            }).then(function(deps) {
                assert.strictEqual(deps.length, 1);
                assert.strictEqual(deps[0].id, "WidgetShare");
            }),

            Q.spread([
                reader.getSourceP("widget/share"),
                reader.getSourceP("WidgetShare")
            ], function(source1, source2) {
                assert.strictEqual(source1, source2);
            })
        ]);
    }

    waitForHelpers(t, helper);
};

exports.testMakePromise = function(t, assert) {
    var error = new Error("test");

    function helperP(context) {
        return context.makePromise(function(callback) {
            process.nextTick(function() {
                callback(error, "asdf");
            });
        }).then(function() {
            assert.ok(false, "should have thrown an error");
        }, function(err) {
            assert.strictEqual(err, error);

            return context.makePromise(function(callback) {
                process.nextTick(function() {
                    callback(null, "success");
                });
            }).then(function(result) {
                assert.strictEqual(result, "success");
            });
        })
    }

    waitForHelpers(t, helperP);
};

exports.testRelativize = function(t, assert) {
    var moduleId = "some/deeply/nested/module";
    var processor = require("../lib/relative").getProcessor(null);

    function makeSource(id) {
        var str = JSON.stringify(id);
        return "require(" + str + ");\n" +
            "require(function(){require(" + str + ")}())";
    }

    function helperP(requiredId, expected) {
        assert.strictEqual(
            util.relativize(moduleId, requiredId),
            expected);

        return processor(
            moduleId,
            makeSource(requiredId)
        ).then(function(output) {
            assert.deepEqual(output, {
                ".js": makeSource(expected)
            });
        });
    }

    Q.all([
        helperP("another/nested/module",
                "../../../another/nested/module"),
        helperP("../../buried/module/./file",
                "../../buried/module/file"),
        helperP("../../buried/module/../file",
                "../../buried/file"),
        helperP("./same/level",
                "./same/level"),
        helperP("./same/./level",
                "./same/level"),
        helperP("./same/../level",
                "./level"),
        helperP("some/deeply/buried/treasure",
                "../buried/treasure"),
        helperP("./file", "./file"),
        helperP("./file/../../../module",
                "../../module"),
        helperP("./file/../../module",
                "../module")
    ]).done(t.finish.bind(t));
};

exports.testGetCanonicalId = function(t, assert) {
    function helperP(context) {
        var reader = new ModuleReader(context, [
            getProvidedP,
            getSourceP
        ], []);

        return Q.spread([
            reader.getCanonicalIdP("widget/share"),
            reader.getCanonicalIdP("WidgetShare"),
            reader.readModuleP("widget/share").get("id"),
            reader.readModuleP("WidgetShare").get("id")
        ], function(ws1, ws2, ws3, ws4) {
            assert.strictEqual(ws1, "WidgetShare");
            assert.strictEqual(ws2, "WidgetShare");
            assert.strictEqual(ws3, "WidgetShare");
            assert.strictEqual(ws4, "WidgetShare");
        });
    }

    waitForHelpers(t, helperP);
};

exports.testCanonicalRequires = function(t, assert) {
    function helperP(context) {
        assert.strictEqual(context.ignoreDependencies, false);

        var reader = new ModuleReader(context, [
            getProvidedP,
            getSourceP
        ], []);

        return reader.readModuleP("widget/follow").then(function(follow) {
            assert.strictEqual(follow.source.indexOf("widget/share"), -1);

            assert.strictEqual(strCount(
                'require("../WidgetShare")',
                follow.source
            ), 4);

            assert.strictEqual(strCount(
                'require("./gallery")',
                follow.source
            ), 2);

            assert.strictEqual(strCount(
                'require("../assert")',
                follow.source
            ), 2);
        });
    }

    waitForHelpers(t, helperP);
};

function strCount(substring, string) {
    return string.split(substring).length - 1;
}

exports.testFlatten = function(t, assert) {
    function check(input, expected) {
        var flat = util.flatten(input);
        assert.deepEqual(flat, expected);
    }

    check(1, 1);
    check([[],,[],1, 2], [1, 2]);
    check([[[[[[]]]]]], []);
    check([[1,[[[[2]]],3]]], [1, 2, 3]);
    check([[1],[[2]],[[[3]]]], [1, 2, 3]);
    check([,,,], []);

    t.finish();
};

exports.testWriteFd = function(t, assert) {
    var file = path.join(outputDir, "writeFdP.test.txt");

    function check(content) {
        function afterUnlink(err) {
            return util.openExclusiveP(file).then(function(fd) {
                return util.writeFdP(fd, content).then(function(written) {
                    assert.strictEqual(content, written);
                });
            });
        }

        return function() {
            return util.unlinkP(file).then(afterUnlink, afterUnlink);
        };
    }

    Q("ignored")
        .then(check("x"))
        .then(check("x\ny"))
        .then(check("x\r\ny"))
        .then(check("\t\nx\t"))
        .then(check("\ufeff")) // zero-width non-breaking space
        .then(check("\u2603")) // snowman
        .then(check("\ud83d\udc19")) // octopus
        .finally(function() {
            return util.unlinkP(file);
        })
        .done(t.finish.bind(t));
};

exports.testWatcherBasic = function(t, assert) {
    var watcher = new Watcher(new ReadFileCache(sourceDir), false);
    var dummy = "dummy.js";
    var dummyFile = path.join(sourceDir, dummy);

    function waitForChangeP() {
        return util.makePromise(function(callback) {
            watcher.on("changed", function(path) {
                callback(null, path);
            });
        });
    }

    util.unlinkP(dummyFile).then(function() {
        return util.openExclusiveP(dummyFile).then(function(fd) {
            return util.writeFdP(fd, "dummy");
        });
    }).then(function() {
        return Q.all([
            watcher.readFileP("home.js"),
            watcher.readFileP(dummy)
        ]);
    }).then(function() {
        return Q.all([
            util.unlinkP(dummyFile),
            waitForChangeP()
        ]);
    }).done(function() {
        watcher.close();
        t.finish();
    });
};

exports.testWatchDirectory = function(t, assert) {
    var watcher = new Watcher(new ReadFileCache(sourceDir), false);
    var watchMe = "watchMe.js";
    var fullPath = path.join(sourceDir, watchMe);

    function waitForChangeP() {
        return util.makePromise(function(callback) {
            watcher.once("changed", function(path) {
                callback(null, path);
            });
        });
    }

    function write(content) {
        return util.openFileP(fullPath).then(function(fd) {
            var promise = waitForChangeP();
            util.writeFdP(fd, content);
            return promise;
        });
    }

    util.unlinkP(fullPath).then(function() {
        return watcher.readFileP(watchMe).then(function(source) {
            assert.ok(false, "readFileP should have failed");
        }, function(err) {
            assert.strictEqual(err.code, "ENOENT");
        });
    }).then(function() {
        return write("first");
    }).then(function() {
        return write("second");
    }).then(function() {
        var promise = waitForChangeP();
        util.unlinkP(fullPath);
        return promise;
    }).then(function() {
        return write("third");
    }).finally(function() {
        return util.unlinkP(fullPath);
    }).done(function() {
        watcher.close();
        t.finish();
    });
};
