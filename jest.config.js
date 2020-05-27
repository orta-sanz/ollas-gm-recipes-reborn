module.exports = {
    transform: {
        "^.(js)": "babel-jest",
    },
    setupFilesAfterEnv: ['./tests/extend-setup.js'],
    transform: {
        '.(js|jsx)$': 'babel-jest'
    },
    testRegex: '.(test|spec)\\.(js|jsx)$',
    testPathIgnorePatterns: [
        'node_modules'
    ],
    moduleFileExtensions: ['js', 'jsx'],
    moduleNameMapper: {
        '.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/tests/__mocks__/fileMock.js',
        '^@components': '<rootDir>/src/components'
    },
    coverageDirectory: "<rootDir>/.reports/jest/coverage",
    collectCoverage: !process.argv.includes('--watch'),
    collectCoverageFrom: [
        "src/**/*.{js,jsx}",
        "!node_modules"
    ],
    coverageReporters: [
        'lcov',
        'text',
        'html'
    ]
};
