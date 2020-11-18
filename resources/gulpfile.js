/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const browserify = require('browserify');
const browserSync = require('browser-sync');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const childProcess = require('child-process-promise');
const concat = require('gulp-concat');
const del = require('del');
const filter = require('gulp-filter');
const fs = require('fs');
const { parallel, series, src, dest, watch } = require('gulp');
const util = require('gulp-util');
const Immutable = require('../');
const gulpLess = require('gulp-less');
const mkdirp = require('mkdirp');
const path = require('path');
const React = require('react');
const size = require('gulp-size');
const sourcemaps = require('gulp-sourcemaps');
const through = require('through2');
const vm = require('vm');
const rename = require('gulp-rename');
const semver = require('semver');

const pagesBabelConfig = require('../pages/.babelrc.json');

const packageInfo = require('../package.json');

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
  const contents = JSON.stringify({
    content: genMarkdownDoc(fileContents),
    package: packageInfo,
  });

  mkdirp.sync(path.dirname(writePath));
  fs.writeFileSync(writePath, contents);
  done();
}

function typedefs(done) {
  mkdirp.sync('../pages/generated/type-definitions');

  let latestTag;

  childProcess
    .exec('git tag --list --sort="-v:refname"')
    .then(function (gitTagResult) {
      const tags = gitTagResult.stdout
        .split('\n')
        .filter((tag) => semver.valid(semver.coerce(tag)))
        .filter((tag) => semver.gte(tag, '3.0.0')) // Anything below 3.0 does not compile with this gulp script
        .sort(
          (tagA, tagB) =>
            0 - semver.compare(semver.clean(tagA), semver.clean(tagB))
        );

      // the latest tag's file has no suffix, it's the "main" file
      latestTag = tags[0];

      const tagsObj = {};

      tags.forEach((tag) => {
        const label = `${semver.major(tag)}.${semver.minor(tag)}`;

        if (!tagsObj[label]) {
          tagsObj[label] = tag;
        }
      });

      // take latest 20 major.minor releases (take latest patch version, including release candidates)
      const sortedVersions = Object.entries(tagsObj)
        .sort((entryA, entryB) => {
          const tagA = semver.clean(entryA[1]);
          const tagB = semver.clean(entryB[1]);

          return 0 - semver.compare(semver.clean(tagA), semver.clean(tagB));
        })
        .slice(0, 20);

      fs.writeFileSync(
        '../pages/generated/versions.json',
        JSON.stringify(
          sortedVersions.map(([docName, tag]) => ({
            docName,
            version: /^v?(.*)/.exec(tag)[1],
            isLatest: tag === latestTag,
          }))
        ),
        'utf8'
      );

      return Promise.all(
        sortedVersions.map(([docName, tag]) =>
          childProcess
            .exec(`git show ${tag}:type-definitions/Immutable.d.ts`)
            .then(function (gitShowResult) {
              const defPath =
                '../pages/generated/type-definitions/Immutable' +
                (tag !== latestTag ? `-${docName}` : '') +
                '.d.ts';
              fs.writeFileSync(defPath, gitShowResult.stdout, 'utf8');
              return [docName, defPath, tag];
            })
        )
      );
    })
    .then(function (tagEntries) {
      const failedVersions = [];
      tagEntries.forEach(function ([docName, typeDefPath, tag]) {
        util.log('Build type defs for version', docName, `(${tag})`);
        const fileContents = fs.readFileSync(typeDefPath, 'utf8');

        const fileSource = fileContents.replace(
          "module 'immutable'",
          'module Immutable'
        );

        const writePath = path.join(
          __dirname,
          '../pages/generated/immutable' +
            (tag !== latestTag ? `-${docName}` : '') +
            '.d.json'
        );

        try {
          const genTypeDefData = requireFresh('../pages/lib/genTypeDefData');
          const markdownDocs = requireFresh('../pages/lib/markdownDocs');
          const defs = genTypeDefData(typeDefPath, fileSource);
          markdownDocs(defs);
          defs.Immutable.version = /^v?(.*)/.exec(tag)[1];
          defs.Immutable.isLatestVersion = tag === latestTag;
          const contents = JSON.stringify(defs);

          mkdirp.sync(path.dirname(writePath));
          fs.writeFileSync(writePath, contents);
        } catch (e) {
          console.error('Unable to build version ' + docName + ':', e.message);
          failedVersions.push([docName, e]);
        }
      });

      if (failedVersions.length) {
        failedVersions.forEach(([ver]) =>
          console.log('Failed to generate definitions for version', ver)
        );
        throw failedVersions[0][1];
      }
    })
    .then(() => done())
    .catch((error) => done(error));
}

function js() {
  return gulpJS('', 'bundle.js');
}

function jsDocs() {
  return gulpJS('docs/', 'bundle.js');
}

function jsServer() {
  return gulpJS('', 'server.js');
}

function jsServerDocs() {
  return gulpJS('docs/', 'server.js');
}

function gulpJS(subDir, rootFile) {
  // We don't have ourself enough to write old Javascript, so let's transform with the es2015 preset package
  const sourcePath = path.join(SRC_DIR, subDir, 'src', rootFile);
  return browserify(sourcePath, { debug: true })
    .transform('babelify', pagesBabelConfig)
    .bundle()
    .pipe(source(rootFile))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(BUILD_DIR + subDir))
    .on('error', handleError);
}

function preRender() {
  return gulpPreRender({
    html: 'index.html',
    src: 'readme.json',
  });
}

function preRenderDocs() {
  return gulpPreRender({
    html: 'docs/index.html',
    src: 'immutable.d.json',
  });
}

function preRenderVersionedDocs() {
  return gulpPreRender({
    html: 'docs/version.html',
    src: 'immutable-*.d.json',
    assetPath: '../',
  });
}

function gulpPreRender(options) {
  return src(path.join('../pages/generated', options.src))
    .pipe(reactPreRender(options.html, options.assetPath))
    .pipe(size({ showFiles: true }))
    .pipe(
      rename(function (path) {
        let dirname = '';
        const match = /-(\d+\.\d+)\.d$/.exec(path.basename);
        if (match) {
          dirname = match[1];
        }
        path.dirname = dirname;
        path.basename = 'index';
        path.extname = '.html';
      })
    )
    .pipe(dest(path.join(BUILD_DIR, path.dirname(options.html))))
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
  return src('../dist/immutable.js')
    .pipe(dest(BUILD_DIR))
    .on('error', handleError)
    .pipe(browserSync.reload({ stream: true }))
    .on('error', handleError);
}

function gulpJsonp(varName) {
  return through.obj(function (file, enc, cb) {
    const jsonp = `window.${varName} = JSON.parse(${JSON.stringify(
      file.contents.toString()
    )});`;
    file.contents = Buffer.from(jsonp, enc);
    this.push(file);
    cb();
  });
}

function jsonpTask() {
  return src([
    '../pages/generated/immutable-*.d.json',
    '../pages/generated/immutable.d.json',
  ])
    .pipe(gulpJsonp('data'))
    .pipe(
      rename(function (path) {
        path.extname = '.jsonp';
      })
    )
    .pipe(dest(path.join(BUILD_DIR, 'docs/defs')))
    .on('error', handleError)
    .pipe(browserSync.reload({ stream: true }))
    .on('error', handleError);
}

function versionJsonpTask() {
  return src('../pages/generated/versions.json')
    .pipe(gulpJsonp('versions'))
    .pipe(
      rename(function (path) {
        path.extname = '.jsonp';
      })
    )
    .pipe(dest(BUILD_DIR))
    .on('error', handleError)
    .pipe(browserSync.reload({ stream: true }))
    .on('error', handleError);
}

const build = series(
  typedefs,
  readme,
  parallel(js, jsDocs, jsServer, jsServerDocs),
  parallel(
    jsonpTask,
    versionJsonpTask,
    less,
    lessDocs,
    immutableCopy,
    statics,
    staticsDocs
  ),
  series(preRender, preRenderDocs, preRenderVersionedDocs)
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
  watch('../pages/src/src/**/*.js', rebuildJS());
  watch('../pages/src/docs/src/**/*.js', rebuildJSDocs());
  watch('../pages/src/**/*.html', series(preRender, preRenderDocs));
  watch('../pages/src/static/**/*', series(statics, staticsDocs));
  watch('../type-definitions/*', parallel(typedefs, rebuildJSDocs()));
}

const dev = series(defaultTask, watchFiles);

function rebuildJS() {
  return series(js, preRender, (done) => {
    browserSync.reload();
    done();
  });
}

function rebuildJSDocs() {
  return series(jsDocs, preRenderDocs, (done) => {
    browserSync.reload();
    done();
  });
}

function handleError(error) {
  util.log(error.message);
}

function reactPreRender(htmlPath, assetPath) {
  const srcHtml = fs.readFileSync(path.join('../pages/src', htmlPath), 'utf8');
  const subDir = path.dirname(htmlPath);

  return through.obj(function (file, enc, cb) {
    const data = JSON.parse(file.contents.toString(enc));
    const suffixMatch = /-\d+\.\d+(?=\.d\.json)/.exec(file.path);
    const suffix = suffixMatch ? suffixMatch[0] : '';

    const html = srcHtml
      .replace(/<!--\s*ReactPreRender\(\s*(.*)\s*\)\s*-->/g, () => {
        // Render the component into a string and insert it into the page, making the content available to crawlers.
        // The bundled script will reuse the existing content
        const componentPath = path.posix.normalize(
          path.posix.join(BUILD_DIR, subDir, 'server.js')
        );
        try {
          const componentContent = fs.readFileSync(componentPath);
          const context = {
            global: {
              React: React,
              Immutable: Immutable,
              data,
              output: '',
            },
            window: {
              addEventListener() {
                /* fake */
              },
              removeEventListener() {
                /* fake */
              },
              data,
            },
            console,
          };

          vm.runInNewContext(componentContent, context);

          return `<div id="app">${context.global.output}</div>`;
        } catch (error) {
          console.log('failed to render target', error);
          return `<div id="app">${error.message}</div>`;
        }
      })
      .replace(
        '<!-- JSONP(defs/immutable.d.jsonp) -->',
        `<script src="${
          assetPath || ''
        }defs/immutable${suffix}.d.jsonp"></script>`
      )
      .replace(
        /<!--\s*version\s*-->/g,
        data && data.Immutable ? data.Immutable.version : ''
      )
      .replace(
        /<!--\s*Script\(\s*(.*)\s*\)\s*-->/g,
        (_, originalScriptPath) => {
          let scriptPath = originalScriptPath;
          if (originalScriptPath.endsWith('immutable.js') && data.Immutable) {
            // this is the doc page for a previous release
            scriptPath = `https://cdn.jsdelivr.net/npm/immutable@${data.Immutable.version}/dist/immutable.min.js`;
          }
          return `<script src="${scriptPath}"></script>`;
        }
      );

    file.contents = Buffer.from(html, enc);
    this.push(file);
    cb();
  });
}

exports.dev = dev;
exports.default = defaultTask;
