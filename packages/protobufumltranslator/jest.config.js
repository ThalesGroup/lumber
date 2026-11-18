/** @type {import('ts-jest').JestConfigWithTsJest} */
const { defaults } = require('jest-config');
module.exports = {
    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],

    collectCoverage: true,

    coverageReporters: ['cobertura', 'text', 'text-summary'],
    preset: 'ts-jest',
    testEnvironment: 'node'
};
