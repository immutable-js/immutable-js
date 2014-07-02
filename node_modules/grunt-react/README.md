# grunt-react

[![Build Status](https://travis-ci.org/ericclemmons/grunt-react.png?branch=master)](https://travis-ci.org/ericclemmons/grunt-react)
[![Dependencies](https://david-dm.org/ericclemmons/grunt-react.png)](https://david-dm.org/ericclemmons/grunt-react)
[![devDependencies](https://david-dm.org/ericclemmons/grunt-react/dev-status.png)](https://david-dm.org/ericclemmons/grunt-react#info=devDependencies&view=table)


> Grunt task for compiling [Facebook React](http://facebook.github.io/react/)'s JSX templates into JavaScript.

It also works great with `grunt-browserify`!

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-react --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-react');
```

## The "react" task

### Overview
In your project's Gruntfile, add a section named `react` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  react: {
    single_file_output: {
      files: {
        'path/to/output/dir/output.js': 'path/to/jsx/templates/dir/input.jsx'
      }
    },
    combined_file_output: {
      files: {
        'path/to/output/dir/combined.js': [
          'path/to/jsx/templates/dir/input1.jsx',
          'path/to/jsx/templates/dir/input2.jsx'
        ]
      }
    },
    dynamic_mappings: {
      files: [
        {
          expand: true,
          cwd: 'path/to/jsx/templates/dir',
          src: ['**/*.jsx'],
          dest: 'path/to/output/dir',
          ext: '.js'
        }
      ]
    }
  },
})
```

- - -

### Recommended Usage
Writing your applications in CommonJS format will allow you to use [Browserify](http://browserify.org/) to
concatenate your files.  Plus, with `grunt-react`, your templates will be converted from JSX to JS *automatically*!

First, install `grunt-browserify` to your project:

```shell
npm install grunt-browserify --save-dev
```

Second, register `grunt-browserify` in your Gruntfile:

```js
grunt.loadNpmTasks('grunt-browserify')
```

Finally, add the following task to your Gruntfile:

```js
browserify:     {
  options:      {
    transform:  [ require('grunt-react').browserify ]
  },
  app:          {
    src:        'path/to/source/main.js',
    dest:       'path/to/target/output.js'
  }
}
```

You've successfully concatenated your JSX & JS files into one file!


### Options

#### options.extension
Type: `String`
Default value: `js`

Extension of files to search for JSX-syntax & convert to JS.

#### options.ignoreMTime
Type: `Boolean`
Default value: `false`

Speed up compilation of JSX files by skipping files not modified since last pass.

- - -

### Usage Examples

#### Recommended Options

I recommend naming your React Components with the `.jsx` extension:

```js
/**
 * @jsx React.DOM
 */

var MyComponent = React.createClass({
  ...
  render: function() {
    return (
      <p>Howdy</p>
    );
  }
});
```

Then, set your Gruntfile to use:

```js
grunt.initConfig({
  react: {
    files: {
      expand: true,
      cwd: 'path/to/jsx/templates/dir',
      src: ['**/*.jsx'],
      dest: 'path/to/output/dir',
      ext: '.js'
    }
  },
})
```

This will output the following:

```js
/**
 * @jsx React.DOM
 */

var MyComponent = React.createClass({displayName: 'MyComponent',
  render: function() {
    return (
      React.DOM.p(null, "Howdy")
    );
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

- v0.8.2
  - Emit `react.error` for Growl & other notifications ([#23](https://github.com/ericclemmons/grunt-react/pull/23))
- v0.8.1
  - Throw a proper error when React fails ([#25](https://github.com/ericclemmons/grunt-react/pull/25))
- v0.8.0
  - Update to React v0.10.0 ([#27](https://github.com/ericclemmons/grunt-react/pull/27))
- v0.7.0
  - Update to React v0.9.0 ([#24](https://github.com/ericclemmons/grunt-react/pull/24))
- v0.6.0
  - Task changes to allow for flexible file options as found in the `grunt-contrib-*` projects.
  - Taking hints from `grunt-contrib-less` to allow for compiling single files separately, dynamic mappings and combining.
  - Removed `extension` option as this is determined by flexible file matching now.
  - Removed MT time ignoring, this can be easily done with the `grunt-newer` plugin.
  - Errors are ignored and skipped by default to match how other grunt plugins work.
- v0.5.2
  - `grunt.fail` instead of throwing an error ([#11](https://github.com/ericclemmons/grunt-react/pull/11))
- v0.5.1
  - Add file name to errors ([#15](https://github.com/ericclemmons/grunt-react/pull/15))
- v0.5.0
  - Update to `react-tools` `~v0.5.0`
- v0.4.1
  - Add logging to make it easier catch errors, thanks to @lorefnon ([#5](https://github.com/ericclemmons/grunt-react/pull/5))
- v0.4.0
  - Update to react-tools ~0.4.0, thanks to @Agent-H ([#3](https://github.com/ericclemmons/grunt-react/pull/3))
- v0.3.0
  - No longer uses `bin/jsx`, thanks to @petehunt ([#2](https://github.com/ericclemmons/grunt-react/pull/2))
- Add `ignoreMTime` option
- v0.2.0
  - Add `require('grunt-react').browserify()` and `require('grunt-react').source()` for compiling within Node
- v0.1.0
  - Initial release


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/ericclemmons/grunt-react/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

