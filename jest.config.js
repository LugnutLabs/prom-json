'use strict'

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  testPathIgnorePatterns: [
    '/dist/',
    '/__mocks__/'
  ],
  collectCoverageFrom: [
    '**/*.{ts,js}',
    '!**/.eslintrc.js',
    '!**/*.config.js',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/__tests__/*.spec.{js,ts}',
    '!**/__tests__/__mocks__/*'
  ]
}
