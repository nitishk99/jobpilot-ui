module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: require.resolve('./jest.babel.cjs') }],
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};
