# ts-compiler

> TypeScript compilation via the [typescript-api][].

This version is compatable with TypeScript 1.0.

[![Build Status][]](http://travis-ci.org/jedmao/ts-compiler)
[![Dependency Status][]](https://gemnasium.com/jedmao/ts-compiler)
[![NPM version][]](http://badge.fury.io/js/ts-compiler)
[![Views][]](https://sourcegraph.com/github.com/jedmao/ts-compiler)

[![NPM][]](https://nodei.co/npm/ts-compiler/)


## TypeScript Usage

```ts
/// <reference path="node_modules/ts-compiler/ts-compiler.d.ts" />
import ts = require('ts-compiler');

ts.compile(
  ['foo.ts', 'bar.ts'],
  { skipWrite: true },
  (err: Error, results: ts.OutputFile[]) => {

    var foo = results[0];
    console.log(foo.text);

    var bar = results[1];
    console.log(bar.text);
  });
```


## JavaScript Usage

```js
var ts = require('ts-compiler');

ts.compile(
  ['foo.ts', 'bar.ts'],
  { skipWrite: true },
  function(err, results) {

    var foo = results[0];
    console.log(foo.text);

    var bar = results[1];
    console.log(bar.text);
});
```


## Module API


### ts.compile(files: string[], options?: ICompilerOptions, callback?: Function): BatchCompiler

- This is a shorthand way to call `new ts.BatchCompiler.compile(...)`
- Callback signature is err: Error, results: [ts.OutputFile](#tsoutputfile) Array.
- The options follow the [ICompilerOptions interface](#tsicompileroptions).
- Emits `error` and `info` events.


### ts.OutputFile

- name: string
- writeByteOrderMark: boolean
- text: string
- fileType: (0: JavaScript, 1: SourceMap, 2: Declaration)
- sourceMapEntries: SourceMapEntry[]


### ts.ICompilerOptions

Though all natively supported TypeScript compiler options will be passed through to the real compiler, it might not always make sense from an API standpoint. Use with common sense.


#### options.declaration
- Type: `Boolean`
- Default: `false`

Generates corresponding .d.ts file.

#### options.mapRoot
- Type: `String`

Specifies the location where debugger should locate map files instead of generated locations.

#### options.module
- Type: `String`

Specify module code generation: `commonjs` or `amd`

#### options.noImplicitAny
- Type: `Boolean`
- Default: `false`

Warn on expressions and declarations with an implied `any` type.

#### options.noResolve
- Type: `Boolean`
- Default: `false`

Skip resolution and preprocessing.

#### options.out
- Type: `String`

Concatenate and emit output to single file.

#### options.outDir
- Type: `String`

Redirect output structure to the directory.

#### options.removeComments
- Type: `Boolean`
- Default: `false`

Do not emit comments to output.

#### options.sourcemap
- Type: `Boolean`
- Default: `false`

Generates corresponding .map file.

#### options.sourceRoot
- Type: `String`

Specifies the location where debugger should locate TypeScript files instead of source locations.

#### options.target
- Type: `String`
- Default: `ES3`

Specify ECMAScript target version: 'ES3' or 'ES5'

#### options.optionsFile
- Type: `String`

Insert command line options and files from a file. This is natively supported by the tsc command, but as a different @file key.

#### skipWrite
- Type: `Boolean`
- Default: `false`

Skips writing the output files. This flag is unique to ts-compiler.


## License

Released under the MIT license.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jedmao/ts-compiler/trend.png)](https://bitdeli.com/free "Bitdeli Badge")


[typescript-api]: https://github.com/jedmao/typescript-api
[Build Status]: https://secure.travis-ci.org/jedmao/ts-compiler.png?branch=master
[Dependency Status]: https://gemnasium.com/jedmao/ts-compiler.png
[NPM version]: https://badge.fury.io/js/ts-compiler.png
[Views]: https://sourcegraph.com/api/repos/github.com/jedmao/ts-compiler/counters/views-24h.png
[NPM]: https://nodei.co/npm/ts-compiler.png?downloads=true
