import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    ignores: [
      'npm/',
      'dist/',
      'type-definitions/flow-tests',
      'website/out/',
      'website/.next/',
    ],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      'constructor-super': 'off',
      'no-constructor-return': 'error',
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-prototype-builtins': 'off',
      'no-this-before-super': 'off',
      'no-useless-concat': 'error',
      'no-var': 'error',
      'operator-assignment': 'error',
      'prefer-spread': 'off',

      // 'import/extensions': [
      //   'error',
      //   {
      //     js: 'never',
      //     ts: 'never',
      //     tsx: 'never',
      //   },
      // ],

      // 'import/newline-after-import': 'error',
      // 'import/no-cycle': 'off',
      // 'import/no-extraneous-dependencies': 'off',
      // 'import/no-mutable-exports': 'error',
      // 'import/no-unresolved': 'error',
      // 'import/no-useless-path-segments': 'off',
      // 'import/prefer-default-export': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['src/*'],
    rules: {
      'no-console': 'error',
    },
  },

  {
    files: ['website/'],
    ...pluginReact.configs.flat.recommended,
    ...pluginReact.configs.flat['jsx-runtime'],

    rules: {
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
    },
  },

  {
    files: ['type-definitions/ts-tests/*'],

    rules: {
      '@typescript-eslint/no-unused-vars': 'off',

      // 'import/no-unresolved': [
      //   'error',
      //   {
      //     ignore: ['immutable'],
      //   },
      // ],
    },
  },

  {
    // TODO might be handled by config jest
    files: ['__tests__/*'],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    // TODO might be handled by config jest
    files: ['perf/*'],
    rules: {
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-var': 'off',
    },
  },
  {
    files: ['resources/*'],
    rules: {
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-var': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
