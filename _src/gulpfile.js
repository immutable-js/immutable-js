var browserify = require('browserify');
var browserSync = require('browser-sync');
var child_process = require('child_process');
var gulp = require('gulp');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var header = require('gulp-header');
var jest = require('gulp-jest');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var path = require('path');
var clean = require('gulp-rimraf');
var size = require('gulp-size');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var stylish = require('jshint-stylish');
var React = require('react');
var reactTools = require('react-tools');
var sequence = require('run-sequence');
var through = require('through2');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var vm = require('vm');


var BUILD_DIR = '../';

// gulp.task('clean', function () {
//   return gulp.src('../static', { read: false })
//     .pipe(clean());
// });

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
      scriptPreprocessor: './resources/jest-preprocessor.js',
      unmockedModulePathPatterns: ['./node_modules/react'],
    }))
    .on('error', handleError);
});

gulp.task('js', function() {
  return browserify({
      debug: true,
      basedir: './app/',
    })
    .add('./src/index.js')
    .require('./src/index.js')
    .require('react')
    // .require('../resources/react-global.js', { expose: 'react' })
    .transform(reactTransformify)
    .bundle()
    .on('error', handleError)
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true,
    }))
    // .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(filter('**/*.js'))
    .pipe(size({ showFiles: true }))
    .on('error', handleError);
});

gulp.task('pre-render', ['js'], function () {
  return gulp.src('./app/index.html')
    .pipe(preRender())
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(BUILD_DIR))
    .on('error', handleError);
});

gulp.task('less', function () {
  return gulp.src('./app/src/*.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      compress: true
    }))
    .pipe(concat('bundle.css'))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(filter('**/*.css'))
    .pipe(size({ showFiles: true }))
    .pipe(browserSync.reload({ stream:true }))
    .on('error', handleError);
});

gulp.task('statics', function () {
  return gulp.src('./app/static/**/*')
    .pipe(gulp.dest(BUILD_DIR+'static'))
    .pipe(browserSync.reload({ stream:true }))
    .on('error', handleError);
});

gulp.task('build', function (done) {
  sequence(['js', 'less', 'statics'], 'pre-render', done);
});

gulp.task('default', function (done) {
  sequence(/*'clean', */'lint', /*'test',*/ 'build', done);
});

// watch files for changes and reload
gulp.task('dev', ['default'], function() {
  browserSync({
    port: 8040,
    server: {
      baseDir: '../'
    }
  });

  gulp.watch('./app/**/*.less', ['less']);
  gulp.watch('./app/src/**/*.js', ['rebuild-js']);
  gulp.watch('./app/**/*.html', ['pre-render']);
  gulp.watch('./app/static/**/*', ['statics']);
});

gulp.task('rebuild-js', function (done) {
  sequence('lint', /*'test',*/ 'pre-render', function () {
    browserSync.reload();
    done();
  });
});

function handleError(error) {
  gutil.log(error.message);
}

function preRender() {
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
              require('fs').readFileSync(BUILD_DIR+'bundle.js') + // ugly
              '\nrequire("react").renderToString(require("react").createElement(require(component)));',
              {
                global: { React: React },
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
      src += '<script>' + components.map(function (component, index) {
        return (
          'var React = require("react");'+
          'React.render('+
            'React.createElement(require("'+component+'")),'+
            'document.getElementById("r' + (index) + '")'+
          ');'
        );
      }) + '</script>';
    }
    file.contents = new Buffer(src, enc);
    this.push(file);
    cb();
  });
}

function reactTransform() {
  var parseError;
  return through.obj(function(file, enc, cb) {
    try {
      file.contents =
        new Buffer(reactTools.transform(file.contents.toString(enc)), enc);
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


function reactTransformify() {
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
