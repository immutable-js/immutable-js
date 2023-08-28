var typescript = require('typescript');
const makeSynchronous = require('make-synchronous');

const TYPESCRIPT_OPTIONS = {
  noEmitOnError: true,
  target: typescript.ScriptTarget.ES2015,
  module: typescript.ModuleKind.CommonJS,
  strictNullChecks: true,
  sourceMap: true,
  inlineSourceMap: true,
};

function transpileTypeScript(src, path) {
  return typescript.transpile(src, TYPESCRIPT_OPTIONS, path, []);
}

function transpileJavaScript(src, path) {
  // Need to make this sync by calling `makeSynchronous`
  // while https://github.com/facebook/jest/issues/9504 is not resolved
  const fn = makeSynchronous(async path => {
    const rollup = require('rollup');
    const buble = require('@rollup/plugin-buble');
    const commonjs = require('@rollup/plugin-commonjs');
    const json = require('@rollup/plugin-json');

    // same input options as in rollup-config.js
    const inputOptions = {
      input: path,
      onwarn: () => {},
      plugins: [commonjs(), json(), buble()],
    };

    const bundle = await rollup.rollup(inputOptions);

    const { output } = await bundle.generate({
      file: path,
      format: 'cjs',
      sourcemap: true,
    });

    await bundle.close();

    const { code, map } = output[0];

    if (!code) {
      throw new Error(
        'Unable to get code from rollup output in jestPreprocessor. Did rollup version changed ?'
      );
    }

    return { code, map };
  });

  return fn(path);
}

module.exports = {
  process(src, path) {
    if (path.endsWith('__tests__/MultiRequire.js')) {
      // exit early for multi-require as we explicitly want to have several instances
      return src;
    }

    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return transpileTypeScript(src, path);
    }

    return transpileJavaScript(src, path);
  },

  getCacheKey() {
    // ignore cache, as there is a conflict between rollup compile and jest preprocessor.
    return Date.now().toString();
  },
};
