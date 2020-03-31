const jest = require('jest');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.spec.json',
    },
  },
  watchPathIgnorePatterns: [
    'tmp\/'
  ],
  testTimeout: 1000000,
};
