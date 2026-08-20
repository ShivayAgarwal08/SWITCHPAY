/* eslint-env jest */
// @format

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({isConnected: true, isInternetReachable: true})),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));
