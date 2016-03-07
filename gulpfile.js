require("harmonize")();

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
var Immutable = require('./');
var jest = require('gulp-jest');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var path = require('path');
var React = require('react/addons');
var reactTools = require('react-tools');
var sequence = require('run-sequence');
var size = require('gulp-size');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var stylish = require('jshint-stylish');
var through = require('through2');
var uglify = require('gulp-uglify');
var vm = require('vm');


var SRC_DIR = './pages/src/';
var BUILD_DIR = './pages/out/';

gulp.task('clean', function (done) {
  return del([
    BUILD_DIR,
  ], {force: true});
});

gulp.task('readme', function() {
  var genMarkdownDoc = require('./pages/lib/genMarkdownDoc');

  var readmePath = path.join(__dirname, './README.md');

  var fileContents = fs.readFileSync(readmePath, 'utf8');

  var writePath = path.join(__dirname, './pages/resources/readme.json');
  var contents = JSON.stringify(genMarkdownDoc(fileContents));

  fs.writeFileSync(writePath, contents);
});

gulp.task('typedefs', function() {
  var genTypeDefData = require('./pages/lib/genTypeDefData');

  var typeDefPath = path.join(__dirname, './type-definitions/Immutable.d.ts');

  var fileContents = fs.readFileSync(typeDefPath, 'utf8');

  var fileSource = fileContents.replace(
    'module \'immutable\'',
    'module Immutable'
  );

  var writePath = path.join(__dirname, './pages/resources/immutable.d.json');
  var contents = JSON.stringify(genTypeDefData(typeDefPath, fileSource));

  fs.writeFileSync(writePath, contents);

  var nonAmbientSource = fileContents
    .replace(
      /declare\s+module\s+Immutable\s*\{/,
      '')
    .replace(
      /\}[\s\n\r]*declare\s+module\s*.immutable.[\s\n\r]*{[\s\n\r]*export\s*=\s*Immutable[\s\n\r]*\}/m,
    '');
  var distPath = path.join(__dirname, 'dist');
  try { fs.mkdirSync(distPath); } catch (x) { }
  var nonAmbientPath = path.join(distPath, 'immutable-nonambient.d.ts');
  fs.writeFileSync(nonAmbientPath, nonAmbientSource);

});

gulp.task('lint', function() {
  return gulp.src('./app/**/*.js')
    .pipe(reactTransform())
    .on('error', handleError)
    .pipe(jshint({
      asi: true,
      browser: true,
      curly: false,
      eqeqeq: true,
      eqnull: true,
      esnext: true,
      expr: true,
      forin: true,
      freeze: true,
      immed: true,
      indent: 2,
      iterator: true,
      newcap: false,
      noarg: true,
      node: true,
      noempty: true,
      nonstandard: true,
      trailing: true,
      undef: true,
      unused: 'vars',
    }))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
    .on('error', handleError);
});

gulp.task('test', function () {
  return gulp.src('./')
    .pipe(jest({
      scriptPreprocessor: './resources/jestPreprocessor.js',
      unmockedModulePathPatterns: ['./node_modules/react'],
    }))
    .on('error', handleError);
});

gulp.task('js', gulpJS(''));
gulp.task('js-docs', gulpJS('docs/'));

function gulpJS(subDir) {
  var reactGlobalModulePath = path.relative(
    path.resolve(SRC_DIR+subDir),
    path.resolve('./resources/react-global.js')
  );
  var immutableGlobalModulePath = path.relative(
    path.resolve(SRC_DIR+subDir),
    path.resolve('./resources/immutable-global.js')
  );
  return function() {
    return browserify({
        debug: true,
        basedir: SRC_DIR+subDir,
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
      .pipe(sourcemaps.init({
        loadMaps: true,
      }))
      .pipe(uglify())
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(BUILD_DIR+subDir))
      .pipe(filter('**/*.js'))
      .pipe(size({ showFiles: true }))
      .on('error', handleError);
  }
}

gulp.task('pre-render', gulpPreRender(''));
gulp.task('pre-render-docs', gulpPreRender('docs/'));

function gulpPreRender(subDir) {
  return function () {
    return gulp.src(SRC_DIR+subDir+'index.html')
      .pipe(preRender(subDir))
      .pipe(size({ showFiles: true }))
      .pipe(gulp.dest(BUILD_DIR+subDir))
      .on('error', handleError);
  }
}

gulp.task('less', gulpLess(''));
gulp.task('less-docs', gulpLess('docs/'));

function gulpLess(subDir) {
  return function () {
    return gulp.src(SRC_DIR+subDir+'src/*.less')
      .pipe(sourcemaps.init())
      .pipe(less({
        compress: true
      }))
      .on('error', handleError)
      .pipe(concat('bundle.css'))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(BUILD_DIR+subDir))
      .pipe(filter('**/*.css'))
      .pipe(size({ showFiles: true }))
      .pipe(browserSync.reload({ stream:true }))
      .on('error', handleError);
  }
}

gulp.task('statics', gulpStatics(''));
gulp.task('statics-docs', gulpStatics('docs/'));

function gulpStatics(subDir) {
  return function() {
    return gulp.src(SRC_DIR+subDir+'static/**/*')
      .pipe(gulp.dest(BUILD_DIR+subDir+'static'))
      .on('error', handleError)
      .pipe(browserSync.reload({ stream:true }))
      .on('error', handleError);
  }
}

gulp.task('build', function (done) {
  sequence(
    ['typedefs'],
    ['readme'],
    ['js', 'js-docs', 'less', 'less-docs', 'statics', 'statics-docs'],
    ['pre-render', 'pre-render-docs'],
    done
  );
});

gulp.task('default', function (done) {
  sequence('clean', 'lint', /*'test',*/ 'build', done);
});

// watch files for changes and reload
gulp.task('dev', ['default'], function() {
  browserSync({
    port: 8040,
    server: {
      baseDir: BUILD_DIR
    }
  });

  gulp.watch('./app/**/*.less', ['less', 'less-docs']);
  gulp.watch('./app/src/**/*.js', ['rebuild-js']);
  gulp.watch('./app/docs/src/**/*.js', ['rebuild-js-docs']);
  gulp.watch('./app/**/*.html', ['pre-render', 'pre-render-docs']);
  gulp.watch('./app/static/**/*', ['statics', 'statics-docs']);
});

gulp.task('rebuild-js', function (done) {
  sequence('lint', 'js', /*'test',*/ ['pre-render'], function () {
    browserSync.reload();
    done();
  });
});

gulp.task('rebuild-js-docs', function (done) {
  sequence('lint', 'js-docs', /*'test',*/ ['pre-render-docs'], function () {
    browserSync.reload();
    done();
  });
});

function handleError(error) {
  gutil.log(error.message);
}

function preRender(subDir) {
  return through.obj(function(file, enc, cb) {
    var src = file.contents.toString(enc);
    var components = [];
    src = src.replace(
      /<!--\s*React\(\s*(.*)\s*\)\s*-->/g,
      function (_, component) {
        var id = 'r' + components.length;
        components.push(component);
        try {
          return (
            '<div id="' + id + '">'+
            vm.runInNewContext(
              fs.readFileSync(BUILD_DIR+subDir+'bundle.js') + // ugly
              '\nrequire("react").renderToString('+
              'require("react").createElement(require(component)))',
              {
                global: {
                  React: React,
                  Immutable: Immutable
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
        '<script>' + components.map(function (component, index) {
          return (
            'var React = require("react");'+
            'React.render('+
              'React.createElement(require("'+component+'")),'+
              'document.getElementById("r' + (index) + '")'+
            ');'
          );
        }) + '</script>'
      );
    }
    file.contents = new Buffer(src, enc);
    this.push(file);
    cb();
  });
}

function reactTransform() {
  var parseError;
  return through.obj(function(file, enc, cb) {
    if (path.extname(file.path) !== '.js') {
      this.push(file);
      return cb();
    }
    try {
      file.contents = new Buffer(reactTools.transform(
        file.contents.toString(enc),
        {harmony: true}
      ), enc);
      this.push(file);
      cb();
    } catch (error) {
      parseError = new gutil.PluginError('transform', {
        message: file.relative + ' : ' + error.message,
        showStack: false
      });
      cb();
    }
  }, function (done) {
    parseError && this.emit('error', parseError);
    done();
  });
}


function reactTransformify(filePath) {
  if (path.extname(filePath) !== '.js') {
    return through();
  }
  var code = '';
  var parseError;
  return through.obj(function(file, enc, cb) {
    code += file;
    cb();
  }, function (done) {
    try {
      this.push(reactTools.transform(code, {harmony:true}));
    } catch (error) {
      parseError = new gutil.PluginError('transform', {
        message: error.message,
        showStack: false
      });
    }
    parseError && this.emit('error', parseError);
    done();
  });
}
