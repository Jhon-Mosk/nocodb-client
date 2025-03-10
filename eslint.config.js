'use strict';

const config = require('eslint-config-metarhia');

module.exports = [
  ...config,
  {
    rules: {
      'no-unused-vars': 'warn',
      'max-len': [
        'error',
        {
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
