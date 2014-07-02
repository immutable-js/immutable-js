var assert = require("assert");
var fs = require("fs");
var path = require("path");
var file = path.join(__dirname, "install.js");

exports.makeGlobal = function() {
    require("./install");
};

function Reader(file) {
    var self = this;
    assert.ok(self instanceof Reader);

    var args;
    var qhead = {};
    var qtail = qhead;

    fs.readFile(file, "utf8", function(err, data) {
        args = [err, data];
        process.nextTick(flush);
    });

    function flush() {
        var next = qhead.next
        if (next && args) {
            qhead = next;
            process.nextTick(flush);
            next.cb.apply(null, args);
        }
    }

    self.addCallback = function(cb) {
        qtail = qtail.next = { cb: cb };
        if (qhead.next === qtail)
            process.nextTick(flush);
    };
}

var reader;

exports.getCode = function(callback) {
    reader = reader || new Reader(file);
    reader.addCallback(callback);
};

function rename(installName, code) {
    if (installName !== "install")
        code = code.replace(
            /\bglobal\.install\b/g,
            "global." + installName);
    return code;
}

exports.renameCode = function(installName, callback) {
    reader = reader || new Reader(file);
    reader.addCallback(function(err, data) {
        callback(err, rename(installName, data));
    });
};

function getCodeSync() {
    return fs.readFileSync(file, "utf8");
}
exports.getCodeSync = getCodeSync;

exports.renameCodeSync = function(installName) {
    return rename(installName, getCodeSync());
};

// Not perfect, but we need to match the behavior of install.js.
var requireExp = /\brequire\(['"]([^'"]+)['"]\)/g;

// This function should match the behavior of `ready` and `absolutize` in
// install.js, but the implementations are not worth unifying because we have
// access to the "path" module here.
exports.getRequiredIDs = function(id, source) {
    var match, seen = {}, ids = [];

    requireExp.lastIndex = 0;
    while ((match = requireExp.exec(source))) {
        var rid = match[1];
        if (rid.charAt(0) === ".")
            rid = path.normalize(path.join(id, "..", match[1]));

        if (!seen.hasOwnProperty(rid)) {
            seen[rid] = true;
            ids.push(rid);
        }
    }

    return ids;
};
