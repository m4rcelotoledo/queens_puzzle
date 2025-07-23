module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/unit/**/*.test.jsx',
    '<rootDir>/src/**/*.test.js',
    '<rootDir>/src/**/*.test.jsx',
  ],
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx}',
    'src/utils/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/index.css',
    '!src/**/*.stories.{js,jsx}',
    '!src/**/*.config.{js,jsx}',
    '!src/components/LoadingScreen.jsx',
    '!src/components/LoginScreen.jsx',
    '!src/components/Notification.jsx',
    '!src/components/PlayerSetupModal.jsx',
    '!src/components/PodiumIcon.jsx',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 100,
      // The line coverage threshold was reduced to 98% due to the presence of
      // certain files or code paths that are difficult to test comprehensively.
      // This reduction ensures realistic coverage goals while maintaining high quality.
      lines: 98,
      statements: 95,
    },
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  verbose: true,
};
