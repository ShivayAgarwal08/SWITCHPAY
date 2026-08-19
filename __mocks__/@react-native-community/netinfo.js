// @format

let addEventListenerCallback = () => {};

export default {
  fetch: jest.fn(() =>
    Promise.resolve({isConnected: true, isInternetReachable: true}),
  ),
  addEventListener: jest.fn(callback => {
    addEventListenerCallback = callback;
    return () => {
      // no-op
    };
  }),
  __triggerStateChange: state => {
    addEventListenerCallback(state);
  },
};
