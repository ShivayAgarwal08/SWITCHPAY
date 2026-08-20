module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jestSetupFile.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@react-navigation|@react-native-community|react-native-screens|react-native-safe-area-context|@react-native-async-storage/async-storage|react-native-camera-kit|react-native-qrcode-svg|react-native-svg|uuid|react-native-get-random-values|react-native-ble-plx)/)',
  ],
};
