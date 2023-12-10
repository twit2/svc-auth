/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts"
    ],
    coveragePathIgnorePatterns: [
        "node_modules",
        "src/models",
        "src/op",
        "src/routes",
        "src/types",
        "src/rpc",
        "src/Index.ts",
        "src/middleware",
        "src/CredWorker.ts"
    ]
};