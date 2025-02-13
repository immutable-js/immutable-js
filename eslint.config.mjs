import pluginJs from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
// eslint-disable-next-line import/no-unresolved
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
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
  importPlugin.flatConfigs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      eqeqeq: 'error',
      'constructor-super': 'off',
      'no-constructor-return': 'error',
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-object-constructor': 'error',
      'no-prototype-builtins': 'off',
      'no-this-before-super': 'off',
      'no-useless-concat': 'error',
      'no-var': 'error',
      'operator-assignment': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-spread': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
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

      'import/no-unresolved': [
        'error',
        {
          ignore: ['immutable'],
        },
      ],
    },
  },

  {
    // TODO might be handled by config jest
    files: ['__tests__/*'],
    rules: {
      'no-undef': 'off',
      'import/no-unresolved': [
        'error',
        {
          ignore: ['immutable'],
        },
      ],
    },
  },
  {
    // TODO might be handled by config jest
    files: ['perf/*'],
    rules: {
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-var': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
  {
    files: ['resources/*'],
    rules: {
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-var': 'off',
      'prefer-arrow-callback': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  }
);
