/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var browserify = require('browserify');
var browserSync = require('browser-sync');
var buffer = require('vinyl-buffer');
var child_process = require('child_process');
var concat = require('gulp-concat');
var del = require('del');
var filter = require('gulp-filter');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var header = require('gulp-header');
var Immutable = require('../');
var less = require('gulp-less');
var mkdirp = require('mkdirp');
var path = require('path');
var React = require('react/addons');
var reactTools = require('react-tools');
var sequence = require('run-sequence');
var size = require('gulp-size');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var through = require('through2');
var uglify = require('gulp-uglify');
var vm = require('vm');
var rename = require('gulp-rename');
var semver = require('semver');
var childProcess = require('child-process-promise');
var markdownDocs = require('../pages/lib/markdownDocs');

function requireFresh(path) {
  delete require.cache[require.resolve(path)];
  return require(path);
}

var SRC_DIR = '../pages/src/';
var BUILD_DIR = '../pages/out/';

gulp.task('clean', function(done) {
  return del([BUILD_DIR], { force: true });
});

gulp.task('readme', function() {
  var genMarkdownDoc = requireFresh('../pages/lib/genMarkdownDoc');

  var readmePath = path.join(__dirname, '../README.md');

  var fileContents = fs.readFileSync(readmePath, 'utf8');

  var writePath = path.join(__dirname, '../pages/generated/readme.json');
  var contents = JSON.stringify(genMarkdownDoc(fileContents));

  mkdirp.sync(path.dirname(writePath));
  fs.writeFileSync(writePath, contents);
});

gulp.task('typedefs', function() {
  mkdirp.sync('../pages/generated/type-definitions');

  var result = ''

  var latestTag;

  return childProcess.exec("git tag").then(function(result) {
    var tags = result.stdout.split("\n")
      .filter(function(tag) { return semver.valid(tag) })
      .sort(function(tagA, tagB) { return semver.compare(tagA, tagB) });

    latestTag = tags[tags.length - 1];
  
    var tagsObj = {};
  
    tags.forEach(function (tag) {
      if (!semver.prerelease(tag)) {
        tagsObj[semver.major(tag) + '.' + semver.minor(tag)] = tag;
      }
    });
  
    tagsObj[latestTag] = latestTag;
  
    return Promise.all(Object.entries(tagsObj).map(function (tagEntry) {
      var docName = tagEntry[0];
      var tag = tagEntry[1];

      return childProcess
        .exec("git show " + tag + ":" + "type-definitions/Immutable.d.ts")
        .then(function (result) {
          const defPath = '../pages/generated/type-definitions/Immutable' +
           (docName !== latestTag ? '-' + docName : '') +
           '.d.ts';
          fs.writeFileSync(defPath, result.stdout, 'utf8');
          return [docName, {
            path: defPath,
            tag: tag,
          }];
        });
    }));
  }).then(function(tagEntries) {
    var genTypeDefData = requireFresh('../pages/lib/genTypeDefData');

    tagEntries.forEach(function (tagEntry) {
      var docName = tagEntry[0];
      var typeDefPath = tagEntry[1].path;
      var tag = tagEntry[1].tag;
      var fileContents = fs.readFileSync(typeDefPath, 'utf8');

      var fileSource = fileContents.replace(
        "module 'immutable'",
        'module Immutable'
      );

      var writePath = path.join(
          __dirname,
          '../pages/generated/immutable' +
          (docName !== latestTag ? '-' + docName : '') +
          '.d.json'
      );

      try {
        var defs = genTypeDefData(typeDefPath, fileSource);
        markdownDocs(defs);
        defs.Immutable.version = /^v?(.*)/.exec(tag)[1];
        var contents = JSON.stringify(defs);


        mkdirp.sync(path.dirname(writePath));
        fs.writeFileSync(writePath, contents);
      } catch(e) {
        console.error('Unable to build verion ' + docName + ':');
        console.error(e.message);
      }
    });
  });
});

gulp.task('js', gulpJS(''));
gulp.task('js-docs', gulpJS('docs/'));

function gulpJS(subDir) {
  var reactGlobalModulePath = path.relative(
    path.resolve(SRC_DIR + subDir),
    path.resolve('./react-global.js')
  );
  var immutableGlobalModulePath = path.relative(
    path.resolve(SRC_DIR + subDir),
    path.resolve('./immutable-global.js')
  );
  return function() {
    return (
      browserify({
        debug: true,
        basedir: SRC_DIR + subDir,
      })
        .add('./src/index.js')
        .require('./src/index.js')
        .require(reactGlobalModulePath, { expose: 'react' })
        .require(immutableGlobalModulePath, { expose: 'immutable' })
        // Helpful when developing with no wifi
        // .require('react', { expose: 'react' })
        // .require('immutable', { expose: 'immutable' })
        .transform(reactTransformify)
        .bundle()
        .on('error', handleError)
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(
          sourcemaps.init({
            loadMaps: true,
          })
        )
        //.pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(BUILD_DIR + subDir))
        .pipe(filter('**/*.js'))
        .pipe(size({ showFiles: true }))
        .on('error', handleError)
    );
  };
}

gulp.task('pre-render', gulpPreRender({
  html: 'index.html',
  src: 'readme.json',
}));
gulp.task('pre-render-docs', gulpPreRender({
  html: 'docs/index.html',
  src: 'immutable.d.json',
}));
gulp.task('pre-render-versioned', gulpPreRender({
  html: 'index.html',
  src: 'readme-*.json',
}));
gulp.task('pre-render-versioned-docs', gulpPreRender({
  html: 'docs/index.html',
  src: 'immutable-*.d.json',
}));

function gulpPreRender(options) {
  return function() {
    return gulp
      .src(path.join('../pages/generated', options.src))
      .pipe(preRender(options.html))
      .pipe(size({ showFiles: true }))
      .pipe(rename(function (path) {
        var suffix = "";
        var match;
        if (match = /-(\d+\.\d+)\.d$/.exec(path.basename)) {
          suffix = match[1];
        }
        path.basename = suffix || 'index';
        path.extname = '.html';
      }))
      .pipe(gulp.dest(path.join(BUILD_DIR, path.dirname(options.html))))
      .on('error', handleError);
  };
}

gulp.task('less', gulpLess(''));
gulp.task('less-docs', gulpLess('docs/'));

function gulpLess(subDir) {
  return function() {
    return gulp
      .src(SRC_DIR + subDir + 'src/*.less')
      .pipe(sourcemaps.init())
      .pipe(
        less({
          compress: true,
        })
      )
      .on('error', handleError)
      .pipe(concat('bundle.css'))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(BUILD_DIR + subDir))
      .pipe(filter('**/*.css'))
      .pipe(size({ showFiles: true }))
      .pipe(browserSync.reload({ stream: true }))
      .on('error', handleError);
  };
}

gulp.task('statics', gulpStatics(''));
gulp.task('statics-docs', gulpStatics('docs/'));

function gulpStatics(subDir) {
  return function() {
    return gulp
      .src(SRC_DIR + subDir + 'static/**/*')
      .pipe(gulp.dest(BUILD_DIR + subDir + 'static'))
      .on('error', handleError)
      .pipe(browserSync.reload({ stream: true }))
      .on('error', handleError);
  };
}

gulp.task('immutable-copy', function() {
  return gulp
    .src('../dist/immutable.js')
    .pipe(gulp.dest(BUILD_DIR))
    .on('error', handleError)
    .pipe(browserSync.reload({ stream: true }))
    .on('error', handleError);
});

function gulpJsonp() {
  return through.obj(function(file, enc, cb) {
    var jsonp = 'window.data = JSON.parse(' + JSON.stringify(file.contents.toString()) + ');';
    file.contents = new Buffer(jsonp, enc);
    this.push(file);
    cb();
  });
}

gulp.task('jsonp-defs', function() {
  return gulp
    .src(['../pages/generated/immutable-*.d.json', '../pages/generated/immutable.d.json'])
    .pipe(gulpJsonp())
    .pipe(rename(function(path) {
      path.extname = ".jsonp";
    }))
    .pipe(gulp.dest(path.join(BUILD_DIR, "docs/defs")))
    .on('error', handleError)
    .pipe(browserSync.reload({ stream: true }))
    .on('error', handleError);
});

gulp.task('build', function(done) {
  sequence(
    ['typedefs'],
    ['readme'],
    [
      'js',
      'js-docs',
      'jsonp-defs',
      'less',
      'less-docs',
      'immutable-copy',
      'statics',
      'statics-docs',
    ],
    [
      'pre-render',
      'pre-render-docs',
      'pre-render-versioned',
      'pre-render-versioned-docs'
    ],
    done
  );
});

gulp.task('default', function(done) {
  sequence('clean', 'build', done);
});

// watch files for changes and reload
gulp.task('dev', ['default'], function() {
  browserSync({
    port: 8040,
    server: {
      baseDir: BUILD_DIR,
    },
  });

  gulp.watch('../README.md', ['build']);
  gulp.watch('../pages/lib/**/*.js', ['build']);
  gulp.watch('../pages/src/**/*.less', ['less', 'less-docs']);
  gulp.watch('../pages/src/src/**/*.js', ['rebuild-js']);
  gulp.watch('../pages/src/docs/src/**/*.js', ['rebuild-js-docs']);
  gulp.watch('../pages/src/**/*.html', ['pre-render', 'pre-render-docs']);
  gulp.watch('../pages/src/static/**/*', ['statics', 'statics-docs']);
  gulp.watch('../type-definitions/*', function() {
    sequence('typedefs', 'rebuild-js-docs');
  });
});

gulp.task('rebuild-js', function(done) {
  sequence('js', ['pre-render'], function() {
    browserSync.reload();
    done();
  });
});

gulp.task('rebuild-js-docs', function(done) {
  sequence('js-docs', ['pre-render-docs'], function() {
    browserSync.reload();
    done();
  });
});

function handleError(error) {
  gutil.log(error.message);
}

function preRender(htmlPath) {
  var srcHtml = fs.readFileSync(path.join('../pages/src', htmlPath), 'utf8');
  var subDir = path.dirname(htmlPath);

  return through.obj(function(file, enc, cb) {
    var data = JSON.parse(file.contents.toString(enc));
    markdownDocs(data);
    var components = [];

    var suffixMatch = /-\d+\.\d+(?=\.d\.json)/.exec(file.path);
    var suffix = suffixMatch ? suffixMatch[0] : '';

    var html = srcHtml.replace(/<!--\s*React\(\s*(.*?)\s*\)\s*-->/g, function(
      _,
      relComponent
    ) {
      var id = 'r' + components.length;
      var component = path.resolve(SRC_DIR, subDir, relComponent);
      components.push(component);
      try {
        return (
          '<div id="' +
          id +
          '">' +
          vm.runInNewContext(
            fs.readFileSync(path.join(BUILD_DIR, subDir, 'bundle.js')) + // ugly
              '\nrequire("react").renderToString(' +
              'require("react").createElement(require(component)))',
            {
              global: {
                React: React,
                Immutable: Immutable,
                data: data,
              },
              window: {},
              component: component,
              console: console,
            }
          ) +
          '</div>'
        );
      } catch (error) {
        return '<div id="' + id + '">' + error.message + '</div>';
      }
    }).replace(
      "<!-- JSONP(defs/immutable.d.jsonp) -->",
      '<script src="defs/immutable' + suffix + '.d.jsonp"></script>'
    );

    if (components.length) {
      html = html.replace(
        /<!--\s*ReactRender\(\)\s*-->/g,
        '<script>' +
          components.map(function(component, index) {
            return (
              'var React = require("react");' +
              'React.render(' +
              'React.createElement(require("' +
              component +
              '")),' +
              'document.getElementById("r' +
              index +
              '")' +
              ');'
            );
          }) +
          '</script>'
      );
    }
    file.contents = new Buffer(html, enc);
    this.push(file);
    cb();
  });
}

function reactTransform() {
  var parseError;
  return through.obj(
    function(file, enc, cb) {
      if (path.extname(file.path) !== '.js') {
        this.push(file);
        return cb();
      }
      try {
        file.contents = new Buffer(
          reactTools.transform(file.contents.toString(enc), { harmony: true }),
          enc
        );
        this.push(file);
        cb();
      } catch (error) {
        parseError = new gutil.PluginError('transform', {
          message: file.relative + ' : ' + error.message,
          showStack: false,
        });
        cb();
      }
    },
    function(done) {
      parseError && this.emit('error', parseError);
      done();
    }
  );
}

function reactTransformify(filePath) {
  if (path.extname(filePath) !== '.js') {
    return through();
  }
  var code = '';
  var parseError;
  return through.obj(
    function(file, enc, cb) {
      code += file;
      cb();
    },
    function(done) {
      try {
        this.push(reactTools.transform(code, { harmony: true }));
      } catch (error) {
        parseError = new gutil.PluginError('transform', {
          message: error.message,
          showStack: false,
        });
      }
      parseError && this.emit('error', parseError);
      done();
    }
  );
}
