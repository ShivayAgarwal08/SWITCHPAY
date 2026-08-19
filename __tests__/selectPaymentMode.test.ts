/**
 * @format
 */

import {selectPaymentMode} from '../src/engine/orchestrator/selectPaymentMode';

test('route follows network availability', () => {
  expect(selectPaymentMode('ONLINE')).toBe('ONLINE_MODE');
  expect(selectPaymentMode('OFFLINE')).toBe('EDGE_MODE');
});
