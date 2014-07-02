/// <reference path="node_modules/typescript-api/typescript-api.d.ts" />
import ts = require('typescript-api');
import path = require('path');
import events = require('events');


export function compile(files: string[], options?: any, callback?: Function) {
	return new BatchCompiler().compile(files, options, callback);
}

export interface ICompilerOptions {
	/**
	 * Generates corresponding .d.ts file.
	 */
	declaration?: boolean;
	/**
	 * Print this message.
	 */
	help?: boolean;
	/**
	 * Specifies the location where debugger should locate map files
	 * instead of generated locations.
	 */
	mapRoot?: string;
	/**
	 * Specify module code generation: 'commonjs' or 'amd'
	 */
	module?: string;
	/**
	 * Warn on expressions and declarations with any implied 'any' type.
	 */
	noImplicitAny?: boolean;
	/**
	 * Skip resolution and preprocessing.
	 */
	noResolve?: boolean;
	/**
	 * Concatenate and emit output to a single file.
	 */
	out?: string;
	/**
	 * Redirect output structure to the directory.
	 */
	outDir?: string;
	/**
	 * Do not emit comments to output.
	 */
	removeComments?: boolean;
	/**
	 * Generates corresponding .map file.
	 */
	sourcemap?: boolean;
	/**
	 * Specifies the location where debugger should locate TypeScript
	 * files instead of source locations.
	 */
	sourceRoot?: string;
	/**
	 * Specify ECMAScript target version: 'ES3' (default), or 'ES5'
	 */
	target?: string;
	/**
	 * Print the compiler's version: 0.9.5.0
	 */
	version?: string;
	/**
	 * Watch input files.
	 */
	watch?: boolean;
	/**
	 * Insert command line options and files from a file.
	 */
	optionsFile?: string;
	/**
	 * Skip writing the output files.
	 */
	skipWrite?: boolean;
}

export class BatchCompiler extends events.EventEmitter {

	private _skipWrite = false;
	private _compiler: ts.BatchCompiler;

	constructor() {
		super();
		this.redirectErrors();
		this._compiler = new ts.BatchCompiler(ts.IO);
		(<any>process).mainModule.filename = require.resolve('typescript');
	}

	private redirectErrors() {
		ts.IO.stderr.Write = (s: string) => {
			this.emit('error', s);
		};
		ts.IO.stderr.WriteLine = (s: string) => {
			ts.IO.stderr.Write(s + '\n');
		};
		ts.IO.stdout.Write = (s: string) => {
			this.emit('info', s);
		};
		ts.IO.stdout.WriteLine = (s: string) => {
			ts.IO.stdout.Write(s + '\n');
		};
		(<any>ts.BatchCompiler).prototype.addDiagnostic = function(diagnostic: ts.Diagnostic) {
			var diagnosticInfo = diagnostic.info();
			if (diagnosticInfo.category === 1 /* Error */) {
				this.hasErrors = true;
			}
			var errorLocation = '';
			if (diagnostic.fileName()) {
				errorLocation = diagnostic.fileName() + "(" + (diagnostic.line() + 1) + "," + (diagnostic.character() + 1) + "): ";
			}
			this.ioHost.stderr.WriteLine(errorLocation + diagnostic.message());
		};
	}

	compile(files: string[], options?: any, callback?: Function): BatchCompiler {
		handleOverloads.call(this);
		handleSkipWrite.call(this);
		this.on('error', callback);
		setupArguments(args => {
			ts.IO.arguments = args;
			this._batchCompile(callback);
		});
		return this;

		function handleOverloads() {
			if (typeof options === 'function') {
				callback = options;
				options = {};
			} else if (typeof callback !== 'function') {
				callback = () => {};
			}
		}

		function handleSkipWrite() {
			options = options || {};
			this._skipWrite = options.skipWrite;
			delete options.skipWrite;
		}

		function setupArguments(cb: Function) {
			var args = argify(options);
			args.push.apply(args, files);
			cb(args);
		}
	}

	private _batchCompile(callback: Function) {
		var compiler = <any>this._compiler;

		ts.CompilerDiagnostics.diagnosticWriter = { Alert: (s: string) => { compiler.ioHost.printLine(s); } };

		if (compiler.parseOptions()) {
			compiler.logger = compiler.compilationSettings.gatherDiagnostics() ? new DiagnosticsLogger((<any>this).ioHost) : new ts.NullLogger();

			if (compiler.compilationSettings.watch()) {
				// Watch will cause the program to stick around as long as the files exist
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
	}

	private _compile(callback: Function) {
		var compiler = <any>this._compiler;
		var tsCompiler = new ts.TypeScriptCompiler(compiler.logger, compiler.compilationSettings);

		compiler.resolvedFiles.forEach(resolvedFile => {
			var sourceFile = compiler.getSourceFile(resolvedFile.path);
			tsCompiler.addFile(resolvedFile.path, sourceFile.scriptSnapshot, sourceFile.byteOrderMark, /*version:*/ 0, /*isOpen:*/ false, resolvedFile.referencedFiles);
		});
		
		var results: ts.OutputFile[] = [];
		for (var it = tsCompiler.compile((path: string) => compiler.resolvePath(path)); it.moveNext();) {
			var result = it.current();

			result.diagnostics.forEach(d => compiler.addDiagnostic(d));
			if (!this._skipWrite && !compiler.tryWriteOutputFiles(result.outputFiles)) {
				callback(new Error('Error writing to output file'));
			}
			Array.prototype.push.apply(results, result.outputFiles);
		}
		callback(null, results);
	}
}

class DiagnosticsLogger implements ts.ILogger {
	constructor(public ioHost: ts.IIO) {
	}
	public information(): boolean { return false; }
	public debug(): boolean { return false; }
	public warning(): boolean { return false; }
	public error(): boolean { return false; }
	public fatal(): boolean { return false; }
	public log(s: string): void {
		this.ioHost.stdout.WriteLine(s);
	}
}

function argify(options: ICompilerOptions): string[] {
	var args = [];
	Object.keys(options).forEach(key => {
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

export class OutputFile extends ts.OutputFile {
	
}
