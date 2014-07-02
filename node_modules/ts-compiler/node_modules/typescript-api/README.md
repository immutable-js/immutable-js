TypeScript API
==============

> TypeScript API exposed (includes definition file).

This version is compatable with TypeScript 1.0.

[![Dependency Status][]](https://gemnasium.com/jedmao/typescript-api)
[![NPM version][]](http://badge.fury.io/js/typescript-api)
[![Views][]](https://sourcegraph.com/github.com/jedmao/typescript-api)

[![NPM][]](https://nodei.co/npm/typescript-api/)


## TypeScript Usage

First, install dt-node as a bower dependency:

```bash
$ bower install --save-dev dt-node https://github.com/jedmao/dt-node.git
```

Then, you can reference the typescript-api.d.ts. You have to do it this way
because the typescript-api has to use the same node.d.ts that your application is
using. Otherwise, it will throw compiler errors.

```ts
/// <reference path="node_modules/typescript-api/typescript-api.d.ts" />
import ts = require('typescript-api');
var compiler = new ts.TypeScriptCompiler(new ts.NullLogger());
```


## JavaScript Usage

```js
var ts = require('typescript-api');
var compiler = new ts.TypeScriptCompiler(new ts.NullLogger());
```


## License

Released under the MIT license.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jedmao/typescript-api/trend.png)](https://bitdeli.com/free "Bitdeli Badge")


[Dependency Status]: https://gemnasium.com/jedmao/typescript-api.png
[NPM version]: https://badge.fury.io/js/typescript-api.png
[Views]: https://sourcegraph.com/api/repos/github.com/jedmao/typescript-api/counters/views-24h.png
[NPM]: https://nodei.co/npm/typescript-api.png?downloads=true
