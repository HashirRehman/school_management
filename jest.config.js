module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/',
        '/loaders/',
        '/cache/',
        '/mws/',
        '/static_arch/',
        '/docs/',
        '/scripts/',
    ],
    collectCoverageFrom: [
        'managers/**/*.js',
        'libs/**/*.js',
        '!**/*.test.js',
        '!**/node_modules/**',
    ],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testTimeout: 30000,
};
