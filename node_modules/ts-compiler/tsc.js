var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ts = require('typescript-api');

var events = require('events');

function compile(files, options, callback) {
    return new BatchCompiler().compile(files, options, callback);
}
exports.compile = compile;

var BatchCompiler = (function (_super) {
    __extends(BatchCompiler, _super);
    function BatchCompiler() {
        _super.call(this);
        this._skipWrite = false;
        this.redirectErrors();
        this._compiler = new ts.BatchCompiler(ts.IO);
        process.mainModule.filename = require.resolve('typescript');
    }
    BatchCompiler.prototype.redirectErrors = function () {
        var _this = this;
        ts.IO.stderr.Write = function (s) {
            _this.emit('error', s);
        };
        ts.IO.stderr.WriteLine = function (s) {
            ts.IO.stderr.Write(s + '\n');
        };
        ts.IO.stdout.Write = function (s) {
            _this.emit('info', s);
        };
        ts.IO.stdout.WriteLine = function (s) {
            ts.IO.stdout.Write(s + '\n');
        };
        ts.BatchCompiler.prototype.addDiagnostic = function (diagnostic) {
            var diagnosticInfo = diagnostic.info();
            if (diagnosticInfo.category === 1) {
                this.hasErrors = true;
            }
            var errorLocation = '';
            if (diagnostic.fileName()) {
                errorLocation = diagnostic.fileName() + "(" + (diagnostic.line() + 1) + "," + (diagnostic.character() + 1) + "): ";
            }
            this.ioHost.stderr.WriteLine(errorLocation + diagnostic.message());
        };
    };

    BatchCompiler.prototype.compile = function (files, options, callback) {
        var _this = this;
        handleOverloads.call(this);
        handleSkipWrite.call(this);
        this.on('error', callback);
        setupArguments(function (args) {
            ts.IO.arguments = args;
            _this._batchCompile(callback);
        });
        return this;

        function handleOverloads() {
            if (typeof options === 'function') {
                callback = options;
                options = {};
            } else if (typeof callback !== 'function') {
                callback = function () {
                };
            }
        }

        function handleSkipWrite() {
            options = options || {};
            this._skipWrite = options.skipWrite;
            delete options.skipWrite;
        }

        function setupArguments(cb) {
            var args = argify(options);
            args.push.apply(args, files);
            cb(args);
        }
    };

    BatchCompiler.prototype._batchCompile = function (callback) {
        var compiler = this._compiler;

        ts.CompilerDiagnostics.diagnosticWriter = { Alert: function (s) {
                compiler.ioHost.printLine(s);
            } };

        if (compiler.parseOptions()) {
            compiler.logger = compiler.compilationSettings.gatherDiagnostics() ? new DiagnosticsLogger(this.ioHost) : new ts.NullLogger();

            if (compiler.compilationSettings.watch()) {
                compiler.watchFiles();
                callback(null);
                return;
            }

            compiler.resolve();
            this._compile(callback);
        } else {
            callback(new Error('Error parsing compiler options'));
        }

        if (compiler.hasErrors) {
            callback(new Error('Unspecified error'));
        }
    };

    BatchCompiler.prototype._compile = function (callback) {
        var compiler = this._compiler;
        var tsCompiler = new ts.TypeScriptCompiler(compiler.logger, compiler.compilationSettings);

        compiler.resolvedFiles.forEach(function (resolvedFile) {
            var sourceFile = compiler.getSourceFile(resolvedFile.path);
            tsCompiler.addFile(resolvedFile.path, sourceFile.scriptSnapshot, sourceFile.byteOrderMark, 0, false, resolvedFile.referencedFiles);
        });

        var results = [];
        for (var it = tsCompiler.compile(function (path) {
            return compiler.resolvePath(path);
        }); it.moveNext();) {
            var result = it.current();

            result.diagnostics.forEach(function (d) {
                return compiler.addDiagnostic(d);
            });
            if (!this._skipWrite && !compiler.tryWriteOutputFiles(result.outputFiles)) {
                callback(new Error('Error writing to output file'));
            }
            Array.prototype.push.apply(results, result.outputFiles);
        }
        callback(null, results);
    };
    return BatchCompiler;
})(events.EventEmitter);
exports.BatchCompiler = BatchCompiler;

var DiagnosticsLogger = (function () {
    function DiagnosticsLogger(ioHost) {
        this.ioHost = ioHost;
    }
    DiagnosticsLogger.prototype.information = function () {
        return false;
    };
    DiagnosticsLogger.prototype.debug = function () {
        return false;
    };
    DiagnosticsLogger.prototype.warning = function () {
        return false;
    };
    DiagnosticsLogger.prototype.error = function () {
        return false;
    };
    DiagnosticsLogger.prototype.fatal = function () {
        return false;
    };
    DiagnosticsLogger.prototype.log = function (s) {
        this.ioHost.stdout.WriteLine(s);
    };
    return DiagnosticsLogger;
})();

function argify(options) {
    var args = [];
    Object.keys(options).forEach(function (key) {
        var value = options[key];
        if (!value) {
            return;
        }
        if (key === 'optionsFile') {
            args.push('@' + value);
            return;
        }
        var flag = '-';
        if (key.length !== 1) {
            flag += '-';
        }
        args.push(flag + key);
        if (typeof value !== 'boolean') {
            args.push(value);
        }
    });
    return args;
}

var OutputFile = (function (_super) {
    __extends(OutputFile, _super);
    function OutputFile() {
        _super.apply(this, arguments);
    }
    return OutputFile;
})(ts.OutputFile);
exports.OutputFile = OutputFile;
