module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jestSetupFile.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@react-navigation|@react-native-community|react-native-screens|react-native-safe-area-context)/)',
  ],
};
