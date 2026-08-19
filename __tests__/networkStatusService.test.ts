/**
 * @format
 */

import {networkStatusService} from '../src/services/network/networkStatusService';

// The manual override is the public interface used to simulate NetInfo events
// in tests without needing the native module.

beforeEach(() => {
  networkStatusService.setStatus('ONLINE');
});

test('starts as ONLINE', () => {
  expect(networkStatusService.getStatus()).toBe('ONLINE');
});

test('emits OFFLINE when network is lost', () => {
  const listener = jest.fn();
  const unsubscribe = networkStatusService.subscribe(listener);

  networkStatusService.setStatus('OFFLINE');

  expect(networkStatusService.getStatus()).toBe('OFFLINE');
  expect(listener).toHaveBeenCalledWith('OFFLINE');

  unsubscribe();
});

test('emits ONLINE_MODE when network is restored', () => {
  networkStatusService.setStatus('OFFLINE');

  const listener = jest.fn();
  const unsubscribe = networkStatusService.subscribe(listener);

  networkStatusService.setStatus('ONLINE');

  expect(networkStatusService.getStatus()).toBe('ONLINE');
  expect(listener).toHaveBeenCalledWith('ONLINE');

  unsubscribe();
});
