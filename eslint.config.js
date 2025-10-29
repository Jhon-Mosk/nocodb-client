'use strict';

const neostandard = require('neostandard');

module.exports = [
  ...neostandard({
    ignores: [...neostandard.resolveIgnoresFromGitignore(), '**/temp/**/*'],
    env: ['node', 'commonjs'],
    ts: true,
    semi: true,
    noJsx: true,
  }),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },
    rules: {
      strict: ['error', 'global'],
      'no-loop-func': ['error'],
      curly: ['error', 'multi-line', 'consistent'],
      'consistent-return': ['error', { treatUndefinedAsUnspecified: true }],
      'no-unused-private-class-members': ['error'],
      'no-invalid-this': ['error'],
      'class-methods-use-this': ['warn'],
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'always'],
      'prefer-arrow-callback': ['error'],
      'prefer-numeric-literals': ['error'],
      'prefer-rest-params': ['error'],
      'prefer-spread': ['error'],
      'no-console': ['off'],
      'max-nested-callbacks': [
        'error',
        {
          max: 5,
        },
      ],
      'no-lonely-if': ['error'],
      'no-nested-ternary': ['error'],
      'operator-assignment': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      '@stylistic/linebreak-style': ['error', 'unix'],
      '@stylistic/max-len': [
        'error',
        {
          code: 80,
          ignoreComments: true,
          ignoreTrailingComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
    },
  },
];
