/**
 * Unit tests for Bluetooth Protocol
 * Tests message serialization, parsing, validation, and creation
 */

import {
  isValidSwitchPayId,
  isValidTransactionId,
  serializeMessage,
  parseMessage,
  createPaymentRequest,
  createPaymentAccepted,
  createPaymentRejected,
  createPaymentAck,
  createError,
  PROTOCOL_CONSTANTS,
} from '../src/services/bluetooth/bluetoothProtocol';

describe('Bluetooth Protocol', () => {
  describe('SwitchPay ID Validation', () => {
    it('should validate correct SwitchPay IDs', () => {
      expect(isValidSwitchPayId('SWP-AAAA1111')).toBe(true);
      expect(isValidSwitchPayId('SWP-BBBB2222')).toBe(true);
      expect(isValidSwitchPayId('SWP-ZZZZ9999')).toBe(true);
    });

    it('should reject invalid SwitchPay IDs', () => {
      expect(isValidSwitchPayId('')).toBe(false);
      expect(isValidSwitchPayId('SWP-AAA111')).toBe(false); // Too short
      expect(isValidSwitchPayId('SWP-AAAAA1111')).toBe(false); // Too long
      expect(isValidSwitchPayId('SWP-AAAA111')).toBe(false); // Too short
      expect(isValidSwitchPayId('SWP-1111AAAA')).toBe(false); // Wrong format
      expect(isValidSwitchPayId('SWP-AAAA11111')).toBe(false); // Too long
      expect(isValidSwitchPayId('SWP-AAA11111')).toBe(false); // Wrong format
      expect(isValidSwitchPayId('INVALID')).toBe(false);
      expect(isValidSwitchPayId('swp-aaaa1111')).toBe(false); // Lowercase
    });
  });

  describe('Transaction ID Validation', () => {
    it('should validate correct UUID transaction IDs', () => {
      expect(isValidTransactionId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidTransactionId('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
      expect(isValidTransactionId('00000000-0000-0000-0000-000000000000')).toBe(true);
    });

    it('should reject invalid transaction IDs', () => {
      expect(isValidTransactionId('')).toBe(false);
      expect(isValidTransactionId('invalid')).toBe(false);
      expect(isValidTransactionId('550e8400-e29b-41d4-a716-44665544000')).toBe(false); // Too short
      expect(isValidTransactionId('550e8400-e29b-41d4-a716-4466554400000')).toBe(false); // Too long
      expect(isValidTransactionId('550e8400-e29b-41d4-a716-44665544000g')).toBe(false); // Invalid character
    });
  });

  describe('Message Serialization', () => {
    it('should serialize payment request message', () => {
      const message = createPaymentRequest(
        '550e8400-e29b-41d4-a716-446655440000',
        'SWP-AAAA1111',
        'SWP-BBBB2222',
        100
      );

      const serialized = serializeMessage(message);
      expect(typeof serialized).toBe('string');
      expect(serialized).toContain('PAYMENT_REQUEST');
      expect(serialized).toContain('SWP-AAAA1111');
      expect(serialized).toContain('SWP-BBBB2222');
    });

    it('should enforce maximum message size', () => {
      const largeMessage = createPaymentRequest(
        '550e8400-e29b-41d4-a716-446655440000',
        'SWP-AAAA1111',
        'SWP-BBBB2222',
        100
      );

      // Add a huge field to exceed size limit
      (largeMessage as any).hugeField = 'x'.repeat(PROTOCOL_CONSTANTS.MAX_MESSAGE_SIZE + 100);

      expect(() => serializeMessage(largeMessage)).toThrow('Message size exceeds maximum allowed size');
    });

    it('should handle serialization errors gracefully', () => {
      // Circular reference should cause error
      const circular: any = { a: null };
      circular.a = circular;

      expect(() => serializeMessage(circular as any)).toThrow();
    });
  });

  describe('Message Parsing', () => {
    it('should parse valid payment request message', () => {
      const message = createPaymentRequest(
        '550e8400-e29b-41d4-a716-446655440000',
        'SWP-AAAA1111',
        'SWP-BBBB2222',
        100
      );

      const serialized = serializeMessage(message);
      const parsed = parseMessage(serialized);

      expect(parsed.type).toBe('PAYMENT_REQUEST');
      expect(parsed.transactionId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(parsed.senderSwitchPayId).toBe('SWP-AAAA1111');
      expect(parsed.receiverSwitchPayId).toBe('SWP-BBBB2222');
      expect(parsed.amount).toBe(100);
    });

    it('should reject empty message', () => {
      expect(() => parseMessage('')).toThrow('Invalid message format');
    });

    it('should reject non-string message', () => {
      expect(() => parseMessage(null as any)).toThrow('Invalid message format');
    });

    it('should reject message with missing required fields', () => {
      const incompleteMessage = JSON.stringify({
        type: 'PAYMENT_REQUEST',
        transactionId: '550e8400-e29b-41d4-a716-446655440000',
        // Missing other required fields
      });

      expect(() => parseMessage(incompleteMessage)).toThrow('Invalid message: missing required fields');
    });

    it('should reject message with invalid type', () => {
      const invalidTypeMessage = JSON.stringify({
        type: 'INVALID_TYPE',
        transactionId: '550e8400-e29b-41d4-a716-446655440000',
        senderSwitchPayId: 'SWP-AAAA1111',
        receiverSwitchPayId: 'SWP-BBBB2222',
        amount: 100,
        timestamp: Date.now(),
      });

      expect(() => parseMessage(invalidTypeMessage)).toThrow('Invalid message type');
    });

    it('should reject message with invalid sender SwitchPay ID', () => {
      const invalidSenderMessage = JSON.stringify({
        type: 'PAYMENT_REQUEST',
        transactionId: '550e8400-e29b-41d4-a716-446655440000',
        senderSwitchPayId: 'INVALID',
        receiverSwitchPayId: 'SWP-BBBB2222',
        amount: 100,
        timestamp: Date.now(),
      });

      expect(() => parseMessage(invalidSenderMessage)).toThrow('Invalid sender SwitchPay ID');
    });

    it('should reject message with invalid receiver SwitchPay ID', () => {
      const invalidReceiverMessage = JSON.stringify({
        type: 'PAYMENT_REQUEST',
        transactionId: '550e8400-e29b-41d4-a716-446655440000',
        senderSwitchPayId: 'SWP-AAAA1111',
        receiverSwitchPayId: 'INVALID',
        amount: 100,
        timestamp: Date.now(),
      });

      expect(() => parseMessage(invalidReceiverMessage)).toThrow('Invalid receiver SwitchPay ID');
    });

    it('should reject message with invalid transaction ID', () => {
      const invalidTxIdMessage = JSON.stringify({
        type: 'PAYMENT_REQUEST',
        transactionId: 'invalid',
        senderSwitchPayId: 'SWP-AAAA1111',
        receiverSwitchPayId: 'SWP-BBBB2222',
        amount: 100,
        timestamp: Date.now(),
      });

      expect(() => parseMessage(invalidTxIdMessage)).toThrow('Invalid transaction ID');
    });

    it('should reject message with invalid amount', () => {
      const invalidAmountMessage = JSON.stringify({
        type: 'PAYMENT_REQUEST',
        transactionId: '550e8400-e29b-41d4-a716-446655440000',
        senderSwitchPayId: 'SWP-AAAA1111',
        receiverSwitchPayId: 'SWP-BBBB2222',
        amount: -100,
        timestamp: Date.now(),
      });

      expect(() => parseMessage(invalidAmountMessage)).toThrow('Invalid amount');
    });

    it('should reject ERROR message without errorMessage', () => {
      const errorWithoutMessage = JSON.stringify({
        type: 'ERROR',
        transactionId: '550e8400-e29b-41d4-a716-446655440000',
        senderSwitchPayId: 'SWP-AAAA1111',
        receiverSwitchPayId: 'SWP-BBBB2222',
        amount: 100,
        timestamp: Date.now(),
      });

      expect(() => parseMessage(errorWithoutMessage)).toThrow('ERROR message type requires errorMessage field');
    });
  });

  describe('Message Creation', () => {
    it('should create payment request message', () => {
      const message = createPaymentRequest(
        '550e8400-e29b-41d4-a716-446655440000',
        'SWP-AAAA1111',
        'SWP-BBBB2222',
        100
      );

      expect(message.type).toBe('PAYMENT_REQUEST');
      expect(message.transactionId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(message.senderSwitchPayId).toBe('SWP-AAAA1111');
      expect(message.receiverSwitchPayId).toBe('SWP-BBBB2222');
      expect(message.amount).toBe(100);
      expect(message.timestamp).toBeGreaterThan(0);
    });

    it('should create payment accepted message', () => {
      const message = createPaymentAccepted(
        '550e8400-e29b-41d4-a716-446655440000',
        'SWP-AAAA1111',
        'SWP-BBBB2222',
        100
      );

      expect(message.type).toBe('PAYMENT_ACCEPTED');
      expect(message.transactionId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should create payment rejected message', () => {
      const message = createPaymentRejected(
        '550e8400-e29b-41d4-a716-446655440000',
        'SWP-AAAA1111',
        'SWP-BBBB2222',
        100,
        'Insufficient balance'
      );

      expect(message.type).toBe('PAYMENT_REJECTED');
      expect(message.errorMessage).toBe('Insufficient balance');
    });

    it('should create payment rejected message without error', () => {
      const message = createPaymentRejected(
        '550e8400-e29b-41d4-a716-446655440000',
        'SWP-AAAA1111',
        'SWP-BBBB2222',
        100
      );

      expect(message.type).toBe('PAYMENT_REJECTED');
      expect(message.errorMessage).toBeUndefined();
    });

    it('should create payment acknowledgement message', () => {
      const message = createPaymentAck(
        '550e8400-e29b-41d4-a716-446655440000',
        'SWP-AAAA1111',
        'SWP-BBBB2222',
        100
      );

      expect(message.type).toBe('PAYMENT_ACK');
      expect(message.transactionId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should create error message', () => {
      const message = createError(
        '550e8400-e29b-41d4-a716-446655440000',
        'SWP-AAAA1111',
        'SWP-BBBB2222',
        100,
        'Connection failed'
      );

      expect(message.type).toBe('ERROR');
      expect(message.errorMessage).toBe('Connection failed');
    });
  });

  describe('Message Round-trip', () => {
    it('should successfully serialize and parse all message types', () => {
      const messages = [
        createPaymentRequest('550e8400-e29b-41d4-a716-446655440000', 'SWP-AAAA1111', 'SWP-BBBB2222', 100),
        createPaymentAccepted('550e8400-e29b-41d4-a716-446655440000', 'SWP-AAAA1111', 'SWP-BBBB2222', 100),
        createPaymentRejected('550e8400-e29b-41d4-a716-446655440000', 'SWP-AAAA1111', 'SWP-BBBB2222', 100, 'Test'),
        createPaymentAck('550e8400-e29b-41d4-a716-446655440000', 'SWP-AAAA1111', 'SWP-BBBB2222', 100),
        createError('550e8400-e29b-41d4-a716-446655440000', 'SWP-AAAA1111', 'SWP-BBBB2222', 100, 'Test error'),
      ];

      messages.forEach(message => {
        const serialized = serializeMessage(message);
        const parsed = parseMessage(serialized);
        expect(parsed).toEqual(message);
      });
    });
  });
});