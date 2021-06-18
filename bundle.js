require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
  "name": "immutable",
  "version": "4.0.0-rc.12",
  "description": "Immutable Data Collections",
  "license": "MIT",
  "homepage": "https://immutable-js.github.com/immutable-js",
  "author": {
    "name": "Lee Byron",
    "url": "https://github.com/leebyron"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/immutable-js/immutable-js.git"
  },
  "bugs": {
    "url": "https://github.com/immutable-js/immutable-js/issues"
  },
  "main": "dist/immutable.js",
  "module": "dist/immutable.es.js",
  "typings": "dist/immutable-nonambient.d.ts",
  "typescript": {
    "definition": "dist/immutable.d.ts"
  },
  "scripts": {
    "build": "run-s build:*",
    "build:dist": "run-s clean:dist bundle:dist bundle:es copy:dist stats:dist",
    "build:pages": "gulp --gulpfile ./resources/gulpfile.js default",
    "stats:dist": "node ./resources/dist-stats.js",
    "clean:dist": "rimraf dist",
    "bundle:dist": "rollup -c ./resources/rollup-config.js",
    "bundle:es": "rollup -c ./resources/rollup-config-es.js",
    "copy:dist": "node ./resources/copy-dist-typedefs.js",
    "format": "npm run lint:format -- --write",
    "lint": "run-s lint:*",
    "lint:ts": "tslint \"__tests__/**/*.ts\"",
    "lint:js": "eslint \"{__tests__,src,pages/src,pages/lib}/**/*.js\"",
    "lint:format": "prettier --check \"{__tests__,src,pages/src,pages/lib,perf,resources}/**/*{\\.js,\\.ts}\"",
    "testonly": "./resources/jest",
    "test": "run-s format build lint testonly test:types",
    "test:travis": "npm run test && npm run check:git-clean",
    "check:git-clean": "./resources/check-changes",
    "test:types": "run-s test:types:*",
    "test:types:ts": "tsc ./type-definitions/Immutable.d.ts --lib es2015 && dtslint type-definitions/ts-tests",
    "test:types:flow": "flow check type-definitions/tests --include-warnings",
    "perf": "node ./resources/bench.js",
    "start": "gulp --gulpfile ./resources/gulpfile.js dev",
    "gitpublish": "./resources/gitpublish.sh"
  },
  "prettier": {
    "singleQuote": true,
    "trailingComma": "es5",
    "semi": true,
    "arrowParens": "avoid"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "ts"
    ],
    "transform": {
      "^.+\\.ts$": "<rootDir>/resources/jestPreprocessor.js"
    },
    "testRegex": "/__tests__/.*\\.(ts|js)$",
    "unmockedModulePathPatterns": [
      "./node_modules/react"
    ]
  },
  "devDependencies": {
    "benchmark": "2.1.4",
    "browser-sync": "^2.26.12",
    "browserify": "16.5.2",
    "colors": "1.4.0",
    "del": "6.0.0",
    "dtslint": "4.1.0",
    "eslint": "7.11.0",
    "eslint-config-airbnb": "18.2.0",
    "eslint-config-prettier": "6.12.0",
    "eslint-plugin-import": "2.22.1",
    "eslint-plugin-jsx-a11y": "6.3.1",
    "eslint-plugin-prettier": "3.1.4",
    "eslint-plugin-react": "7.21.4",
    "flow-bin": "0.85.0",
    "gulp": "4.0.2",
    "gulp-concat": "2.6.1",
    "gulp-filter": "6.0.0",
    "gulp-header": "2.0.9",
    "gulp-less": "4.0.1",
    "gulp-size": "3.0.0",
    "gulp-sourcemaps": "2.6.5",
    "gulp-uglify": "3.0.2",
    "gulp-util": "3.0.8",
    "jasmine-check": "0.1.5",
    "jest": "26.5.2",
    "marked": "1.2.0",
    "microtime": "3.0.0",
    "mkdirp": "1.0.4",
    "npm-run-all": "4.1.5",
    "prettier": "^2.3.1",
    "react": "^0.12.2",
    "react-router": "^0.11.6",
    "react-tools": "0.13.3",
    "rimraf": "3.0.2",
    "rollup": "2.29.0",
    "rollup-plugin-buble": "0.19.2",
    "rollup-plugin-commonjs": "9.1.3",
    "rollup-plugin-json": "3.0.0",
    "rollup-plugin-strip-banner": "2.0.0",
    "through2": "4.0.2",
    "transducers-js": "^0.4.174",
    "tslint": "5.20.1",
    "typescript": "3.0.3",
    "uglify-js": "3.11.1",
    "uglify-save-license": "0.4.1",
    "vinyl-buffer": "1.0.1",
    "vinyl-source-stream": "2.0.0"
  },
  "files": [
    "dist",
    "contrib",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "immutable",
    "persistent",
    "lazy",
    "data",
    "datastructure",
    "functional",
    "collection",
    "stateless",
    "sequence",
    "iteration"
  ]
}

},{}],2:[function(require,module,exports){
module.exports="<h1 id=\"immutable-collections-for-javascript\">Immutable collections for JavaScript</h1>\n<p><a href=\"https://github.com/immutable-js/immutable-js/actions/workflows/ci.yml?query=branch%3Amain\"><img src=\"https://github.com/immutable-js/immutable-js/actions/workflows/ci.yml/badge.svg?branch=main\" alt=\"Build Status\"/></a> <a href=\"https://gitter.im/immutable-js/Lobby?utm_source=badge&amp;utm_medium=badge&amp;utm_campaign=pr-badge&amp;utm_content=badge\"><img src=\"https://badges.gitter.im/immutable-js/Lobby.svg\" alt=\"Join the chat at https://gitter.im/immutable-js/Lobby\"/></a></p>\n<p><a href=\"http://en.wikipedia.org/wiki/Immutable_object\">Immutable</a> data cannot be changed once created, leading to much simpler\napplication development, no defensive copying, and enabling advanced memoization\nand change detection techniques with simple logic. <a href=\"http://en.wikipedia.org/wiki/Persistent_data_structure\">Persistent</a> data presents\na mutative API which does not update the data in-place, but instead always\nyields new updated data.</p>\n<p>Immutable.js provides many Persistent Immutable data structures including:\n<code><a target=\"_self\" href=\"docs/#/List\">List</a></code>, <code><a target=\"_self\" href=\"docs/#/Stack\">Stack</a></code>, <code><a target=\"_self\" href=\"docs/#/Map\">Map</a></code>, <code><a target=\"_self\" href=\"docs/#/OrderedMap\">OrderedMap</a></code>, <code><a target=\"_self\" href=\"docs/#/Set\">Set</a></code>, <code><a target=\"_self\" href=\"docs/#/OrderedSet\">OrderedSet</a></code> and <code><a target=\"_self\" href=\"docs/#/Record\">Record</a></code>.</p>\n<p>These data structures are highly efficient on modern JavaScript VMs by using\nstructural sharing via <a href=\"http://en.wikipedia.org/wiki/Hash_array_mapped_trie\">hash maps tries</a> and <a href=\"http://hypirion.com/musings/understanding-persistent-vector-pt-1\">vector tries</a> as popularized\nby Clojure and Scala, minimizing the need to copy or cache data.</p>\n<p>Immutable.js also provides a lazy <code><a target=\"_self\" href=\"docs/#/Seq\">Seq</a></code>, allowing efficient\nchaining of collection methods like <code>map</code> and <code>filter</code> without creating\nintermediate representations. Create some <code><a target=\"_self\" href=\"docs/#/Seq\">Seq</a></code> with <code><a target=\"_self\" href=\"docs/#/Range\">Range</a></code> and <code><a target=\"_self\" href=\"docs/#/Repeat\">Repeat</a></code>.</p>\n<p>Want to hear more? Watch the presentation about Immutable.js:</p>\n<p><a href=\"https://youtu.be/I7IdS-PbEgI\" target=\"_blank\" alt=\"Immutable Data and React\"><img src=\"https://img.youtube.com/vi/I7IdS-PbEgI/0.jpg\" /></a></p>\n<h2 id=\"getting-started\">Getting started</h2>\n<p>Install <code><a target=\"_self\" href=\"docs/#/\">immutable</a></code> using npm.</p>\n<code class=\"codeBlock\">npm install immutable</code><p>Then require it into any module.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map1 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map2 <span class=\"token operator\" >=</span> map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >set<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >50</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nmap1<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span> <span class=\"token operator\" >+</span> <span class=\"token string\" >\" vs. \"</span> <span class=\"token operator\" >+</span> map2<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 2 vs. 50</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><h3 id=\"browser\">Browser</h3>\n<p>Immutable.js has no dependencies, which makes it predictable to include in a Browser.</p>\n<p>It&#39;s highly recommended to use a module bundler like <a href=\"https://webpack.github.io/\">webpack</a>,\n<a href=\"https://rollupjs.org/\">rollup</a>, or\n<a href=\"http://browserify.org/\">browserify</a>. The <code><a target=\"_self\" href=\"docs/#/\">immutable</a></code> npm module works\nwithout any additional consideration. All examples throughout the documentation\nwill assume use of this kind of tool.</p>\n<p>Alternatively, Immutable.js may be directly included as a script tag. Download\nor link to a CDN such as <a href=\"https://cdnjs.com/libraries/immutable\">CDNJS</a>\nor <a href=\"https://www.jsdelivr.com/package/npm/immutable\">jsDelivr</a>.</p>\n<p>Use a script tag to directly add <code><span class=\"token qualifier\" >Immutable</span></code> to the global scope:</p>\n<code class=\"codeBlock\"><span class=\"token operator\" >&lt;</span>script src<span class=\"token operator\" >=</span><span class=\"token string\" >\"immutable.min.js\"</span><span class=\"token operator\" >></span><span class=\"token operator\" >&lt;</span><span class=\"token operator\" >/</span>script<span class=\"token operator\" >></span>\n<span class=\"token operator\" >&lt;</span>script<span class=\"token operator\" >></span>\n  <span class=\"token keyword\" >var</span> map1 <span class=\"token operator\" >=</span> <span class=\"token qualifier\" >Immutable</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n  <span class=\"token keyword\" >var</span> map2 <span class=\"token operator\" >=</span> map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >set<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >50</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n  map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 2\n</span>  map2<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 50\n</span><span class=\"token operator\" >&lt;</span><span class=\"token operator\" >/</span>script<span class=\"token operator\" >></span></code><p>Or use an AMD-style loader (such as <a href=\"http://requirejs.org/\">RequireJS</a>):</p>\n<code class=\"codeBlock\"><span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span><span class=\"token string\" >'./immutable.min.js'</span><span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >,</span> <span class=\"token block-keyword\" >function</span> <span class=\"token punctuation\" >(</span><span class=\"token qualifier\" >Immutable</span><span class=\"token punctuation\" >)</span> <span class=\"token punctuation\" >{</span>\n  <span class=\"token keyword\" >var</span> map1 <span class=\"token operator\" >=</span> <span class=\"token qualifier\" >Immutable</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n  <span class=\"token keyword\" >var</span> map2 <span class=\"token operator\" >=</span> map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >set<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >50</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n  map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 2\n</span>  map2<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 50\n</span><span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span></code><h3 id=\"flow--typescript\">Flow &amp; TypeScript</h3>\n<p>Use these Immutable collections and sequences as you would use native\ncollections in your <a href=\"https://flowtype.org/\">Flowtype</a> or <a href=\"http://typescriptlang.org\">TypeScript</a> programs while still taking\nadvantage of type generics, error detection, and auto-complete in your IDE.</p>\n<p>Installing <code><a target=\"_self\" href=\"docs/#/\">immutable</a></code> via npm brings with it type definitions for Flow (v0.55.0 or higher)\nand TypeScript (v2.1.0 or higher), so you shouldn&#39;t need to do anything at all!</p>\n<h4 id=\"using-typescript-with-immutablejs-v4\">Using TypeScript with Immutable.js v4</h4>\n<p>Immutable.js type definitions embrace ES2015. While Immutable.js itself supports\nlegacy browsers and environments, its type definitions require TypeScript&#39;s 2015\nlib. Include either <code><span class=\"token string\" >\"target\"</span><span class=\"token punctuation\" >:</span> <span class=\"token string\" >\"es2015\"</span></code> or <code><span class=\"token string\" >\"lib\"</span><span class=\"token punctuation\" >:</span> <span class=\"token string\" >\"es2015\"</span></code> in your\n<code>tsconfig<span class=\"token punctuation\" >.</span>json</code>, or provide <code><span class=\"token operator\" >--</span>target es2015</code> or <code><span class=\"token operator\" >--</span>lib es2015</code> to the\n<code>tsc</code> command.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >\"immutable\"</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map1 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map2 <span class=\"token operator\" >=</span> map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >set<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >50</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nmap1<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span> <span class=\"token operator\" >+</span> <span class=\"token string\" >\" vs. \"</span> <span class=\"token operator\" >+</span> map2<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 2 vs. 50</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><h4 id=\"using-typescript-with-immutablejs-v3-and-earlier\">Using TypeScript with Immutable.js v3 and earlier:</h4>\n<p>Previous versions of Immutable.js include a reference file which you can include\nvia relative path to the type definitions at the top of your file.</p>\n<code class=\"codeBlock\"><span class=\"token comment\" spellcheck=\"true\">///&lt;reference path='./node_modules/immutable/dist/immutable.d.ts'/>\n</span><span class=\"token keyword\" >import</span> <span class=\"token qualifier\" >Immutable</span> from <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >var</span> map1<span class=\"token punctuation\" >:</span> <span class=\"token qualifier\" >Immutable</span><span class=\"token punctuation\" >.</span><span class=\"token qualifier\" >Map</span><span class=\"token operator\" >&lt;</span>string<span class=\"token punctuation\" >,</span> number<span class=\"token operator\" >></span><span class=\"token punctuation\" >;</span>\nmap1 <span class=\"token operator\" >=</span> <span class=\"token qualifier\" >Immutable</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >var</span> map2 <span class=\"token operator\" >=</span> map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >set<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >50</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nmap1<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 2\n</span>map2<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 50</span></code><h2 id=\"the-case-for-immutability\">The case for Immutability</h2>\n<p>Much of what makes application development difficult is tracking mutation and\nmaintaining state. Developing with immutable data encourages you to think\ndifferently about how data flows through your application.</p>\n<p>Subscribing to data events throughout your application creates a huge overhead of\nbook-keeping which can hurt performance, sometimes dramatically, and creates\nopportunities for areas of your application to get out of sync with each other\ndue to easy to make programmer error. Since immutable data never changes,\nsubscribing to changes throughout the model is a dead-end and new data can only\never be passed from above.</p>\n<p>This model of data flow aligns well with the architecture of <a href=\"https://reactjs.org/\">React</a>\nand especially well with an application designed using the ideas of <a href=\"https://facebook.github.io/flux/docs/in-depth-overview/\">Flux</a>.</p>\n<p>When data is passed from above rather than being subscribed to, and you&#39;re only\ninterested in doing work when something has changed, you can use equality.</p>\n<p>Immutable collections should be treated as <em>values</em> rather than <em>objects</em>. While\nobjects represent some thing which could change over time, a value represents\nthe state of that thing at a particular instance of time. This principle is most\nimportant to understanding the appropriate use of immutable data. In order to\ntreat Immutable.js collections as values, it&#39;s important to use the\n<code><a target=\"_self\" href=\"docs/#/is\">Immutable.is()</a></code> function or <code><span class=\"token punctuation\" >.</span><span class=\"token function\" >equals<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code> method to determine <em>value equality</em>\ninstead of the <code><span class=\"token operator\" >===</span></code> operator which determines object <em>reference identity</em>.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map1 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map2 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nmap1<span class=\"token punctuation\" >.</span><span class=\"token function\" >equals<span class=\"token punctuation\" >(</span></span>map2<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// true\n</span>map1 <span class=\"token operator\" >===</span> map2<span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// false</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>Note: As a performance optimization Immutable.js attempts to return the existing\ncollection when an operation would result in an identical collection, allowing\nfor using <code><span class=\"token operator\" >===</span></code> reference equality to determine if something definitely has not\nchanged. This can be extremely useful when used within a memoization function\nwhich would prefer to re-run the function if a deeper equality check could\npotentially be more costly. The <code><span class=\"token operator\" >===</span></code> equality check is also used internally by\n<code><a target=\"_self\" href=\"docs/#/is\">Immutable.is</a></code> and <code><span class=\"token punctuation\" >.</span><span class=\"token function\" >equals<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code> as a performance optimization.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map1 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map2 <span class=\"token operator\" >=</span> map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >set<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// Set to same value\n</span>map1 <span class=\"token operator\" >===</span> map2<span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// true</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>If an object is immutable, it can be &quot;copied&quot; simply by making another reference\nto it instead of copying the entire object. Because a reference is much smaller\nthan the object itself, this results in memory savings and a potential boost in\nexecution speed for programs which rely on copies (such as an undo-stack).</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> mapCopy <span class=\"token operator\" >=</span> map<span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// Look, \"copies\" are free!</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><h2 id=\"javascript-first-api\">JavaScript-first API</h2>\n<p>While Immutable.js is inspired by Clojure, Scala, Haskell and other functional\nprogramming environments, it&#39;s designed to bring these powerful concepts to\nJavaScript, and therefore has an Object-Oriented API that closely mirrors that\nof <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla\">ES2015</a> <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array\">Array</a>, <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map\">Map</a>, and <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set\">Set</a>.</p>\n<p>The difference for the immutable collections is that methods which would mutate\nthe collection, like <code>push</code>, <code><a target=\"_self\" href=\"docs/#/set\">set</a></code>, <code>unshift</code> or <code>splice</code>, instead return a new\nimmutable collection. Methods which return new arrays, like <code>slice</code> or <code>concat</code>,\ninstead return new immutable collections.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >List</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> list1 <span class=\"token operator\" >=</span> <span class=\"token function\" >List<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >2</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> list2 <span class=\"token operator\" >=</span> list1<span class=\"token punctuation\" >.</span><span class=\"token function\" >push<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >3</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >4</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >5</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> list3 <span class=\"token operator\" >=</span> list2<span class=\"token punctuation\" >.</span><span class=\"token function\" >unshift<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >0</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> list4 <span class=\"token operator\" >=</span> list1<span class=\"token punctuation\" >.</span><span class=\"token function\" >concat<span class=\"token punctuation\" >(</span></span>list2<span class=\"token punctuation\" >,</span> list3<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nassert<span class=\"token punctuation\" >.</span><span class=\"token function\" >equal<span class=\"token punctuation\" >(</span></span>list1<span class=\"token punctuation\" >.</span>size<span class=\"token punctuation\" >,</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nassert<span class=\"token punctuation\" >.</span><span class=\"token function\" >equal<span class=\"token punctuation\" >(</span></span>list2<span class=\"token punctuation\" >.</span>size<span class=\"token punctuation\" >,</span> <span class=\"token number\" >5</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nassert<span class=\"token punctuation\" >.</span><span class=\"token function\" >equal<span class=\"token punctuation\" >(</span></span>list3<span class=\"token punctuation\" >.</span>size<span class=\"token punctuation\" >,</span> <span class=\"token number\" >6</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nassert<span class=\"token punctuation\" >.</span><span class=\"token function\" >equal<span class=\"token punctuation\" >(</span></span>list4<span class=\"token punctuation\" >.</span>size<span class=\"token punctuation\" >,</span> <span class=\"token number\" >13</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nassert<span class=\"token punctuation\" >.</span><span class=\"token function\" >equal<span class=\"token punctuation\" >(</span></span>list4<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >0</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>Almost all of the methods on <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array\">Array</a> will be found in similar form on\n<code><a target=\"_self\" href=\"docs/#/List\">Immutable.List</a></code>, those of <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map\">Map</a> found on <code><a target=\"_self\" href=\"docs/#/Map\">Immutable.Map</a></code>, and those of <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set\">Set</a>\nfound on <code><a target=\"_self\" href=\"docs/#/Set\">Immutable.Set</a></code>, including collection operations like <code><span class=\"token function\" >forEach<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code>\nand <code><span class=\"token function\" >map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code>.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> alpha <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span><span class=\"token punctuation\" >,</span> d<span class=\"token punctuation\" >:</span> <span class=\"token number\" >4</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nalpha<span class=\"token punctuation\" >.</span><span class=\"token function\" >map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >(</span>v<span class=\"token punctuation\" >,</span> k<span class=\"token punctuation\" >)</span> <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> k<span class=\"token punctuation\" >.</span><span class=\"token function\" >toUpperCase<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >join<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// 'A,B,C,D'</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><h3 id=\"convert-from-raw-javascript-objects-and-arrays\">Convert from raw JavaScript objects and arrays.</h3>\n<p>Designed to inter-operate with your existing JavaScript, Immutable.js\naccepts plain JavaScript Arrays and Objects anywhere a method expects a\n<code><a target=\"_self\" href=\"docs/#/Collection\">Collection</a></code>.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span><span class=\"token punctuation\" >,</span> <span class=\"token qualifier\" >List</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map1 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span><span class=\"token punctuation\" >,</span> d<span class=\"token punctuation\" >:</span> <span class=\"token number\" >4</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map2 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >10</span><span class=\"token punctuation\" >,</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >20</span><span class=\"token punctuation\" >,</span> t<span class=\"token punctuation\" >:</span> <span class=\"token number\" >30</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> obj <span class=\"token operator\" >=</span> <span class=\"token punctuation\" >{</span> d<span class=\"token punctuation\" >:</span> <span class=\"token number\" >100</span><span class=\"token punctuation\" >,</span> o<span class=\"token punctuation\" >:</span> <span class=\"token number\" >200</span><span class=\"token punctuation\" >,</span> g<span class=\"token punctuation\" >:</span> <span class=\"token number\" >300</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map3 <span class=\"token operator\" >=</span> map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >merge<span class=\"token punctuation\" >(</span></span>map2<span class=\"token punctuation\" >,</span> obj<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// Map { a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300 }\n</span><span class=\"token keyword\" >const</span> list1 <span class=\"token operator\" >=</span> <span class=\"token function\" >List<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> list2 <span class=\"token operator\" >=</span> <span class=\"token function\" >List<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token number\" >4</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >5</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >6</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> array <span class=\"token operator\" >=</span> <span class=\"token punctuation\" >[</span> <span class=\"token number\" >7</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >8</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >9</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> list3 <span class=\"token operator\" >=</span> list1<span class=\"token punctuation\" >.</span><span class=\"token function\" >concat<span class=\"token punctuation\" >(</span></span>list2<span class=\"token punctuation\" >,</span> array<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// List [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>This is possible because Immutable.js can treat any JavaScript Array or Object\nas a Collection. You can take advantage of this in order to get sophisticated\ncollection methods on JavaScript Objects, which otherwise have a very sparse\nnative API. Because Seq evaluates lazily and does not cache intermediate\nresults, these operations can be extremely efficient.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Seq</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> myObject <span class=\"token operator\" >=</span> <span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >;</span>\n<span class=\"token function\" >Seq<span class=\"token punctuation\" >(</span></span>myObject<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >map<span class=\"token punctuation\" >(</span></span>x <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> x <span class=\"token operator\" >*</span> x<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >toObject<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// { a: 1, b: 4, c: 9 }</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>Keep in mind, when using JS objects to construct Immutable Maps, that\nJavaScript Object properties are always strings, even if written in a quote-less\nshorthand, while Immutable Maps accept keys of any type.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> fromJS <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n\n<span class=\"token keyword\" >const</span> obj <span class=\"token operator\" >=</span> <span class=\"token punctuation\" >{</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >:</span> <span class=\"token string\" >\"one\"</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >;</span>\nconsole<span class=\"token punctuation\" >.</span><span class=\"token function\" >log<span class=\"token punctuation\" >(</span></span><span class=\"token qualifier\" >Object</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >keys<span class=\"token punctuation\" >(</span></span>obj<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// [ \"1\" ]\n</span>console<span class=\"token punctuation\" >.</span><span class=\"token function\" >log<span class=\"token punctuation\" >(</span></span>obj<span class=\"token punctuation\" >[</span><span class=\"token string\" >\"1\"</span><span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >,</span> obj<span class=\"token punctuation\" >[</span><span class=\"token number\" >1</span><span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// \"one\", \"one\"\n</span>\n<span class=\"token keyword\" >const</span> map <span class=\"token operator\" >=</span> <span class=\"token function\" >fromJS<span class=\"token punctuation\" >(</span></span>obj<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nconsole<span class=\"token punctuation\" >.</span><span class=\"token function\" >log<span class=\"token punctuation\" >(</span></span>map<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >\"1\"</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >,</span> map<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >1</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// \"one\", undefined</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>Property access for JavaScript Objects first converts the key to a string, but\nsince Immutable Map keys can be of any type the argument to <code><a target=\"_self\" href=\"docs/#/get\">get()</a></code> is\nnot altered.</p>\n<h3 id=\"converts-back-to-raw-javascript-objects\">Converts back to raw JavaScript objects.</h3>\n<p>All Immutable.js Collections can be converted to plain JavaScript Arrays and\nObjects shallowly with <code><span class=\"token function\" >toArray<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code> and <code><span class=\"token function\" >toObject<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code> or deeply with <code><span class=\"token function\" >toJS<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code>.\nAll Immutable Collections also implement <code><span class=\"token function\" >toJSON<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code> allowing them to be passed\nto <code><a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify\">JSON.stringify</a></code> directly. They also respect the custom <code><span class=\"token function\" >toJSON<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code> methods of\nnested objects.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span><span class=\"token punctuation\" >,</span> <span class=\"token qualifier\" >List</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> deep <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token function\" >List<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token number\" >3</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >4</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >5</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >)</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nconsole<span class=\"token punctuation\" >.</span><span class=\"token function\" >log<span class=\"token punctuation\" >(</span></span>deep<span class=\"token punctuation\" >.</span><span class=\"token function\" >toObject<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// { a: 1, b: 2, c: List [ 3, 4, 5 ] }\n</span>console<span class=\"token punctuation\" >.</span><span class=\"token function\" >log<span class=\"token punctuation\" >(</span></span>deep<span class=\"token punctuation\" >.</span><span class=\"token function\" >toArray<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// [ 1, 2, List [ 3, 4, 5 ] ]\n</span>console<span class=\"token punctuation\" >.</span><span class=\"token function\" >log<span class=\"token punctuation\" >(</span></span>deep<span class=\"token punctuation\" >.</span><span class=\"token function\" >toJS<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// { a: 1, b: 2, c: [ 3, 4, 5 ] }\n</span>JSON<span class=\"token punctuation\" >.</span><span class=\"token function\" >stringify<span class=\"token punctuation\" >(</span></span>deep<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// '{\"a\":1,\"b\":2,\"c\":[3,4,5]}'</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><h3 id=\"embraces-es2015\">Embraces ES2015</h3>\n<p>Immutable.js supports all JavaScript environments, including legacy\nbrowsers (even IE8). However it also takes advantage of features added to\nJavaScript in <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla\">ES2015</a>, the latest standard version of JavaScript, including\n<a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol\">Iterators</a>, <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions\">Arrow Functions</a>, <a href=\"http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes\">Classes</a>, and <a href=\"http://www.2ality.com/2014/09/es6-modules-final.html\">Modules</a>. It&#39;s inspired\nby the native <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map\">Map</a> and <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set\">Set</a> collections added to ES2015.</p>\n<p>All examples in the Documentation are presented in ES2015. To run in all\nbrowsers, they need to be translated to ES5.</p>\n<code class=\"codeBlock\"><span class=\"token comment\" spellcheck=\"true\">// ES2015\n</span><span class=\"token keyword\" >const</span> mapped <span class=\"token operator\" >=</span> foo<span class=\"token punctuation\" >.</span><span class=\"token function\" >map<span class=\"token punctuation\" >(</span></span>x <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> x <span class=\"token operator\" >*</span> x<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// ES5\n</span><span class=\"token keyword\" >var</span> mapped <span class=\"token operator\" >=</span> foo<span class=\"token punctuation\" >.</span><span class=\"token function\" >map<span class=\"token punctuation\" >(</span></span><span class=\"token block-keyword\" >function</span> <span class=\"token punctuation\" >(</span>x<span class=\"token punctuation\" >)</span> <span class=\"token punctuation\" >{</span> <span class=\"token keyword\" >return</span> x <span class=\"token operator\" >*</span> x<span class=\"token punctuation\" >;</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span></code><p>All Immutable.js collections are <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol\">Iterable</a>, which allows them to be\nused anywhere an Iterable is expected, such as when spreading into an Array.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >List</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> aList <span class=\"token operator\" >=</span> <span class=\"token function\" >List<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> anArray <span class=\"token operator\" >=</span> <span class=\"token punctuation\" >[</span> <span class=\"token number\" >0</span><span class=\"token punctuation\" >,</span> <span class=\"token punctuation\" >.</span><span class=\"token punctuation\" >.</span><span class=\"token punctuation\" >.</span>aList<span class=\"token punctuation\" >,</span> <span class=\"token number\" >4</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >5</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// [ 0, 1, 2, 3, 4, 5 ]</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>Note: A Collection is always iterated in the same order, however that order may\nnot always be well defined, as is the case for the <code><a target=\"_self\" href=\"docs/#/Map\">Map</a></code> and <code><a target=\"_self\" href=\"docs/#/Set\">Set</a></code>.</p>\n<h2 id=\"nested-structures\">Nested Structures</h2>\n<p>The collections in Immutable.js are intended to be nested, allowing for deep\ntrees of data, similar to JSON.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> fromJS <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> nested <span class=\"token operator\" >=</span> <span class=\"token function\" >fromJS<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token punctuation\" >{</span> b<span class=\"token punctuation\" >:</span> <span class=\"token punctuation\" >{</span> c<span class=\"token punctuation\" >:</span> <span class=\"token punctuation\" >[</span> <span class=\"token number\" >3</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >4</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >5</span> <span class=\"token punctuation\" >]</span> <span class=\"token punctuation\" >}</span> <span class=\"token punctuation\" >}</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// Map { a: Map { b: Map { c: List [ 3, 4, 5 ] } } }</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>A few power-tools allow for reading and operating on nested data. The\nmost useful are <code><a target=\"_self\" href=\"docs/#/mergeDeep\">mergeDeep</a></code>, <code><a target=\"_self\" href=\"docs/#/getIn\">getIn</a></code>, <code><a target=\"_self\" href=\"docs/#/setIn\">setIn</a></code>, and <code><a target=\"_self\" href=\"docs/#/updateIn\">updateIn</a></code>, found on <code><a target=\"_self\" href=\"docs/#/List\">List</a></code>,\n<code><a target=\"_self\" href=\"docs/#/Map\">Map</a></code> and <code><a target=\"_self\" href=\"docs/#/OrderedMap\">OrderedMap</a></code>.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> fromJS <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> nested <span class=\"token operator\" >=</span> <span class=\"token function\" >fromJS<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token punctuation\" >{</span> b<span class=\"token punctuation\" >:</span> <span class=\"token punctuation\" >{</span> c<span class=\"token punctuation\" >:</span> <span class=\"token punctuation\" >[</span> <span class=\"token number\" >3</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >4</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >5</span> <span class=\"token punctuation\" >]</span> <span class=\"token punctuation\" >}</span> <span class=\"token punctuation\" >}</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n\n<span class=\"token keyword\" >const</span> nested2 <span class=\"token operator\" >=</span> nested<span class=\"token punctuation\" >.</span><span class=\"token function\" >mergeDeep<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token punctuation\" >{</span> b<span class=\"token punctuation\" >:</span> <span class=\"token punctuation\" >{</span> d<span class=\"token punctuation\" >:</span> <span class=\"token number\" >6</span> <span class=\"token punctuation\" >}</span> <span class=\"token punctuation\" >}</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// Map { a: Map { b: Map { c: List [ 3, 4, 5 ], d: 6 } } }\n</span>\nconsole<span class=\"token punctuation\" >.</span><span class=\"token function\" >log<span class=\"token punctuation\" >(</span></span>nested2<span class=\"token punctuation\" >.</span><span class=\"token function\" >getIn<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token string\" >'a'</span><span class=\"token punctuation\" >,</span> <span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token string\" >'d'</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 6\n</span>\n<span class=\"token keyword\" >const</span> nested3 <span class=\"token operator\" >=</span> nested2<span class=\"token punctuation\" >.</span><span class=\"token function\" >updateIn<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token string\" >'a'</span><span class=\"token punctuation\" >,</span> <span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token string\" >'d'</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >,</span> value <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> value <span class=\"token operator\" >+</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nconsole<span class=\"token punctuation\" >.</span><span class=\"token function\" >log<span class=\"token punctuation\" >(</span></span>nested3<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// Map { a: Map { b: Map { c: List [ 3, 4, 5 ], d: 7 } } }\n</span>\n<span class=\"token keyword\" >const</span> nested4 <span class=\"token operator\" >=</span> nested3<span class=\"token punctuation\" >.</span><span class=\"token function\" >updateIn<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token string\" >'a'</span><span class=\"token punctuation\" >,</span> <span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token string\" >'c'</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >,</span> list <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> list<span class=\"token punctuation\" >.</span><span class=\"token function\" >push<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >6</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// Map { a: Map { b: Map { c: List [ 3, 4, 5, 6 ], d: 7 } } }</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><h2 id=\"equality-treats-collections-as-values\">Equality treats Collections as Values</h2>\n<p>Immutable.js collections are treated as pure data <em>values</em>. Two immutable\ncollections are considered <em>value equal</em> (via <code><span class=\"token punctuation\" >.</span><span class=\"token function\" >equals<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span></code> or <code><a target=\"_self\" href=\"docs/#/is\">is()</a></code>) if they\nrepresent the same collection of values. This differs from JavaScript&#39;s typical\n<em>reference equal</em> (via <code><span class=\"token operator\" >===</span></code> or <code><span class=\"token operator\" >==</span></code>) for Objects and Arrays which only\ndetermines if two variables represent references to the same object instance.</p>\n<p>Consider the example below where two identical <code><a target=\"_self\" href=\"docs/#/Map\">Map</a></code> instances are not\n<em>reference equal</em> but are <em>value equal</em>.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token comment\" spellcheck=\"true\">// First consider:\n</span><span class=\"token keyword\" >const</span> obj1 <span class=\"token operator\" >=</span> <span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> obj2 <span class=\"token operator\" >=</span> <span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >;</span>\nobj1 <span class=\"token operator\" >!</span><span class=\"token operator\" >==</span> obj2<span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// two different instances are always not equal with ===\n</span>\n<span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span><span class=\"token punctuation\" >,</span> is <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map1 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map2 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nmap1 <span class=\"token operator\" >!</span><span class=\"token operator\" >==</span> map2<span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// two different instances are not reference-equal\n</span>map1<span class=\"token punctuation\" >.</span><span class=\"token function\" >equals<span class=\"token punctuation\" >(</span></span>map2<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// but are value-equal if they have the same values\n</span><span class=\"token function\" >is<span class=\"token punctuation\" >(</span></span>map1<span class=\"token punctuation\" >,</span> map2<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// alternatively can use the is() function</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>Value equality allows Immutable.js collections to be used as keys in Maps or\nvalues in Sets, and retrieved with different but equivalent collections:</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span><span class=\"token punctuation\" >,</span> <span class=\"token qualifier\" >Set</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map1 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map2 <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> <span class=\"token keyword\" >set</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >Set<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >add<span class=\"token punctuation\" >(</span></span>map1<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >set</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >has<span class=\"token punctuation\" >(</span></span>map2<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// true because these are value-equal</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>Note: <code><a target=\"_self\" href=\"docs/#/is\">is()</a></code> uses the same measure of equality as <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is\">Object.is</a> for scalar\nstrings and numbers, but uses value equality for Immutable collections,\ndetermining if both are immutable and all keys and values are equal\nusing the same measure of equality.</p>\n<h4 id=\"performance-tradeoffs\">Performance tradeoffs</h4>\n<p>While value equality is useful in many circumstances, it has different\nperformance characteristics than reference equality. Understanding these\ntradeoffs may help you decide which to use in each case, especially when used\nto memoize some operation.</p>\n<p>When comparing two collections, value equality may require considering every\nitem in each collection, on an <code><span class=\"token function\" >O<span class=\"token punctuation\" >(</span></span>N<span class=\"token punctuation\" >)</span></code> time complexity. For large collections of\nvalues, this could become a costly operation. Though if the two are not equal\nand hardly similar, the inequality is determined very quickly. In contrast, when\ncomparing two collections with reference equality, only the initial references\nto memory need to be compared which is not based on the size of the collections,\nwhich has an <code><span class=\"token function\" >O<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >1</span><span class=\"token punctuation\" >)</span></code> time complexity. Checking reference equality is always very\nfast, however just because two collections are not reference-equal does not rule\nout the possibility that they may be value-equal.</p>\n<h4 id=\"return-self-on-no-op-optimization\">Return self on no-op optimization</h4>\n<p>When possible, Immutable.js avoids creating new objects for updates where no\nchange in <em>value</em> occurred, to allow for efficient <em>reference equality</em> checking\nto quickly determine if no change occurred.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> originalMap <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> updatedMap <span class=\"token operator\" >=</span> originalMap<span class=\"token punctuation\" >.</span><span class=\"token function\" >set<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nupdatedMap <span class=\"token operator\" >===</span> originalMap<span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// No-op .set() returned the original reference.</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>However updates which do result in a change will return a new reference. Each\nof these operations occur independently, so two similar updates will not return\nthe same reference:</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> originalMap <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> updatedMap <span class=\"token operator\" >=</span> originalMap<span class=\"token punctuation\" >.</span><span class=\"token function\" >set<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >1000</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// New instance, leaving the original immutable.\n</span>updatedMap <span class=\"token operator\" >!</span><span class=\"token operator\" >==</span> originalMap<span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> anotherUpdatedMap <span class=\"token operator\" >=</span> originalMap<span class=\"token punctuation\" >.</span><span class=\"token function\" >set<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'b'</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >1000</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// Despite both the results of the same operation, each created a new reference.\n</span>anotherUpdatedMap <span class=\"token operator\" >!</span><span class=\"token operator\" >==</span> updatedMap<span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// However the two are value equal.\n</span>anotherUpdatedMap<span class=\"token punctuation\" >.</span><span class=\"token function\" >equals<span class=\"token punctuation\" >(</span></span>updatedMap<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><h2 id=\"batching-mutations\">Batching Mutations</h2>\n<blockquote>\n<p>If a tree falls in the woods, does it make a sound?</p>\n<p>If a pure function mutates some local data in order to produce an immutable\nreturn value, is that ok?</p>\n<p>— Rich Hickey, Clojure</p>\n</blockquote>\n<p>Applying a mutation to create a new immutable object results in some overhead,\nwhich can add up to a minor performance penalty. If you need to apply a series\nof mutations locally before returning, Immutable.js gives you the ability to\ncreate a temporary mutable (transient) copy of a collection and apply a batch of\nmutations in a performant manner by using <code>withMutations</code>. In fact, this is\nexactly how  Immutable.js applies complex mutations itself.</p>\n<p>As an example, building <code>list2</code> results in the creation of 1, not 3, new\nimmutable Lists.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >List</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> list1 <span class=\"token operator\" >=</span> <span class=\"token function\" >List<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> list2 <span class=\"token operator\" >=</span> list1<span class=\"token punctuation\" >.</span><span class=\"token function\" >withMutations<span class=\"token punctuation\" >(</span></span><span class=\"token block-keyword\" >function</span> <span class=\"token punctuation\" >(</span>list<span class=\"token punctuation\" >)</span> <span class=\"token punctuation\" >{</span>\n  list<span class=\"token punctuation\" >.</span><span class=\"token function\" >push<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >4</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >push<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >5</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >.</span><span class=\"token function\" >push<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >6</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nassert<span class=\"token punctuation\" >.</span><span class=\"token function\" >equal<span class=\"token punctuation\" >(</span></span>list1<span class=\"token punctuation\" >.</span>size<span class=\"token punctuation\" >,</span> <span class=\"token number\" >3</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\nassert<span class=\"token punctuation\" >.</span><span class=\"token function\" >equal<span class=\"token punctuation\" >(</span></span>list2<span class=\"token punctuation\" >.</span>size<span class=\"token punctuation\" >,</span> <span class=\"token number\" >6</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p>Note: Immutable.js also provides <code>asMutable</code> and <code>asImmutable</code>, but only\nencourages their use when <code>withMutations</code> will not suffice. Use caution to not\nreturn a mutable copy, which could result in undesired behavior.</p>\n<p><em>Important!</em>: Only a select few methods can be used in <code>withMutations</code> including\n<code><a target=\"_self\" href=\"docs/#/set\">set</a></code>, <code>push</code> and <code>pop</code>. These methods can be applied directly against a\npersistent data-structure where other methods like <code>map</code>, <code>filter</code>, <code>sort</code>,\nand <code>splice</code> will always return new immutable data-structures and never mutate\na mutable collection.</p>\n<h2 id=\"lazy-seq\">Lazy Seq</h2>\n<p><code><a target=\"_self\" href=\"docs/#/Seq\">Seq</a></code> describes a lazy operation, allowing them to efficiently chain\nuse of all the higher-order collection methods (such as <code>map</code> and <code>filter</code>)\nby not creating intermediate collections.</p>\n<p><strong>Seq is immutable</strong> — Once a Seq is created, it cannot be\nchanged, appended to, rearranged or otherwise modified. Instead, any mutative\nmethod called on a <code><a target=\"_self\" href=\"docs/#/Seq\">Seq</a></code> will return a new <code><a target=\"_self\" href=\"docs/#/Seq\">Seq</a></code>.</p>\n<p><strong>Seq is lazy</strong> — <code><a target=\"_self\" href=\"docs/#/Seq\">Seq</a></code> does as little work as necessary to respond to any\nmethod call. Values are often created during iteration, including implicit\niteration when reducing or converting to a concrete data structure such as\na <code><a target=\"_self\" href=\"docs/#/List\">List</a></code> or JavaScript <code><a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array\">Array</a></code>.</p>\n<p>For example, the following performs no work, because the resulting\n<code><a target=\"_self\" href=\"docs/#/Seq\">Seq</a></code>&#39;s values are never iterated:</p>\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Seq</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> oddSquares <span class=\"token operator\" >=</span> <span class=\"token function\" >Seq<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >[</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >3</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >4</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >5</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >6</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >7</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >8</span> <span class=\"token punctuation\" >]</span><span class=\"token punctuation\" >)</span>\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >filter<span class=\"token punctuation\" >(</span></span>x <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> x <span class=\"token operator\" >%</span> <span class=\"token number\" >2</span> <span class=\"token operator\" >!</span><span class=\"token operator\" >==</span> <span class=\"token number\" >0</span><span class=\"token punctuation\" >)</span>\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >map<span class=\"token punctuation\" >(</span></span>x <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> x <span class=\"token operator\" >*</span> x<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span></code><p>Once the <code><a target=\"_self\" href=\"docs/#/Seq\">Seq</a></code> is used, it performs only the work necessary. In this\nexample, no intermediate arrays are ever created, filter is called three\ntimes, and map is only called once:</p>\n<code class=\"codeBlock\">oddSquares<span class=\"token punctuation\" >.</span><span class=\"token function\" >get<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >1</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span> <span class=\"token comment\" spellcheck=\"true\">// 9</span></code><p>Any collection can be converted to a lazy Seq with <code><a target=\"_self\" href=\"docs/#/Seq\">Seq()</a></code>.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Map</span><span class=\"token punctuation\" >,</span> <span class=\"token qualifier\" >Seq</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> map <span class=\"token operator\" >=</span> <span class=\"token function\" >Map<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >{</span> a<span class=\"token punctuation\" >:</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> b<span class=\"token punctuation\" >:</span> <span class=\"token number\" >2</span><span class=\"token punctuation\" >,</span> c<span class=\"token punctuation\" >:</span> <span class=\"token number\" >3</span> <span class=\"token punctuation\" >}</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token keyword\" >const</span> lazySeq <span class=\"token operator\" >=</span> <span class=\"token function\" >Seq<span class=\"token punctuation\" >(</span></span>map<span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><p><code><a target=\"_self\" href=\"docs/#/Seq\">Seq</a></code> allows for the efficient chaining of operations, allowing for the\nexpression of logic that can otherwise be very tedious:</p>\n<code class=\"codeBlock\">lazySeq\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >flip<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span>\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >map<span class=\"token punctuation\" >(</span></span>key <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> key<span class=\"token punctuation\" >.</span><span class=\"token function\" >toUpperCase<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >)</span>\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >flip<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// Seq { A: 1, B: 2, C: 3 }</span></code><p>As well as expressing logic that would otherwise seem memory or time\nlimited, for example <code><a target=\"_self\" href=\"docs/#/Range\">Range</a></code> is a special kind of Lazy sequence.</p>\n<!-- runkit:activate -->\n<code class=\"codeBlock\"><span class=\"token keyword\" >const</span> <span class=\"token punctuation\" >{</span> <span class=\"token qualifier\" >Range</span> <span class=\"token punctuation\" >}</span> <span class=\"token operator\" >=</span> <span class=\"token function\" >require<span class=\"token punctuation\" >(</span></span><span class=\"token string\" >'immutable'</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token function\" >Range<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >1</span><span class=\"token punctuation\" >,</span> <span class=\"token number\" >Infinity</span><span class=\"token punctuation\" >)</span>\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >skip<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >1000</span><span class=\"token punctuation\" >)</span>\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >map<span class=\"token punctuation\" >(</span></span>n <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> <span class=\"token operator\" >-</span>n<span class=\"token punctuation\" >)</span>\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >filter<span class=\"token punctuation\" >(</span></span>n <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> n <span class=\"token operator\" >%</span> <span class=\"token number\" >2</span> <span class=\"token operator\" >===</span> <span class=\"token number\" >0</span><span class=\"token punctuation\" >)</span>\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >take<span class=\"token punctuation\" >(</span></span><span class=\"token number\" >2</span><span class=\"token punctuation\" >)</span>\n  <span class=\"token punctuation\" >.</span><span class=\"token function\" >reduce<span class=\"token punctuation\" >(</span></span><span class=\"token punctuation\" >(</span>r<span class=\"token punctuation\" >,</span> n<span class=\"token punctuation\" >)</span> <span class=\"token operator\" >=</span><span class=\"token operator\" >></span> r <span class=\"token operator\" >*</span> n<span class=\"token punctuation\" >,</span> <span class=\"token number\" >1</span><span class=\"token punctuation\" >)</span><span class=\"token punctuation\" >;</span>\n<span class=\"token comment\" spellcheck=\"true\">// 1006008</span><a class=\"try-it\" data-options=\"%7B%7D\" onClick=\"runIt(this)\">run it</a></code><h2 id=\"documentation\">Documentation</h2>\n<p><a href=\"http://immutable-js.github.io/immutable-js/\">Read the docs</a> and eat your vegetables.</p>\n<p>Docs are automatically generated from <a href=\"https://github.com/immutable-js/immutable-js/blob/main/type-definitions/Immutable.d.ts\">Immutable.d.ts</a>.\nPlease contribute!</p>\n<p>Also, don&#39;t miss the <a href=\"https://github.com/immutable-js/immutable-js/wiki\">Wiki</a> which\ncontains articles on specific topics. Can&#39;t find something? Open an <a href=\"https://github.com/immutable-js/immutable-js/issues\">issue</a>.</p>\n<h2 id=\"testing\">Testing</h2>\n<p>If you are using the <a href=\"http://chaijs.com/\">Chai Assertion Library</a>, <a href=\"https://github.com/astorije/chai-immutable\">Chai Immutable</a> provides a set of assertions to use against Immutable.js collections.</p>\n<h2 id=\"contribution\">Contribution</h2>\n<p>Use <a href=\"https://github.com/immutable-js/immutable-js/issues\">Github issues</a> for requests.</p>\n<p>We actively welcome pull requests, learn how to <a href=\"https://github.com/immutable-js/immutable-js/blob/main/.github/CONTRIBUTING.md\">contribute</a>.</p>\n<p>Immutable.js is maintained within the <a href=\"https://www.contributor-covenant.org/version/2/0/code_of_conduct/\">Contributor Covenant&#39;s Code of Conduct</a>.</p>\n<h2 id=\"changelog\">Changelog</h2>\n<p>Changes are tracked as <a href=\"https://github.com/immutable-js/immutable-js/releases\">Github releases</a>.</p>\n<h2 id=\"thanks\">Thanks</h2>\n<p><a href=\"https://www.youtube.com/watch?v=K2NYwP90bNs\">Phil Bagwell</a>, for his inspiration\nand research in persistent data structures.</p>\n<p><a href=\"https://github.com/hughfdjackson/\">Hugh Jackson</a>, for providing the npm package\nname. If you&#39;re looking for his unsupported package, see <a href=\"https://github.com/hughfdjackson/immutable\">this repository</a>.</p>\n<h2 id=\"license\">License</h2>\n<p>Immutable.js is <a href=\"./LICENSE\">MIT-licensed</a>.</p>\n"
},{}],3:[function(require,module,exports){
(function (global){(function (){
global.runIt = function runIt(button) {
  if (!global.RunKit) return;

  var container = document.createElement('div');
  var codeElement = button.parentNode;
  var parent = codeElement.parentNode;

  parent.insertBefore(container, codeElement);
  parent.removeChild(codeElement);
  codeElement.removeChild(button);

  const options = JSON.parse(unescape(button.dataset.options));

  function withCorrectVersion(code) {
    return code.replace(
      /require\('immutable'\)/g,
      "require('immutable@4.0.0-rc.9')"
    );
  }

  global.RunKit.createNotebook({
    element: container,
    nodeVersion: options.nodeVersion || '*',
    preamble: withCorrectVersion(
      'const assert = (' +
        makeAssert +
        ")(require('immutable'));" +
        (options.preamble || '')
    ),
    source: withCorrectVersion(
      codeElement.textContent.replace(/\n(>[^\n]*\n?)+$/g, '')
    ),
    minHeight: '52px',
    onLoad: function (notebook) {
      notebook.evaluate();
    },
  });
};

function makeAssert(I) {
  var isIterable = I.isIterable || I.Iterable.isIterable;
  var html = ("\n    <style>\n      * {\n        font-size: 14px;\n        font-family: monospace;\n      }\n\n      code {\n        font-family: monospace;\n        color: #4183C4;\n        text-decoration: none;\n        text-decoration: none;\n        background: rgba(65, 131, 196, 0.1);\n        border-radius: 2px;\n        padding: 2px;\n    }\n\n      .success {\n        color: rgba(84,184,54,1.0);\n      }\n\n      .success:before {\n        content: \"✅\";\n      }\n\n      .failure {\n        color: rgba(220,47,33,1.0);\n      }\n\n      .failure i {\n        color: rgba(210,44,31,1.0);\n      }\n\n      .failure:before {\n        content: \"❌\";\n      }\n    </style>"



































);

  function compare(lhs, rhs, same, identical) {
    var both = !identical && isIterable(lhs) && isIterable(rhs);

    if (both) return lhs.equals(rhs);

    return lhs === rhs;
  }

  function message(lhs, rhs, same, identical) {
    var result = compare(lhs, rhs, same, identical);
    var comparison = result
      ? identical
        ? 'strict equal to'
        : 'does equal'
      : identical
      ? 'not strict equal to'
      : 'does not equal';
    var className = result === same ? 'success' : 'failure';
    var lhsString = isIterable(lhs) ? lhs + '' : JSON.stringify(lhs);
    var rhsString = isIterable(rhs) ? rhs + '' : JSON.stringify(rhs);

    return (html += ("\n      <span class=\"" + 
className + "\">\n        <code>" + 
lhsString + "</code>\n        " + 
comparison + "\n        <code>" + 
rhsString + "</code>\n      </span><br/>"
));
  }

  function equal(lhs, rhs) {
    return message(lhs, rhs, true);
  }

  function notEqual(lhs, rhs) {
    return message(lhs, rhs, false);
  }

  function strictEqual(lhs, rhs) {
    return message(lhs, rhs, true, true);
  }

  function notStrictEqual(lhs, rhs) {
    return message(lhs, rhs, false, true);
  }

  return { equal:equal, notEqual:notEqual, strictEqual:strictEqual, notStrictEqual:notStrictEqual };
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
var React = require('react');
var SVGSet = require('./SVGSet');
var Logo = require('./Logo');
var StarBtn = require('./StarBtn');
var packageJson = require('../../../package.json');

var isMobileMatch =
  window.matchMedia && window.matchMedia('(max-device-width: 680px)');
var isMobile = isMobileMatch && isMobileMatch.matches;

var Header = React.createClass({displayName: "Header",
  getInitialState: function () {
    return { scroll: 0 };
  },

  componentDidMount: function () {
    this.offsetHeight = this.getDOMNode().offsetHeight;
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);
  },

  componentWillUnmount: function () {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  },

  handleResize: function () {
    this.offsetHeight = this.getDOMNode().offsetHeight;
  },

  handleScroll: function () {
    if (!this._pending) {
      var headerHeight = Math.min(
        800,
        Math.max(260, document.documentElement.clientHeight * 0.7)
      );
      if (window.scrollY < headerHeight) {
        this._pending = true;
        window.requestAnimationFrame(function()  {
          this._pending = false;
          this.setState({ scroll: window.scrollY });
        }.bind(this));
      }
    }
  },

  render: function () {
    var neg = this.state.scroll < 0;
    var s = neg ? 0 : this.state.scroll;
    var sp = isMobile ? 35 : 70;

    return (
      React.createElement("div", {className: "header"}, 
        React.createElement("div", {className: "miniHeader"}, 
          React.createElement("div", {className: "miniHeaderContents"}, 
            React.createElement("a", {href: "./", target: "_self", className: "miniLogo"}, 
              React.createElement(SVGSet, null, 
                React.createElement(Logo, {color: "#FC4349"}), 
                React.createElement(Logo, {color: "#2C3E50", inline: true})
              )
            ), 
            React.createElement("a", {href: "docs/", target: "_self"}, 
              "Docs (v", 
              packageJson.version, ")"
            ), 
            React.createElement("a", {href: "https://stackoverflow.com/questions/tagged/immutable.js?sort=votes"}, 
              "Questions"
            ), 
            React.createElement("a", {href: "https://github.com/immutable-js/immutable-js/"}, "GitHub")
          )
        ), 
        React.createElement("div", {className: "coverContainer"}, 
          React.createElement("div", {className: "cover"}, 
            React.createElement("div", {className: "coverFixed"}, 
              React.createElement("div", {className: "filler"}, 
                React.createElement("div", {className: "miniHeaderContents"}, 
                  React.createElement("a", {href: "docs/", target: "_self"}, 
                    "Docs (v", 
                    packageJson.version, ")"
                  ), 
                  React.createElement("a", {href: "https://stackoverflow.com/questions/tagged/immutable.js?sort=votes"}, 
                    "Questions"
                  ), 
                  React.createElement("a", {href: "https://github.com/immutable-js/immutable-js/"}, 
                    "GitHub"
                  )
                )
              ), 
              React.createElement("div", {className: "synopsis"}, 
                React.createElement("div", {className: "logo"}, 
                  (isMobile
                    ? [0, 0, 0, 0, 0, 0, 0]
                    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  ).map(function(_, i)  
                    {return React.createElement(SVGSet, {key: i, style: t(y(s, i * sp), z(s, i * sp))}, 
                      React.createElement(Logo, {color: "#c1c6c8"}), 
                      React.createElement(Logo, {color: "#6dbcdb", opacity: o(s, i * sp)})
                    );}
                  ), 
                  React.createElement(SVGSet, {style: t(s * -0.55, 1)}, 
                    React.createElement(Logo, {color: "#FC4349"}), 
                    React.createElement(Logo, {color: "#2C3E50", inline: true})
                  )
                )
              ), 
              React.createElement("div", {className: "buttons"}, 
                React.createElement(StarBtn, null)
              )
            )
          )
        )
      )
    );
  },
});

function y(s, p) {
  return (p < s ? p : s) * -0.55;
}

function o(s, p) {
  return Math.max(0, s > p ? 1 - (s - p) / 350 : 1);
}

function z(s, p) {
  return Math.max(0, s > p ? 1 - (s - p) / 20000 : 1);
}

function t(y, z) {
  var transform = 'translate3d(0, ' + y + 'px, 0) scale(' + z + ')';
  return {
    transform: transform,
    WebkitTransform: transform,
    MozTransform: transform,
    msTransform: transform,
    OTransform: transform,
  };
}

module.exports = Header;

},{"../../../package.json":1,"./Logo":5,"./SVGSet":6,"./StarBtn":7,"react":"react"}],5:[function(require,module,exports){
var React = require('react');

var Logo = React.createClass({displayName: "Logo",
  shouldComponentUpdate: function (nextProps) {
    return nextProps.opacity !== this.props.opacity;
  },

  render: function () {
    var opacity = this.props.opacity;
    if (opacity === undefined) {
      opacity = 1;
    }
    return !this.props.inline ? (
      React.createElement("g", {fill: this.props.color, style: { opacity: this.props.opacity}}, 
        React.createElement("path", {d: "M0,0l13.9,0v41.1H0L0,0z"}), 
        React.createElement("path", {d: "M18.2,0L29,0l10.7,15.8L50.4,0l10.9,0v41.1H48.1V26.3l-8.4,12.3l-8.4-12.3v14.8H18.2V0z"}), 
        React.createElement("path", {d: "M65.5,0l10.9,0L87,15.8L97.7,0l10.9,0v41.1H95.4V26.3L87,38.7l-8.4-12.3v14.8H65.5V0z"}), 
        React.createElement("path", {
          d: "M128.6,42.2c-2.6,0-4.9-0.3-7-1c-2.1-0.7-3.9-1.6-5.4-3c-1.5-1.3-2.6-3-3.4-5c-0.8-2-1.2-4.4-1.2-7.1V0" + ' ' +
          "l13.1,0v25.6c0,1.4,0.3,2.5,0.9,3.3c0.6,0.8,1.6,1.1,3,1.1c1.4,0,2.4-0.4,3-1.1c0.6-0.8,0.9-1.9,0.9-3.3V0l13.2,0v26.1" + ' ' +
          "c0,2.7-0.4,5.1-1.2,7.1c-0.8,2-2,3.7-3.5,5c-1.5,1.3-3.3,2.3-5.4,3C133.5,41.8,131.2,42.2,128.6,42.2z"}
        ), 
        React.createElement("path", {d: "M155.4,10.8h-7.6V0l28.7,0v10.8h-7.6v30.3h-13.6V10.8z"}), 
        React.createElement("path", {
          d: "M186.4,0l9.9,0l15.6,41.1h-12.9l-1.4-3.7h-12.5l-1.4,3.7h-12.9L186.4,0z M194.1,28.4l-2.8-7.2l-2.8,7.2" + ' ' +
          "H194.1z"}
        ), 
        React.createElement("path", {
          d: "M212.9,0L229,0c2.1,0,3.9,0.2,5.6,0.7c1.7,0.5,3.2,1.2,4.4,2.1s2.2,2.1,2.8,3.5c0.7,1.4,1,3,1,4.8" + ' ' +
          "c0,1.3-0.2,2.4-0.5,3.4c-0.3,0.9-0.7,1.7-1,2.3c-0.5,0.7-1,1.4-1.5,1.8c0.9,0.6,1.7,1.3,2.5,2.2c0.6,0.8,1.2,1.8,1.7,3" + ' ' +
          "c0.5,1.2,0.8,2.7,0.8,4.4c0,2-0.3,3.8-1,5.4c-0.7,1.6-1.7,3-3,4.1c-1.3,1.1-2.9,2-4.7,2.6c-1.9,0.6-4,0.9-6.3,0.9h-16.8V0z" + ' ' +
           "M230.2,12.5c0-1.9-1-2.8-3.1-2.8h-1.5v5.7h1.5C229.2,15.4,230.2,14.4,230.2,12.5z M227.1,31.4c3.1,0,4.7-1.2,4.7-3.6" + ' ' +
          "c0-2.4-1.6-3.6-4.7-3.6h-1.5v7.2H227.1z"}
        ), 
        React.createElement("path", {d: "M248.3,0L262,0v30.3h11.3v10.8h-25V0z"}), 
        React.createElement("path", {d: "M275.3,0l24.2,0v10.8h-11.1v4.6h10.9v10.2h-10.9v4.7H300v10.8h-24.7V0z"})
      )
    ) : (
      React.createElement("g", {fill: this.props.color, style: { opacity: this.props.opacity}}, 
        React.createElement("path", {d: "M0,0l13.9,0v41.1H0L0,0z M7.8,36.2V4.9H6.2v31.3H7.8z"}), 
        React.createElement("path", {
          d: "M18.2,0L29,0l10.7,15.8L50.4,0l10.9,0v41.1H48.1V26.3l-8.4,12.3l-8.4-12.3v14.8H18.2V0z M25.9,36.2V7.9" + ' ' +
          "L39.7,28L53.5,7.9v28.3h1.6V4.9h-1.6L39.7,25.2L25.9,4.9h-1.6v31.3H25.9z"}
        ), 
        React.createElement("path", {
          d: "M65.5,0l10.9,0L87,15.8L97.7,0l10.9,0v41.1H95.4V26.3L87,38.7l-8.4-12.3v14.8H65.5V0z M73.2,36.2V7.9" + ' ' +
          "L87,28l13.7-20.1v28.3h1.6V4.9h-1.6L87,25.2L73.2,4.9h-1.6v31.3H73.2z"}
        ), 
        React.createElement("path", {
          d: "M128.6,42.2c-2.6,0-4.9-0.3-7-1c-2.1-0.7-3.9-1.6-5.4-3c-1.5-1.3-2.6-3-3.4-5c-0.8-2-1.2-4.4-1.2-7.1V0" + ' ' +
          "l13.1,0v25.6c0,1.4,0.3,2.5,0.9,3.3c0.6,0.8,1.6,1.1,3,1.1c1.4,0,2.4-0.4,3-1.1c0.6-0.8,0.9-1.9,0.9-3.3V0l13.2,0v26.1" + ' ' +
          "c0,2.7-0.4,5.1-1.2,7.1c-0.8,2-2,3.7-3.5,5c-1.5,1.3-3.3,2.3-5.4,3C133.5,41.8,131.2,42.2,128.6,42.2z M128.6,34.8" + ' ' +
          "c-6.2,0-9.2-3-9.2-9.1V4.9h-1.6v20.8c0,3.5,0.9,6.1,2.8,7.9c1.9,1.8,4.6,2.7,8,2.7c3.5,0,6.2-0.9,8.1-2.7c1.9-1.8,2.8-4.5,2.8-7.9" + ' ' +
          "V4.9h-1.7v20.8C137.8,31.7,134.8,34.8,128.6,34.8z"}
        ), 
        React.createElement("path", {d: "M155.4,10.8h-7.6V0l28.7,0v10.8h-7.6v30.3h-13.6V10.8z M163,36.2V6.4h8.8V4.9h-19.2v1.5h8.8v29.8H163z"}), 
        React.createElement("path", {
          d: "M186.4,0l9.9,0l15.6,41.1h-12.9l-1.4-3.7h-12.5l-1.4,3.7h-12.9L186.4,0z M180,36.2l1.2-3.1h20.3l1.2,3.1" + ' ' +
          "h1.7L192.5,4.9h-2.3l-11.9,31.3H180z M191.3,6.4l9.6,25.2h-19.2L191.3,6.4z M194.1,28.4l-2.8-7.2l-2.8,7.2H194.1z"}
        ), 
        React.createElement("path", {
          d: "M212.9,0L229,0c2.1,0,3.9,0.2,5.6,0.7c1.7,0.5,3.2,1.2,4.4,2.1s2.2,2.1,2.8,3.5c0.7,1.4,1,3,1,4.8" + ' ' +
          "c0,1.3-0.2,2.4-0.5,3.4c-0.3,0.9-0.7,1.7-1,2.3c-0.5,0.7-1,1.4-1.5,1.8c0.9,0.6,1.7,1.3,2.5,2.2c0.6,0.8,1.2,1.8,1.7,3" + ' ' +
          "c0.5,1.2,0.8,2.7,0.8,4.4c0,2-0.3,3.8-1,5.4c-0.7,1.6-1.7,3-3,4.1c-1.3,1.1-2.9,2-4.7,2.6c-1.9,0.6-4,0.9-6.3,0.9h-16.8V0z" + ' ' +
           "M228,36.2c3.6,0,6.3-0.8,8-2.3c1.7-1.6,2.6-3.6,2.6-6.2c0-1.7-0.4-3-1.1-4c-0.7-1-1.5-1.8-2.3-2.4c-1-0.7-2.2-1.1-3.4-1.4" + ' ' +
          "c1-0.3,1.9-0.7,2.7-1.4c0.7-0.5,1.3-1.3,1.9-2.2s0.8-2.1,0.8-3.5c0-2.6-0.8-4.5-2.5-5.9c-1.6-1.3-3.9-2-6.7-2h-8.9v31.3H228z" + ' ' +
           "M220.7,19.1V6.4l7.3,0c2.7,0,4.6,0.6,5.8,1.8c1.2,1.2,1.8,2.7,1.8,4.6c0,1.9-0.6,3.4-1.8,4.6c-1.2,1.2-3.1,1.8-5.8,1.8H220.7z" + ' ' +
           "M220.7,34.7V20.6h7.2c1.3,0,2.5,0.1,3.5,0.4c1.1,0.3,2,0.7,2.9,1.2c0.8,0.6,1.5,1.3,1.9,2.2c0.5,0.9,0.7,2,0.7,3.2" + ' ' +
          "c0,2.5-0.8,4.3-2.5,5.4c-1.7,1.1-3.9,1.7-6.6,1.7H220.7z M230.2,12.5c0-1.9-1-2.8-3.1-2.8h-1.5v5.7h1.5" + ' ' +
          "C229.2,15.4,230.2,14.4,230.2,12.5z M227.1,31.4c3.1,0,4.7-1.2,4.7-3.6c0-2.4-1.6-3.6-4.7-3.6h-1.5v7.2H227.1z"}
        ), 
        React.createElement("path", {d: "M248.3,0L262,0v30.3h11.3v10.8h-25V0z M269.9,36.2v-1.5h-13.8V4.9h-1.6v31.3H269.9z"}), 
        React.createElement("path", {
          d: "M275.3,0l24.2,0v10.8h-11.1v4.6h10.9v10.2h-10.9v4.7H300v10.8h-24.7V0z M295.4,36.2v-1.5h-12.3V21.2h11.7" + ' ' +
          "v-1.5h-11.7V6.4h12.3V4.9h-13.9v31.3H295.4z"}
        )
      )
    );
  },
});

module.exports = Logo;

},{"react":"react"}],6:[function(require,module,exports){
var React = require('react');

var SVGSet = React.createClass({displayName: "SVGSet",
  render: function () {
    return (
      React.createElement("svg", {className: "svg", style: this.props.style, viewBox: "0 0 300 42.2"}, 
        this.props.children
      )
    );
  },
});

module.exports = SVGSet;

},{"react":"react"}],7:[function(require,module,exports){
var React = require('react');
var loadJSON = require('./loadJSON');

// API endpoints
// https://registry.npmjs.org/immutable/latest
// https://api.github.com/repos/immutable-js/immutable-js

var StarBtn = React.createClass({displayName: "StarBtn",
  getInitialState: function () {
    return { stars: null };
  },

  componentDidMount: function () {
    loadJSON(
      'https://api.github.com/repos/immutable-js/immutable-js',
      function(value)  {
        value &&
          value.stargazers_count &&
          this.setState({ stars: value.stargazers_count });
      }.bind(this)
    );
  },

  render: function () {
    return (
      React.createElement("span", {className: "github-btn"}, 
        React.createElement("a", {
          className: "gh-btn", 
          id: "gh-btn", 
          href: "https://github.com/immutable-js/immutable-js/"
        }, 
          React.createElement("span", {className: "gh-ico"}), 
          React.createElement("span", {className: "gh-text"}, "Star")
        ), 
        this.state.stars && React.createElement("span", {className: "gh-triangle"}), 
        this.state.stars && (
          React.createElement("a", {
            className: "gh-count", 
            href: "https://github.com/immutable-js/immutable-js/stargazers"
          }, 
            this.state.stars
          )
        )
      )
    );
  },
});

module.exports = StarBtn;

},{"./loadJSON":8,"react":"react"}],"/home/runner/work/immutable-js/immutable-js/pages/src/src/index.js":[function(require,module,exports){
var React = require('react');
var Header = require('./Header');
var readme = require('../../generated/readme.json');

require('../../lib/runkit-embed');

var Index = React.createClass({displayName: "Index",
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement(Header, null), 
        React.createElement("div", {className: "pageBody", id: "body"}, 
          React.createElement("div", {className: "contents"}, 
            React.createElement("div", {dangerouslySetInnerHTML: { __html: readme}})
          )
        )
      )
    );
  },
});

module.exports = Index;

},{"../../generated/readme.json":2,"../../lib/runkit-embed":3,"./Header":4,"react":"react"}],8:[function(require,module,exports){
module.exports = loadJSON;

function loadJSON(url, then) {
  var oReq = new XMLHttpRequest();
  oReq.onload = function(event)  {
    var json;
    try {
      json = JSON.parse(event.target.responseText);
    } catch (e) {
      // ignore error
    }
    then(json);
  };
  oReq.open('get', url, true);
  oReq.send();
}

},{}],"immutable":[function(require,module,exports){
(function (global){(function (){
module.exports = global.Immutable;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"react":[function(require,module,exports){
(function (global){(function (){
module.exports = global.React;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},["/home/runner/work/immutable-js/immutable-js/pages/src/src/index.js"])

//# sourceMappingURL=maps/bundle.js.map
