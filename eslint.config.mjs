import { fileURLToPath } from 'node:url';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'node:path';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import pluginJest from 'eslint-plugin-jest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const websiteCompat = new FlatCompat({
  baseDirectory: `${__dirname}/website`,
});

// console.log(
//   ...fixupConfigRules(
//     compat.extends(
//       'airbnb',
//       'plugin:@typescript-eslint/recommended',
//       'plugin:import/typescript',
//       'prettier'
//     )
//   )
// );

export default tseslint.config([
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,

  {
    ignores: ['dist/**/*', '**/node_modules', 'type-definitions/flow-tests'],
  },
  ...fixupConfigRules(
    compat.extends(
      //   'airbnb',
      //   'plugin:@typescript-eslint/recommended',
      'plugin:import/typescript'
    )
  ),
  {
    plugins: {
      react,
      //   '@typescript-eslint': tseslint.plugin,
    },

    // languageOptions: {
    //   parser: tseslint.parser,
    //   parserOptions: {
    //     project: true,
    //   },
    //   ecmaVersion: 6,
    //   sourceType: 'module',
    // },

    rules: {
      'array-callback-return': 'off',
      'block-scoped-var': 'off',
      'class-methods-use-this': 'off',
      'consistent-return': 'off',
      'constructor-super': 'off',
      'default-case': 'off',
      'func-names': 'off',
      'max-classes-per-file': 'off',
      'no-bitwise': 'off',
      'no-cond-assign': 'off',
      'no-constant-condition': 'off',
      'no-constructor-return': 'error',
      'no-continue': 'off',
      'no-else-return': 'error',
      'no-empty': 'error',
      'no-lonely-if': 'error',
      'no-multi-assign': 'off',
      'no-nested-ternary': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-prototype-builtins': 'off',
      'no-restricted-syntax': 'off',
      'no-return-assign': 'off',
      'no-self-compare': 'off',
      'no-sequences': 'off',
      'no-shadow': 'off',
      'no-this-before-super': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-useless-concat': 'error',
      'no-var': 'error',
      'object-shorthand': 'off',
      'operator-assignment': 'error',
      'prefer-destructuring': 'off',
      'prefer-rest-params': 'off',
      'prefer-spread': 'off',
      'prefer-template': 'off',
      'spaced-comment': 'off',
      'vars-on-top': 'off',
      'react/destructuring-assignment': 'off',
      'react/jsx-boolean-value': 'off',
      'react/jsx-curly-brace-presence': 'off',
      'react/jsx-filename-extension': 'off',
      'react/no-array-index-key': 'off',
      'react/no-danger': 'off',
      'react/no-multi-comp': 'off',
      'react/prefer-es6-class': 'off',
      'react/prefer-stateless-function': 'off',
      'react/prop-types': 'off',
      'react/self-closing-comp': 'error',
      'react/sort-comp': 'off',
      'react/jsx-props-no-spreading': 'off',

      'react/require-default-props': [
        'error',
        {
          functions: 'ignore',
        },
      ],

      'jsx-a11y/no-static-element-interactions': 'off',

      'import/extensions': [
        'error',
        {
          js: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],

      'import/newline-after-import': 'error',
      'import/no-cycle': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-mutable-exports': 'error',
      'import/no-unresolved': 'error',
      'import/no-useless-path-segments': 'off',
      'import/prefer-default-export': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['__tests__/*'],

    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      //   'jest/no-disabled-tests': 'warn',
      //   'jest/no-focused-tests': 'error',
      //   'jest/no-identical-title': 'error',
      //   'jest/prefer-to-have-length': 'warn',
      //   'jest/valid-expect': 'error',

      'import/no-unresolved': [
        'error',
        {
          ignore: ['immutable'],
        },
      ],
    },
  },

  {
    files: ['type-definitions/immutable.d.ts'],

    rules: {
      // does trigger an error while runing eslint with PairSorting enum
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      // does trigger an error while runing eslint with declare namespace Immutable
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  {
    files: ['type-definitions/ts-tests/*'],

    rules: {
      'no-lone-blocks': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'prefer-const': 'off',

      'import/no-unresolved': [
        'error',
        {
          ignore: ['immutable'],
        },
      ],
    },
  },

  ...websiteCompat.config({
    extends: ['next', 'next/core-web-vitals'],
    //   settings: {
    //     next: {
    //       rootDir: 'packages/my-app/',
    //     },
    //   },
  }),
]);
