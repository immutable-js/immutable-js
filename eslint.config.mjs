import pluginJs from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import pluginJest from 'eslint-plugin-jest';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import {
  config as tseslintConfig,
  configs as tseslintConfigs,
} from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default tseslintConfig(
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
  {
    languageOptions: {
      globals: globals.browser,

      // parserOptions: {
      //   projectService: true,
      //   tsconfigRootDir: import.meta.dirname,
      // },
    },
  },
  pluginJs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  ...tseslintConfigs.recommended,

  {
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
  {
    rules: {
      eqeqeq: 'error',
      'no-constructor-return': 'error',
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-object-constructor': 'error',
      'no-prototype-builtins': 'off',
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
      'sort-imports': 'off',
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc' },
          pathGroups: [
            {
              pattern: 'immutable',
              group: 'builtin',
              position: 'before',
            },
          ],
          // warnOnUnassignedImports: true,
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

      'import/no-unresolved': [
        'error',
        {
          ignore: ['immutable'],
        },
      ],
    },
  },

  {
    files: ['__tests__/**/*', 'website/**/*.test.ts', 'perf/*'],
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    ...pluginJest.configs['flat/recommended'],
    ...pluginJest.configs['flat/style'],
    plugins: { jest: pluginJest },
    rules: {
      ...pluginJest.configs['flat/recommended'].rules,
      // TODO activate style rules later
      // ...pluginJest.configs['jest/style'].rules,
      'jest/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect', 'expectIs', 'expectIsNot'],
          additionalTestBlockFunctions: [],
        },
      ],
      'import/no-unresolved': [
        'error',
        {
          ignore: ['immutable'],
        },
      ],
    },
  },
  {
    files: ['perf/*'],
    rules: {
      'jest/expect-expect': 'off',
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
