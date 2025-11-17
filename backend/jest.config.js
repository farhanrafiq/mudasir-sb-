module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/backend/jest.env.js'],
    setupFilesAfterEnv: ['<rootDir>/backend/jest.setup.ts'],
  roots: ['<rootDir>/backend'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
};
