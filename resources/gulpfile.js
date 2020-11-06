/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const browserify = require('browserify');
const browserSync = require('browser-sync');
const buffer = require('vinyl-buffer');
const concat = require('gulp-concat');
const del = require('del');
const filter = require('gulp-filter');
const fs = require('fs');
const { parallel, series, src, dest, watch } = require('gulp');
const gutil = require('gulp-util');
const Immutable = require('../');
const gulpLess = require('gulp-less');
const mkdirp = require('mkdirp');
const path = require('path');
const React = require('react/addons');
const reactTools = require('react-tools');
const size = require('gulp-size');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const through = require('through2');
const uglify = require('gulp-uglify');
const vm = require('vm');

function requireFresh(path) {
  delete require.cache[require.resolve(path)];
  return require(path);
}

const SRC_DIR = '../pages/src/';
const BUILD_DIR = '../pages/out/';

function clean() {
  return del([BUILD_DIR], { force: true });
}

function readme(done) {
  const genMarkdownDoc = requireFresh('../pages/lib/genMarkdownDoc');

  const readmePath = path.join(__dirname, '../README.md');

  const fileContents = fs.readFileSync(readmePath, 'utf8');

  const writePath = path.join(__dirname, '../pages/generated/readme.json');
  const contents = JSON.stringify(genMarkdownDoc(fileContents));

  mkdirp.sync(path.dirname(writePath));
  fs.writeFileSync(writePath, contents);
  done();
}

function typedefs(done) {
  const genTypeDefData = requireFresh('../pages/lib/genTypeDefData');

  const typeDefPath = path.join(
    __dirname,
    '../type-definitions/Immutable.d.ts'
  );

  const fileContents = fs.readFileSync(typeDefPath, 'utf8');

  const fileSource = fileContents.replace(
    "module 'immutable'",
    'module Immutable'
  );

  const writePath = path.join(__dirname, '../pages/generated/immutable.d.json');
  const contents = JSON.stringify(genTypeDefData(typeDefPath, fileSource));

  mkdirp.sync(path.dirname(writePath));
  fs.writeFileSync(writePath, contents);
  done();
}

function js() {
  return gulpJS('');
}

function jsDocs() {
  return gulpJS('docs/');
}

function gulpJS(subDir) {
  const reactGlobalModulePath = path.relative(
    path.resolve(SRC_DIR + subDir),
    path.resolve('./react-global.js')
  );
  const immutableGlobalModulePath = path.relative(
    path.resolve(SRC_DIR + subDir),
    path.resolve('./immutable-global.js')
  );
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
      .pipe(uglify())
      .pipe(sourcemaps.write('./maps'))
      .pipe(dest(BUILD_DIR + subDir))
      .pipe(filter('**/*.js'))
      .pipe(size({ showFiles: true }))
      .on('error', handleError)
  );
}

function preRender() {
  return gulpPreRender('');
}

function preRenderDocs() {
  return gulpPreRender('docs/');
}

function gulpPreRender(subDir) {
  return src(SRC_DIR + subDir + 'index.html')
    .pipe(reactPreRender(subDir))
    .pipe(size({ showFiles: true }))
    .pipe(dest(BUILD_DIR + subDir))
    .on('error', handleError);
}

function less() {
  return gulpLessTask('');
}

function lessDocs() {
  return gulpLessTask('docs/');
}

function gulpLessTask(subDir) {
  return src(SRC_DIR + subDir + 'src/*.less')
    .pipe(sourcemaps.init())
    .pipe(
      gulpLess({
        compress: true,
      })
    )
    .on('error', handleError)
    .pipe(concat('bundle.css'))
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest(BUILD_DIR + subDir))
    .pipe(filter('**/*.css'))
    .pipe(size({ showFiles: true }))
    .pipe(browserSync.reload({ stream: true }))
    .on('error', handleError);
}

function statics() {
  return gulpStatics('');
}

function staticsDocs() {
  return gulpStatics('docs/');
}

function gulpStatics(subDir) {
  return src(SRC_DIR + subDir + 'static/**/*')
    .pipe(dest(BUILD_DIR + subDir + 'static'))
    .on('error', handleError)
    .pipe(browserSync.reload({ stream: true }))
    .on('error', handleError);
}

function immutableCopy() {
  return src(SRC_DIR + '../../dist/immutable.js')
    .pipe(dest(BUILD_DIR))
    .on('error', handleError)
    .pipe(browserSync.reload({ stream: true }))
    .on('error', handleError);
}

const build = parallel(
  typedefs,
  readme,
  series(js, jsDocs, less, lessDocs, immutableCopy, statics, staticsDocs),
  series(preRender, preRenderDocs)
);

const defaultTask = series(clean, build);

// watch files for changes and reload
function watchFiles() {
  browserSync({
    port: 8040,
    server: {
      baseDir: BUILD_DIR,
    },
  });

  watch('../README.md', build);
  watch('../pages/lib/**/*.js', build);
  watch('../pages/src/**/*.less', series(less, lessDocs));
  watch('../pages/src/src/**/*.js', rebuildJS);
  watch('../pages/src/docs/src/**/*.js', rebuildJSDocs);
  watch('../pages/src/**/*.html', series(preRender, preRenderDocs));
  watch('../pages/src/static/**/*', series(statics, staticsDocs));
  watch('../type-definitions/*', parallel(typedefs, rebuildJSDocs));
}

const dev = series(defaultTask, watchFiles);

function rebuildJS(done) {
  parallel(js, preRender, () => {
    browserSync.reload();
    done();
  });
}

function rebuildJSDocs(done) {
  parallel(jsDocs, preRenderDocs, () => {
    browserSync.reload();
    done();
  });
}

function handleError(error) {
  gutil.log(error.message);
}

function reactPreRender(subDir) {
  return through.obj(function (file, enc, cb) {
    let src = file.contents.toString(enc);
    const components = [];
    src = src.replace(
      /<!--\s*React\(\s*(.*)\s*\)\s*-->/g,
      (_, relComponent) => {
        const id = 'r' + components.length;
        const component = path.resolve(SRC_DIR + subDir, relComponent);
        components.push(component);
        try {
          return (
            '<div id="' +
            id +
            '">' +
            vm.runInNewContext(
              fs.readFileSync(BUILD_DIR + subDir + 'bundle.js') + // ugly
                '\nrequire("react").renderToString(' +
                'require("react").createElement(require(component)))',
              {
                global: {
                  React: React,
                  Immutable: Immutable,
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
      }
    );
    if (components.length) {
      src = src.replace(
        /<!--\s*ReactRender\(\)\s*-->/g,
        '<script>' +
          components.map((component, index) => {
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

    file.contents = Buffer.from(src, enc);
    this.push(file);
    cb();
  });
}

function reactTransformify(filePath) {
  if (path.extname(filePath) !== '.js') {
    return through();
  }
  let code = '';
  let parseError;
  return through.obj(
    (file, enc, cb) => {
      code += file;
      cb();
    },
    function (done) {
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

exports.dev = dev;
exports.default = defaultTask;
